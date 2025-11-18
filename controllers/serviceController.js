import Service from '../models/serviceModel.js';
import fs from 'fs';
import cloudinary from '../config/cloudinary-config.js';


export const addOrUpdateService = async (req, res) => {
  try {
    let { serviceType, title, content, image, steps } = req.body;

    // If JSON body came as text (multipart)
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }

    // Convert steps to JSON if sent as string
    if (typeof steps === "string") {
      steps = JSON.parse(steps);
    }

    let uploadedImage;

    // If file uploaded → upload to Cloudinary
    if (req.files && req.files.length > 0) {
      const resultCloud = await cloudinary.uploader.upload(req.files[0].path, {
        folder: 'services',
      });

      fs.unlinkSync(req.files[0].path);
      uploadedImage = resultCloud.secure_url;
    }

    // If user provided image URL → use it
    const finalImage = uploadedImage || image;

    let service = await Service.findOne({ serviceType });

    if (service) {
      service.title = title || service.title;
      service.content = content || service.content;
      service.steps = steps || service.steps;
      if (finalImage) service.image = finalImage;

      await service.save();

      return res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        service,
      });
    }

    // For new service → at least 1 image is required (file or URL)
    if (!finalImage) {
      return res.status(400).json({
        success: false,
        message: 'Image is required for new service (File or URL)',
      });
    }

    service = await Service.create({
      serviceType,
      title,
      content,
      image: finalImage,
      steps,
    });

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      service,
    });

  } catch (error) {
    console.error('Service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service by type (for frontend)
export const getServiceByType = async (req, res) => {
  try {
    const { type } = req.params;
    const service = await Service.findOne({ serviceType: type });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service by custom ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ serviceId: id });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceType, title, content } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: "serviceType is required",
      });
    }

    let service = await Service.findOne({ serviceType });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    let image = service.image; 

    // If new image uploaded → upload to Cloudinary and replace old
    if (req.files && req.files.length > 0) {
      const resultCloud = await cloudinary.uploader.upload(req.files[0].path, {
        folder: 'services',
      });

      fs.unlinkSync(req.files[0].path);
      image = resultCloud.secure_url;
    }

    // Update fields
    if (title) service.title = title;
    if (content) service.content = content;
    if (image) service.image = image;

    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });

  } catch (error) {
    console.error("Update Service Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const addOrUpdateFAQs = async (req, res) => {
  try {
    let { serviceType, faqs } = req.body;

    // If JSON came as string (multipart)
    if (typeof faqs === "string") {
      faqs = JSON.parse(faqs);
    }

    // Validate
    if (!serviceType) {
      return res.status(400).json({ success: false, message: "serviceType is required" });
    }

    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ success: false, message: "FAQs must be a non-empty array" });
    }

    const service = await Service.findOne({ serviceType });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Replace or update FAQs
    service.faqs = faqs;

    await service.save();

    res.status(200).json({
      success: true,
      message: "FAQs updated successfully",
      service,
    });

  } catch (error) {
    console.error("FAQ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getServiceSummary = async (req, res) => {
  try {
    const services = await Service.find({}, "serviceType title image");

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching service summary:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};