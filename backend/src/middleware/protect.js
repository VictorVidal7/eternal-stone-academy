const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;
  console.log('Protect Middleware: Headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Protect Middleware: Token found in authorization header:', token);
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
    console.log('Protect Middleware: Token found in x-auth-token header:', token);
  }

  if (!token) {
    console.log('Protect Middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Protect Middleware: Token decoded:', decoded);

    req.user = await User.findById(decoded.id).select('-password');
    console.log('Protect Middleware: User found:', req.user);

    if (!req.user) {
      console.log('Protect Middleware: User not found in database');
      return res.status(404).json({ msg: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Protect Middleware: Error during token verification:', error.message);
    res.status(401).json({ msg: 'Token verification failed' });
  }
};

module.exports = protect;
