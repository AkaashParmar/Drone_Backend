import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/productOrderModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("get-razorpay-key error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createOrder = async (req, res) => {
  try {
    const { items = [], amount, currency = "INR", receipt } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount is required" });

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, 
      notes: {
        items: JSON.stringify(items.map(i => ({ id: i.productId, qty: i.qty }))),
      },
    };

    const order = await razorpay.orders.create(options);

    // save order in DB with status 'created'
    const dbOrder = new Order({
      items,
      amount: amountInPaise,
      currency,
      receipt: options.receipt,
      razorpayOrderId: order.id,
      status: "created",
    });
    await dbOrder.save();

    res.status(201).json({ order, dbOrderId: dbOrder._id });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // verify signature: hmac_sha256(order_id|payment_id, key_secret)
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // update DB order
      const order = dbOrderId
        ? await Order.findById(dbOrderId)
        : await Order.findOne({ razorpayOrderId: razorpay_order_id });

      if (order) {
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = "paid";
        await order.save();
      }

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      console.warn("Invalid signature", { razorpay_order_id, razorpay_payment_id });
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};


export const webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const body = req.body; 
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (computedSignature !== signature) {
      console.warn("Webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(body.toString());
    const event = payload.event;

    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      // find order by razorpay_order_id and update
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.razorpayPaymentId = payment.id;
        order.status = "paid";
        await order.save();
      }
    } else if (event === "payment.failed") {
      const payment = payload.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.status = "failed";
        await order.save();
      }
    }
    // handle other events as needed...

    // respond quickly
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Server error");
  }
};
