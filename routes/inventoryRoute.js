// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

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

module.exports = router;