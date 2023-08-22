import asynchandlers from 'express-async-handler'
import product from '../models/shop.model.mjs'

// Search products
/**
 * @swagger
 * /searching:
 *    get:
 *     summary: Filter products
 *     description: Filter product on the basis of name, price, stock, category
 *     parameters:
 *     - name : key
 *       in : query
 *       description: Search keyword
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       '200':
 *         description: Search ruslt successfully retrived
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal  error
 */
const searching = asynchandlers(async (req, res)=>{
    const { key } = req.query
    try{
    let productfield = await product.find(
        {
            "$or":[
                {name:{$regex:key}},
                //{price:{$regex:key}},
                //{stock:{$regex:key}},
                {category:{$regex:key}}
            ]
        }
    )
    res.status(200).json(productfield)
    } catch (error){
        console.error(error)
    }
})
/**
 * @swagger
 * /index/search:
 *   get:
 *     summary: Search products by name
 *     description: Search for products based on the given product name
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Product name to search for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Search ruslt successfully retrived
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal  error
 */
// Search by Index 

const indexSearch = asynchandlers(async(req, res)=>{

    const productName = req.query.q
    console.log(productName)
    if(!productName){
        res.status(400).json({message:"No Product Name Provided!"})
    }

    try{
        const regex = new RegExp(productName, 'i');
        const result = await product.find({ name: { $regex: regex } })
        console.log(result)
        res.json(result)

    } catch(err){
        console.error('Error searching products',err)
        res.status(500).json({message:"Interval Server Error"})
    }
})



// Filter by Category
/**
 * @swagger
 * /products/category:
 *    get:
 *     summary: Filter Products
 *     description: Filter products by category 
 *     parameters:
 *     - name: category
 *       in : query
 *       description: Get specific category products by adding category 
 *       required: true
 *       schema:
 *         type: string
 *     responses: 
 *       '200':
 *         description: Product filter by category successfully found!
 *         content: 
 *           application/json:
 *             schema: 
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Product'
 *       '404':
 *         description: No category found
 *       '500':
 *         description: internal server error
 * 
 */
const filterByCategory = asynchandlers(async(req, res)=>{
    const  category  = req.query.category;
    if(!category){
        res.status(404)
        throw new Error("No Category found!")
    }

    const filteredcategory = await product.find({ category : category})
    res.status(200).json(filteredcategory)
})

// Filter by price
/**
 * @swagger
 * /products/price:
 *    get:
 *     summary: Filter by price 
 *     description: Filter by Price range by entering Min price and Max price
 *     parameters:
 *     - name: minPrice
 *       in: query
 *       description: Add min price 
 *       required: true
 *       schema: 
 *         type: number
 *     - name: maxPrice
 *       in: query
 *       description: Add max price 
 *       required: true
 *       schema:
 *         type: number
 *     responses:
 *        '200':
 *          description: Filter products by given price range successfully
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items: 
 *                  $ref: '#/components/schemas/Product'
 *        '404':
 *          description: No price range found
 *        '500':
 *           description: Internal server error
 *   
 */
const filterbyPrice = asynchandlers(async(req, res) =>{
    const minPrice = parseFloat(req.query.minPrice)
    const maxPrice = parseFloat(req.query.maxPrice)

    if(isNaN(minPrice) || isNaN(maxPrice)){
        res.status(404)
        res.json({message:"No Price range found"})
    }

    const priceRange = await product.find({price:{$gte : minPrice, $lte :maxPrice}})
    res.status(200).json(priceRange)
})

//Filter by Size
/**
 * @swagger
 * /products/size:
 *    get:
 *     summary: Filter by size
 *     description: Filter products by size
 *     parameters:
 *     - name: size
 *       in : query
 *       description: Add size by which product would be filters
 *       required: true
 *       schema:
 *         type: string
 *     responses: 
 *        '200':
 *          description: Filtered by size, Products are retrived
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items: 
 *                  $ref: '#/components/schemas/Product'
 *        '404':
 *          description: No size found
 *        '500':
 *           description: Internal server error
 */
const filterbysize = async (req, res) => {
    try {
      const size = req.query.size;
  
      if (!size) {
        res.status(404).json({ message: 'No size found' });
        return;
      }
  
      const sizeFilter = await product.find({ size: size });
      res.status(200).json(sizeFilter);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Filter by rating
/**
 * @swagger
 * /products/rating:
 *    get:
 *     summary: Filter by review
 *     description: Filter products by review
 *     parameters:
 *     - name: minRating
 *       in : query
 *       description: Add min rating you need!
 *       required: true
 *       schema:
 *         type: string
 *     responses: 
 *        '200':
 *          description: Filtered by rating
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items: 
 *                  $ref: '#/components/schemas/Product'
 *        '404':
 *          description: No size found
 *        '500':
 *           description: Internal server error
 */
const filterByRating = asynchandlers(async(req, res)=>{
    const { minRating } = req.query;

    const filteredProduct = await product.find({'review.rating':{$gte : parseInt(minRating)}})

    res.status(200).json(filteredProduct)
})

export {searching,
indexSearch,
filterByCategory,
filterbyPrice,
filterbysize,
filterByRating}