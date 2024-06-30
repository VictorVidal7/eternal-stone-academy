// auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token') || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    req.user.role = req.user.role || 'student';
    console.log('User in auth middleware:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ errors: [{ msg: 'Token is not valid' }] });
  }
};