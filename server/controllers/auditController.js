import db from "../config/db.js";

export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(10, Number.parseInt(req.query.pageSize, 10) || 20));
    const offset = (page - 1) * pageSize;
    const search = String(req.query.search || "").trim();
    const action = String(req.query.action || "").trim();
    const where = [];
    const params = [];

    if (search) {
      where.push("(al.action LIKE ? OR al.entity_type LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (action) {
      where.push("al.action = ?");
      params.push(action);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}`,
      params
    );

    const [logs] = await db.query(
      `SELECT al.id, al.user_id, al.action, al.entity_type, al.entity_id,
              al.ip_address, al.created_at, u.full_name AS user_name, u.email AS user_email
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        pageSize,
        total: Number(countRows[0]?.total || 0),
      },
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};
