
const Post = require('../models/post');
const Forum = require('../models/forum');

exports.createPost = async (req, res) => {
  const { content, forumId } = req.body;
  try {
    const newPost = new Post({
      content,
      forum: forumId,
      user: req.user.id,
    });

    const post = await newPost.save();

    let forum = await Forum.findById(forumId);
    forum.posts.push(post._id);
    await forum.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email').populate('forum');
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
