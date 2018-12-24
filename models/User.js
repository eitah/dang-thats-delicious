const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply an email address"
  },
  name: {
    type: String,
    required: "Please supply a name",
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// this is to tie into the avatar everyone has on their global email prover
userSchema.virtual("gravatar").get(function() {
  const hash = md5(this.email); // encrypt the users email in the image url
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

// this sets up everything you need for mongoose to use an email as a user
// this makes available a register method on the model to represent signup.
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", userSchema);
