const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

/* Schema Declaration */
// do all your data normalization close to the model as possible
const storeSchema = new mongoose.Schema(
  {
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
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

/* Indexes */
// define our indexes. This is a compound index on both name and description
storeSchema.index({
  name: "text",
  description: "text"
});

// Allows lat long to be indexed correctly.
storeSchema.index({
  location: "2dsphere"
});

function autoPopulate(next) {
  this.populate("reviews author");
  next();
}

storeSchema.pre("find", autoPopulate);
storeSchema.pre("findOne", autoPopulate);

/* Pre-Save Hooks */
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

/* Custom Fetchers */
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

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // lookup stores and populate their reviews
    {
      $lookup: {
        from: "reviews", // this wrecked me. apparently mongodb lower cases and adds an s automatically to your ref
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    // filter for items with 2 or more reviews
    {
      $match: {
        "reviews.1": {
          //reviews.1 means the second element of the reviews array. weird, no?
          $exists: true
        }
      }
    },
    // add average rating field
    {
      $addFields: {
        averageRating: {
          $avg: "$reviews.rating"
        }
      }
    },
    //sort highest reviews first
    { $sort: { averageRating: -1 } },
    { $limit: 10 }
  ]);
};

// /* Virtual */
// find reviews where the stores id is equal to the store property.
// this populates data about another model in relation to the current one
storeSchema.virtual("reviews", {
  ref: "Review", // what model to link
  localField: "_id", // which field on the store
  foreignField: "store" // which field on the review
});

module.exports = mongoose.model("Store", storeSchema);
