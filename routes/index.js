const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");

router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/page/:page", catchErrors(storeController.getStores))

router.get("/add", authController.isLoggedIn, storeController.addStore);
router.post(
  "/add",
  authController.isLoggedIn,
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

router.get(
  "/stores/:id/edit",
  authController.isLoggedIn,
  catchErrors(storeController.editStore)
);
router.get("/stores/:slug", catchErrors(storeController.getStoreBySlug));

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
  authController.login
);

router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.get("/account", userController.getAccount);
router.post("/account", catchErrors(userController.updateAccount));

// email link to them
// come back to site from the link and if token is valid may reset password
router.post("/account/forgot", catchErrors(authController.forgot));
router.get(
  "/account/reset/:token",
  catchErrors(authController.isResetPasswordTokenValid),
  catchErrors(authController.reset)
);
router.post(
  "/account/reset/:token",
  authController.confirmedPasswords,
  catchErrors(authController.isResetPasswordTokenValid),
  catchErrors(authController.update)
);

router.get("/map", storeController.mapPage);
router.get(
  "/hearts",
  authController.isLoggedIn,
  catchErrors(storeController.heartsPage)
);
router.get("/top", catchErrors(storeController.getTopTenPage));

/*
  API
*/

router.get("/api/search", catchErrors(storeController.searchStores));
router.get("/api/stores/near", catchErrors(storeController.mapStores));
router.post("/api/stores/:id/heart", catchErrors(storeController.heartStore));
router.post(
  "/api/review/:store",
  authController.isLoggedIn,
  reviewController.validateReview,
  catchErrors(reviewController.writeReview)
);

/*
  API END
*/

module.exports = router;
