const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "💩 Add Store" });
};

// types of flash: success warning info error
exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  await store.save();
  console.log("it worked!");
  req.flash(
    "success",
    `Successfully created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};
 
exports.getStores = async (req, res) => {
  // query the db for a list of all stores
  const stores = await Store.find();
  res.render("stores", { title: "stores", stores });
};

exports.editStore = async (req, res) => {
  // find the store given the id
  const store = await Store.findOne({ _id: req.params.id });
  // TODO confirm they are the owner of the store
  // renders out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req, res) => {
  //find and update store with args: query, data, optio ns. 
  // Exec() ensures it runs.

  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old ones,
    runValidators: true,
  }).exec();
  // tell them the store was updated
  req.flash('success', `Successfully updated <strong>${store.name}</strong>.
  <a href="/stores/${store.slug}">View Store →</a>`)
  res.redirect(`/stores/${store._id}/edit`);
  // redirect to the store and tell them it worked
};