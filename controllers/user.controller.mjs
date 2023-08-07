import asynchandlers from 'express-async-handler'
import users from '../models/user.model.mjs'

// Get all users 
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users.
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     responses:
 *       200:
 *         description: Successful operation. Returns a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error.
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */


/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f41b6677d9190015e4dbd4"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "mysecretpassword"
 *         role:
 *           type: string
 *           enum:
 *             - "customer"
 *             - "admin"
 *           example: "customer"
 *         cart:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 example: 2
 *         purchases:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *         order:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */


const GetUsers = asynchandlers( async (req, res) =>{
    const getusers = await users.find()
    if(req.user.role !== 'admin'){
        return res.status(403).json({message:"Unauthorized! Only admin can access"})
    }
    res.status(200).json(getusers)
})

// Create new user

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add new users
 *     description: Adds a new user to the database.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *               $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: User(s) added successfully.
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */

const CreateUser = asynchandlers(async(req, res)=>{
    console.log("The new user is: ", req.body)
    const userData = req.body;
    if(!Array.isArray(userData) || userData.length === 0){
        res.status(404)
        res.json({message: "Invalid array or no data"})
    }
    if(req.user.role !== 'admin'){
       return res.status(403).json({message:"Unauthorized! Only admin can access "})
    }
    const userdata = await users.create(userData)
    res.status(200).json(userdata)
})

// update users
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update user
 *     description: Updates a user based on its ID. Only admin users can access this endpoint.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ID of the user to be updated.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden. Only admin users can access this endpoint.
 *       '404':
 *         description: Not Found. User not found.
 *       '500':
 *         description: Internal server error.
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:     # Define the ApiKey authentication scheme for JWT
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *
 */   
const UpdateUser = asynchandlers(async(req, res)=>{
    const { id } = req.query
    const finduser = await users.findById({_id : id})
    if(!finduser){
        res.status(404)
        res.json({message: "No User Found!"})
    }
    if(req.user.role !== 'admin'){
        return res.status(403).json({message:"Unauthorized! only user can access"})
    }
    const updateduser = await users.findByIdAndUpdate(
        finduser._id,
        req.body,
        {new : true}
    )
    res.status(200).json(updateduser)
})

// Delete users
/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete users
 *     description: Deletes one or more users from the database. Only admin users can access this endpoint.
 *     security:
 *       - ApiKeyAuth: []   # Specify the security requirement for the endpoint
 *     parameters:
 *       - in: query
 *         name: ids
 *         description: Comma-separated IDs of the users to be deleted.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Users deleted successfully.
 *       '403':
 *         description: Forbidden. Only admin users can access this endpoint.
 *       '404':
 *         description: Not Found. Some users not found or no IDs found.
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
const deleteUsers = asynchandlers(async(req, res)=>{
    const { ids } = req.query;
    if(!ids){
        res.status(404)
        res.json({message:"No Id's Found"})
    }
    if(req.user.role !== 'admin'){
        return res.status(403).json({message:"Unauthorized! Only admin can access"})
    }

    const IdArray = ids.split(",")
    const deletedUser = await users.deleteMany({_id : {$in : IdArray}})

    if (deletedUser.deleteCount != IdArray.length){
        res.status(404)
        res.json({message:"Some users not found"})
    }

    res.status(200).json({message:"Users Deleted"})
}) 
export { GetUsers,
    CreateUser,
    UpdateUser,
    deleteUsers
}