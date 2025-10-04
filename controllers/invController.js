const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    
    if (!data || data.length === 0 || !data[0].classification_name) {
      return res.status(404).render("errors/error", {
        title: "404 - Category Not Found",
        message: "Sorry, no vehicles were found in this category.",
        nav: await utilities.getNav()
      })
    }
    
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })

  } catch (err) {
    console.error("Error in buildByClassificationId:", err)
    next(err)
  }
}

/* ***************************
 *  Build inventory by specific id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();

  try {
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).send("Vehicle not found");
    }

    const vehicleHTML = await utilities.buildVehicleDetailHTML(vehicleData);

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      content: vehicleHTML,
    });
  } catch (err) {
    next(err);
  }
}

  module.exports = invCont