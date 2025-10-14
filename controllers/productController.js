import Drone from "../models/productModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary-config.js";

// Create a new drone
export const createDrone = async (req, res) => {
  try {
    let droneData = req.body;

    if (typeof droneData === "string") {
      droneData = JSON.parse(droneData);
    }

    // Handle image upload
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "drones",
      });

      fs.unlinkSync(req.file.path);
      droneData.image = resultCloud.secure_url;
    }

    const drone = new Drone(droneData);
    await drone.save();

    res.status(201).json({ success: true, data: drone });
  } catch (err) {
    console.error("Create drone error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all drones
export const getDrones = async (req, res) => {
  try {
    const drones = await Drone.find();
    res.json({ success: true, data: drones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an existing drone
export const updateDrone = async (req, res) => {
  try {
    let updateData = req.body;

    if (typeof updateData === "string") {
      updateData = JSON.parse(updateData);
    }

    const { id } = req.params;
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ success: false, message: "Drone not found" });
    }

    // If a new image is uploaded, replace the old one
    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "drones",
      });

      fs.unlinkSync(req.file.path); // delete local temp file
      updateData.image = resultCloud.secure_url;
    }

    const updatedDrone = await Drone.findByIdAndUpdate(id, updateData, {
      new: true, // return updated document
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedDrone });
  } catch (err) {
    console.error("Update drone error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get drone by ID
export const getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, data: drone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a drone
export const deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) return res.status(404).json({ success: false, message: "Drone not found" });
    res.json({ success: true, message: "Drone deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
