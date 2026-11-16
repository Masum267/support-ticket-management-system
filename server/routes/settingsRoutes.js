import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getMySettings, updateMySettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/me", authenticateToken, getMySettings);
router.put("/me", authenticateToken, updateMySettings);

export default router;
