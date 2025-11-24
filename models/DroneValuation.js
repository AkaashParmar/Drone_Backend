import mongoose from "mongoose";

const droneValuationSchema = new mongoose.Schema({
  droneModel: String,
  purchaseYear: Number,
  originalPrice: Number,
  condition: String,
  flightHours: Number,
  batteryHealth: String,
  cameraCondition: String,
  crashes: String,
  accessories: [String],
  warranty: String,
  description: String,
  estimatedPrice: Number,
}, { timestamps: true });

export default mongoose.model("DroneValuation", droneValuationSchema);
