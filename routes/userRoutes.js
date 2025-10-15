import express from 'express';
import {
  getProfile, updateProfile, selectRole,
  updateRoleDetails, uploadDocs, getUsersByRole, addToCart, removeFromCart
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadMultiple  from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/select-role', protect, selectRole);
router.put('/role-details', protect, updateRoleDetails);

// upload seller docs (protected)
router.post('/upload-docs', protect, (req, res, next) => {
  // multer middleware wrapper to handle array upload errors
  uploadMultiple(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadDocs);

// public (or protected depending on your app) get users by role
router.get('/by-role/:role', protect, getUsersByRole);

router.post('/add', protect, addToCart);
router.post('/remove', protect, removeFromCart);

export default router;
