const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Ruta para el dashboard de administrador
router.get('/dashboard', [auth, checkRole(['admin'])], (req, res) => {
  console.log('Admin accessing dashboard. User:', req.user);
  res.status(200).json({ msg: 'Welcome to admin dashboard' });
});

module.exports = router;