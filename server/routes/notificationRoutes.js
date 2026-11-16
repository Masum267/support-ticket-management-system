import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticateToken, getMyNotifications);
router.patch("/read-all", authenticateToken, markAllNotificationsRead);
router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
