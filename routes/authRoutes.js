import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Register (signup) - expects minimal primary fields and role (role optional)
router.post('/register', register);

// Login
router.post('/login', login);

export default router;
