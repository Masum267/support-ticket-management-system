
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =====================================================
// REGISTER
// =====================================================

export const register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      employee_id,
      department_id,
    } = req.body || {};

    // Required fields validation
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !full_name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 bytes",
      });
    }

    // Check existing email
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    // Public registration always creates Employee account
    const [result] = await db.query(
      `INSERT INTO users
      (
        full_name,
        email,
        password,
        phone,
        employee_id,
        department_id,
        role_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        phone || null,
        employee_id || null,
        department_id || null,
        1,
        "Active",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Required fields validation
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check JWT configuration
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("JWT Security Error: Missing or weak JWT_SECRET");

      return res.status(500).json({
        success: false,
        message: "Authentication service configuration error",
      });
    }

    // Find user with role and department
    const [users] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.email,
        u.password,
        u.phone,
        u.employee_id,
        u.department_id,
        u.role_id,
        u.status,
        r.role_name,
        d.department_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = ?`,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      jwtSecret,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        department_id: user.department_id,
        department_name: user.department_name,
        role_id: user.role_id,
        role_name: user.role_name,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};
