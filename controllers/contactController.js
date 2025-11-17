import ContactMessage from "../models/ContactMessage.js";
import sendEmail from "../utils/sendEmail.js";
import path from "path";

export const submitContactForm = async (req, res) => {
  try {
    const {
      name,
      email,
      topic,
      orderId,
      message,
      urgency,
      agree,
    } = req.body;

    // Uploaded files → temp folder
    const attachments = (req.files || []).map((file) => ({
      filename: file.filename,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));

    // 1️⃣ Save form submission in MongoDB
    const saved = await ContactMessage.create({
      name,
      email,
      topic,
      orderId,
      message,
      urgency,
      agree,
      attachments,
    });

    // 2️⃣ Prepare email HTML
    const html = `
      <h2>New Contact Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Order ID:</strong> ${orderId || "N/A"}</p>
      <p><strong>Urgency:</strong> ${urgency}</p>
      <p><strong>Message:</strong><br/>${message}</p>

      <h3>Attachments</h3>
      ${
        attachments.length
          ? attachments
              .map(
                (a) => `<p>${a.filename}</p>`
              )
              .join("")
          : "<p>No attachments</p>"
      }
    `;

    // 3️⃣ Send email to ADMIN
    await sendEmail(
      process.env.EMAIL_USER,
      `New Contact Request – ${topic}`,
      html,
      email
    );

    return res.status(200).json({
      success: true,
      message: "Your message was submitted successfully.",
      data: saved,
    });
  } catch (err) {
    console.error("Contact form error =>", err);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting form",
    });
  }
};

// 🟣 Admin should view all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};
