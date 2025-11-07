import express from "express";
import multer from "multer";
import { createPilot, getAllPilots, getPilotById } from "../controllers/pilotController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post('/add', upload.array("image", 5), createPilot);
router.get("/:id", getPilotById);

export default router;
