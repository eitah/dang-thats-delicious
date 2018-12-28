const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const Review = mongoose.model("Review");
const multer = require("multer");
const jimp = require("jimp"); // helps load photos by reading a photo buffer
const uuid = require("uuid"); // gives unique images for all

const { icon } = require("../helpers");

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

exports.getTopTenPage = async (req, res) => {
  const stores = await Store.getTopStores(); // beasly query but good.
  res.render("topStores", { stores, title: `Top ${stores.length} Stores` });
};

exports.getStores = async (req, res) => {
  // query the db for a list of all stores
  const page = req.params.page || 1;
  const limit = 5;
  const skip = page * limit - limit; // 1 * 4 - 4 = 0; p2 * 4 - 4 = 4;
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({created: 'desc'});

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash('info', `Hey, you asked for page ${page} but that doesn't exist. So I put you on page ${pages}`)
    res.redirect(`/stores/page/${pages}`);
    return
  }
  res.render("stores", { title: "stores", stores, page, pages, count });
};

exports.getStoreBySlug = async (req, res) => {
  // find the store given the slug. populate enriches data via the associated document.
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) return;
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

exports.searchStores = async (req, res) => {
  const usersQuery = req.query.q;
  // $text performs a text search on any field(s) indexed as text.
  // $search is how we input the users query.
  // Projected (2nd arg for find) lets you work with meta fields. the key is the name of the field.
  // $meta describes important metadata, example text "textscore"
  const stores = await Store
    // find stores that match
    .find(
      {
        $text: {
          $search: usersQuery
        }
      },
      {
        score: {
          $meta: "textScore"
        }
      }
    )
    // sort by match score descending
    .sort({
      score: {
        $meta: "textScore"
      }
    })
    // limit to only 5 results
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  // mongodb format is [lng, lat] as numbers not strings
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 10 * 1000 // in meters. 10 km
      }
    }
  };

  // filter by specific fields we care about and limit result set then return
  const stores = await Store.find(q)
    .select("slug name description location photo")
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render("map", { title: "Map of Stores" });
};

exports.heartStore = async (req, res) => {
  // get a list of users hearts
  const hearts = req.user.hearts.map(obj => obj.toString());
  // determine whether to add or remove a hearted store in mongo
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const fish = await User.findById(req.user._id);
  const newUser = await User.findOneAndUpdate(
    req.user._id, // query
    { [operator]: { hearts: req.params.id } }, // toggle
    {
      new: true // return updated user. By default it returns same user as before.
    }
  );
  res.json(newUser);
};

exports.heartsPage = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  const noStoresHTML = `
    <div style="text-align: center;">
      <div class="heart__button heart__button--hearted">${
        req.user.name
      }! You haven't ${icon("heart")} any stores.
      </div>
      <strong>Try it today!</strong>
    </div>
  `;
  res.render("stores", { title: "Hearted Stores", stores, noStoresHTML });
};
