import express from 'express';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import Razorpay from 'razorpay';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from "./routes/productRoutes.js";
import rentRoutes from "./routes/rentRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import sellRoutes from "./routes/sellRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import razorpayRoutes from "./routes/razorpay.js";
import industryRoutes from "./routes/industryRoutes.js";
import pages from './models/pages.js';
import PilotRoutes from './routes/pilotRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";
import repairRoutes from "./routes/repairRouts.js";
import planRoutes from "./routes/planRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";

dotenv.config();
await connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173" , "https://drone-frontend-beryl.vercel.app"],
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (req, res) => {
  res.send("Drone Backend Server is running");
});


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/sell", sellRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', razorpayRoutes);
app.use("/api/industries", industryRoutes);
app.use("/api/pages", pages);
app.use("/api/pilots", PilotRoutes);
app.use('/api/addresses', addressRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/repair",repairRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/valuation", valuationRoutes);

app.get("/api/get-razorpay-key", (req, res) => {
  try {
    console.log("Razorpay Keys fetched successfully");
    res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error("Error fetching Razorpay keys:", error);
    res.status(500).json({ message: "Failed to fetch keys", error: error.message });
  }
});


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  console.log("Create order");
  console.log("body", req.body);

  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required to create order",
      });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7), // random ID
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);

    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ error: "Something went wrong while creating Razorpay order" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
