const User = require('../models/user');

exports.registerUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    console.log('Registered user:', newUser);
    res.status(201).json(newUser);
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
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.log('Error during user login:', error.message);
    res.status(400).json({ error: error.message });
  }
};
