import React, { useCallback, useEffect, useState } from "react";
import { Alert, App as AntApp, Card, Input, Space, Table, Tag, Typography } from "antd";
import { SearchOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;

const AuditLogs = () => {
  const { message } = AntApp.useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const loadLogs = useCallback(async (page = pagination.current, pageSize = pagination.pageSize, term = search) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/audit-logs", {
        params: { page, pageSize, search: term },
      });
      setLogs(data.logs || []);
      setPagination({ current: data.pagination.page, pageSize: data.pagination.pageSize, total: data.pagination.total });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load audit logs";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [message, pagination.current, pagination.pageSize, search]);

  useEffect(() => { loadLogs(1, pagination.pageSize, ""); }, []); // initial load only

  const columns = [
    { title: "Time", dataIndex: "created_at", key: "created_at", width: 190, render: (value) => value ? new Date(value).toLocaleString() : "—" },
    { title: "User", key: "user", render: (_, row) => <><Text strong>{row.user_name || "Deleted user"}</Text><br /><Text type="secondary">{row.user_email || "—"}</Text></> },
    { title: "Action", dataIndex: "action", key: "action", render: (value) => <Tag color="blue">{value}</Tag> },
    { title: "Entity", dataIndex: "entity_type", key: "entity_type", render: (value) => value || "—" },
    { title: "Entity ID", dataIndex: "entity_id", key: "entity_id", render: (value) => value ?? "—" },
    { title: "IP Address", dataIndex: "ip_address", key: "ip_address", render: (value) => value || "—" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space align="center" style={{ marginBottom: 8 }}>
        <SafetyCertificateOutlined style={{ fontSize: 24 }} />
        <Title level={3} style={{ margin: 0 }}>Audit Logs</Title>
      </Space>
      <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Review administrative and ticket activity recorded by the system.
      </Text>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <Card>
        <Input
          allowClear
          value={search}
          prefix={<SearchOutlined />}
          placeholder="Search action, user, email, or entity"
          onChange={(event) => setSearch(event.target.value)}
          onPressEnter={() => loadLogs(1, pagination.pageSize, search)}
          style={{ maxWidth: 420, marginBottom: 16 }}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} audit records`,
            onChange: (page, pageSize) => loadLogs(page, pageSize, search),
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
