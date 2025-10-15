import DroneListing from "../models/sellModel.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import sendEmail from "../utils/sendEmail.js";

export const createDroneListing = async (req, res) => {
  try {
    let formData = req.body;

    // Parse if sent as string (for multipart/form-data)
    if (typeof formData === "string") {
      formData = JSON.parse(formData);
    }

    // Handle multiple images if uploaded
    if (req.files && req.files.length > 0) {
      const imageUrls = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "drone_listings",
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path); 
      }

      formData.images = imageUrls;
    }

    // Save to DB
    const newListing = await DroneListing.create(formData);

    // Send email to admin using sendEmail utility ---
    const adminEmail = process.env.EMAIL_USER; 

    if (adminEmail) {
      const htmlImages = (newListing.images || [])
        .map((url) => `<img src="${url}" width="200" style="margin: 5px;" />`)
        .join("");

      const subject = "📌 New Drone Listing Submitted";
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
          <h2>New Drone Listing</h2>
          <p>A new drone listing has been submitted with the following details:</p>
          <ul>
            <li><b>Name:</b> ${newListing.name}</li>
            <li><b>Email:</b> ${newListing.email}</li>
            <li><b>Phone:</b> ${newListing.phone}</li>
            <li><b>Drone Model:</b> ${newListing.droneModel}</li>
            <li><b>Condition:</b> ${newListing.condition}</li>
            <li><b>Flight Hours:</b> ${newListing.flightHours}</li>
            <li><b>Price:</b> $${newListing.price}</li>
            <li><b>Description:</b> ${newListing.description || "N/A"}</li>
          </ul>
          <p><b>Images:</b></p>
          <div style="display:flex; flex-wrap: wrap;">${htmlImages}</div>
          <p>Reply directly to the user to contact them.</p>
        </div>
      `;

      await sendEmail(adminEmail, subject, html, newListing.email);
    } else {
      console.warn("ADMIN_EMAIL is not defined. Skipping email notification.");
    }

    res.status(201).json({
      success: true,
      data: newListing,
      message: "Listing created and admin notified (if admin email is set).",
    });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all drone listings
export const getAllDroneListings = async (req, res) => {
  try {
    const listings = await DroneListing.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: listings });
  } catch (err) {
    console.error("Get listings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single drone listing by ID
export const getDroneListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await DroneListing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    console.error("Get listing error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a drone listing
export const deleteDroneListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await DroneListing.findByIdAndDelete(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Optionally, delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const imgUrl of listing.images) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`drone_listings/${publicId}`);
      }
    }

    res.status(200).json({ success: true, message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

