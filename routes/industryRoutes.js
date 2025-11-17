import express from "express";
import {
  addOrUpdateIndustry,
  getIndustries,
  getIndustryBySlug,
  updateIndustry,
  updateSectionImages,
  deleteIndustry,
  getIndustryTitlesWithImage,
} from "../controllers/industryController.js";
// import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", upload.array("images", 4), addOrUpdateIndustry);
router.get("/get", getIndustries);
router.get("/:slug", getIndustryBySlug);
router.put(
  "/:id",
  upload.array("images", 4),
  updateIndustry
);

router.put(
  "/industry/:id/section/:sectionIndex/update-images",
  upload.array("sectionImages", 4),
  updateSectionImages
);

router.delete("/:id", deleteIndustry);

router.get("/industry/titles", getIndustryTitlesWithImage);

export default router;
