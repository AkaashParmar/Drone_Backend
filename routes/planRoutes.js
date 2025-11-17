import express from "express";
import { createPlan, getPlanBySlug,updatePlan , getAllPlans } from "../controllers/planController.js";

const router = express.Router();

// POST → Add new plan using Postman
router.post("/create", createPlan);
router.get("/all", getAllPlans);
// GET → Fetch plan by slug
router.get("/:slug", getPlanBySlug);
router.put("/:slug", updatePlan);

export default router;
