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
      message: "Your store name is not a valid store name",
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
  photo: String
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
  console.error({ storesWithSlug });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  // todo handle cases of invalid names, maybe with regex validator?
  next();
});

module.exports = mongoose.model("Store", storeSchema);
