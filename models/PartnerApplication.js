import mongoose from "mongoose";

const partnerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true }, // partnership type selected
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PartnerApplication", partnerApplicationSchema);
