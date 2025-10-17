import express from "express";
import {
    createCourse,
    getAllCourses,
    getCourse,
    updateCourse,
    deleteCourse,
    updateCourseImage,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", protect, upload.array("image", 5), createCourse);
router.get("/getAll", protect, getAllCourses);
router.get("/get/:idOrType", protect, getCourse);
router.put("/update/:id", protect, updateCourse);
router.delete("/delete/:id", protect, deleteCourse);
router.put("/update-image/:id", protect, upload.array("image", 5), updateCourseImage);

export default router;
