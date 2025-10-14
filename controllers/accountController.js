const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash('message') || null
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash('message') || null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account management view
* **************************************** */
const buildAccountManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  try {
    const flashMessage = req.flash("notice")
    let welcomeMessage = `<h2>Welcome ${accountData.account_firstname}</h2>`

    let content = `
      ${welcomeMessage}
      <p><a href="/account/update/${accountData.account_id}" title="Update your account information">Update Account Information</a></p>
    `
    
    // Show inventory management link only for Employee/Admin
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      content += `
        <h3>Inventory Management</h3>
        <p><a href="/inv/" title="Go to Inventory Management">Manage Inventory</a></p>
      `
    }

    res.render("account/management", {
      title: "Account Management",
      nav,
      notice: flashMessage,
      content,
      accountData,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Build Update Account View
 * ************************** */
const buildUpdateAccount = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = res.locals.accountData

  // Security check: prevent updating someone else’s account
  if (accountData.account_id !== account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/management")
  }

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    accountData
  })
}

const updateAccount = async function (req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  if (accountData.account_id !== account_id) {
    req.flash("notice", "You can only update your own account.");
    return res.redirect("/account/");
  }

  const errors = [];

  if (!account_firstname) errors.push({ msg: "First name is required." });
  if (!account_lastname) errors.push({ msg: "Last name is required." });
  if (!account_email) errors.push({ msg: "Email is required." });

  // Check if email is already in use by another account
  const existingAccount = await accountModel.getAccountByEmail(account_email);
  if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
    errors.push({ msg: "Email is already in use." });
  }

  if (errors.length > 0) {
    return res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData: { account_id, account_firstname, account_lastname, account_email },
      errors,
      message: null
    });
  }

  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

  if (result) {
    req.flash("notice", "Account information updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Error updating account.");
    res.redirect(`/account/update/${account_id}`);
  }
};

const updateAccountPassword = async function (req, res, next) {
  const { account_id, account_password } = req.body;
  const loggedInAccount = res.locals.accountData;
  const nav = await utilities.getNav();

  if (loggedInAccount.account_id !== parseInt(account_id)) {
    req.flash("notice", "You can only change your own password.");
    return res.redirect("/account/");
  }

  if (!account_password || !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}$/.test(account_password)) {
    req.flash("notice", "Password must be at least 12 characters long and include an uppercase letter, a number, and a special character.");
    return res.redirect(`/account/update/${account_id}`);
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);

    if (result) {
      req.flash("notice", "Password updated successfully.");
    } else {
      req.flash("notice", "Error updating password.");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("notice", "An error occurred while updating the password.");
  }

  res.redirect("/account/");
};



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updateAccountPassword }