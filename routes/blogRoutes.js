import express from "express";
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", createBlog);
router.put("/:slug", updateBlog);
router.delete("/:slug", deleteBlog);

export default router;
