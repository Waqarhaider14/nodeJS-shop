import asynchandlers from 'express-async-handler'
import products from '../models/shop.model.mjs'

// Review 
/**
 * @swagger
 * /rating:
 *   post:
 *     summary: Submit Review
 *     description: Submit a review for a product.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user submitting the review.
 *               productId:
 *                 type: string
 *                 description: ID of the product to submit the review for.
 *               rating:
 *                 type: number
 *                 description: Rating value (integer) for the product.
 *               comment:
 *                 type: string
 *                 description: Optional comment for the review.
 *     responses:
 *       '200':
 *         description: Product review added successfully.
 *       '400':
 *         description: Bad request. Invalid input data or user has already submitted a review for this product.
 *       '404':
 *         description: Product not found.
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

const submitReview = asynchandlers(async(req, res)=>{

  const {userId, productId, rating, comment} = req.body;
    const product = await products.findById(productId);
    
    if(req.user.userId !== userId){
        return res.status(403).json({message:"You are not eligible to review this product "})
    }
    if(!product){
        res.status(404).json({message:"No product found!"})
    }
    
    // check if user already rated products
    existingReview = await product.review.find((review)=> review.user.tostring() === userId)

    if(existingReview){
        res.status(404).json({message:"User already submit review for this product"})
    }

    // Creating object for rating

    const ratingObject = {
        user : userId,
        rating: parseInt(rating),
        comment: comment
    }

    // adding in products's review array

    product.review.push(ratingObject)

    //saving product

    await product.save()

    res.status(200).json({message:"product review added successfully!"})

})

export { submitReview}