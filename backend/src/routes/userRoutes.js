const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const protect = require('../middleware/protect');
//const role = require('../middleware/role');

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

router.put('/change-password', [auth, protect], (req, res, next) => userController.changePassword(req, res, next));

//router.put('/:id', [auth, protect], (req, res, next) => userController.updateUser(req, res, next));
router.put('/:id', [auth, protect], userController.updateUser);

//router.delete('/:id', [auth, protect], (req, res, next) => userController.deleteUser(req, res, next));
router.delete('/:id', [auth, protect], userController.deleteUser);

//router.get('/:id', [auth, protect, role(['admin', 'student'])], (req, res, next) => userController.getUser(req, res, next));
router.get('/:id', [auth, protect], userController.getUser);

router.post('/forgot-password', (req, res, next) => userController.forgotPassword(req, res, next));

router.put('/reset-password/:resettoken', (req, res, next) => userController.resetPassword(req, res, next));

module.exports = router;