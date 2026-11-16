import db from "../config/db.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.employee_id,
        u.department_id,
        d.department_name,
        u.role_id,
        r.role_name,
        u.status,
        u.created_at
      FROM users u
      LEFT JOIN roles r
        ON u.role_id = r.id
      LEFT JOIN departments d
        ON u.department_id = d.id
      ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};


export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body || {};

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    // Check whether role exists
    const [roles] = await db.query(
      "SELECT id, role_name FROM roles WHERE id = ?",
      [role_id]
    );

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check whether user exists
    const [users] = await db.query(
      "SELECT id, full_name, role_id FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const oldRoleId = users[0].role_id;
    const newRoleName = roles[0].role_name;

    await db.query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [role_id, id]
    );

    // Record action in audit log
    await db.query(
      `INSERT INTO audit_logs
      (user_id, action, entity_type, entity_id)
      VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        "User Role Changed",
        "users",
        id,
      ]
    );

    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: Number(id),
        old_role_id: oldRoleId,
        new_role_id: Number(role_id),
        new_role_name: newRoleName,
      },
    });
  } catch (error) {
    console.error("Change User Role Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change user role",
      error: error.message,
    });
  }
};


//Super Admin Password Reset API
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body || {};

    if (!new_password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own password from this API",
      });
    }

    const [users] = await db.query(
      `SELECT id, full_name, email
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await db.query(
      `UPDATE users
       SET password = ?
       WHERE id = ?`,
      [hashedPassword, id]
    );

    await db.query(
      `INSERT INTO audit_logs
      (user_id, action, entity_type, entity_id)
      VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        "User Password Changed",
        "users",
        id,
      ]
    );

    res.json({
      success: true,
      message: "User password changed successfully",
      user: {
        id: Number(id),
        full_name: users[0].full_name,
        email: users[0].email,
      },
    });
  } catch (error) {
    console.error("Change User Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change user password",
      error: error.message,
    });
  }
};


//User Active Inactive API
export const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = ["Active", "Inactive"];

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

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const [users] = await db.query(
      `SELECT id, full_name, email, status
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldStatus = users[0].status;

    if (oldStatus === status) {
      return res.json({
        success: true,
        message: `User is already ${status}`,
      });
    }

    await db.query(
      `UPDATE users
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    await db.query(
      `INSERT INTO audit_logs
      (user_id, action, entity_type, entity_id)
      VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        "User Status Changed",
        "users",
        id,
      ]
    );

    res.json({
      success: true,
      message: "User status updated successfully",
      user: {
        id: Number(id),
        full_name: users[0].full_name,
        email: users[0].email,
        old_status: oldStatus,
        new_status: status,
      },
    });
  } catch (error) {
    console.error("Change User Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change user status",
      error: error.message,
    });
  }
};