import Partner from "../models/partnerModel.js";

export const applyPartner = async (req, res) => {
  try {
    const { businessName, experience } = req.body;
    const partner = await Partner.create({
      user: req.user._id,
      businessName,
      experience,
    });
    res.json({ message: "Partner request submitted", partner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPartners = async (req, res) => {
  const partners = await Partner.find().populate("user", "name email");
  res.json(partners);
};
