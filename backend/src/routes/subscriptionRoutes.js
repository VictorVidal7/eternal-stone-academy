
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

router.post('/', auth, subscriptionController.createSubscription);
router.get('/', auth, subscriptionController.getSubscriptions);
router.get('/:id', auth, subscriptionController.getSubscriptionById);
router.delete('/:id', auth, subscriptionController.deleteSubscription);

module.exports = router;
