import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { 
  submitServiceRequest, 
  getAllServiceRequests 
} from "../controllers/repairController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public — submit request
router.post("/submit", submitServiceRequest);


// Admin — see all
router.get(
  "/all",
  protect,
  allowRoles("Admin"),
  getAllServiceRequests
);

export default router;
