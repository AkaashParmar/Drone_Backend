import express from "express";
import { createBooking, getBookings } from "../controllers/rentController.js";

const router = express.Router();

router.post("/book", createBooking);
router.get("/", getBookings);

export default router;
