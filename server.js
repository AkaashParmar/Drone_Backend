import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res.send("Drone Backend Server is running");
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
