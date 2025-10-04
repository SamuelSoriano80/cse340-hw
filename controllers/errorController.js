const utilities = require("../utilities/");

const errorController = {};

/* ***************************
 *  Trigger intentional 500 error
 * ************************** */
errorController.triggerError = async function (req, res, next) {
  try {
    // Intentionally cause an error that will be caught
    const undefinedVariable = undefined;
    
    // This will throw "Cannot read properties of undefined (reading 'something')"
    const willCauseError = undefinedVariable.something;
    
    // This line will never be reached
    res.send("This should not appear");
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};

module.exports = errorController;