
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const forumController = require('../controllers/forumController');

router.post('/', [auth, role(['instructor', 'admin'])], forumController.createForum);
router.get('/', auth, forumController.getForums);
router.get('/:id', auth, forumController.getForumById);
router.delete('/:id', [auth, role(['admin'])], forumController.deleteForum);

module.exports = router;
