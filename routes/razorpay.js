import express from "express";
import { createOrder, verifyPayment, getRazorpayKey, webhookHandler } from "../controllers/razorpayController.js";
const router = express.Router();

// GET public key for frontend — only return key_id
router.get("/get-razorpay-key",  getRazorpayKey);
router.post("/create-order",  createOrder);
router.post("/verify-payment",  verifyPayment);
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

export default router;
