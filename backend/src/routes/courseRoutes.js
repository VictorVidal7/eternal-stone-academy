
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const courseController = require('../controllers/courseController');

router.post('/', [auth, role(['instructor', 'admin'])], courseController.createCourse);
router.get('/', auth, courseController.getCourses);
router.get('/:id', auth, courseController.getCourseById);
router.put('/:id', [auth, role(['instructor', 'admin'])], courseController.updateCourse);
router.delete('/:id', [auth, role(['admin'])], courseController.deleteCourse);

module.exports = router;
