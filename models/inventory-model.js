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

// Add new classification
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        throw error
    }
}

// Add new inventory item
async function addInventory(
    classification_id, 
    inv_make, 
    inv_model, 
    inv_description, 
    inv_Image, 
    inv_thumbnail, 
    inv_prices, 
    inv_year, 
    inv_miles, 
    inv_color
) {
    try {
        const sql = `INSERT INTO inventory (
            classification_id, inv_make, inv_model, inv_description, 
            inv_image, inv_thumbnail, inv_prices, inv_year, inv_miles, inv_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
        
        const result = await pool.query(sql, [
            classification_id, inv_make, inv_model, inv_description,
            inv_Image, inv_thumbnail, inv_prices, inv_year, inv_miles, inv_color
        ])
        
        console.log('Inventory added successfully:', result.rows[0])
        return result
    } catch (error) {
        console.error('Database error in addInventory:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        })
        throw error
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET 
        inv_make = $1, 
        inv_model = $2, 
        inv_description = $3, 
        inv_image = $4, 
        inv_thumbnail = $5, 
        inv_prices = $6, 
        inv_year = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *`
      
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete Inventory Error: ", error);
    return 0;
  }
}

async function searchVehicles({ minPrice, maxPrice, color, minMiles, maxMiles }) {
  try {
    const sql = `
      SELECT * FROM inventory
      WHERE inv_prices BETWEEN $1 AND $2
        AND inv_miles BETWEEN $3 AND $4
        AND ($5 = '' OR inv_color ILIKE $5)
      ORDER BY inv_make, inv_model
    `;
    const values = [
      minPrice || 0,
      maxPrice || 9999999,
      minMiles || 0,
      maxMiles || 9999999,
      color || ''
    ];
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error("Error in searchVehicles:", error);
    return [];
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory, updateInventory, deleteInventoryItem, searchVehicles};