import DroneBooking from "../models/rentModel.js";
import sendEmail from "../utils/sendEmail.js";

export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, droneModel, pickupDate, endDate, message } = req.body;

    if (!name || !email || !phone || !droneModel || !pickupDate || !endDate) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }
    
    const newBooking = await DroneBooking.create({ name, email, phone, droneModel, pickupDate, endDate, message });

    const adminEmail = process.env.EMAIL_USER;
    const subject = "🛩️ New Drone Rental Booking Request";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
        <h2>New Drone Rental Booking</h2>
        <p>A new booking request has been submitted:</p>
        <ul>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Phone:</b> ${phone}</li>
          <li><b>Drone Model:</b> ${droneModel}</li>
          <li><b>Pickup Date:</b> ${pickupDate}</li>
          <li><b>End Date:</b> ${endDate}</li>
          <li><b>Message:</b> ${message || "N/A"}</li>
        </ul>
        <p>Reply directly to the user to confirm booking.</p>
      </div>
    `;

    // Send email to admin using form data
    await sendEmail(adminEmail, subject, html, email);

    res.status(201).json({
      success: true,
      message: "Booking submitted successfully and email sent to admin",
      data: newBooking,
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// you can fetch here all bookings (for admin)
export const getBookings = async (req, res) => {
  try {
    const bookings = await DroneBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
