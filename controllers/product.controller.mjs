import asynchandlers from "express-async-handler";
import product from "../models/shop.model.mjs";


// Get all Products

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves a list of all products.
 *     responses:
 *       '200':
 *         description: Successful operation. Returns a list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal server error.
 */

// Components Section
/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f41b6677d9190015e4dbd4"
 *         name:
 *           type: string
 *           example: "Product A"
 *         price:
 *           type: number
 *           example: 19.99
 *         description:
 *           type: string
 *           example: "This is a sample product."
 *         category:
 *           type: string
 *           example: "Electronics"
 *         gender:
 *           type: string
 *           enum:
 *             - "male"
 *             - "female"
 *             - "kids"
 *           example: "male"
 *         size:
 *           type: string
 *           enum:
 *             - "small"
 *             - "medium"
 *             - "large"
 *             - "X large"
 *           example: "medium"
 *         stock:
 *           type: number
 *           example: 10
 *         picture:
 *           type: string
 *         review:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: "user_id"
 *               product:
 *                 type: string
 *                 example: "product_id"
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: "Great product!"
 */

const getProducts = asynchandlers(async (req, res)=>{
    const products = await product.find()
    res.status(200).json(products)

})
// testing 

const test = asynchandlers(async(req, res)=>{
  res.json({message:"All setup!"})
})
// Add new Products
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add new products
 *     description: Adds multiple new products to the database.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/NewProduct'
 *     responses:
 *       '200':
 *         description: Products added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       '400':
 *         description: 'Bad Request: Invalid or empty array of products, or product picture is missing for one or more products.'
 *       '401':
 *         description: 'Unauthorized: Invalid token or not provided.'
 *       '403':
 *         description: 'Unauthorized: Access denied. Only admin users are allowed to add new products.'
 *       '500':
 *         description: 'Internal Server Error. An error occurred while processing the request.'
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:   # Define the security scheme for the API key (token in headers)
 *       type: apiKey
 *       in: header   # Specify the location of the API key (token) in the headers
 *       name: Authorization   # Specify the header field name for the API key (token)
 *       description: |   # Use a pipe (|) to properly format multiline description
 *         Please provide the API key (token) in the headers using the format:
 *         "Authorization: YOUR_TOKEN".
 * 
 *   schemas:
 *     NewProduct:   # Define the schema for the new product object
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         gender:
 *           type: string
 *           enum:
 *             - male
 *             - female
 *             - kids
 *         size:
 *           type: string
 *           enum:
 *             - small
 *             - medium
 *             - large
 *             - X large
 *         picture:
 *           type: string
 *           format: byte   # Specify the format of the picture as byte
 *           description: The base64-encoded image data of the product picture.
 */
import fs from 'fs';
import path from 'path';

const newProducts = async (req, res) => {
  try {
    console.log("The req body is:", req.body);

    // Assuming request body as an array of products
    const productsData = req.body;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Access denied. Only admin users are allowed to add new products." });
    }

    // Validate that we have received an array of products
    if (!Array.isArray(productsData) || productsData.length === 0) {
      res.status(400).json({ message: "Invalid or empty array of products." });
      return;
    }

    // Loop through each product and handle its creation
    const newProducts = [];
    for (const productData of productsData) {
      // Check if the 'picture' field is available in the product data
      if (!productData.picture) {
        res.status(400).json({ message: "Product picture is missing for one or more products." });
        return;
      }

      const imageData = productData.picture;
      const matches = imageData.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: 'Invalid base64 data.' });
      }
  
      const extension = matches[1]; // Get the extension
  
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Generate a unique filename for the image
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const imageFileName = `picture-${uniqueSuffix}.${extension}`; // You can modify the extension if needed

      // Save the image to the public folder
      try {
        fs.writeFileSync(path.join('public', imageFileName), imageBuffer);
      } catch (error) {
        console.error("Error while writing the image file:", error.message);
        return res.status(500).json({ message: "An error occurred while processing the request." });
      }

      // Add the picture URL to the product data
      productData.picture = `/${imageFileName}`;

      // Create the product with the picture URL and push it to the newProducts array
      const newProduct = await product.create(productData);
      newProducts.push(newProduct);
    }

    res.status(200).json(newProducts);
  } catch (err) {
    // If an error occurs, handle it here
    console.error("Error:", err.message);
    res.status(500).json({ message: "An error occurred while processing the request." });
  }
};


