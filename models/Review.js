const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: "You must supply an Author"
    },
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: "You must supply a Store"
    },
    text: {
      type: String,
      required: "You must supply review text"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    }, 
    created: Date,
  }
);

/* Custom Fetchers */
// to add a custom fetcher from your mongoose schema, add it to the statics object.
// you must use a named function to allow for a this bound to the model.
reviewSchema.statics.getTopStores = function(next) {
  return this.aggregate([
    {
      $group: {
        _id: "$store",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
  ])
  .limit(10);
};


module.exports = mongoose.model("Review", reviewSchema);
