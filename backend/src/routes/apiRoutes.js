
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/courses', apiController.getCourses);
router.get('/courses/:id', apiController.getCourseById);

module.exports = router;
