import express from "express";
import upload from "../middleware/uploadMiddleware.js"; // your diskStorage multer
import { submitContactForm, getAllMessages } from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public – Contact Form Submit
router.post("/submit", upload.array("attachments", 5), submitContactForm);

// Admin only – See all contact messages
router.get(
  "/all",
  protect,
  allowRoles("Admin"),
  getAllMessages
);

export default router;
