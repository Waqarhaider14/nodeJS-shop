// authMiddleware.js
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization; // Assuming the token is passed in the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Please login first!' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('Decoded Token is:', decodedToken);
    req.user = {
      userId: decodedToken.user.id,
      role: decodedToken.user.role
    }
    console.log(req.user)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

export default authMiddleware;
