const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const User = require('../models/User');
const { JWT_SECRET, GOOGLE_CLIENT_ID } = require('../config/constants');

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: "google" });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Google login successful",
      user: { id: user._id, name, email, picture }
    });
  } catch (error) {
    console.error("Google login failed:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phoneNumber });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phoneNumber: user.phoneNumber }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkAuth = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ loggedIn: false });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ loggedIn: false });
    res.json({ loggedIn: true, user });
  });
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Sign in successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phoneNumber: user.phoneNumber }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const signout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Sign out successful' });
};


const getMe = async (req, res) => {
  try {
    
    const userId = req.user.userId;

    
    const user = await User.findById(userId).select("-password"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User data fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error); // log to see the real issue
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { googleAuth, signup, checkAuth, signin, signout, getMe };