const utilities = require("./")

async function handleErrors(err, req, res, next) {
  console.error(err)

  const status = err.status || 500

  const nav = await utilities.getNav()

  res.status(status).render("errors/error", {
    title: "Error " + status,
    message: err.message,
    status,
    nav
  })
}

module.exports = handleErrors