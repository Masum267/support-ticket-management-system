import db from "../config/db.js";

const DEFAULT_SETTINGS = {
  ticket_notifications: 1,
  email_notifications: 1,
  system_notifications: 1,
  language: "English",
};

export const getMySettings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ticket_notifications, email_notifications,
              system_notifications, language, updated_at
       FROM user_settings WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.json({
        success: true,
        settings: { ...DEFAULT_SETTINGS, user_id: Number(req.user.id) },
      });
    }

    res.json({ success: true, settings: rows[0] });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

export const updateMySettings = async (req, res) => {
  try {
    const body = req.body || {};
    const toBit = (value, fallback) => {
      if (value === undefined || value === null) return fallback;
      if (value === true || value === 1 || value === "1") return 1;
      if (value === false || value === 0 || value === "0") return 0;
      return null;
    };

    const ticketNotifications = toBit(body.ticket_notifications, 1);
    const emailNotifications = toBit(body.email_notifications, 1);
    const systemNotifications = toBit(body.system_notifications, 1);
    const language = body.language ?? "English";

    if ([ticketNotifications, emailNotifications, systemNotifications].includes(null)) {
      return res.status(400).json({
        success: false,
        message: "Notification settings must be true or false",
      });
    }

    if (language !== "English") {
      return res.status(400).json({
        success: false,
        message: "Only English is currently supported",
      });
    }

    await db.query(
      `INSERT INTO user_settings
        (user_id, ticket_notifications, email_notifications, system_notifications, language)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        ticket_notifications = VALUES(ticket_notifications),
        email_notifications = VALUES(email_notifications),
        system_notifications = VALUES(system_notifications),
        language = VALUES(language),
        updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, ticketNotifications, emailNotifications, systemNotifications, language]
    );

    const [rows] = await db.query(
      `SELECT ticket_notifications, email_notifications,
              system_notifications, language, updated_at
       FROM user_settings WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: "Settings saved successfully",
      settings: rows[0],
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message,
    });
  }
};
