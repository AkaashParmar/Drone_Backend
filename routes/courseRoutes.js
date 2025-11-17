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
    getEnrollments,
    addReview,
    getReviews,
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
router.post("/courses/:id/enroll", protect, addEnrollment);
router.get("/courses/:id/enrollments", getEnrollments);
router.post("/courses/:courseId/review", protect, addReview);
router.get("/:courseId/reviews", getReviews);

export default router;
