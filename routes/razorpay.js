import express from "express";
import { createOrder, verifyPayment, getRazorpayKey, webhookHandler, getMyOrders, getOrderById } from "../controllers/razorpayController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// public key for frontend
router.get("/get-razorpay-key", protect, getRazorpayKey);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Order Routes
router.get("/orders/my-orders", protect, getMyOrders);
router.get("/orders/:id", protect, getOrderById);

export default router;
