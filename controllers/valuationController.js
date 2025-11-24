import DroneValuation from "../models/DroneValuation.js";

export const estimatePrice = async (req, res) => {
  try {
    const data = req.body;

let basePrice = Number(data.originalPrice);

if (!basePrice || basePrice < 1000) {
  basePrice = 100000; // fallback
}

const age = new Date().getFullYear() - Number(data.purchaseYear);

// depreciation based on age
basePrice -= basePrice * (age * 0.08);  // 8% per year

// CONDITION
if (data.condition === "Good") basePrice -= 0.10 * basePrice;
if (data.condition === "Fair") basePrice -= 0.20 * basePrice;
if (data.condition === "For Parts") basePrice -= 0.50 * basePrice;

// Battery
if (data.batteryHealth === "Average") basePrice -= 8000;
if (data.batteryHealth === "Poor") basePrice -= 15000;

// Camera
if (data.cameraCondition === "Average") basePrice -= 7000;
if (data.cameraCondition === "Poor") basePrice -= 15000;

// Crashes
if (data.crashes === "Minor") basePrice -= 10000;
if (data.crashes === "Major") basePrice -= 30000;

// Flight hours
if (Number(data.flightHours) > 100) basePrice -= 10000;
if (Number(data.flightHours) > 300) basePrice -= 20000;

// Accessories
basePrice += (data.accessories?.length || 0) * 1500;

// Warranty
if (data.warranty === "Yes") basePrice += 10000;

const finalPrice = Math.max(5000, Math.floor(basePrice));


    // Save in DB
    const saved = await DroneValuation.create({
      ...data,
      estimatedPrice: finalPrice,
    });

    return res.status(200).json({
      success: true,
      estimatedPrice: finalPrice,
      data: saved,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
