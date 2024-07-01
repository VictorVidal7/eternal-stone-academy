const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  let token = req.header('x-auth-token') || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    req.user = user;
    req.user.role = req.user.role || 'student';
    console.log('User role in auth middleware:', req.user.role);
    next();
  } catch (err) {
    res.status(401).json({ errors: [{ msg: 'Token is not valid' }] });
  }
};