import express from "express";
import {
  createIndustry,
  getIndustries,
  getIndustryBySlug,
  updateIndustry,
  deleteIndustry,
} from "../controllers/industryController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.array("images", 4), createIndustry);
router.get("/", getIndustries); 
router.get("/:slug", getIndustryBySlug); 
router.put("/:id", upload.array("images", 4), updateIndustry); 
router.delete("/:id", deleteIndustry); 

export default router;
