import express from "express";
import {
    createDrone,
    getDrones,
    updateDrone,
    getDroneById,
    deleteDrone,
    getRelatedAccessories,
    buyNow,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), protect, createDrone);
router.get("/", protect, getDrones);
router.put("/:id", protect, upload.single("image"), updateDrone);
router.get("/:id",protect, getDroneById);
router.delete("/:id", protect, deleteDrone);
router.get('/:droneId/related-accessories', protect, getRelatedAccessories);
router.post('/buy-now', protect, buyNow);

export default router;
