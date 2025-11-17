import Partner from "../models/partnerModel.js";
import PartnerApplication from "../models/PartnerApplication.js";
import sendEmail from "../utils/sendEmail.js";


export const applyPartner = async (req, res) => {
  try {
    const { businessName, experience } = req.body;
    const partner = await Partner.create({
      user: req.user._id,
      businessName,
      experience,
    });
    res.json({ message: "Partner request submitted", partner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPartners = async (req, res) => {
  const partners = await Partner.find().populate("user", "name email");
  res.json(partners);
};



export const submitPartnerApplication = async (req, res) => {
  try {
    const { name, company, email, type, message } = req.body;

    // Validate
    if (!name || !company || !email || !type) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Save to MongoDB
    const saved = await PartnerApplication.create({
      name,
      company,
      email,
      type,
      message,
    });

    // Prepare HTML email
    const html = `
      <h2>New Partner Network Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Partnership Type:</strong> ${type}</p>
      <p><strong>Message:</strong><br/>${message || "No message provided"}</p>
    `;

    // Send email to admin (fallback to EMAIL_USER automatically)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    await sendEmail(
      adminEmail,
      "New Partner Network Application",
      html,
      email
    );

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully.",
      data: saved,
    });

  } catch (err) {
    console.error("Partner application error =>", err);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting application.",
    });
  }
};

// Admin fetch (optional)
export const getAllPartnerApplications = async (req, res) => {
  try {
    const apps = await PartnerApplication.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
};