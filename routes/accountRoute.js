// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.checkLogin, accountController.buildAccountManagement)

router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/logout", (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, secure: process.env.NODE_ENV !== "development" });

  req.flash("notice", "You have been logged out successfully.");
  res.redirect("/");
});

router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.updateAccountPassword)
)

module.exports = router
