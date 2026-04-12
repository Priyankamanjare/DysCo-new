const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const registerUser = async(req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required.'
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if(!hashedPassword) {
      return res.status(500).json({
        message: 'Password could not be hashed'
      })
    }

    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    await user.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'User registration unsuccessful',
      error: error.message,
    });
  }
};

const loginUser = async(req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      })
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Password does not match.' 
      });
    }

    const token = generateToken(user._id);
    if(!token) {
      return res.status(500).json({
        message: 'Error creating token'
      })
    }

    return res.status(200).json({
      message: 'User logged in successfully',
      user: {
        name: user.name,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'User login unsuccessful',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
