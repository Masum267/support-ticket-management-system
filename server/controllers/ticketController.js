
import db from "../config/db.js";
import { createNotification, createAuditLog } from "../utils/eventLogger.js";

// =====================================================
// 1. CREATE TICKET
// =====================================================

export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category_id,
      priority,
      department_id,
      location,
    } = req.body || {};

    if (!subject || !description || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Subject, description and category are required",
      });
    }

    const [categories] = await db.query(
      "SELECT id FROM ticket_categories WHERE id = ?",
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket category",
      });
    }

    if (department_id) {
      const [departments] = await db.query(
        "SELECT id FROM departments WHERE id = ?",
        [department_id]
      );

      if (departments.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid department",
        });
      }
    }

    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const selectedPriority = priority || "Medium";

    if (!allowedPriorities.includes(selectedPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    // Generate unique ticket number.
    let ticketNumber;
    let ticketExists = true;

    while (ticketExists) {
      const randomNumber = Math.floor(
        100000 + Math.random() * 900000
      );

      ticketNumber = `TKT-${randomNumber}`;

      const [existingTickets] = await db.query(
        `SELECT id
         FROM tickets
         WHERE ticket_number = ?
         LIMIT 1`,
        [ticketNumber]
      );

      ticketExists = existingTickets.length > 0;
    }

    // Create ticket.
    const [result] = await db.query(
      `INSERT INTO tickets
      (
        ticket_number,
        subject,
        description,
        category_id,
        priority,
        status,
        requester_id,
        department_id,
        location
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketNumber,
        subject.trim(),
        description.trim(),
        category_id,
        selectedPriority,
        "Open",
        req.user.id,
        department_id || null,
        location || null,
      ]
    );

    const ticketId = result.insertId;

    // Save ticket history.
    await db.query(
      `INSERT INTO ticket_history
      (
        ticket_id,
        user_id,
        action,
        old_value,
        new_value
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        req.user.id,
        "Ticket Created",
        null,
        "Open",
      ]
    );

    // Create audit log.
    await createAuditLog(
      req.user.id,
      "Ticket Created",
      "tickets",
      ticketId,
      req.ip
    );

    // Get all active users, including the ticket creator.
    const [activeUsers] = await db.query(
      `SELECT id
       FROM users
       WHERE status = 'Active'`
    );

    // Send notification to every active user.
    for (const activeUser of activeUsers) {
      await createNotification(
        activeUser.id,
        "New Ticket Created",
        `A new ticket ${ticketNumber} - ${subject.trim()} has been created.`
      );
    }

    // Return response.
    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: {
        id: ticketId,
        ticket_number: ticketNumber,
        subject: subject.trim(),
        description: description.trim(),
        category_id: Number(category_id),
        priority: selectedPriority,
        status: "Open",
        requester_id: req.user.id,
        department_id: department_id
          ? Number(department_id)
          : null,
        location: location || null,
      },
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};


// =====================================================
// 2. GET MY TICKETS
// =====================================================
export const getMyTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT
        t.id,
        t.ticket_number,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.location,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        t.closed_at,
        tc.category_name,
        d.department_name,
        agent.full_name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      LEFT JOIN ticket_categories tc
        ON t.category_id = tc.id
      LEFT JOIN departments d
        ON t.department_id = d.id
      LEFT JOIN users agent
        ON t.assigned_to = agent.id
      WHERE t.requester_id = ?
      ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: "My tickets fetched successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get My Tickets Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// =====================================================
// 3. GET ALL TICKETS
// =====================================================
export const getAllTickets = async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT
        t.id,
        t.ticket_number,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.location,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        t.closed_at,
        tc.category_name,
        d.department_name,
        requester.full_name AS requester_name,
        requester.email AS requester_email,
        requester.employee_id AS requester_employee_id,
        agent.id AS assigned_agent_id,
        agent.full_name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      LEFT JOIN ticket_categories tc
        ON t.category_id = tc.id
      LEFT JOIN departments d
        ON t.department_id = d.id
      LEFT JOIN users requester
        ON t.requester_id = requester.id
      LEFT JOIN users agent
        ON t.assigned_to = agent.id
      ORDER BY t.created_at DESC`
    );

    res.json({
      success: true,
      message: "All tickets fetched successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get All Tickets Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all tickets",
      error: error.message,
    });
  }
};

// =====================================================
// 4. GET TICKET DETAILS
// =====================================================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await db.query(
      `SELECT
        t.id,
        t.ticket_number,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.location,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        t.closed_at,
        tc.category_name,
        d.department_name,
        requester.id AS requester_id,
        requester.full_name AS requester_name,
        requester.email AS requester_email,
        requester.employee_id AS requester_employee_id,
        agent.id AS assigned_agent_id,
        agent.full_name AS assigned_agent_name,
        agent.email AS assigned_agent_email
      FROM tickets t
      LEFT JOIN ticket_categories tc
        ON t.category_id = tc.id
      LEFT JOIN departments d
        ON t.department_id = d.id
      LEFT JOIN users requester
        ON t.requester_id = requester.id
      LEFT JOIN users agent
        ON t.assigned_to = agent.id
      WHERE t.id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];
    const role = req.user.role_name;

    const isOwner =
      Number(ticket.requester_id) === Number(req.user.id);

    const canViewAll = [
      "agent",
      "admin",
      "super_admin",
      "manager",
    ].includes(role);

    if (!isOwner && !canViewAll) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this ticket",
      });
    }

    res.json({
      success: true,
      message: "Ticket details fetched successfully",
      ticket,
    });
  } catch (error) {
    console.error("Get Ticket Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details",
      error: error.message,
    });
  }
};

