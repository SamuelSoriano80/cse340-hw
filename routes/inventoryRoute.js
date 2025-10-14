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
router.get('/', utilities.checkAccountType, invController.buildManagement)

// Classification routes
router.get('/add-classification', utilities.checkAccountType, invController.buildAddClassification)
router.post('/add-classification', utilities.checkAccountType, invController.addClassification)

// Add inventory routes
router.get('/add-inventory', utilities.checkAccountType, invController.buildAddInventory)
router.post('/add-inventory', utilities.checkAccountType, invController.addInventory)

router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

// Display edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
    "/update",
    utilities.checkAccountType,
    invValidate.newInventoryRules(),
    invValidate.checkUpdateData, 
    utilities.handleErrors(invController.updateInventory)
);

// Deliver delete confirmation view
router.get('/delete/:inv_id', utilities.checkAccountType, async (req, res, next) => {
  try {
    await invController.buildDeleteView(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Process the deletion
router.post('/delete', utilities.checkAccountType, async (req, res, next) => {
  try {
    await invController.deleteInventory(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Search routes
router.get(
  "/search", 
  utilities.handleErrors(invController.buildSearchPage)
);

router.post(
  "/search", 
  utilities.handleErrors(invController.handleSearch)
);

module.exports = router;