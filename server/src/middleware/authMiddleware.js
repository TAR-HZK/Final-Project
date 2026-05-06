const jwt = require('jsonwebtoken');
const User = require('../features/users/userModel');

const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next middleware or controller function
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

module.exports = { protect };