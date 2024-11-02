const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: `User registered successfully: ${username}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error during registration: ${err.message}` });
  }
};

const login = async (req, res) => {
  console.log("logging in...");
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `Invalid password` });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const userObj = user.toObject();
    res.status(200).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: `Error during login: ${err.message}` });
  }
};
// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, profilePicture } = req.body;
    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (profilePicture) updatedFields.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: `Error updating profile: ${err.message}` });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: `Error fetching users: ${err.message}` });
  }
};

module.exports = {
  register,
  login,
  updateUserProfile,
  getAllUsers,
};
