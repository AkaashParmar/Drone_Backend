import Drone from "../models/productModel.js";

// -----------  INTENT DETECTION  ----------- //
function detectIntent(message) {
  message = message.toLowerCase();

  // Product Recommendation
  if (
    message.includes("buy") ||
    message.includes("price") ||
    message.includes("budget") ||
    message.includes("recommend") ||
    message.includes("suggest") ||
    message.includes("best drone") ||
    message.includes("which drone") ||
    message.includes("wedding") ||
    message.includes("agriculture") ||
    message.includes("industry") ||
    message.includes("survey") ||
    message.includes("4k") ||
    message.includes("camera drone")
  ) {
    return "product_query";
  }

  // Support
  if (
    message.includes("not working") ||
    message.includes("problem") ||
    message.includes("issue") ||
    message.includes("error") ||
    message.includes("battery") ||
    message.includes("take off") ||
    message.includes("gimbal") ||
    message.includes("help") ||
    message.includes("how to")
  ) {
    return "support";
  }

  return "general";
}

// -----------  PRODUCT SEARCH ENGINE  ----------- //
async function findMatchingProducts(message) {
  message = message.toLowerCase();

  // Start with all drones
  let query = {};

  // Category-Based Recommendation
  if (message.includes("agri") || message.includes("farm")) {
    query = { description: { $regex: "agri|farm|spray", $options: "i" } };
  } else if (message.includes("wedding") || message.includes("event")) {
    query = { description: { $regex: "camera|photo|video|wedding", $options: "i" } };
  } else if (message.includes("industry")) {
    query = { description: { $regex: "survey|mapping|industrial", $options: "i" } };
  } else if (message.includes("4k") || message.includes("camera")) {
    query = { camera: { $regex: "4k|camera", $options: "i" } };
  }

  // Fetch top 3 matching drones
  const drones = await Drone.find(query).limit(3);

  // If no match → return top 3 trending drones
  if (drones.length === 0) {
    return await Drone.find().limit(3);
  }

  return drones;
}

// -----------  MAIN CONTROLLER  ----------- //
export const chatBotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Please type a message first." });
    }

    const intent = detectIntent(message);

    // ------- PRODUCT RECOMMENDATION ------- //
    if (intent === "product_query") {
      const products = await findMatchingProducts(message);

      const reply =
        "Here are the best drones based on your requirement:\n\n" +
        products
          .map(
            (p) =>
              `• **${p.name}**  
   - Brand: ${p.brand}  
   - Price: ₹${p.discountedPrice || p.price}  
   - Camera: ${p.camera || "N/A"}  
   - Flight Time: ${p.flightTime || "N/A"}  
   - Description: ${p.description?.substring(0, 60)}...  
`
          )
          .join("\n") +
        "\nTell me your budget & purpose (wedding, agriculture, mapping) to refine more.";

      return res.json({ reply, intent, products });
    }

    // ------- SUPPORT / HELP ------- //
    if (intent === "support") {
      const reply =
        "Let’s solve this! Try these steps:\n\n" +
        "1. Restart the drone & remote.\n" +
        "2. Ensure battery is fully charged.\n" +
        "3. Recalibrate IMU + Compass.\n" +
        "4. Check propellers & gimbal lock.\n" +
        "5. Ensure GPS signal strength is good.\n\n" +
        "Tell me the exact issue (e.g., 'not taking off', 'gimbal stuck'), I’ll guide you.";

      return res.json({ reply, intent });
    }

    // ------- GENERAL ------- //
    const general =
      "Hi! I can help you with:\n" +
      "• Drone Buying Suggestions\n" +
      "• Rent / Sell / Pilot Program Info\n" +
      "• Agriculture / Industry Drones\n" +
      "• Accessories\n" +
      "• Troubleshooting Problems\n\n" +
      "Just ask me anything.";

    res.json({ reply: general, intent });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ reply: "Server error occurred." });
  }
};
