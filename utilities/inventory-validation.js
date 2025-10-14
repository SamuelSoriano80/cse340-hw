const { body, validationResult } = require("express-validator")
const utilities = require("./")
const invModel = require("../models/inventory-model")
const validate = {}

/* ***********************************
 * Validation rules for adding/updating inventory
 * *********************************** */
validate.newInventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please choose a valid classification."),
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),
    body("inv_description")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_prices")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_year")
      .isInt({ min: 1900, max: 2030 })
      .withMessage("Please provide a valid year."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
    body("inv_color")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long."),
  ]
}

/* ****************************************
 *  Check data and return errors or continue
 * **************************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image,
          inv_thumbnail, inv_prices, inv_year, inv_miles, inv_color } = req.body

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let classificationList = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_prices,
      inv_year,
      inv_miles,
      inv_color,
      message: req.flash('message') || null
    })
    return
  }
  next()
}

/* ****************************************
 *  Check data and return errors to edit view
 * **************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_description,
          inv_image, inv_thumbnail, inv_prices, inv_year, inv_miles, inv_color } = req.body

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let classificationList = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_prices,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      message: req.flash('message') || null
    })
    return
  }
  next()
}

module.exports = validate
