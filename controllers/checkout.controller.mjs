import asynchandlers from "express-async-handler";
import products from "../models/shop.model.mjs";
import users from "../models/user.model.mjs";
import order from "../models/orders.model.mjs";
import stripeModule from 'stripe';
import main from '../nodeMailer/nodemailer.mjs'

const stripeAPIKey = "sk_test_51NXKZGFQgZz54RKwEwbmgjG9hiB3dQ1EhKfcLWMtMmGHlVbfZkYDXtc41CwwHviA5erEMXkJ8q9HYTa2evWYuOvW00lUrCdScF";
const stripe = stripeModule(stripeAPIKey);
// checkout

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Checkout and process payment
 *     description: Process payment for the products in the user's cart and create an order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who is checking out and making the payment.
 *               paymentMethodId:
 *                 type: string
 *                 description: ID of the payment method used for the transaction.
 *             required:
 *               - userId
 *               - paymentMethodId
 *     responses:
 *       '200':
 *         description: Product purchased successfully. Order created and inventory updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 order:
 *                   type: object
 *                   description: Order details.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID of the created order.
 *                     user:
 *                       type: string
 *                       description: ID of the user who placed the order.
 *                     items:
 *                       type: array
 *                       description: Array of ordered items.
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                             description: ID of the ordered product.
 *                           quantity:
 *                             type: number
 *                             description: Quantity of the ordered product.
 *                           price:
 *                             type: number
 *                             description: Price of the ordered product.
 *                     total:
 *                       type: number
 *                       description: Total price of the order.
 *       '400':
 *         description: Payment failed. The payment was not successful.
 *       '404':
 *         description: No user found or empty cart. The user is not found or the cart is empty.
 *       '500':
 *         description: Internal server error. An error occurred while processing the payment.
 */

const checkout = asynchandlers(async(req, res)=>{
    const { userId, paymentMethodId } = req.body;
  // Retrieving cart
  const user = await users.findById(userId).populate('cart.product');

  // Checking if user is invalid or empty cart
  if (!user || user.cart.length === 0) {
    res.status(404).json({ message: 'No user found or empty cart' });
  }

  // calculating total price
  const totalPrice = user.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Stripe expects the amount in cents
      currency: 'usd', // Adjust as needed for your currency
      payment_method: paymentMethodId,
      confirm: true,
    });

    // If the payment is successful, create the order and update the inventory
    if (paymentIntent.status === 'succeeded') {
      // Create orders
      const orders = {
        user: userId,
        items: user.cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: totalPrice,
      };

      // Save orders
      const savedOrder = await order.create(orders);

      // Update inventory
      for (const item of user.cart) {
        const product = await products.findById(item.product._id);
        
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
      const {email}= user
      const message = "Thank you for your order!  "
      await main(email, "Order Confirmation", message)
      res.status(200).json({ message: 'Product purchased successfully!', order: savedOrder });
    } else {
      res.status(400).json({ message: 'Payment failed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the payment.' });
  }
});


// User Account 
/**
 * @swagger
 * /Account:
 *   get:
 *     summary: User Account
 *     description: Get user account details.
 *     parameters:
 *       - in: query
 *         name: userId
 *         description: ID of the user account to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     responses:
 *       '200':
 *         description: User account details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the user.
 *                 email:
 *                   type: string
 *                   description: Email of the user.
 *                 role:
 *                   type: string
 *                   description: Role of the user.
 *                 purchases:
 *                   type: array
 *                   description: Array of user's purchases.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID of the purchase.
 *                       product:
 *                         type: string
 *                         description: ID of the purchased product.
 *                       quantity:
 *                         type: number
 *                         description: Quantity of the purchased product.
 *       '400':
 *         description: Bad request. Invalid input data or unauthorized to access this account.
 *       '404':
 *         description: User not found.
 *       '500':
 *         description: Internal server error.
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */


const userAccount = asynchandlers(async (req, res) =>{
  const { userId } = req.query;

  // check if the given user id match with authenticated user

  if(req.user.userId !== userId){
    res.status(400).json({message:"You are not allowed to access this dashboard"})
  }

  // find if user exist 
  const findUser = await users.findById(userId)
  if(!findUser){
    res.status(404).json({message:"No user found"})
  }

  const {name, email, purchases, role} = findUser;

  const UserAccount = {
    name : name,
    email: email,
    role: role,
    purchases: purchases,
  }

  res.status(200).json(UserAccount)
})

export { checkout,
    userAccount}