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
    required: "You must supply a rating"
  }
});

module.exports = mongoose.model("Review", reviewSchema);

