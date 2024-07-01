const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
    }
    user = new User({ 
      name, 
      email, 
      password,
      role: role === 'admin' ? 'admin' : (role === 'instructor' ? 'instructor' : 'student')
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    console.error('Register User: Error during registration:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    console.error('Login User: Error during login:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.params.id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }
      user.email = email;
    }

    await user.save();

    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Update User: Error during update:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User: Error during deletion:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Get User: Error during retrieval:', error.message);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Current password is incorrect' }] });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ errors: [{ msg: 'New password must be at least 6 characters long' }] });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token válido por 10 minutos

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.json({ msg: 'Email sent' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ errors: [{ msg: 'Email could not be sent' }] });
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired token' }] });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ errors: [{ msg: 'Access denied. Required role not found.' }] });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    if (!['admin', 'instructor', 'student'].includes(newRole)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid role' }] });
    }

    user.role = newRole;
    await user.save();

    res.json({ 
      msg: 'User role updated successfully', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Change User Role Error:', error);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUser,
  changePassword,
  forgotPassword,
  resetPassword,
  changeUserRole
};