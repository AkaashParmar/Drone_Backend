import express from "express";
import multer from "multer";
import { createPilot, getAllPilots, getPilotById } from "../controllers/pilotController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
    { name: "qualificationDocuments", maxCount: 20 },
  { name: "insuranceDocuments", maxCount: 20 } 
  ]),
  createPilot
);


router.get("/:id", getPilotById);

export default router;
