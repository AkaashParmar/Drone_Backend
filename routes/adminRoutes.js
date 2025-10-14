import express from 'express';
import {
  listUsers, getUser, updateUserRole, deleteUser,
  listUploads, deleteUpload, getStats
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect and restrict to Admin
router.use(protect, allowRoles('Admin'));

router.get('/users', listUsers);
router.get('/user/:id', getUser);
router.put('/user/:id/role', updateUserRole);
router.delete('/user/:id', deleteUser);

router.get('/uploads', listUploads);
router.delete('/uploads/:filename', deleteUpload);

router.get('/stats', getStats);

export default router;
