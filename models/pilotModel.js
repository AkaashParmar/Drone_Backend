import mongoose from "mongoose";


const qualificationSchema = new mongoose.Schema({
  selected: [String],          // DGCA, FAA, EASA, etc.
  expiry: String,              // Expiry date
  document: String,            // File path
  otherText: String            // Custom text
});

const essentialsSchema = new mongoose.Schema({
  qualifications: [qualificationSchema],
  experience: String,          // "0-1", "1-2", "5+" etc.
  skillLevel: String           // Standard / Advanced / Expert
});

const insurancePolicySchema = new mongoose.Schema({
  provider: String,
  type: String,
  document: String,   // file path
  validUntil: String,
});

const insuranceSchema = new mongoose.Schema({
  hasInsurance: Boolean,
  policies: [insurancePolicySchema],
});


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
    essentials: essentialsSchema,

    // === Equipment ===
    drones: [String],
    cameras: [String],

    // === Capabilities ===
    capabilities: [String],              // Existing
    certifications: [String],            // Existing

    maxWindSpeed: [String],              // ⬅ NEW
    otherCapabilities: [String],         // ⬅ NEW
    additionalServices: [String],        // ⬅ NEW

    weightLimit: { type: Number },       // ⬅ NEW (kg)
    flightTimeLimit: { type: Number },

    // === Insurance ===
  insurance: insuranceSchema,

    // === Expertise ===
expertiseAreas: [String],
projectCount: { type: Number },
notableClients: [String],

 // === Specialisms (NEW) ===
    specialisms: [
      {
        types: [String],
        experience: String,
        hourlyRate: Number,
        halfDayRate: Number,
        dayRate: Number,
      },
    ],

    termsAccepted: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const Pilot = mongoose.model("Pilot", pilotSchema);
export default Pilot;
