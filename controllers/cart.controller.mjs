import asynchandlers from 'express-async-handler'

import products from '../models/shop.model.mjs'
import users from '../models/user.model.mjs'

// Add to cart
/**
 * @swagger
 * /cart/add:
 *    post:
 *      summary: Cart
 *      description: Add products to cart
 *      requestBody: 
 *        required: true
 *        content: 
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  type: string
 *                  description: ID of the user who is adding to cart
 *                items:
 *                  type: array
 *                  description: Array of items to be addedd in cart
 *                  items:
 *                    type: object  
 *                    properties:
 *                      productId: 
 *                        type: string
 *                        description: ID of the product to be added in cart
 *                      quantity:
 *                        type: number
 *                        description: Quantity of the product to be added in cart
 *              required:
 *                -  userId
 *                -  items
 *      responses:
 *        '200':
 *          description: Products add to cart sucessfully!
 */ 
const addtoCart = asynchandlers(async (req, res) => {
    const { userId, items } = req.body;
  
    // Finding the user
    const user = await users.findById(userId);
  
    // If the user doesn't exist, return an error response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Array to store cart items to be added
    const itemsToAdd = [];
  
    // Loop through the items array
    for (const item of items) {
      const { productId, quantity } = item;
  
      // Find the product
      const product = await products.findById(productId);
  
      // If the product doesn't exist or is out of stock, skip this item
      if (!product || product.stock < quantity) {
        continue;
      }
  
      // Valid product, add to items to be added
      itemsToAdd.push({
        product: product._id,
        quantity: quantity,
      });
    }
  
    // Add all valid cart items to the user's cart
    user.cart.push(...itemsToAdd);
  
    // Save the user
    await user.save();
  
    res.status(200).json({ message: "Products added to cart successfully!", itemsAdded: itemsToAdd });
  });
  

// Remove product from cart

/**
 * @swagger
 * /remove:
 *   delete:
 *     summary: Remove from cart
 *     description: Remove products from cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of user from which product should be removed from cart
 *               productId:
 *                 type: string
 *                 description: ID of product that should be removed from cart
 *             required:
 *               - userId
 *               - productId
 *     responses:
 *       '200':
 *         description: Product removed from cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '500':
 *         description: Internal server error
 */
const removecart = asynchandlers(async (req, res) => {
  const {userId, productId} = req.body;
  //find user
  const user = await users.findById(userId)
  console.log(user)
  if(!user){
    res.status(404).json({error:"User not found"})
    return
  }
  // Remove the product from the cart
  // uses the filter method to create a new array that includes only the cart items that meet a certain condition
  user.cart = user.cart.filter(item => item.product.toString() !== productId);
  await user.save();

  res.status(200).json({ message: 'Product removed successfully!' });
})

// Get single user cart

const GetCart = asynchandlers(async(req, res)=>{
    const { userid } = req.query;
    // finding user

    const user = await users.findById(userid).populate('cart.product');
    // Check if user exist
    if(!user){
        res.status(404)
        res.json({message:"No User Found"})
    }

    res.status(200).json(user.cart)

})




export {addtoCart,
GetCart,
removecart}