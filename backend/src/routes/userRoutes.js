const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    userController.registerUser(req, res, next);
  }
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    userController.loginUser(req, res, next);
  }
);

router.put('/change-password', auth, userController.changePassword);

router.put('/change-role', [auth, checkRole(['admin'])], userController.changeUserRole);

router.post('/forgot-password', userController.forgotPassword);

router.put('/reset-password/:resettoken', userController.resetPassword);

router.put('/:id', auth, userController.updateUser);

router.delete('/:id', auth, userController.deleteUser);

router.get('/:id', [auth, checkRole(['admin', 'instructor', 'student'])], userController.getUser);

module.exports = router;