// =====================================================
// 5. ADD COMMENT
// =====================================================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body || {};

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const [tickets] = await db.query(
      `SELECT id, requester_id, assigned_to
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];
    const role = req.user.role_name;

    const isOwner =
      Number(ticket.requester_id) === Number(req.user.id);

    const canCommentAsStaff = [
      "agent",
      "admin",
      "super_admin",
      "manager",
    ].includes(role);

    if (!isOwner && !canCommentAsStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to comment on this ticket",
      });
    }

    const [result] = await db.query(
      `INSERT INTO ticket_comments
      (
        ticket_id,
        user_id,
        comment,
        is_internal
      )
      VALUES (?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        comment.trim(),
        0,
      ]
    );

    const notifyUserId =
      Number(ticket.requester_id) === Number(req.user.id)
        ? ticket.assigned_to
        : ticket.requester_id;

    if (
      notifyUserId &&
      Number(notifyUserId) !== Number(req.user.id)
    ) {
      await createNotification(
        notifyUserId,
        "New ticket comment",
        `A new comment was added to ticket #${id}.`
      );
    }

    await createAuditLog(
      req.user.id,
      "Ticket Comment Added",
      "tickets",
      id,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: {
        id: result.insertId,
        ticket_id: Number(id),
        user_id: req.user.id,
        comment: comment.trim(),
        is_internal: 0,
      },
    });
  } catch (error) {
    console.error("Add Comment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// =====================================================
// 6. GET TICKET COMMENTS
// =====================================================
export const getTicketComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await db.query(
      `SELECT id, requester_id
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];
    const role = req.user.role_name;

    const isOwner =
      Number(ticket.requester_id) === Number(req.user.id);

    const canViewAll = [
      "agent",
      "admin",
      "super_admin",
      "manager",
    ].includes(role);

    if (!isOwner && !canViewAll) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view comments",
      });
    }

    const [comments] = await db.query(
      `SELECT
        tc.id,
        tc.ticket_id,
        tc.user_id,
        tc.comment,
        tc.is_internal,
        tc.created_at,
        u.full_name AS user_name,
        u.email AS user_email
      FROM ticket_comments tc
      LEFT JOIN users u
        ON tc.user_id = u.id
      WHERE tc.ticket_id = ?
        AND tc.is_internal = 0
      ORDER BY tc.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      message: "Ticket comments fetched successfully",
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// =====================================================
// 7. EMPLOYEE TICKET STATUS UPDATE
// =====================================================
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = [
      "Open",
      "Pending User",
      "Reopened",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const [tickets] = await db.query(
      `SELECT id, status, assigned_to
       FROM tickets
       WHERE id = ?
         AND requester_id = ?`,
      [id, req.user.id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const oldStatus = tickets[0].status;

    if (oldStatus === status) {
      return res.json({
        success: true,
        message: `Ticket status is already ${status}`,
      });
    }

    await db.query(
      `UPDATE tickets
       SET
         status = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
         AND requester_id = ?`,
      [
        status,
        id,
        req.user.id,
      ]
    );

    await db.query(
      `INSERT INTO ticket_history
      (
        ticket_id,
        user_id,
        action,
        old_value,
        new_value
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        "Status Updated",
        oldStatus,
        status,
      ]
    );

    await createAuditLog(
      req.user.id,
      "Ticket Status Updated",
      "tickets",
      id,
      req.ip
    );

    if (
      tickets[0].assigned_to &&
      Number(tickets[0].assigned_to) !== Number(req.user.id)
    ) {
      await createNotification(
        tickets[0].assigned_to,
        "Ticket status updated",
        `Ticket #${id} status changed from ${oldStatus} to ${status}.`
      );
    }

    res.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket: {
        id: Number(id),
        old_status: oldStatus,
        new_status: status,
      },
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};

// =====================================================
// 8. GET TICKET HISTORY
// =====================================================
export const getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await db.query(
      `SELECT id, requester_id
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];
    const role = req.user.role_name;

    const isOwner =
      Number(ticket.requester_id) === Number(req.user.id);

    const canViewAll = [
      "agent",
      "admin",
      "super_admin",
      "manager",
    ].includes(role);

    if (!isOwner && !canViewAll) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view ticket history",
      });
    }

    const [history] = await db.query(
      `SELECT
        th.id,
        th.ticket_id,
        th.user_id,
        th.action,
        th.old_value,
        th.new_value,
        th.created_at,
        u.full_name AS user_name
      FROM ticket_history th
      LEFT JOIN users u
        ON th.user_id = u.id
      WHERE th.ticket_id = ?
      ORDER BY th.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      message: "Ticket history fetched successfully",
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get Ticket History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket history",
      error: error.message,
    });
  }
};

// =====================================================
// 9. ASSIGN TICKET
// =====================================================

export const assignTicket = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;
    const { assigned_to } = req.body || {};

    const ticketId = Number(id);
    const assignedUserId = Number(assigned_to);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (!Number.isInteger(assignedUserId) || assignedUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid user.",
      });
    }

    // Only authorized staff can assign tickets
    const userRole = String(
      req.user.role_name || req.user.role || ""
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const allowedRoles = [
      "agent",
      "manager",
      "admin",
      "super_admin",
    ];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to assign tickets.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Lock ticket record
    const [tickets] = await connection.query(
      `SELECT
        id,
        ticket_number,
        status,
        assigned_to,
        requester_id
       FROM tickets
       WHERE id = ?
       FOR UPDATE`,
      [ticketId]
    );

    if (!tickets.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const ticket = tickets[0];

    if (["Resolved", "Closed"].includes(ticket.status)) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Resolved or closed tickets cannot be reassigned.",
      });
    }

    // Only active staff members can receive tickets
    const [users] = await connection.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.status,
        r.role_name
       FROM users u
       INNER JOIN roles r
         ON r.id = u.role_id
       WHERE u.id = ?
         AND u.status = 'Active'
         AND LOWER(r.role_name) IN (
           'agent',
           'manager',
           'admin',
           'super_admin'
         )
       LIMIT 1`,
      [assignedUserId]
    );

    if (!users.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Selected user is not an active staff member. Employees cannot be assigned tickets.",
      });
    }

    const selectedUser = users[0];

    const oldAssignedTo = ticket.assigned_to
      ? Number(ticket.assigned_to)
      : null;

    // Prevent duplicate assignment
    if (oldAssignedTo === assignedUserId) {
      await connection.rollback();

      return res.json({
        success: true,
        message: "This ticket is already assigned to the selected user.",
        ticket: {
          id: ticketId,
          ticket_number: ticket.ticket_number,
          assigned_to: assignedUserId,
          assigned_agent_name: selectedUser.full_name,
          assigned_agent_email: selectedUser.email,
          status: ticket.status,
        },
      });
    }

    // Update assignment
    await connection.query(
      `UPDATE tickets
       SET
         assigned_to = ?,
         status = 'Assigned',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [assignedUserId, ticketId]
    );

    // Save assignment history
    await connection.query(
      `INSERT INTO ticket_history
       (ticket_id, user_id, action, old_value, new_value)
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        req.user.id,
        oldAssignedTo ? "Ticket Reassigned" : "Ticket Assigned",
        oldAssignedTo ? String(oldAssignedTo) : null,
        String(assignedUserId),
      ]
    );

    await connection.commit();

    // Audit log
    try {
      await createAuditLog(
        req.user.id,
        oldAssignedTo ? "Ticket Reassigned" : "Ticket Assigned",
        "tickets",
        ticketId,
        req.ip
      );
    } catch (auditError) {
      console.error("Assignment Audit Log Error:", auditError.message);
    }

    // Notify new assignee
    await createNotification(
      assignedUserId,
      oldAssignedTo ? "Ticket Reassigned to You" : "New Ticket Assigned",
      `Ticket ${ticket.ticket_number} has been assigned to you.`
    );

    // Notify previous assignee
    if (oldAssignedTo && oldAssignedTo !== assignedUserId) {
      await createNotification(
        oldAssignedTo,
        "Ticket Reassigned",
        `Ticket ${ticket.ticket_number} has been reassigned to another user.`
      );
    }

    return res.json({
      success: true,
      message: oldAssignedTo
        ? "Ticket reassigned successfully."
        : "Ticket assigned successfully.",
      ticket: {
        id: ticketId,
        ticket_number: ticket.ticket_number,
        assigned_to: assignedUserId,
        assigned_agent_name: selectedUser.full_name,
        assigned_agent_email: selectedUser.email,
        status: "Assigned",
      },
    });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Assignment Rollback Error:", rollbackError.message);
      }
    }

    console.error("Assign Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket.",
      error: error.message,
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};



// =====================================================
// AVAILABLE ACTIVE USERS FOR ASSIGNMENT
// =====================================================

export const getAvailableAgents = async (req, res) => {
  try {
    const [agents] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.employee_id,
        u.status,
        r.role_name
       FROM users u
       INNER JOIN roles r
         ON r.id = u.role_id
       WHERE u.status = 'Active'
         AND LOWER(r.role_name) IN (
           'agent',
           'manager',
           'admin',
           'super_admin'
         )
       ORDER BY u.full_name ASC`
    );

    return res.json({
      success: true,
      count: agents.length,
      agents,
    });

  } catch (error) {
    console.error("Get Available Agents Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available agents",
      error: error.message,
    });
  }
};


