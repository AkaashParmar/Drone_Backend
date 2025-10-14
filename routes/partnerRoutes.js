import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyPartner, getAllPartners } from "../controllers/partnerController.js";

const router = express.Router();

router.post("/", protect, applyPartner);
router.get("/", protect, getAllPartners);

export default router;
