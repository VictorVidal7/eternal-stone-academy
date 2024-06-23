
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.get('/student-progress', auth, reportController.getStudentProgress);
router.get('/instructor-reports', auth, reportController.getInstructorReports);

module.exports = router;
