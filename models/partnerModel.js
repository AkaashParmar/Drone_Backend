import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true },
  experience: String,
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Partner", partnerSchema);
