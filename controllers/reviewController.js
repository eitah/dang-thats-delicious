const mongoose = require("mongoose");
const Review = mongoose.model("Review");

exports.validateReview = (req, res, next) => {
  req.sanitizeBody("text");
  req.checkBody("text", "You must supply a written review!").notEmpty();
  req.checkBody("rating", "You must supply a star rating!").notEmpty();

  const errors = req.validationErrors(); // check all of the above and put in errors;
  if (errors) {
    const referer = req.header("Referer") || "/";
    req.flash("error", errors.map(err => err.msg));
    res.redirect(referer);
    return;
  }
  next(); // no errors, lets proceed!
};

exports.writeReview = async (req, res) => {
  const review = new Review({
    author: req.user._id,
    store: req.params.store,
    text: req.body.text,
    rating: req.body.rating
  });
  await review.save(review);
  req.flash(
    "success",
    "Review submitted successfully. Thanks for your feedback!"
  );
  res.redirect("back");
};
