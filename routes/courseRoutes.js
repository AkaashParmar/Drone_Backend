import express from "express";
import {
    createCourse,
    getAllCourses,
    getAllCoursesdropdown,
    getCourse,
    getCourseBySlug,
    updateCourse,
    deleteCourse,
    updateCourseImage,
    addEnrollment,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", upload.array("image", 5), createCourse);
router.get("/getAll", getAllCourses);
router.get("/getDropdown", getAllCoursesdropdown);
router.get("/get/:idOrType", getCourse);
router.get("/:slug", getCourseBySlug)
router.put("/update/:id", upload.array("images", 4), updateCourse);
router.delete("/delete/:id", deleteCourse);
router.put("/update-image/:id", upload.array("image", 5), updateCourseImage);
router.post("/:id/enroll", protect, addEnrollment);

export default router;
