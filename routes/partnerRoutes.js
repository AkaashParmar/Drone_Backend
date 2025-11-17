import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyPartner, getAllPartners , submitPartnerApplication, getAllPartnerApplications } from "../controllers/partnerController.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, applyPartner);
router.get("/", protect, getAllPartners);
router.post("/submit", submitPartnerApplication);

// Admin-only: fetch all partner applications
router.get(
  "/all",
  protect,
  allowRoles("Admin"),
  getAllPartnerApplications
);

export default router;
