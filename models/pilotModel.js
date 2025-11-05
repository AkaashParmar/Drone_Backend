import mongoose from "mongoose";

const pilotSchema = new mongoose.Schema(
  {
    // === Personal ===
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    description: { type: String, required: true },
    currency: { type: String, required: true },
    photo: { type: String, required: true },
    logo: { type: String },

    // === Location ===
    locationType: { type: String }, // e.g., "Urban", "Rural"
    coverageArea: { type: String }, // e.g., "Pan India"
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },

    // === Portfolio ===
    portfolioLinks: [String], // e.g., YouTube, website URLs

    // === Essentials ===
    licenseNumber: { type: String },
    expiryDate: { type: String },
    experienceYears: { type: Number },
    companyName: { type: String },
    availableForHire: { type: Boolean, default: true },

    // === Equipment ===
   drones: [String],

    // === Capabilities ===
    capabilities: [String], // e.g., "Aerial Mapping", "Cinematography"
    certifications: [String],

    // === Insurance ===
    insuranceProvider: { type: String },
    policyNumber: { type: String },
    expiry: { type: String },

    // === Expertise ===
    expertiseAreas: [String], // e.g., "Agriculture", "Construction"
    projectCount: { type: Number },
    notableClients: [String],
  },
  { timestamps: true }
);

const Pilot = mongoose.model("Pilot", pilotSchema);
export default Pilot;
