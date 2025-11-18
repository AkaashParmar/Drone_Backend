import express from "express";
import {
    createDrone,
    getDrones,
    updateDrone,
    getDroneById,
    deleteDrone,
    getRelatedAccessories,
    buyNow,
    getInTheBoxItems,
    addInTheBoxItems,
    getAllDrones,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), protect, createDrone);
router.get("/", protect, getDrones);
router.get("/drones", getAllDrones);
router.get("/:id", getDroneById);
router.put("/:id", protect, upload.single("image"), updateDrone);

router.delete("/:id", protect, deleteDrone);
router.get('/:droneId/related-accessories', protect, getRelatedAccessories);
router.post('/buy-now', protect, buyNow);
router.get('/:droneId/in-the-box', protect, getInTheBoxItems);
router.post('/:droneId/in-the-box', protect, addInTheBoxItems);



export default router;
