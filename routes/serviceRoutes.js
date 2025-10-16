import express from 'express';
import {
    addOrUpdateService,
    getAllServices,
    getServiceByType,
    getServiceById
} from '../controllers/serviceController.js';
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post('/add', upload.array("image", 5), protect, addOrUpdateService);
router.get('/all', protect, getAllServices);
router.get('/id/:id', protect, getServiceById);
router.get('/type/:type', protect, getServiceByType);

export default router;
