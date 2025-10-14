// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get a specific vehicle by id
router.get("/detail/:inv_id", invController.buildByInvId);

// Management view route
router.get('/', invController.buildManagement)

// Classification routes
router.get('/add-classification', invController.buildAddClassification)
router.post('/add-classification', invController.addClassification)

// Add inventory routes
router.get('/add-inventory', invController.buildAddInventory)
router.post('/add-inventory', invController.addInventory)

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Display edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
    "/update",
    invValidate.newInventoryRules(),
    invValidate.checkUpdateData, 
    utilities.handleErrors(invController.updateInventory)
);

module.exports = router;