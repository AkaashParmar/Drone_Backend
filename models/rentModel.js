import mongoose from "mongoose";

const rentSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  droneModel: { type: String, required: true },
  rentDuration: { type: Number, required: true }, // in days
  rentPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "completed"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Rent", rentSchema);
