const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  try {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    
    // Check if data exists and has items before using forEach
    if (data && data.length > 0) {
      data.forEach((row) => {
        list += "<li>"
        list +=
          '<a href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>"
        list += "</li>"
      })
    }
    
    list += "</ul>"
    return list
  } catch (error) {
    console.error("getNav error:", error)
    // Return basic nav without classifications if there's an error
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_prices) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildVehicleDetailHTML = function(vehicle){
  return `
    <section class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-img" />
      <div class="vehicle-info">
        <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p><strong>Price:</strong> $${vehicle.inv_prices.toLocaleString("en-US")}</p>
        <p><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString("en-US")} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `;
}

Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

Util.buildClassificationList = async function (classification_id = null) {
    try {
        let data = await invModel.getClassifications()
        let classificationList = '<select name="classification_id" id="classificationList" required>'
        classificationList += "<option value=''>Choose a Classification</option>"
        
        if (data && data.length > 0) {
            data.forEach((row) => {
                classificationList += '<option value="' + row.classification_id + '"'
                if (classification_id != null && row.classification_id == classification_id) {
                    classificationList += " selected "
                }
                classificationList += ">" + row.classification_name + "</option>"
            })
        } else {
            classificationList += "<option value=''>No classifications available</option>"
        }
        
        classificationList += "</select>"
        return classificationList
    } catch (error) {
        console.error('Error building classification list:', error)
        return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>'
    }
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Make login state available to all views
 * **************************************** */
Util.handleSessionData = (req, res, next) => {
  if (typeof res.locals.loggedin === "undefined") {
    res.locals.loggedin = false
  }
  if (typeof res.locals.accountData === "undefined") {
    res.locals.accountData = null
  }
  next()
}

/* ****************************************
 *  Check if user is Employee or Admin
 * **************************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData) {
    const { account_type } = res.locals.accountData
    if (account_type === "Employee" || account_type === "Admin") {
      return next()
    } else {
      req.flash("notice", "Access denied. Employees or Admins only.")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in to access that page.")
    return res.redirect("/account/login")
  }
}

module.exports = Util