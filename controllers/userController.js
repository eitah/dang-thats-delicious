const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const multer = require("multer");
const jimp = require("jimp"); // helps load photos by reading a photo buffer
const uuid = require("uuid"); // gives unique images for all

exports.loginForm = (req, res) => {
  res.render("login", { title: "Log In" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "You must supply an Email!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false, // this lets you use emails with extra dots
    remove_extension: false, // gets rid of the extra bits
    gmail_remove_subaddress: false // gets rid of extra addresses after the email
  });

  req.checkBody("password", "Password cannot be blank").notEmpty();
  req
    .checkBody("password-confirm", "The Confirmed password cannot be blank")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops, your passwords do not match!")
    .equals(req.body.password);

  const errors = req.validationErrors(); // check all of the above and put in errors;
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next(); // no errors, lets proceed!
};

exports.getAccount = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};
//
exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  // Find and update user with args: query, data, options.
  // $set tells the system to overlay name and email on the existing user.
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );
  req.flash("success", "The profile was updated");
  // Redirect to the referrer
  res.redirect("back");
};
