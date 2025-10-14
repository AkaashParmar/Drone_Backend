import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// GET /api/admin/users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('listUsers', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/user/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getUser', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/user/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Buyer','Seller','Renter','Partner','Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: user.toJSON() });
  } catch (err) {
    console.error('updateUserRole', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/user/:id
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "Admin cannot delete themselves" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/uploads
export const listUploads = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) return res.json({ files: [] });
    const files = fs.readdirSync(uploadsDir);
    res.json({ files });
  } catch (err) {
    console.error('listUploads', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/uploads/:filename
export const deleteUpload = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'File not found' });
    fs.unlinkSync(filepath);
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error('deleteUpload', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const byRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    res.json({ totalUsers, byRole });
  } catch (err) {
    console.error('getStats', err);
    res.status(500).json({ message: 'Server error' });
  }
};
