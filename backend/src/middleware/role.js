exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ errors: [{ msg: 'Unauthorized' }] });
    }

    const hasRole = roles.find(role => req.user.role === role);
    if (!hasRole) {
      return res.status(403).json({ errors: [{ msg: 'Access denied. Required role not found.' }] });
    }

    next();
  }
}