const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");

router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));

router.get("/add", 
authController.isLoggedIn,
storeController.addStore);
router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get("/stores/:id/edit", catchErrors(storeController.editStore));
router.get("/stores/:slug", catchErrors(storeController.getStore));

router.get("/tags", catchErrors(storeController.getStoresByTag));
router.get("/tags/:tag", catchErrors(storeController.getStoresByTag));

router.get("/login", userController.loginForm);
router.get("/register", userController.registerForm);

// validate the registration data
// register user
// log them in
router.post(
  "/register",
  userController.validateRegister,
  catchErrors(userController.registerUser),
  authController.login,
);

router.post('/login', authController.isLoggedIn, authController.login);
router.get('/logout', authController.logout);

router.get('/account', userController.getAccount);
router.post(
  "/account",
  catchErrors(userController.updateAccount)
);

// check that user is logged in
// write and save a token and expiry to account to confirm user wants a reset.
// email link to them
// come back to site from the link and if token is valid may reset password
// router.post('account/forgot', )

module.exports = router;
