const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

router.get('/', auth, courseController.getCourses);

router.get('/:id', auth, courseController.getCourse);

router.post('/', [auth, checkRole(['admin', 'instructor'])], courseController.createCourse);

router.put('/:id', [auth, checkRole(['admin', 'instructor'])], courseController.updateCourse);

router.delete('/:id', [auth, checkRole(['admin', 'instructor'])], courseController.deleteCourse);

module.exports = router;