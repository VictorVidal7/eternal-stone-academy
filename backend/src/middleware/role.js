const checkRole = (roles) => (req, res, next) => {
  console.log('Checking role:', roles, 'User role:', req.user.role);
  if (!req.user) {
    return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  if (!roles.includes(req.user.role)) {
    console.log('Access denied for user:', req.user);
    return res.status(403).json({ errors: [{ msg: 'Access denied. Required role not found.' }] });
  }

  next();
};

module.exports = { checkRole };