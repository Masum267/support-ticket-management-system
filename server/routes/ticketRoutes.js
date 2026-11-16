
import express from "express";

import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  addComment,
  getTicketComments,
  updateTicketStatus,
  getTicketHistory,
  assignTicket,
  getAvailableAgents,
  getAssignedTickets,
  updateAgentTicketStatus,
  closeTicket,
  getDashboardStats,
} from "../controllers/ticketController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

const staffRoles = [
  "agent",
  "manager",
  "admin",
  "super_admin",
];

// Dashboard Statistics
router.get(
  "/dashboard-stats",
  authenticateToken,
  getDashboardStats
);

// Create Ticket
router.post(
  "/",
  authenticateToken,
  createTicket
);

// Employee - Own Tickets
router.get(
  "/my-tickets",
  authenticateToken,
  getMyTickets
);

router.get(
  "/my",
  authenticateToken,
  getMyTickets
);

// All Tickets
router.get(
  "/all",
  authenticateToken,
  authorizeRoles(...staffRoles),
  getAllTickets
);

// Assigned Tickets
router.get(
  "/assigned",
  authenticateToken,
  authorizeRoles("agent"),
  getAssignedTickets
);

// Active Users for Assignment
router.get(
  "/agents",
  authenticateToken,
  authorizeRoles(...staffRoles),
  getAvailableAgents
);

// Assign / Reassign Ticket
router.patch(
  "/:id/assign",
  authenticateToken,
  authorizeRoles(...staffRoles),
  assignTicket
);

// Resolve / Update Staff Ticket Status
router.patch(
  "/:id/agent-status",
  authenticateToken,
  authorizeRoles(...staffRoles),
  updateAgentTicketStatus
);

// Close Ticket
router.patch(
  "/:id/close",
  authenticateToken,
  authorizeRoles(...staffRoles),
  closeTicket
);

// Employee Ticket Status Update
router.patch(
  "/:id/status",
  authenticateToken,
  updateTicketStatus
);

// Add Comment
router.post(
  "/:id/comments",
  authenticateToken,
  addComment
);

// Get Comments
router.get(
  "/:id/comments",
  authenticateToken,
  getTicketComments
);

// Get Ticket History
router.get(
  "/:id/history",
  authenticateToken,
  getTicketHistory
);

// Ticket Details
router.get(
  "/:id",
  authenticateToken,
  getTicketById
);

export default router;
