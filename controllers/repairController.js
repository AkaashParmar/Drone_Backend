import ServiceRequest from "../models/ServiceRequest.js";
import sendEmail from "../utils/sendEmail.js";

export const submitServiceRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      droneModel,
      inspection,
      issue,
      topic,     // Received from frontend page
    } = req.body;

  

    // Save request in DB
    const saved = await ServiceRequest.create({
      name,
      email,
      phone,
      city,
      droneModel,
      inspection,
      issue,
      topic,
    });

    // Email content
    const html = `
      <h2>New Drone Repair Request</h2>
      <p><strong>Service Type:</strong> ${topic}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Drone Model:</strong> ${droneModel}</p>
      <p><strong>Inspection:</strong> ${inspection}</p>
      <p><strong>Issue:</strong><br/>${issue}</p>
    `;

    // Send email to admin
    await sendEmail(
      process.env.EMAIL_USER,
      `Drone Service Request – ${topic}`,
      html,
      email
    );

    res.status(200).json({
      success: true,
      message: "Service request submitted successfully.",
      data: saved
    });

  } catch (error) {
    console.error("Service Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting request",
    });
  }
};


// ADMIN — Get all service requests
export const getAllServiceRequests = async (req, res) => {
  try {
    const list = await ServiceRequest.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};
