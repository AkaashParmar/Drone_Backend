import express from "express";
import { createOrder, verifyPayment, getRazorpayKey, webhookHandler } from "../controllers/razorpayController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET public key for frontend — only return key_id
router.get("/get-razorpay-key", protect, getRazorpayKey);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

export default router;
