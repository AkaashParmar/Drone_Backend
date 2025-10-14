import DroneListing from "../models/sellModel.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Create new drone listing
export const createDroneListing = async (req, res) => {
    try {
        let formData = req.body;

        // If sent as string (multipart/form-data), parse it
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
                fs.unlinkSync(file.path); // delete temp file
            }

            formData.images = imageUrls;
        }

        const newListing = new DroneListing(formData);
        await newListing.save();

        res.status(201).json({ success: true, data: newListing });
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

