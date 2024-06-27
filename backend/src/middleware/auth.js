const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  console.log('Auth Middleware: Checking token:', token);

  if (!token) {
    console.log('Auth Middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware: Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth Middleware: Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
