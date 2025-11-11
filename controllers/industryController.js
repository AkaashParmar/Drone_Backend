import fs from "fs";
import Industry from "../models/industryModel.js";
import cloudinary from "../config/cloudinary-config.js";

// Add or Update Industry
export const addOrUpdateIndustry = async (req, res) => {
  try {
    let { industryType, title, theme, description, content, features, sections, faqs, images } = req.body;

    // Parse JSON strings if coming multipart/form-data
    if (typeof features === "string") features = JSON.parse(features);
    if (typeof sections === "string") sections = JSON.parse(sections);
    if (typeof faqs === "string") faqs = JSON.parse(faqs);
    if (typeof images === "string") images = JSON.parse(images);

    // Handle new image uploads
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const resultCloud = await cloudinary.uploader.upload(file.path, {
          folder: "industries",
        });
        uploadedImages.push(resultCloud.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    // If existing image URLs are provided along with new uploads
    const finalImages = [...(images || []), ...uploadedImages];

    // Check if Industry exists by industryType
    let industry = await Industry.findOne({ industryType });

    if (industry) {
      // Update existing industry
      industry.title = title || industry.title;
      industry.theme = theme || industry.theme;
      industry.description = description || industry.description;
      industry.content = content || industry.content;
      industry.features = features || industry.features;
      industry.sections = sections || industry.sections;
      industry.faqs = faqs || industry.faqs;
      if (finalImages.length > 0) industry.images = finalImages;

      await industry.save();

      return res.status(200).json({
        success: true,
        message: "Industry updated successfully",
        data: industry,
      });
    }

    // Creating new entry → Validate required fields
    if (!title || !theme || !industryType || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "title, theme, industryType, description & content are required",
      });
    }

    // For new industry → Must have at least 1 image (file or existing URL)
    if (finalImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least 1 industry image required (file upload or image URL)",
      });
    }

    // Create new industry
    industry = await Industry.create({
      title,
      theme,
      industryType,
      description,
      content,
      images: finalImages,
      features: features || [],
      sections: sections || [],
      faqs: faqs || [],
    });

    return res.status(201).json({
      success: true,
      message: "Industry added successfully",
      data: industry,
    });

  } catch (error) {
    console.error("Error adding/updating industry:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
// export const updateIndustry = async (req, res) => {
//   try {
//     const { title, description, content } = req.body;
//     const imagePaths = req.files?.map((file) => file.path);

//     const updatedIndustry = await Industry.findByIdAndUpdate(
//       req.params.id,
//       { title, description, content, ...(imagePaths?.length && { images: imagePaths }) },
//       { new: true }
//     );

//     if (!updatedIndustry) {
//       return res.status(404).json({ success: false, message: "Industry not found" });
//     }

//     res.status(200).json({ success: true, message: "Industry updated successfully", data: updatedIndustry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };


export const updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, content } = req.body;

    const industry = await Industry.findById(id);
    if (!industry)
      return res.status(404).json({ success: false, message: "Industry not found" });

    // Update basic fields
    if (title) industry.title = title;
    if (description) industry.description = description;
    if (content) industry.content = content;

    // ✅ Replace old images completely when new images are uploaded
    if (req.files && req.files.length > 0) {
      // Clear old images
      industry.images = [];

      // Upload new images
      for (let file of req.files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "industries/main",
        });
        industry.images.push(upload.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    await industry.save();

    res.status(200).json({
      success: true,
      message: "Industry images replaced successfully",
      data: industry,
    });
  } catch (error) {
    console.error("Error updating industry:", error);
    res.status(500).json({ success: false, message: error.message });
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

export const updateSectionImages = async (req, res) => {
  try {
    const { id } = req.params;
    const sectionIndex = parseInt(req.params.sectionIndex, 10);

    let { sectionImagesToRemove } = req.body;

    if (typeof sectionImagesToRemove === "string") {
      sectionImagesToRemove = JSON.parse(sectionImagesToRemove);
    }

    const industry = await Industry.findById(id);
    if (!industry) {
      return res.status(404).json({ success: false, message: "Industry not found" });
    }

    // Ensure sectionIndex is valid
    if (
      isNaN(sectionIndex) ||
      sectionIndex < 0 ||
      sectionIndex >= industry.sections.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid section index",
      });
    }

    const section = industry.sections[sectionIndex];

    // Remove old images
    if (Array.isArray(sectionImagesToRemove) && sectionImagesToRemove.length > 0) {
      section.image = section.image.filter(img => !sectionImagesToRemove.includes(img));
    }

    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "industry/sections"
        });
        section.image.push(uploaded.secure_url);
      }
    }

    await industry.save();

    return res.status(200).json({
      success: true,
      message: "Section images updated successfully",
      data: industry.sections[sectionIndex]
    });

  } catch (error) {
    console.error("Error updating section images:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
