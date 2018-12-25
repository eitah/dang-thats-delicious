const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

// do all your data normalization close to the model as possible
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name!",
    validate: {
      validator: v => {
        return slug(v).length;
      },
      message: "Your store name is not a valid store name"
    }
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates!"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address"
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  }
});

// define our indexes. This is a compound index on both name and description
storeSchema.index({
  name: "text",
  description: "text"
});

// needs to be a regular function not a lambda so it can access this
storeSchema.pre("save", async function(next) {
  if (!this.isModified("name")) {
    next(); // ship it
    return; // stop this function from running
  }
  this.slug = slug(this.name); // turns the store name into a slug

  // find others with this slug and add a unique identifier to the slug if needed
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const storesWithSlug = await this.constructor.find({ slug: slugRegex });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  // todo handle cases of invalid names, maybe with regex validator?
  next();
});

// to add a custom fetcher from your mongoose schema, add it to the statics object.
// you must use a named function to allow for a this bound to the model.
storeSchema.statics.getTagsList = function(next) {
  return this.aggregate([
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model("Store", storeSchema);
