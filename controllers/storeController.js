const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp"); // helps load photos by reading a photo buffer
const uuid = require("uuid"); // gives unique images for all

const multerOptions = {
  storage: multer.memoryStorage(), // read into memory, resize it, and upload it
  fileFilter(req, file, next) {
    // blocks file types not allowed. Mimetype is a trusted data
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
      return;
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.upload = multer(multerOptions).single("photo");
exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to the file system keep going!
  next();
};

// exports.upload = multer(multerOptions).singleField("photo");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "💩 Add Store" });
};

// types of flash: success warning info error
exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  console.log("it worked!");
  req.flash(
    "success",
    `Successfully created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // query the db for a list of all stores
  const stores = await Store.find();
  res.render("stores", { title: "stores", stores });
};

exports.getStore = async (req, res, next) => {
  // find the store given the slug. populate enriches data via the associated document.
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author"
  );
  if (!store) return next();
  res.render("store", { store, title: store.name });
};

const confirmOwner = (store = {}, user) => {
  if (!store.author || !store.author.equals(user._id)) {
    throw Error("You must own a store in order to edit it.");
  }
};

exports.editStore = async (req, res) => {
  // find the store given the id
  const store = await Store.findOne({ _id: req.params.id });
  // confirm they are the owner of the store. they are guaranteed to be logged in.
  confirmOwner(store, req.user);
  // renders out the edit form so the user can update their store
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Set the location data to be a point
  req.body.location.type = "Point";
  // Find and update store with args: query, data, options. Exec() ensures it runs.
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old ones,
    runValidators: true
  }).exec();
  // Tell them the store was updated
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>.
  <a href="/stores/${store.slug}">View Store →</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
  // Redirect to the store and tell them it worked
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;

  // query to filter by tag, or show anything with any tag at all
  const tagQuery = tag || { $exists: true };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render("tags", { tags, stores, title: tag || "Tags", tag });
};
