import express from "express";
import multer from "multer";
import { createPilot, getAllPilots, getPilotById } from "../controllers/pilotController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router
  .route("/")
  .post(
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "logo", maxCount: 1 },
    ]),
    createPilot
  )
  .get(getAllPilots);

router.route("/:id").get(getPilotById);

export default router;