// =====================================================
// 10. GET ASSIGNED TICKETS
// =====================================================
export const getAssignedTickets = async (req, res) => {
  try {
    const agentId = req.user.id;

    const [tickets] = await db.query(
      `SELECT
        t.id,
        t.ticket_number,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.location,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        t.closed_at,
        tc.category_name,
        d.department_name,
        requester.full_name AS requester_name,
        requester.email AS requester_email,
        requester.employee_id AS requester_employee_id
      FROM tickets t
      LEFT JOIN ticket_categories tc
        ON t.category_id = tc.id
      LEFT JOIN departments d
        ON t.department_id = d.id
      LEFT JOIN users requester
        ON t.requester_id = requester.id
      WHERE t.assigned_to = ?
      ORDER BY t.created_at DESC`,
      [agentId]
    );

    res.json({
      success: true,
      message: "Assigned tickets fetched successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get Assigned Tickets Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tickets",
      error: error.message,
    });
  }
};

// =====================================================
// 11. AGENT STATUS UPDATE
// =====================================================

export const updateAgentTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const role = String(req.user.role_name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const allowedRoles = [
      "agent",
      "manager",
      "admin",
      "super_admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this ticket",
      });
    }

    const allowedStatuses = [
      "In Progress",
      "Pending User",
      "Resolved",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const [tickets] = await db.query(
      `SELECT
        id,
        ticket_number,
        status,
        requester_id,
        assigned_to
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];
    const oldStatus = ticket.status;

    if (oldStatus === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Closed tickets cannot be updated",
      });
    }

    if (oldStatus === status) {
      return res.json({
        success: true,
        message: `Ticket is already ${status}`,
      });
    }

    await db.query(
      `UPDATE tickets
       SET
         status = ?,
         updated_at = CURRENT_TIMESTAMP,
         resolved_at = CASE
           WHEN ? = 'Resolved'
           THEN CURRENT_TIMESTAMP
           ELSE resolved_at
         END
       WHERE id = ?`,
      [status, status, id]
    );

    await db.query(
      `INSERT INTO ticket_history
      (
        ticket_id,
        user_id,
        action,
        old_value,
        new_value
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        "Status Updated",
        oldStatus,
        status,
      ]
    );

    await createAuditLog(
      req.user.id,
      "Ticket Status Updated",
      "tickets",
      id,
      req.ip
    );

    if (
      ticket.requester_id &&
      Number(ticket.requester_id) !== Number(req.user.id)
    ) {
      await createNotification(
        ticket.requester_id,
        "Ticket status updated",
        `Ticket ${ticket.ticket_number} status changed from ${oldStatus} to ${status}.`
      );
    }

    if (
      ticket.assigned_to &&
      Number(ticket.assigned_to) !== Number(req.user.id) &&
      Number(ticket.assigned_to) !== Number(ticket.requester_id)
    ) {
      await createNotification(
        ticket.assigned_to,
        "Ticket status updated",
        `Ticket ${ticket.ticket_number} status changed to ${status}.`
      );
    }

    return res.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket: {
        id: Number(ticket.id),
        ticket_number: ticket.ticket_number,
        old_status: oldStatus,
        new_status: status,
      },
    });
  } catch (error) {
    console.error("Update Staff Ticket Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};


// =====================================================
// 12. CLOSE TICKET
// =====================================================

export const closeTicket = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const allowedRoles = [
      "agent",
      "manager",
      "admin",
      "super_admin",
    ];

    const userRole = String(req.user.role_name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to close tickets",
      });
    }

    await connection.beginTransaction();

    const [tickets] = await connection.query(
      `SELECT id, status, requester_id, assigned_to
       FROM tickets
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (tickets.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    if (ticket.status !== "Resolved") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Only resolved tickets can be closed",
      });
    }

    await connection.query(
      `UPDATE tickets
       SET status = 'Closed',
           closed_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );

    // Insert ticket history using the actual database column.
    await connection.query(
      `INSERT INTO ticket_history
       (ticket_id, user_id, action, old_value, new_value)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, "Ticket Closed", "Resolved", "Closed"]
    );

    // Create audit log.
    await createAuditLog({
      user_id: userId,
      action: "Ticket Closed",
      table_name: "tickets",
      record_id: id,
      description: `Ticket ID ${id} was closed`,
    });

    // Notify ticket requester.
    await createNotification({
      user_id: ticket.requester_id,
      title: "Ticket Closed",
      message: `Your ticket #${id} has been closed.`,
      type: "ticket",
      related_id: id,
    });

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Ticket closed successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Close Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to close ticket",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