/**
 * @swagger
 * /products:
 *   put:
 *     summary: Update a product
 *     description: Updates an existing product in the database.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatedProduct'
 *     responses:
 *       '200':
 *         description: Product updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       '400':
 *         description: 'Bad Request: Product picture is missing or invalid.'
 *       '401':
 *         description: 'Unauthorized: Invalid token or not provided.'
 *       '403':
 *         description: 'Unauthorized: Access denied. Only admin users are allowed to update products.'
 *       '404':
 *         description: 'Not Found: No product found with the provided ID.'
 *       '500':
 *         description: 'Internal Server Error. An error occurred while processing the request.'
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:   # Define the security scheme for the API key (token in headers)
 *       type: apiKey
 *       in: header   # Specify the location of the API key (token) in the headers
 *       name: Authorization   # Specify the header field name for the API key (token)
 *       description: |   # Use a pipe (|) to properly format multiline description
 *         Please provide the API key (token) in the headers using the format:
 *         "Authorization: YOUR_TOKEN".
 * 
 *   schemas:
 *     UpdatedProduct:   # Define the schema for the updated product object
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         gender:
 *           type: string
 *           enum:
 *             - male
 *             - female
 *             - kids
 *         size:
 *           type: string
 *           enum:
 *             - small
 *             - medium
 *             - large
 *             - X large
 *         picture:
 *           type: string
 *           format: byte   # Specify the format of the picture as byte
 *           description: The base64-encoded image data of the product picture (if updating the picture).
 */

const updateproduct = asynchandlers(async (req, res) =>{
  try {
    const { id } = req.query;
    const findProduct = await product.findById(id);
    if (!findProduct) {
      res.status(404).json({ message: "No Product found" });
      return;
    }

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Access denied. Only admin users are allowed to update products." });
    }

    // Check if the 'picture' field is available in the request body
    if (req.body.picture) {
      // Decode the base64 image data and save it as an image file
      const imageData = req.body.picture;
      const matches = imageData.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: 'Invalid base64 data.' });
      }
  
      const extension = matches[1]; // Get the extension
  
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Generate a unique filename for the image
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const imageFileName = `picture-${uniqueSuffix}.${extension}`; // You can modify the extension if needed


      // Save the image to the public folder
      try {
        fs.writeFileSync(path.join('public', imageFileName), imageBuffer);
      } catch (error) {
        console.error("Error while writing the image file:", error.message);
        return res.status(500).json({ message: "An error occurred while processing the request." });
      }

      // Add the picture URL to the product data
      req.body.picture = `/${imageFileName}`;
    }

    // Update the product with the new data
    const updatedProduct = await product.findByIdAndUpdate(
      findProduct._id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    // If an error occurs, handle it here
    console.error("Error:", err.message);
    res.status(500).json({ message: "An error occurred while processing the request." });
  }
});

// Delete products
/**
 * @swagger
 * /delete-products:
 *   delete:
 *     summary: Delete products
 *     description: Deletes one or more products from the database.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated IDs of the products to be deleted.
 *     responses:
 *       '200':
 *         description: Products deleted successfully.
 *       '401':
 *         description: |-
 *           Unauthorized: Invalid token or not provided.
 *       '403':
 *         description: |-
 *           Unauthorized: Access denied. Only admin users are allowed to delete products.
 *       '404':
 *         description: No IDs found or some products not found.
 *       '500':
 *         description: Internal Server Error. An error occurred while processing the request.
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */
const deleteproduct = asynchandlers(async (req, res)=>{
    const { ids } = req.query;

    if(!ids){
        res.status(404);
        throw new Error("No Ids Found")
    }
    // check if user is admin 
    if(req.user.role !== 'admin'){
        return res.status(403).json({message:"Unauthorized: Access denied! Only admins are allowed to delete products"})
    }

    const IdArray = ids.split(",")
    try{
      // finding the products to be deleted
      const productToDelete = await product.find({_id:{$in : IdArray}})

      // Unlink the picture associated with each product
      productToDelete.forEach(async (productToDelete) => {
        if(productToDelete.picture){
          const picturePath = path.join("public", productToDelete.picture)
          fs.unlink(picturePath, (err) => {
            if (err){
              console.error("Error in deleting ");
            }
          })
        }
      })

      // Delete the products from database

      const deletingProducts = await product.deleteMany({_id:{$in : IdArray}})
      if(deletingProducts.deletedCount !== IdArray.length){
        res.status(400).json({message:"Some Products not found"})
      }
      res.status(200).json({message:"Product and its picture deleted successfully :)"})
    }catch(err){
      console.error("Error: ", err)
      res.status(500).json({message:"Error in deleting Products"})
    }

})

export {getProducts,
newProducts,
updateproduct,
deleteproduct,
test
}