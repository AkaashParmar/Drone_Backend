import Rent from "../models/rentModel.js";

export const applyForRent = async (req, res) => {
  try {
    const { droneModel, rentDuration, rentPrice } = req.body;
    const rent = await Rent.create({
      renter: req.user._id,
      droneModel,
      rentDuration,
      rentPrice,
    });
    res.json({ message: "Rent request submitted", rent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRents = async (req, res) => {
  const rents = await Rent.find().populate("renter", "name email");
  res.json(rents);
};
