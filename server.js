import express from 'express';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from "./routes/productRoutes.js";
import rentRoutes from "./routes/rentRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import sellRoutes from "./routes/sellRoutes.js";
import adminRoutes from './routes/adminRoutes.js';

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

// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
