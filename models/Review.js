const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
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
    max: 5
  },
  created: {
    type: Date,
    default: Date.now
  }
});

function autoPopulate(next) {
  this.populate("author");
  this.sort("-created");
  next();
}

reviewSchema.pre("find", autoPopulate);
reviewSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model("Review", reviewSchema);
