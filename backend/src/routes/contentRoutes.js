
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const contentController = require('../controllers/contentController');

router.post('/', [auth, role(['instructor', 'admin'])], contentController.addContent);
router.get('/:id', auth, contentController.getContentById);
router.delete('/:id', [auth, role(['instructor', 'admin'])], contentController.deleteContent);

module.exports = router;
