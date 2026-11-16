import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Tooltip,
  Empty,
  message,
} from "antd";

import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

const MyTickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  /* =========================
     Fetch My Tickets
  ========================= */

  const fetchMyTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/my-tickets");

      if (response.data?.success) {
        const data = response.data.tickets || [];

        setTickets(data);
        setFilteredTickets(data);
      } else {
        setTickets([]);
        setFilteredTickets([]);
      }
    } catch (error) {
      console.error("My tickets error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to load your tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  /* =========================
     Filters
  ========================= */

  useEffect(() => {
    let data = [...tickets];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (ticket) =>
          ticket.ticket_number
            ?.toLowerCase()
            .includes(value) ||
          ticket.subject
            ?.toLowerCase()
            .includes(value) ||
          ticket.category
            ?.toLowerCase()
            .includes(value)
      );
    }

    if (statusFilter !== "All") {
      data = data.filter(
        (ticket) => ticket.status === statusFilter
      );
    }

    if (priorityFilter !== "All") {
      data = data.filter(
        (ticket) => ticket.priority === priorityFilter
      );
    }

    setFilteredTickets(data);
  }, [
    search,
    statusFilter,
    priorityFilter,
    tickets,
  ]);

  /* =========================
     Status Tag
  ========================= */

  const getStatusTag = (status) => {
    const statusMap = {
      Open: {
        color: "blue",
        text: "Open",
      },

      Assigned: {
        color: "cyan",
        text: "Assigned",
      },

      "In Progress": {
        color: "processing",
        text: "In Progress",
      },

      "Pending User": {
        color: "orange",
        text: "Pending User",
      },

      Resolved: {
        color: "green",
        text: "Resolved",
      },

      Closed: {
        color: "default",
        text: "Closed",
      },

      Reopened: {
        color: "purple",
        text: "Reopened",
      },
    };

    const config = statusMap[status] || {
      color: "default",
      text: status || "Unknown",
    };

    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /* =========================
     Priority Tag
  ========================= */

  const getPriorityTag = (priority) => {
    const priorityMap = {
      Low: "green",
      Medium: "blue",
      High: "orange",
      Critical: "red",
    };

    return (
      <Tag color={priorityMap[priority] || "default"}>
        {priority || "N/A"}
      </Tag>
    );
  };

  /* =========================
     Date Format
  ========================= */

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================
     Table Columns
  ========================= */

  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticket_number",
      key: "ticket_number",
      width: 130,
      render: (value) => (
        <Text strong>{value || "N/A"}</Text>
      ),
    },

    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (value) => (
        <Text>{value || "No subject"}</Text>
      ),
    },

    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 130,
      render: (value) => (
        <Tag>{value || "N/A"}</Tag>
      ),
    },

    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (value) => getPriorityTag(value),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (value) => getStatusTag(value),
    },

    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (value) => (
        <Text type="secondary">
          {formatDate(value)}
        </Text>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="View Ticket">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/tickets/${record.id}`)
            }
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  /* =========================
     Summary
  ========================= */

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Open" ||
      ticket.status === "Assigned" ||
      ticket.status === "In Progress"
  ).length;

  const pendingTickets = tickets.filter(
    (ticket) => ticket.status === "Pending User"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
  ).length;

  return (
    <div>
      {/* =========================
          Header
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
            }}
          >
            My Tickets
          </Title>

          <Text type="secondary">
            View and track all tickets submitted by you.
          </Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchMyTickets}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* =========================
          Summary Cards
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card>
          <Text type="secondary">
            Total Tickets
          </Text>

          <Title
            level={2}
            style={{
              margin: "8px 0 0",
            }}
          >
            {totalTickets}
          </Title>
        </Card>

        <Card>
          <Text type="secondary">
            Active Tickets
          </Text>

          <Title
            level={2}
            style={{
              margin: "8px 0 0",
              color: "#1677ff",
            }}
          >
            {openTickets}
          </Title>
        </Card>

        <Card>
          <Text type="secondary">
            Pending User
          </Text>

          <Title
            level={2}
            style={{
              margin: "8px 0 0",
              color: "#fa8c16",
            }}
          >
            {pendingTickets}
          </Title>
        </Card>

        <Card>
          <Text type="secondary">
            Resolved / Closed
          </Text>

          <Title
            level={2}
            style={{
              margin: "8px 0 0",
              color: "#52c41a",
            }}
          >
            {resolvedTickets}
          </Title>
        </Card>
      </div>

      {/* =========================
          Ticket Table
      ========================= */}

      <Card>
        {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search ticket, subject or category"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: 300,
            }}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{
              width: 170,
            }}
            options={[
              {
                value: "All",
                label: "All Status",
              },
              {
                value: "Open",
                label: "Open",
              },
              {
                value: "Assigned",
                label: "Assigned",
              },
              {
                value: "In Progress",
                label: "In Progress",
              },
              {
                value: "Pending User",
                label: "Pending User",
              },
              {
                value: "Resolved",
                label: "Resolved",
              },
              {
                value: "Closed",
                label: "Closed",
              },
              {
                value: "Reopened",
                label: "Reopened",
              },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{
              width: 160,
            }}
            options={[
              {
                value: "All",
                label: "All Priority",
              },
              {
                value: "Low",
                label: "Low",
              },
              {
                value: "Medium",
                label: "Medium",
              },
              {
                value: "High",
                label: "High",
              },
              {
                value: "Critical",
                label: "Critical",
              },
            ]}
          />

          <Button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPriorityFilter("All");
            }}
          >
            Clear Filters
          </Button>
        </div>

        {/* Table */}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredTickets}
          loading={loading}
          scroll={{
            x: 1000,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No tickets found"
              />
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tickets`,
          }}
        />
      </Card>
    </div>
  );
};

export default MyTickets;