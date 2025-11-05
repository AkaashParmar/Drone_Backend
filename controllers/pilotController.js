import Pilot from "../models/pilotModel.js";
import nodemailer from "nodemailer";

export const createPilot = async (req, res) => {
  try {
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
      portfolioLinks,
      licenseNumber,
      expiryDate,
      experienceYears,
      companyName,
      availableForHire,
      drones,
      capabilities,
      certifications,
      insuranceProvider,
      policyNumber,
      expiry,
      expertiseAreas,
      projectCount,
      notableClients,
    } = req.body;

    const photo = req.files?.photo?.[0]?.path;
    const logo = req.files?.logo?.[0]?.path;

    if (!firstName || !lastName || !email || !mobile || !description || !currency || !photo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // === 1️⃣ Save in DB ===
    const pilot = await Pilot.create({
      firstName,
      lastName,
      email,
      mobile,
      description,
      currency,
      photo,
      logo,
      locationType,
      coverageArea,
      address,
      country,
      state,
      city,
      pincode,
      portfolioLinks: portfolioLinks ? JSON.parse(portfolioLinks) : [],
      licenseNumber,
      expiryDate,
      experienceYears,
      companyName,
      availableForHire,
      drones: drones ? JSON.parse(drones) : [],
      capabilities: capabilities ? JSON.parse(capabilities) : [],
      certifications: certifications ? JSON.parse(certifications) : [],
      insuranceProvider,
      policyNumber,
      expiry,
      expertiseAreas: expertiseAreas ? JSON.parse(expertiseAreas) : [],
      projectCount,
      notableClients: notableClients ? JSON.parse(notableClients) : [],
    });

    // === 2️⃣ Send email to Admin ===
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // works if you are using a Gmail inbox
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


    const mailOptions = {
      from: `"Pilot Onboarding" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || "akash@netfotech.in.com", // admin email
      subject: `🛩️ New Pilot Application: ${firstName} ${lastName}`,
      html: `
        <h2>New Pilot Application Submitted</h2>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Description:</b> ${description}</p>
        <p><b>Currency:</b> ${currency}</p>
        <p><b>Location:</b> ${address || "N/A"}, ${city || ""}, ${state || ""}, ${country || ""}</p>
        <p><b>License:</b> ${licenseNumber || "N/A"} (Exp: ${expiryDate || "N/A"})</p>
        <p><b>Experience:</b> ${experienceYears || "N/A"} years</p>
        <p><b>Company:</b> ${companyName || "N/A"}</p>
        <p><b>Capabilities:</b> ${(capabilities && JSON.parse(capabilities).join(", ")) || "N/A"}</p>
        <p><b>Expertise Areas:</b> ${(expertiseAreas && JSON.parse(expertiseAreas).join(", ")) || "N/A"}</p>
        <p><b>Insurance:</b> ${insuranceProvider || "N/A"} | Policy: ${policyNumber || "N/A"}</p>
        <p><b>Drones:</b> ${(drones && JSON.parse(drones).map(d => d.model).join(", ")) || "N/A"}</p>
        <hr />
        <p><b>Portfolio Links:</b> ${(portfolioLinks && JSON.parse(portfolioLinks).join(", ")) || "N/A"}</p>
        <p><b>Notable Clients:</b> ${(notableClients && JSON.parse(notableClients).join(", ")) || "N/A"}</p>
        <hr />
        <p>📸 <b>Photo:</b> ${photo}</p>
        <p>🪪 <b>Logo:</b> ${logo || "N/A"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Pilot form submitted successfully, and sent to admin via email!",
      pilot,
    });
  } catch (error) {
    console.error(error);
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
