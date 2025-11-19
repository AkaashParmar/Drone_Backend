import Drone from "../models/productModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary-config.js";
import Order from '../models/productOrderModel.js';

// Create a new drone
export const createDrone = async (req, res) => {
  try {
    let droneData = req.body;

    if (typeof droneData === "string") {
      droneData = JSON.parse(droneData);
    }

    if (req.user && req.user.id) {
      droneData.createdBy = req.user.id;
    }

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

    if (req.file && req.file.path) {
      const resultCloud = await cloudinary.uploader.upload(req.file.path, {
        folder: "drones",
      });

      fs.unlinkSync(req.file.path); 
      updateData.image = resultCloud.secure_url;
    }

    const updatedDrone = await Drone.findByIdAndUpdate(id, updateData, {
      new: true,
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

export const getRelatedAccessories = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ success: false, message: 'Drone not found' });
    }

    // Find accessories related by brand or name match
    const relatedAccessories = await Drone.find({
      category: 'Accessory',
      $or: [
        { name: { $regex: drone.name.split(' ')[0], $options: 'i' } }, 
        { description: { $regex: drone.brand, $options: 'i' } } 
      ]
    });

    res.status(200).json({
      success: true,
      drone: drone.name,
      relatedAccessories
    });

  } catch (error) {
    console.error('Error fetching related accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// product order (buyNow controller)
export const buyNow = async (req, res) => {
  try {
    const { userId, droneId, quantity } = req.body;

    const drone = await Drone.findById(droneId);
    if (!drone)
      return res.status(404).json({ success: false, message: 'Drone not found' });

    // Check if there is already a pending order for this user
    let existingOrder = await Order.findOne({ user: userId, status: 'Pending' });

    const orderData = {
      user: userId,
      items: [{ product: droneId, quantity: quantity || 1 }],
      totalPrice: (drone.discountedPrice || drone.price) * (quantity || 1),
      status: 'Pending'
    };

    if (existingOrder) {
      // Replace the existing pending order with the new one
      existingOrder.items = orderData.items;
      existingOrder.totalPrice = orderData.totalPrice;
      await existingOrder.save();
      return res.status(200).json({ success: true, order: existingOrder });
    } else {
      // Create a new order if none exists
      const newOrder = new Order(orderData);
      await newOrder.save();
      return res.status(201).json({ success: true, order: newOrder });
    }
  } catch (err) {
    console.error("Buy now error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET In the Box Items for a Drone
export const getInTheBoxItems = async (req, res) => {
  try {
    const { droneId } = req.params;
    const drone = await Drone.findById(droneId);

    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.status(200).json({
      success: true,
      inTheBox: drone.inTheBox || [],
    });
  } catch (error) {
    console.error("❌ Error fetching In the Box items:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ADD or UPDATE "In the Box" items for a Drone
export const addInTheBoxItems = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { inTheBox } = req.body; // Expecting array of { name, qty }

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    drone.inTheBox = inTheBox; // overwrite existing items
    await drone.save();

    res.status(200).json({
      success: true,
      message: "In the Box items updated successfully",
      inTheBox: drone.inTheBox,
    });
  } catch (error) {
    console.error("❌ Error adding In the Box items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find({ category: "Drone" });

    res.status(200).json({
      success: true,
      count: drones.length,
      data: drones
    });

  } catch (error) {
    console.error("Error fetching drones:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};


export const addReview = async (req, res) => {
  try {
    const { droneId } = req.params;
    const userId = req.user.id; // assuming auth middleware
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    // Prevent duplicate review from same user
    const alreadyReviewed = drone.reviews.find(
      (rev) => rev.user.toString() === userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Create review
    const newReview = {
      user: userId,
      rating: Number(rating),
      comment
    };

    drone.reviews.push(newReview);

    // update average rating
    drone.averageRating =
      drone.reviews.reduce((acc, item) => item.rating + acc, 0) /
      drone.reviews.length;

    await drone.save();

    res.status(201).json({
      message: "Review added successfully",
      reviews: drone.reviews,
      averageRating: drone.averageRating
    });

  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


