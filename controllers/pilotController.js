import Pilot from "../models/pilotModel.js";
import nodemailer from "nodemailer";

export const createPilot = async (req, res) => {
  try {
    // -----------------------------------
    // PARSE JSON FIELDS
    // -----------------------------------
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
    const parsedSpecialisms = req.body.specialisms ? JSON.parse(req.body.specialisms) : [];
    const parsedTermsAccepted = req.body.termsAccepted === "true";

    // Essentials & Insurance
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

    // Attach insurance documents
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

    // Required fields
    const {
      firstName, lastName, email, mobile, description, currency,
      locationType, coverageArea, address, country, state, city, pincode,
      licenseNumber, expiryDate, companyName, availableForHire, projectCount,
    } = req.body;

    if (!firstName || !lastName || !email || !mobile || !description || !currency || !photo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // SAVE TO DB
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

      portfolioLinks: parsedPortfolioLinks,
      galleryImages,

      essentials,

      companyName,
      availableForHire: availableForHire === "true",
      licenseNumber,
      expiryDate,

      drones: parsedDrones,
      cameras: parsedCameras,

      capabilities: parsedCapabilities,
      certifications: parsedCertifications,

      maxWindSpeed: parsedMaxWindSpeed,
      otherCapabilities: parsedOtherCapabilities,
      additionalServices: parsedAdditionalServices,

      weightLimit: req.body.weightLimit,
      flightTimeLimit: req.body.flightTimeLimit,

      insurance,

      expertiseAreas: parsedExpertiseAreas,
      notableClients: parsedNotableClients,
      projectCount,

      specialisms: parsedSpecialisms,
      termsAccepted: parsedTermsAccepted,
    });

    // -----------------------------------
    // EMAIL CONFIG
    // -----------------------------------
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // All attachments (images + docs)
    const attachments = [
      ...(photo ? [{ filename: photo.split("\\").pop(), path: photo }] : []),
      ...(logo ? [{ filename: logo.split("\\").pop(), path: logo }] : []),

      ...galleryImages.map(g => ({
        filename: g.split("\\").pop(),
        path: g
      })),

      ...(essentials?.qualifications || [])
        .filter(q => q.document)
        .map(q => ({
          filename: q.document.split("\\").pop(),
          path: q.document
        })),

      ...(insurance?.policies || [])
        .filter(p => p.document)
        .map(p => ({
          filename: p.document.split("\\").pop(),
          path: p.document
        })),
    ];

    // -----------------------------------
    // FULL EMAIL TEMPLATE
    // -----------------------------------
    const mailOptions = {
      from: `"Pilot Onboarding" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🛩️ New Pilot Application: ${firstName} ${lastName}`,
      html: `
  <h2>🛩️ New Pilot Application Submitted</h2>

  <h3>Personal Info</h3>
  <p><b>Name:</b> ${firstName} ${lastName}</p>
  <p><b>Email:</b> ${email}</p>
  <p><b>Mobile:</b> ${mobile}</p>
  <p><b>Description:</b> ${description}</p>
  <p><b>Currency:</b> ${currency}</p>

  <hr/>

  <h3>Location</h3>
  <p><b>Coverage Area:</b> ${coverageArea}</p>
  <p><b>Address:</b> ${address}</p>
  <p><b>Country:</b> ${country}</p>
  <p><b>State:</b> ${state}</p>
  <p><b>City:</b> ${city}</p>
  <p><b>Pincode:</b> ${pincode}</p>

  <hr/>

  <h3>Essentials</h3>
  <p><b>Experience:</b> ${essentials?.experience}</p>
  <p><b>Skill Level:</b> ${essentials?.skillLevel}</p>

  <h4>Qualifications</h4>
  <ul>
    ${essentials?.qualifications?.map(q => `
      <li>
        <b>${q.selected.join(", ")}</b><br/>
        Expiry: ${q.expiry}<br/>
        Other: ${q.otherText || "N/A"}<br/>
        Document Attached ✔
      </li>
    `).join("") || "None"}
  </ul>

  <hr/>

  <h3>Equipment</h3>
  <p><b>Drones:</b> ${parsedDrones.join(", ")}</p>
  <p><b>Cameras:</b> ${parsedCameras.join(", ")}</p>

  <hr/>

  <h3>Capabilities</h3>
  <p><b>Capabilities:</b> ${parsedCapabilities.join(", ")}</p>
  <p><b>Certifications:</b> ${parsedCertifications.join(", ")}</p>
  <p><b>Max Wind Speed:</b> ${parsedMaxWindSpeed.join(", ")}</p>
  <p><b>Other Capabilities:</b> ${parsedOtherCapabilities.join(", ")}</p>
  <p><b>Additional Services:</b> ${parsedAdditionalServices.join(", ")}</p>
  <p><b>Weight Limit:</b> ${req.body.weightLimit}</p>
  <p><b>Flight Time Limit:</b> ${req.body.flightTimeLimit}</p>

  <hr/>

  <h3>Insurance</h3>
  <p><b>Has Insurance:</b> ${insurance?.hasInsurance ? "Yes" : "No"}</p>

  ${insurance?.policies?.map(p => `
    <div>
      Provider: ${p.provider}<br/>
      Type: ${p.type}<br/>
      Valid Until: ${p.validUntil}<br/>
      Document Attached ✔
      <br/><br/>
    </div>
  `).join("") || "None"}

  <hr/>

  <h3>Expertise</h3>
  <p><b>Expertise Areas:</b> ${parsedExpertiseAreas.join(", ")}</p>
  <p><b>Notable Clients:</b> ${parsedNotableClients.join(", ")}</p>

  <hr/>

  <h3>Specialisms</h3>
  ${parsedSpecialisms?.map(s => `
    <div>
      <b>Types:</b> ${s.types.join(", ")}<br/>
      Experience: ${s.experience}<br/>
      Hourly Rate: ${s.hourlyRate}<br/>
      Half Day Rate: ${s.halfDayRate}<br/>
      Day Rate: ${s.dayRate}<br/><br/>
    </div>
  `).join("")}

  <hr/>

  <h3>Portfolio Links</h3>
  <p>${parsedPortfolioLinks.join("<br/>")}</p>

  <hr/>

  <h3>Gallery Images</h3>
  <p>Total Images: ${galleryImages.length} ✔ (Attached)</p>

  <h3 style="color:green;">All files attached successfully.</h3>
      `,
      attachments,
    };

    // Send mail
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
