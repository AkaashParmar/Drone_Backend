import express from "express";
import { estimatePrice } from "../controllers/valuationController.js";

const router = express.Router();

router.post("/estimate", estimatePrice);

export default router;
