import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    topic: { type: String, required: true },
    orderId: { type: String },
    message: { type: String, required: true },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "low" },
    attachments: [
      {
        url: String,
        filename: String
      }
    ],
    agree: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactSchema);
