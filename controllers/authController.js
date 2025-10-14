import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";


// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      fullName, phone, email, password, role,
      agreeTerms = false, rememberMe = false
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'User already exists with this email' });

    // Create new user with minimal roleDetails defaults
    const user = new User({
      fullName,
      phone,
      email: email.toLowerCase(),
      password,
      role: role || 'Buyer',
      agreeTerms,
      rememberMe
    });

    await user.save();

    res.status(201).json({
      message: 'User registered',
      user: user.toJSON(),
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
 try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    const message = `
      Hello ${user.fullName},
      <br/><br/>
      Your OTP for password reset is: <b>${otp}</b>.
      <br/>It is valid for 10 minutes.
      <br/><br/>
      If you didn't request this, please ignore this email.
    `;

    await sendEmail(user.email, 'Password Reset OTP', message);

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ msg: 'Email, OTP, and new password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: 'User not found' });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ msg: 'Invalid OTP' });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ msg: 'OTP expired' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
