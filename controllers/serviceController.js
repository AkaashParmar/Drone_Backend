import Service from '../models/serviceModel.js';
import fs from 'fs';
import cloudinary from '../config/cloudinary-config.js';


export const addOrUpdateService = async (req, res) => {
  try {
    let { serviceType, title, content } = req.body;

    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }

    let image;

    // Handle single or multiple image uploads
    if (req.files && req.files.length > 0) {
      // Use the first uploaded image for this service
      const resultCloud = await cloudinary.uploader.upload(req.files[0].path, {
        folder: 'services',
      });

      fs.unlinkSync(req.files[0].path);
      image = resultCloud.secure_url;
    }

    let service = await Service.findOne({ serviceType });

    if (service) {
      service.title = title;
      service.content = content;
      if (image) service.image = image; // update image only if new uploaded
      await service.save();

      return res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        service,
      });
    }

    // Check if image exists for new service
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required for new service',
      });
    }

    // Create new service
    service = await Service.create({ serviceType, title, content, image });
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
