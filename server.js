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

dotenv.config();
await connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

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


// get Razorpay key (for frontend to access)
app.get("/get-razorpay-key", (req, res) => {                
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


// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
