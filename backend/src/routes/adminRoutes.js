const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const protect = require('../middleware/protect');
const checkRole = require('../middleware/role');

// Ruta para el dashboard de administrador
router.get('/dashboard', [auth, protect, checkRole(['admin'])], (req, res) => {
  res.json({ msg: 'Welcome to admin dashboard' });
});

module.exports = router;