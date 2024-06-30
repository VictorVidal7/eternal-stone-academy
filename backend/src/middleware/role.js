const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ errors: [{ msg: 'Access denied. Required role not found.' }] });
  }

  next();
};

module.exports = checkRole;