import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  Spin,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import { getUser } from "../utils/auth";

const { Title, Text } = Typography;

const Dashboard = () => {
  const user = getUser();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    in_progress: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
    reopened: 0,
    recentTickets: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/dashboard-stats");

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        message.error(
          response.data.message || "Failed to load dashboard"
        );
      }
    } catch (error) {
      console.error("Dashboard Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticket_number",
      key: "ticket_number",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      render: (value) => value || "N/A",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const colorMap = {
          Low: "green",
          Medium: "blue",
          High: "orange",
          Critical: "red",
        };

        return (
          <Tag color={colorMap[priority] || "default"}>
            {priority}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Open: "blue",
          Assigned: "cyan",
          "In Progress": "processing",
          "Pending User": "warning",
          "Pending Vendor": "warning",
          Resolved: "green",
          Closed: "default",
          Reopened: "red",
        };

        return (
          <Tag color={colorMap[status] || "default"}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Requester",
      dataIndex: "requester_name",
      key: "requester_name",
    },
    {
      title: "Assigned Agent",
      dataIndex: "assigned_agent_name",
      key: "assigned_agent_name",
      render: (value) => value || "Unassigned",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Dashboard
        </Title>

        <Text type="secondary">
          Welcome back, {user?.full_name || "User"}
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={Number(stats.total || 0)}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Open"
              value={Number(stats.open || 0)}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Assigned"
              value={Number(stats.assigned || 0)}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="In Progress"
              value={Number(stats.in_progress || 0)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Resolved"
              value={Number(stats.resolved || 0)}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card>
            <Statistic
              title="Closed"
              value={Number(stats.closed || 0)}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Tickets"
        style={{ marginTop: 24 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={stats.recentTickets || []}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{
            emptyText: "No recent tickets found",
          }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;