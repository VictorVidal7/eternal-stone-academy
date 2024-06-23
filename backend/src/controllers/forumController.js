
const Forum = require('../models/forum');
const Post = require('../models/post');

exports.createForum = async (req, res) => {
  const { title, courseId } = req.body;
  try {
    const newForum = new Forum({
      title,
      course: courseId,
    });

    const forum = await newForum.save();
    res.json(forum);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find().populate('course').populate('posts');
    res.json(forums);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).populate('course').populate('posts');
    if (!forum) {
      return res.status(404).json({ msg: 'Forum not found' });
    }
    res.json(forum);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ msg: 'Forum not found' });
    }

    await forum.remove();
    res.json({ msg: 'Forum removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
