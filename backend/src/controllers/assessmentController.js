
const Assessment = require('../models/assessment');

exports.createAssessment = async (req, res) => {
  const { title, questions, courseId, instructor } = req.body;
  try {
    const newAssessment = new Assessment({
      title,
      questions,
      course: courseId,
      instructor,
    });

    const assessment = await newAssessment.save();
    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate('course').populate('instructor', 'name email');
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('course').populate('instructor', 'name email');
    if (!assessment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    await assessment.remove();
    res.json({ msg: 'Assessment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
