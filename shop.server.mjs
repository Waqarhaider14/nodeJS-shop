import express from 'express'
import {connectDB} from './config/db-connection.mjs'
import env from 'dotenv'
env.config()
const app = express();
const PORT = process.env.PORT || 4001;
// Middlwares
import errorMiddleWare from './middleware/errorHandling.middleware.mjs'
import authMiddleware from './middleware/authMiddleware.middleware.mjs'
import upload from './middleware/upload.middleware.mjs';
// Importing product controller
import {getProducts,newProducts, updateproduct, deleteproduct } from './controllers/product.controller.mjs'
// Importing Filters
import {searching, filterByCategory, filterbyPrice, filterbysize, filterByRating, indexSearch} from './controllers/product.filters.mjs'
// Importing Users controller
import {GetUsers, CreateUser, UpdateUser, deleteUsers} from './controllers/user.controller.mjs'
import {addtoCart, removecart, GetCart} from './controllers/cart.controller.mjs'
import {checkout, userAccount} from './controllers/checkout.controller.mjs'
import {submitReview} from './controllers/review.controller.mjs'
import {registerUser, loginUser, verify, forgotPassword, resetPassword} from './controllers/user.registration.login.mjs'
const router = express.Router()
// Swagger 
import swaggerspecs from './swagger/swagger.specs.mjs'
import swaggerUi from 'swagger-ui-express'

connectDB();
app.use(express.json())


app.use('/api-doc',swaggerUi.serve, swaggerUi.setup(swaggerspecs))

// Products
router.get("/products",getProducts)
router.post("/products",upload,authMiddleware,newProducts)
router.put("/products",upload,authMiddleware,updateproduct)
router.delete("/products",authMiddleware, deleteproduct)
// filters
router.get('/searching', searching);
router.get('/index/search',indexSearch)
router.get('/products/category',filterByCategory)
router.get('/products/price',filterbyPrice)
router.get('/products/size',filterbysize)
router.get('/products/rating',filterByRating)
// Users
router.get('/users',authMiddleware,GetUsers)
router.post('/users',authMiddleware,CreateUser)
router.put('/users',authMiddleware,UpdateUser)
router.delete('/users', authMiddleware,deleteUsers)
//cart
router.post("/cart/add",addtoCart)
router.delete("/remove",removecart)
router.get("/cart",GetCart)
//purchase
router.post('/checkout',checkout)
// review
router.post('/rating',authMiddleware,submitReview)
// Register & login 
router.post('/register', registerUser)
router.post('/login',loginUser)
router.get('/verify',verify)
router.post('/forgetPassword',forgotPassword)
router.post('/reset',resetPassword)
// Account page
router.get('/Account',authMiddleware,userAccount)
// Router
app.use(router)
app.get('/',(req, res)=>{
    res.send("Welcome to Ecommerce API's")
})

app.use(errorMiddleWare)
app.listen(PORT, () =>{
    console.log(`App is listening to ${PORT}`)
})


