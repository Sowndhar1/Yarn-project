import { signToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import CustomerProfile from "../models/CustomerProfile.js";
import StaffProfile from "../models/StaffProfile.js";
import AdminProfile from "../models/AdminProfile.js";
import fs from 'fs';
import path from 'path';

const logToFile = (msg) => {
  const logPath = path.join(process.cwd(), 'debug_log.txt');
  fs.appendFileSync(logPath, msg + '\n');
};

const sanitizeUser = (user, profile = null) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  username: user.username,
  role: user.role,
  phone: user.phone,
  addresses: user.addresses, // Include addresses in response
  details: profile || null, // Individual details fetched from separate "database" (collection)
});

export const login = async (req, res) => {
  try {
    const { identifier, password, userType = 'staff', user_type } = req.body || {};
    const loginType = user_type || userType;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    // Find user with matching credentials
    const logMsg1 = `[LOGIN_DEBUG] Attempting login for: ${identifier}, type: ${loginType}`;
    console.log(logMsg1);
    logToFile(logMsg1);

    const user = await User.findOne({
      $and: [
        {
          $or: [
            { username: { $regex: new RegExp(`^${identifier}$`, 'i') } },
            { email: { $regex: new RegExp(`^${identifier}$`, 'i') } } // Case-insensitive email match
          ]
        },
        { isActive: true }
      ]
    });

    if (!user) {
      const logMsg2 = `[LOGIN_DEBUG] User not found or inactive for: ${identifier}`;
      console.log(logMsg2);
      logToFile(logMsg2);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const logMsg3 = `[LOGIN_DEBUG] User found: ${user.username} (${user.role})`;
    console.log(logMsg3);
    logToFile(logMsg3);

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const logMsg4 = `[LOGIN_DEBUG] Password mismatch for: ${user.username}`;
      console.log(logMsg4);
      logToFile(logMsg4);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user type matches the login type
    if (loginType === 'customer' && user.role !== 'customer') {
      return res.status(403).json({ message: "Please use the customer login page" });
    }

    if (loginType === 'staff' && user.role === 'customer') {
      return res.status(403).json({ message: "Please use the customer login page" });
    }

    // Fetch Role-Specific Profile (The "Separate Database" logic)
    let profile = null;
    if (user.role === 'customer') profile = await CustomerProfile.findOne({ userId: user._id });
    else if (user.role === 'admin') profile = await AdminProfile.findOne({ userId: user._id });
    else profile = await StaffProfile.findOne({ userId: user._id });

    const token = signToken({ ...user.toObject(), id: user._id.toString() });
    res.json({
      token,
      user: sanitizeUser(user, profile),
      redirectTo: getRedirectPath(user.role)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'sales_staff':
      return '/sales';
    case 'inventory_staff':
      return '/inventory';
    case 'customer':
      return '/my-account';
    default:
      return '/';
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch Role-Specific Profile
    let profile = null;
    if (user.role === 'customer') profile = await CustomerProfile.findOne({ userId: user._id });
    else if (user.role === 'admin') profile = await AdminProfile.findOne({ userId: user._id });
    else profile = await StaffProfile.findOne({ userId: user._id });

    res.json({ user: sanitizeUser(user, profile) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, username } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        ...(username ? [{ username: { $regex: new RegExp(`^${username}$`, 'i') } }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      phone: phone || "",
      username: username || email.split('@')[0],
      password,
      role: "customer",
      isActive: true,
    });

    // Create isolated customer profile (The "Separate Database" logic)
    const profile = await CustomerProfile.create({ userId: newUser._id });

    const token = signToken({ ...newUser.toObject(), id: newUser._id.toString() });
    res.status(201).json({
      token,
      user: sanitizeUser(newUser, profile),
      message: "Registration successful"
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("updateProfile called. User ID:", req.user?.id);
    console.log("Request Body:", req.body);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error("updateProfile: User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, addresses } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    await user.save();

    // Fetch Role-Specific Profile for consistency
    let profile = null;
    if (user.role === 'customer') profile = await CustomerProfile.findOne({ userId: user._id });
    else if (user.role === 'admin') profile = await AdminProfile.findOne({ userId: user._id });
    else profile = await StaffProfile.findOne({ userId: user._id });

    res.json({
      user: sanitizeUser(user, profile),
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
