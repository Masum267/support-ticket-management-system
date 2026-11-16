import db from "../config/db.js";

export const createNotification = async (userId, title, message) => {
  if (!userId) return;
  try {
    // Respect the user's in-app notification preference when settings exist.
    const [settings] = await db.query(
      "SELECT system_notifications, ticket_notifications FROM user_settings WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (settings.length && (Number(settings[0].system_notifications) === 0 || Number(settings[0].ticket_notifications) === 0)) return;

    await db.query(
      "INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)",
      [userId, title, message]
    );
  } catch (error) {
    // Notifications should never break the primary ticket operation.
    console.error("Create Notification Error:", error.message);
  }
};

export const createAuditLog = async (userId, action, entityType = null, entityId = null, ipAddress = null) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [userId || null, action, entityType, entityId || null, ipAddress]
    );
  } catch (error) {
    console.error("Create Audit Log Error:", error.message);
  }
};
