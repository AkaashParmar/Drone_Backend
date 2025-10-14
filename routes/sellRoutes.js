import express from "express";
import {
    createDroneListing,
    getAllDroneListings,
    getDroneListingById,
    deleteDroneListing
} from "../controllers/sellController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.array("images", 5), createDroneListing);
router.get("/", getAllDroneListings);
router.get("/:id", getDroneListingById);
router.delete("/:id", protect, deleteDroneListing);

export default router;
