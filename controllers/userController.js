import User from '../models/User.js';
import path from 'path';

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getProfile', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, phone, agreeTerms, rememberMe } = req.body;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (agreeTerms !== undefined) user.agreeTerms = agreeTerms;
    if (rememberMe !== undefined) user.rememberMe = rememberMe;

    await user.save();
    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (err) {
    console.error('updateProfile', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/select-role
export const selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Buyer','Seller','Renter','Partner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.user._id);
    user.role = role;
    await user.save();
    res.json({ message: 'Role selected', role: user.role, user: user.toJSON() });
  } catch (err) {
    console.error('selectRole', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/role-details
// Accepts role-specific object in body (for Buyer, Seller, Renter, Partner)
export const updateRoleDetails = async (req, res) => {
  try {
    const { roleDetails } = req.body; // expects an object like { buyer: {...} } or { seller: {...} }
    if (!roleDetails || typeof roleDetails !== 'object') {
      return res.status(400).json({ message: 'roleDetails object required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Merge provided roleDetails into existing
    for (const key of Object.keys(roleDetails)) {
      if (key in user.roleDetails) {
        // shallow merge; for arrays and primitives this replaces, but you can customize merging if needed
        user.roleDetails[key] = { ...user.roleDetails[key].toObject ? user.roleDetails[key].toObject() : user.roleDetails[key], ...roleDetails[key] };
      } else {
        // ignore unknown keys
      }
    }

    await user.save();
    res.json({ message: 'Role details updated', roleDetails: user.roleDetails });
  } catch (err) {
    console.error('updateRoleDetails', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/user/upload-docs
export const uploadDocs = async (req, res) => {
  try {
    // multer populated req.files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const filePaths = req.files.map(f => {
      // return relative path in uploads folder
      return `/uploads/${f.filename}`;
    });

    // attach to seller docs array
    user.roleDetails.seller.sellerDocs = [...(user.roleDetails.seller.sellerDocs || []), ...filePaths];
    await user.save();

    res.json({ message: 'Files uploaded', files: filePaths });
  } catch (err) {
    console.error('uploadDocs', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/user/by-role/:role
export const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    if (!['Buyer','Seller','Renter','Partner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('getUsersByRole', err);
    res.status(500).json({ message: 'Server error' });
  }
};
