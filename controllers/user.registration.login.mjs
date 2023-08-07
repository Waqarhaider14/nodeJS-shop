import asynchandlers from "express-async-handler";
import bcrypt from "bcryptjs";
import users from "../models/user.model.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import main from '../nodeMailer/nodemailer.mjs'
import { v4 as uuidv4 } from 'uuid';

const ACCESS_TOKEN_SECRET = 'systems123@'


dotenv.config()

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registration successful. Check your email for verification.
 *       409:
 *         description: Email already exists!
 *       500:
 *         description: Internal Server Error
 */
const registerUser = asynchandlers(async(req, res)=>{
  const { name, email, password, role } = req.body;

  // Check if the user email already exists
  const emailfind = await users.findOne({ email });
  if (emailfind) {
    return res.status(409).json({ message: 'Email already exists!' });
  }

  // Hash the password
  const hashedpassword = await bcrypt.hash(password, 10);

  // Generate a unique verification token
  const verificationToken = uuidv4();

  // Make document object for the new user
  const regUser = new users({
    name,
    email,
    password: hashedpassword,
    role,
    verificationToken, 
  });

  try {
    // Save the user to the database
    await regUser.save();

    // Create the verification link with the token
    const verificationLink = `http://localhost:4001/verify?token=${verificationToken}`;

    // Send verification email to the new user
    const verificationText = 'Welcome to our platform! Please verify your email address'
    await main(email, verificationText, `Email Verification link:  ${verificationLink}`);

    // Respond with success message
    res.status(201).json({ message: 'User registration successful. Check your email for verification.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// verification 
const verify = asynchandlers(async(req, res)=>{
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is missing.' });
  }

  try {
    console.log('Verification token:', token);

    // Find the user with the given verification token
    const user = await users.findOne({ verificationToken: token });

    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found or already verified.' });
    }

    // Mark the user as verified and remove the verification token
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect the user to a success page or respond with a success message
    return res.status(200).json({ message: 'Email verification successful. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Login 

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login 
 *     description: Login to your account
 *     parameters: 
 *       - name: email
 *         in: query
 *         description: user's email
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         in: query
 *         description: user's password
 *         required: true
 *         schema:
 *           type: string
 *     responses: 
 *       '200':
 *         description: User Login successfully
 *         content:
 *           application/json:
 *             schema: 
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token for user's authentication 
 *       '404':
 *         description: user not found
 */
const loginUser = asynchandlers(async(req, res)=>{
    try {
        const { email, password } = req.query;
    
        // Validation: Check if email and password are provided
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required.' });
        }
    
        // Find the user by their email in the database
        const user = await users.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        if(user.verificationToken){
          res.status(400).json({message:"User not verified! please verify first!"})
        }
    
        // Compare the entered password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials.' });
        }
    
        // Generate a JSON Web Token (JWT) for the user's authentication
        const token = jwt.sign(
          {
            user: {
              username: user.username,
              email: user.email,
              id: user.id,
              role: user.role
            },
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' } // Changed token expiration to 1 hour for better usability
        );
    
        res.status(200).json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the login.' });
      }
    });

// forget password
const forgotPassword = asynchandlers(async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by their email in the database
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a unique password reset token
    const resetToken = uuidv4();

    // Update the user document with the resetToken and resetTokenExpires fields
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Set expiration to 1 hour (in milliseconds)
    await user.save();

    // Create the password reset link with the token
    const resetLink = `http://localhost:4001/reset?token=${resetToken}`;

    // Send the password reset email to the user
    const resetText = `To reset your password, click on the link below: ${resetLink}`;
    await main(email, resetText, 'Password Reset');

    res.status(200).json({ message: 'Password reset email sent. Please check your email for instructions.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// Reset password: 
const resetPassword = asynchandlers(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the user with the provided resetToken and check if it's not expired
    const user = await users.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the new hashed password and remove the resetToken fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

export { registerUser,
loginUser,
verify,
forgotPassword,
resetPassword
}