const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data.rows
  } catch (error) {
    console.error("getClassifications error: " + error)
    return []
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    return [];
  }
}

/* ***************************
 *  Get items by specific id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById};