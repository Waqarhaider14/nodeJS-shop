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
// cluster setup
import  cluster from 'cluster';
import os from 'os'

const setupWorkerProcesses = () => {
    const numCores = os.cpus().length;
    console.log(`Master cluster setting up ${numCores} workers`);
  
    for (let i = 0; i < numCores; i += 1) {
      cluster.fork()
    }
  
    cluster.on("online", (worker) => {
      console.log(`Worker ${worker.process.pid} is listening`);
    });
  
    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      console.log("Starting a new worker");
      cluster.fork();
    });
  };

  
const setUpExpress = () => {
connectDB();
app.use(express.json())


app.use('/api-doc',swaggerUi.serve, swaggerUi.setup(swaggerspecs))

// Products
router.get("/products",getProducts)
router.post("/products",authMiddleware,newProducts)
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

app.use(errorMiddleWare)
app.listen(PORT, () =>{
    console.log(`App is listening to ${PORT} `)
})
}

const setupServer = (isClusterRequired) => {
  if (isClusterRequired && cluster.isPrimary) {
    setupWorkerProcesses();
  } else {
    setUpExpress();
  }
};

setupServer(true);

export default app;

