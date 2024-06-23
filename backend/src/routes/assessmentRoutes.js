
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const assessmentController = require('../controllers/assessmentController');

router.post('/', [auth, role(['instructor', 'admin'])], assessmentController.createAssessment);
router.get('/', auth, assessmentController.getAssessments);
router.get('/:id', auth, assessmentController.getAssessmentById);
router.delete('/:id', [auth, role(['admin'])], assessmentController.deleteAssessment);

module.exports = router;
