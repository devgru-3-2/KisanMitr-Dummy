const User = require('../models/userSchema');
const { sendOTP, verifyOTP } = require('./auth');

exports.sendOTP = async (req, res) => {
  try {
    const { phone, userType } = req.body;

    // check if user exists in MongoDB
    const user = await User.findOne({ phone, role: userType });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // send OTP to user's phone number
    const otp = await sendOTP(phone);

    res.status(200).json({ message: 'OTP sent successfully', otp });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, userType, otp } = req.body;

    // verify OTP
    const isVerified = await verifyOTP(phone, otp);

    if (!isVerified) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // check if user exists in MongoDB
    const user = await User.findOne({ phone, role: userType });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
};
