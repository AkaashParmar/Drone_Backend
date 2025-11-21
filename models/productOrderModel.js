import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: String, required: true }, 
      name: String,
      price: Number,
      qty: Number,
      image: String,
    },
  ],
  amount: { type: Number, required: true }, 
  currency: { type: String, default: "INR" },
  receipt: { type: String }, 
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["created","paid","failed","refunded"], default: "created" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
