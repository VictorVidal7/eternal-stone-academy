const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  console.log('Register User: Request body:', req.body);
  const { name, email, password } = req.body;

  try {
    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Register User: Registered user:', user);
    console.log('Register User: Token generated:', token);

    res.status(201).json({ ...user.toObject(), token });
  } catch (error) {
    console.log('Register User: Error during registration:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  console.log('Login User: Request body:', req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login User: User not found with email:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Login User: Password match:', isMatch);

    if (!isMatch) {
      console.log('Login User: Password does not match');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login User: Token generated:', token);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.log('Login User: Error during login:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  console.log('Update User: Request params:', req.params);
  console.log('Update User: Request body:', req.body);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || password.length < 6) {
      throw new Error('Invalid data');
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      console.log('Update User: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('Update User: Updated user:', user);
    res.status(200).json(user);
  } catch (error) {
    console.log('Update User: Error during update:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  console.log('Delete User: Request params:', req.params);
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('Delete User: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('Delete User: User deleted successfully');
    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.log('Delete User: Error during deletion:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  console.log('Get User: Request params:', req.params);
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      console.log('Get User: User not found');
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('Get User: Found user:', user);
    res.status(200).json(user);
  } catch (error) {
    console.log('Get User: Error during retrieval:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};