// =====================================================
// 13. DASHBOARD STATISTICS
// =====================================================
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role_name;

    let stats = {};
    let recentTickets = [];

    // ===========================
    // EMPLOYEE
    // ===========================
    if (role === "employee") {
      const [result] = await db.query(
        `SELECT
          COUNT(*) AS total,
          COALESCE(SUM(status = 'Open'), 0) AS open,
          COALESCE(SUM(status = 'Pending User'), 0) AS pending,
          COALESCE(SUM(status = 'Resolved'), 0) AS resolved,
          COALESCE(SUM(status = 'Closed'), 0) AS closed
        FROM tickets
        WHERE requester_id = ?`,
        [userId]
      );

      stats = result[0];

      const [recent] = await db.query(
        `SELECT
          t.id,
          t.ticket_number,
          t.subject,
          t.priority,
          t.status,
          t.created_at,
          tc.category_name
        FROM tickets t
        LEFT JOIN ticket_categories tc
          ON t.category_id = tc.id
        WHERE t.requester_id = ?
        ORDER BY t.created_at DESC
        LIMIT 5`,
        [userId]
      );

      recentTickets = recent;
    }

    // ===========================
    // AGENT
    // ===========================
    else if (role === "agent") {
      const [result] = await db.query(
        `SELECT
          COUNT(*) AS total,
          COALESCE(SUM(status = 'Assigned'), 0) AS assigned,
          COALESCE(SUM(status = 'In Progress'), 0) AS in_progress,
          COALESCE(SUM(status = 'Pending User'), 0) AS pending,
          COALESCE(SUM(status = 'Resolved'), 0) AS resolved
        FROM tickets`
      );

      stats = result[0];

      const [recent] = await db.query(
        `SELECT
          t.id,
          t.ticket_number,
          t.subject,
          t.priority,
          t.status,
          t.created_at,
          tc.category_name
        FROM tickets t
        LEFT JOIN ticket_categories tc
          ON t.category_id = tc.id
        ORDER BY t.created_at DESC
        LIMIT 5`
      );

      recentTickets = recent;
    }

    // ===========================
    // ADMIN / SUPER ADMIN / MANAGER
    // ===========================
    else {
      const [result] = await db.query(
        `SELECT
          COUNT(*) AS total,
          COALESCE(SUM(status = 'Open'), 0) AS open,
          COALESCE(SUM(status = 'Assigned'), 0) AS assigned,
          COALESCE(SUM(status = 'In Progress'), 0) AS in_progress,
          COALESCE(
            SUM(
              status IN (
                'Pending User',
                'Pending Vendor'
              )
            ),
            0
          ) AS pending,
          COALESCE(SUM(status = 'Resolved'), 0) AS resolved,
          COALESCE(SUM(status = 'Closed'), 0) AS closed,
          COALESCE(SUM(status = 'Reopened'), 0) AS reopened
        FROM tickets`
      );

      stats = result[0];

      const [recent] = await db.query(
        `SELECT
          t.id,
          t.ticket_number,
          t.subject,
          t.priority,
          t.status,
          t.created_at,
          tc.category_name,
          requester.full_name AS requester_name,
          agent.full_name AS assigned_agent_name
        FROM tickets t
        LEFT JOIN ticket_categories tc
          ON t.category_id = tc.id
        LEFT JOIN users requester
          ON t.requester_id = requester.id
        LEFT JOIN users agent
          ON t.assigned_to = agent.id
        ORDER BY t.created_at DESC
        LIMIT 5`
      );

      recentTickets = recent;
    }

    Object.keys(stats).forEach((key) => {
      stats[key] = Number(stats[key] || 0);
    });

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        role,
        total: stats.total || 0,
        open: stats.open || 0,
        assigned: stats.assigned || 0,
        in_progress: stats.in_progress || 0,
        pending: stats.pending || 0,
        resolved: stats.resolved || 0,
        closed: stats.closed || 0,
        reopened: stats.reopened || 0,
        recentTickets,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};
