import express from 'express';
import {
    addOrUpdateService,
    getAllServices,
    getServiceByType,
    getServiceById,
    updateService,
    addOrUpdateFAQs,
    getServiceSummary
} from '../controllers/serviceController.js';
// import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post('/add', upload.array("image", 5), addOrUpdateService);
router.get('/all', getAllServices);
router.get('/id/:id', getServiceById);
router.get('/type/:type', getServiceByType);
router.put("/update", upload.array("image", 1), updateService);
router.post("/faqs/add-update", addOrUpdateFAQs);
router.get("/summary", getServiceSummary);

export default router;
