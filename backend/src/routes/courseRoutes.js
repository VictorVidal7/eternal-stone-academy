const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const protect = require('../middleware/protect');
const { checkRole } = require('../middleware/role');

// ... (mantén todas las definiciones de Swagger como están)

router.get('/', [auth, protect], courseController.getCourses);

router.get('/:id', [auth, protect], courseController.getCourse);

router.post('/', [auth, protect, checkRole(['admin', 'instructor'])], courseController.createCourse);

router.put('/:id', [auth, protect, checkRole(['admin', 'instructor'])], courseController.updateCourse);

router.delete('/:id', [auth, protect, checkRole(['admin', 'instructor'])], courseController.deleteCourse);

module.exports = router;