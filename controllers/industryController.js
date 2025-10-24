import fs from "fs";
import Industry from "../models/industryModel.js";
import cloudinary from "../config/cloudinary-config.js";


// Add new Industry with Cloudinary image upload
export const createIndustry = async (req, res) => {
  try {
    let { title, description, content } = req.body;

    // Parse body if sent as string
    if (typeof title === "string") title = title.trim();
    if (typeof description === "string") description = description.trim();
    if (typeof content === "string") content = content.trim();

    if (!title || !description || !content) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Upload multiple images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "industries",
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path); 
      }
    }

    const newIndustry = new Industry({
      title,
      description,
      content,
      images: imageUrls,
    });

    await newIndustry.save();

    res.status(201).json({
      success: true,
      message: "Industry created successfully",
      data: newIndustry,
    });
  } catch (error) {
    console.error("Error creating industry:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


// Get all industries
export const getIndustries = async (req, res) => {
  try {
    const industries = await Industry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: industries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get single industry by slug
export const getIndustryBySlug = async (req, res) => {
  try {
    const industry = await Industry.findOne({ slug: req.params.slug });
    if (!industry) {
      return res.status(404).json({ success: false, message: "Industry not found" });
    }
    res.status(200).json({ success: true, data: industry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update industry
export const updateIndustry = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const imagePaths = req.files?.map((file) => file.path);

    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      { title, description, content, ...(imagePaths?.length && { images: imagePaths }) },
      { new: true }
    );

    if (!updatedIndustry) {
      return res.status(404).json({ success: false, message: "Industry not found" });
    }

    res.status(200).json({ success: true, message: "Industry updated successfully", data: updatedIndustry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete industry
export const deleteIndustry = async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return res.status(404).json({ success: false, message: "Industry not found" });
    }
    res.status(200).json({ success: true, message: "Industry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
