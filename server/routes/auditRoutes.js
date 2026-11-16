import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = express.Router();
router.get("/", authenticateToken, authorizeRoles("super_admin"), getAuditLogs);
export default router;
