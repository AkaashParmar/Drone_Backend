import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyForRent, getAllRents } from "../controllers/rentController.js";

const router = express.Router();

router.post("/", protect, applyForRent);
router.get("/", protect, getAllRents);

export default router;
