import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    droneModel: { type: String, required: true },
    inspection: { type: String, required: true },
    issue: { type: String, required: true },

    // From which repair page the form was submitted
    topic: { 
      type: String, 
      // enum: [
      //   "Basic Repair Plan",
      //   "Emergency Service Repair Plan",
      //   "Full Service Repair Plan"
      // ],
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
