
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;

    // Check JWT secret configuration
    if (!secret || secret.length < 32) {
      console.error(
        "JWT Security Error: JWT_SECRET is missing or too weak."
      );

      return res.status(500).json({
        success: false,
        message: "Authentication service configuration error",
      });
    }

    // Validate Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const bearerMatch = authHeader.match(/^Bearer\s+(\S+)$/i);

    if (!bearerMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer token.",
      });
    }

    const token = bearerMatch[1];

    // Verify JWT
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      clockTolerance: 5,
    });

    // Validate decoded payload
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // Attach verified user information
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    console.error("Authentication Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error",
    });
  }
};
