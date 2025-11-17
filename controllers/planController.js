import Plan from "../models/PlanModel.js";

export const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlanBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const plan = await Plan.findOne({ slug });

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({ success: true, plan });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PLAN
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().select("name title slug"); // lightweight response

    res.status(200).json({
      success: true,
      plans,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};
