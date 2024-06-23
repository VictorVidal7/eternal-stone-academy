
const Course = require('../models/course');
const User = require('../models/user');
const Assessment = require('../models/assessment');

exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await Course.find({ students: studentId }).populate('content').populate('instructor', 'name email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getInstructorReports = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const courses = await Course.find({ instructor: instructorId }).populate('students').populate('content');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
