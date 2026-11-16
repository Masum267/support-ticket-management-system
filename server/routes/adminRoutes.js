import express from "express";

import { 
    getAllUsers,
    changeUserRole,
    changeUserPassword,
    changeUserStatus,



 } from "../controllers/adminController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("super_admin"),
  getAllUsers
);

router.patch(
  "/users/:id/role",
  authenticateToken,
  authorizeRoles("super_admin"),
  changeUserRole
);

router.patch(
  "/users/:id/password",
  authenticateToken,
  authorizeRoles("super_admin"),
  changeUserPassword
);

router.patch(
  "/users/:id/status",
  authenticateToken,
  authorizeRoles("super_admin"),
  changeUserStatus
);

export default router;