import mongoose from "mongoose";

const droneListingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    droneModel: { type: String, required: true },
    condition: {
      type: String,
      enum: ["Brand New","Like New","Excellent","Good","Fair","For Parts"],
      default: "Brand New",
    },
    flightHours: { type: Number, default: 0 },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] }, 
  },
  { timestamps: true }
);

const DroneListing = mongoose.model("DroneListing", droneListingSchema);
export default DroneListing;
