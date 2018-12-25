const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const { send } = require('../handlers/mail');

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You are now logged in!"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out 👋");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! they are logged in
    return;
  }
  req.flash("error", "Oops, you must be logged in");
  res.redirect("/login");
};


exports.forgot = async (req, res, next) => {
  // 1. see if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "No account with that email exists");
    return res.redirect("/login");
  }
  // 2. reset tokens and expiry set on account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // one hour
  await user.save();
  // 3. send an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;
  await send({ 
    user, 
    subject: 'Password Reset: Your password reset for Delicious.com',
    resetURL,
    filename: 'password-reset', 
  });
  // 4. redirect to login page after email has been sent
  req.flash(
    "success",
    `You have been emailed a password reset link`
  );
  res.redirect("/login");
};

exports.isResetPasswordTokenValid = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired');
    res.redirect('/login');
  }
  req.user = user;
  return next();
};

exports.reset = async (req, res) => {
  // if there is a user show them the reset password form
  res.render('reset', {title: 'Reset Your Password'});
};

exports.confirmedPasswords = (req, res, next) => {
  req.checkBody("password", "Password cannot be blank").notEmpty();
  req
    .checkBody("password-confirm", "Confirmed password cannot be blank")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops, your passwords do not match!")
    .equals(req.body.password);
  const errors = req.validationErrors(); // check all of the above and put in errors;
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    return res.redirect("back");
  }
  next(); // keep it going
};

exports.update = async (req, res) => {
  const user = req.user;
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash("success", "💃 Nice, your password has been reset. You are now logged in!");
  return res.redirect('/');
};