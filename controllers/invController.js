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

invCont.buildManagement = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            message: req.flash('message') || null
        })
    } catch (error) {
        next(error)
    }
}

// Build add classification view
invCont.buildAddClassification = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: null,
            classification_name: '', // Add this line
            message: req.flash('message') || null
        })
    } catch (error) {
        next(error)
    }
}

// Process add classification - fix the error handling
invCont.addClassification = async function (req, res, next) {
    try {
        const { classification_name } = req.body
        const nav = await utilities.getNav()
        
        // Server-side validation
        if (!classification_name || !/^[a-zA-Z0-9]+$/.test(classification_name)) {
            return res.render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: [{ msg: 'Classification name must contain only letters and numbers, no spaces or special characters' }],
                classification_name: classification_name || '',
                message: { type: 'error', message: 'Classification name must contain only letters and numbers' }
            })
        }
        
        const result = await invModel.addClassification(classification_name)
        
        if (result) {
            // Rebuild nav to include new classification
            const newNav = await utilities.getNav()
            res.render("inventory/management", {
                title: "Inventory Management",
                nav: newNav,
                message: { type: 'success', message: 'Classification added successfully!' }
            })
        } else {
            throw new Error('Failed to add classification')
        }
    } catch (error) {
        console.error('Error adding classification:', error)
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            errors: null,
            classification_name: req.body.classification_name || '',
            message: { type: 'error', message: 'Sorry, adding classification failed.' }
        })
    }
}

// Build add inventory view
invCont.buildAddInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList()
        res.render("inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationList,
            errors: null,
            // Add all form fields with empty defaults
            classification_id: '',
            inv_make: '',
            inv_model: '',
            inv_description: '',
            inv_image: '/images/vehicles/no-image.png',
            inv_thumbnail: '/images/vehicles/no-image-tn.png',
            inv_prices: '',
            inv_year: '',
            inv_miles: '',
            inv_color: '',
            message: req.flash('message') || null
        })
    } catch (error) {
        next(error)
    }
}

// Process add inventory
invCont.addInventory = async function (req, res, next) {
    try {
        const { 
            classification_id, 
            inv_make, 
            inv_model, 
            inv_description, 
            inv_image, 
            inv_thumbnail, 
            inv_prices, 
            inv_year, 
            inv_miles, 
            inv_color 
        } = req.body
        
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        
        // Convert string values to proper data types
        const price = parseFloat(inv_prices)
        const miles = parseInt(inv_miles)
        
        // Basic server-side validation with converted values
        const errors = []
        if (!classification_id) errors.push({ param: 'classification_id', msg: 'Classification is required' })
        if (!inv_make) errors.push({ param: 'inv_make', msg: 'Make is required' })
        if (!inv_model) errors.push({ param: 'inv_model', msg: 'Model is required' })
        if (!inv_description) errors.push({ param: 'inv_description', msg: 'Description is required' })
        if (!price || price <= 0 || isNaN(price)) errors.push({ param: 'inv_prices', msg: 'Valid price is required' })
        if (!inv_year) errors.push({ param: 'inv_year', msg: 'Valid year is required' })
        if (!miles || miles < 0 || isNaN(miles)) errors.push({ param: 'inv_miles', msg: 'Valid miles value is required' })
        if (!inv_color) errors.push({ param: 'inv_color', msg: 'Color is required' })
        
        if (errors.length > 0) {
            return res.render("inventory/add-inventory", {
                title: "Add Vehicle",
                nav,
                classificationList,
                errors,
                ...req.body,
                message: { type: 'error', message: 'Please correct the errors below' }
            })
        }
        
        const result = await invModel.addInventory(
            classification_id, 
            inv_make, 
            inv_model, 
            inv_description, 
            inv_image, 
            inv_thumbnail, 
            price,
            inv_year,
            miles,
            inv_color
        )
        
        if (result) {
            req.flash('message', 'Vehicle added successfully!')
            res.render("inventory/management", {
                title: "Inventory Management",
                nav,
                message: { type: 'success', message: 'Vehicle added successfully!' }
            })
        } else {
            throw new Error('Failed to add vehicle')
        }
    } catch (error) {
        console.error('Error in addInventory controller:', error)
        
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(req.body.classification_id)
        
        res.render("inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationList,
            errors: null,
            ...req.body,
            message: { type: 'error', message: 'Sorry, adding vehicle failed.' }
        })
    }
}

  module.exports = invCont