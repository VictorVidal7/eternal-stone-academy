const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.registerUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    console.log('Registered user:', newUser);
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ ...newUser._doc, token });
  } catch (error) {
    console.log('Error during user registration:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log('Attempting to find user with email:', req.body.email); // Agregar depuración
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log('User not found with email:', req.body.email); // Agregar depuración
      throw new Error('Invalid credentials');
    }
    console.log('User found:', user); // Agregar depuración
    const isMatch = await user.comparePassword(req.body.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password does not match');
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log('Error during user login:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
