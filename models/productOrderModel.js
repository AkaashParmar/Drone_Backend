import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional
  items: [
    {
      productId: { type: String, required: true }, // replace with ObjectId if you have Product model
      name: String,
      price: Number,
      qty: Number,
      image: String,
    },
  ],
  amount: { type: Number, required: true }, // in paise
  currency: { type: String, default: "INR" },
  receipt: { type: String }, // optional identifier
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["created","paid","failed","refunded"], default: "created" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
