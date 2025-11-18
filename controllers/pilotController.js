import Pilot from "../models/pilotModel.js";
import nodemailer from "nodemailer";

export const createPilot = async (req, res) => {
  try {
    // === PARSE JSON FIELDS ===
    const parsedPortfolioLinks = req.body.portfolioLinks ? JSON.parse(req.body.portfolioLinks) : [];
    const parsedDrones = req.body.drones ? JSON.parse(req.body.drones) : [];
    const parsedCapabilities = req.body.capabilities ? JSON.parse(req.body.capabilities) : [];
    const parsedCertifications = req.body.certifications ? JSON.parse(req.body.certifications) : [];
    const parsedExpertiseAreas = req.body.expertiseAreas ? JSON.parse(req.body.expertiseAreas) : [];
    const parsedNotableClients = req.body.notableClients ? JSON.parse(req.body.notableClients) : [];
    const parsedCameras = req.body.cameras ? JSON.parse(req.body.cameras) : [];
    const parsedMaxWindSpeed = req.body.maxWindSpeed ? JSON.parse(req.body.maxWindSpeed) : [];
    const parsedOtherCapabilities = req.body.otherCapabilities ? JSON.parse(req.body.otherCapabilities) : [];
    const parsedAdditionalServices = req.body.additionalServices ? JSON.parse(req.body.additionalServices) : [];
    const parsedSpecialisms = req.body.specialisms
      ? JSON.parse(req.body.specialisms)
      : [];
    const parsedTermsAccepted = req.body.termsAccepted === "true";

    // === PARSE Essentials OBJECT ===
    let essentials = req.body.essentials ? JSON.parse(req.body.essentials) : null;
    let insurance = req.body.insurance ? JSON.parse(req.body.insurance) : null;
    // Attach qualification documents
    if (essentials && req.files?.qualificationDocuments) {
      req.files.qualificationDocuments.forEach((file, idx) => {
        if (essentials.qualifications[idx]) {
          essentials.qualifications[idx].document = file.path;
        }
      });
    }
    if (insurance && req.files?.insuranceDocuments) {
      req.files.insuranceDocuments.forEach((file, idx) => {
        if (insurance.policies[idx]) {
          insurance.policies[idx].document = file.path;
        }
      });
    }
    // Required images
    const photo = req.files?.photo?.[0]?.path;
    const logo = req.files?.logo?.[0]?.path;

    // Gallery images
    const galleryImages = req.files?.galleryImages
      ? req.files.galleryImages.map((img) => img.path)
      : [];

    // BASIC REQUIRED FIELDS
    const {
      firstName,
      lastName,
      email,
      mobile,
      description,
      currency,
      locationType,
      coverageArea,
      address,
      country,
      state,
      city,
      pincode,
      licenseNumber,
      expiryDate,
      companyName,
      availableForHire,
      insuranceProvider,
      policyNumber,
      expiry,
      projectCount,
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !description || !currency || !photo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // === SAVE TO DB ===
    const pilot = await Pilot.create({
      firstName,
      lastName,
      email,
      mobile,
      description,
      currency,
      photo,
      logo,

      // Location
      locationType,
      coverageArea,
      address,
      country,
      state,
      city,
      pincode,

      // Portfolio
      portfolioLinks: parsedPortfolioLinks,
      galleryImages,

      // Essentials (FULL OBJECT)
      essentials,

      // Company + License
      companyName,
      availableForHire: availableForHire === "true" || availableForHire === true,
      licenseNumber,
      expiryDate,

      // Equipment
      drones: parsedDrones,
      cameras: parsedCameras,

      // Capabilities
      capabilities: parsedCapabilities,
      certifications: parsedCertifications,
      // New Capabilities
      maxWindSpeed: parsedMaxWindSpeed,
      otherCapabilities: parsedOtherCapabilities,
      additionalServices: parsedAdditionalServices,
      weightLimit: req.body.weightLimit,
      flightTimeLimit: req.body.flightTimeLimit,


      // Insurance
      insurance: insurance,


      // Expertise
      expertiseAreas: parsedExpertiseAreas,
      projectCount,
      notableClients: parsedNotableClients,
      specialisms: parsedSpecialisms,
      termsAccepted: parsedTermsAccepted
    });

    // === EMAIL ===
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Pilot Onboarding" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || "akash@netfotech.in",
      subject: `🛩️ New Pilot Application: ${firstName} ${lastName}`,
      html: `
      <h2>New Pilot Application Submitted</h2>

      <h3>Personal Info</h3>
      <p><b>Name:</b> ${firstName} ${lastName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Mobile:</b> ${mobile}</p>

      <h3>Essentials</h3>
      <p><b>Experience:</b> ${essentials?.experience || "N/A"}</p>
      <p><b>Skill Level:</b> ${essentials?.skillLevel || "N/A"}</p>

      <h4>Qualifications</h4>
      <ul>
        ${essentials?.qualifications?.map(
        (q) => `
            <li>
              <b>${q.selected.join(", ")}</b>
              <br />Expiry: ${q.expiry || "N/A"}
              <br />Other: ${q.otherText || "N/A"}
              <br />Document: ${q.document || "N/A"}
            </li>
        `
      ).join("") || "None"
        }
      </ul>

      <h3>Portfolio</h3>
      <p><b>Reels:</b> ${parsedPortfolioLinks.join(", ") || "None"}</p>

      <h3>Gallery Images:</h3>
      ${galleryImages.map((g) => `<p>${g}</p>`).join("")}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Pilot form submitted successfully!",
      pilot,
    });

  } catch (error) {
    console.error("❌ ERROR IN createPilot:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all pilots
export const getAllPilots = async (req, res) => {
  try {
    const pilots = await Pilot.find().sort({ createdAt: -1 });
    res.json(pilots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get pilot by ID
export const getPilotById = async (req, res) => {
  try {
    const pilot = await Pilot.findById(req.params.id);
    if (!pilot) return res.status(404).json({ message: "Pilot not found" });
    res.json(pilot);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
