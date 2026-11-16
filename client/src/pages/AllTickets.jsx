import React, { useEffect, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { getUser } from "../utils/auth";

const { Title, Text } = Typography;

const API_BASE_URL = "http://localhost:5000/api";

const AllTickets = () => {
  const navigate = useNavigate();

  const { message, modal } = AntApp.useApp();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [closeLoadingId, setCloseLoadingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("token");

  // =====================================================
  // Get Current User
  // =====================================================

  useEffect(() => {
    const user = getUser();

    if (user) {
      const rawRole = user.role_name || user.role || "";

      // Normalize role
      const normalizedRole = String(rawRole)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

      setUserRole(normalizedRole);
      setCurrentUserId(Number(user.id));
    }
  }, []);

  // =====================================================
  // Fetch All Tickets
  // =====================================================

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/tickets/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTickets(response.data.tickets || []);
      } else {
        message.error(
          response.data.message || "Failed to fetch tickets"
        );
      }
    } catch (error) {
      console.error("Fetch All Tickets Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to fetch tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Fetch Agents
  // =====================================================

  const fetchAgents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/agents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAgents(response.data.agents || []);
      }
    } catch (error) {
      console.error("Fetch Agents Error:", error);
    }
  };

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    fetchTickets();

    if (
      userRole === "admin" ||
      userRole === "super_admin"
    ) {
      fetchAgents();
    }
  }, [userRole]);

  // =====================================================
  // Open Assign Modal
  // =====================================================

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);

    setSelectedAgent(
      ticket.assigned_agent_id
        ? Number(ticket.assigned_agent_id)
        : null
    );

    setAssignModalOpen(true);
  };

  // =====================================================
  // Assign Ticket
  // =====================================================

  const handleAssignTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!selectedAgent) {
      message.warning("Please select an agent");
      return;
    }

    try {
      setAssignLoading(true);

      const response = await axios.patch(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/assign`,
        {
          assigned_to: Number(selectedAgent),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        message.success(
          response.data.message ||
            "Ticket assigned successfully"
        );

        setAssignModalOpen(false);
        setSelectedTicket(null);
        setSelectedAgent(null);

        await fetchTickets();
      } else {
        message.error(
          response.data.message ||
            "Failed to assign ticket"
        );
      }
    } catch (error) {
      console.error("Assign Ticket Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to assign ticket"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // =====================================================
  // Close Ticket
  // =====================================================

  const handleCloseTicket = (ticket) => {
    if (!ticket) {
      return;
    }

    if (ticket.status !== "Resolved") {
      message.warning(
        "Only resolved tickets can be closed"
      );
      return;
    }

    modal.confirm({
      title: "Close Ticket",

      content: (
        <div>
          <p>
            Are you sure you want to close this ticket?
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Ticket:</strong>{" "}
            {ticket.ticket_number || "N/A"}
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Subject:</strong>{" "}
            {ticket.subject || "N/A"}
          </p>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              color: "#666",
            }}
          >
            Only resolved tickets can be closed.
          </p>
        </div>
      ),

      okText: "Close Ticket",
      cancelText: "Cancel",

      okButtonProps: {
        danger: true,
      },

      onOk: async () => {
        try {
          setCloseLoadingId(ticket.id);

          const response = await axios.patch(
            `${API_BASE_URL}/tickets/${ticket.id}/close`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            message.success(
              response.data.message ||
                "Ticket closed successfully"
            );

            await fetchTickets();
          } else {
            message.error(
              response.data.message ||
                "Failed to close ticket"
            );
          }
        } catch (error) {
          console.error("Close Ticket Error:", error);

          message.error(
            error.response?.data?.message ||
              "Failed to close ticket"
          );
        } finally {
          setCloseLoadingId(null);
        }
      },
    });
  };

  // =====================================================
  // Status Tag
  // =====================================================

  const getStatusTag = (status) => {
    const statusColors = {
      Open: "blue",
      Assigned: "cyan",
      "In Progress": "processing",
      "Pending User": "orange",
      Resolved: "green",
      Closed: "default",
      Reopened: "purple",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status || "N/A"}
      </Tag>
    );
  };

  // =====================================================
  // Priority Tag
  // =====================================================

  const getPriorityTag = (priority) => {
    const priorityColors = {
      Low: "green",
      Medium: "blue",
      High: "orange",
      Critical: "red",
    };

    return (
      <Tag
        color={
          priorityColors[priority] || "default"
        }
      >
        {priority || "N/A"}
      </Tag>
    );
  };

  // =====================================================
  // Filter Tickets
  // =====================================================

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchText
      .toLowerCase()
      .trim();

    const matchesSearch =
      !search ||
      ticket.ticket_number
        ?.toLowerCase()
        .includes(search) ||
      ticket.subject
        ?.toLowerCase()
        .includes(search) ||
      ticket.requester_name
        ?.toLowerCase()
        .includes(search) ||
      ticket.assigned_agent_name
        ?.toLowerCase()
        .includes(search) ||
      ticket.category_name
        ?.toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      ticket.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  // =====================================================
  // Table Columns
  // =====================================================

  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticket_number",
      key: "ticket_number",
      width: 160,

      render: (ticketNumber) => (
        <Text strong>
          {ticketNumber || "N/A"}
        </Text>
      ),
    },

    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 230,

      render: (subject) => (
        <Text>
          {subject || "No Subject"}
        </Text>
      ),
    },

    {
      title: "Requester",
      dataIndex: "requester_name",
      key: "requester_name",
      width: 160,

      render: (name, record) => (
        <div>
          <Text strong>
            {name || "N/A"}
          </Text>

          {record.requester_employee_id && (
            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                {record.requester_employee_id}
              </Text>
            </div>
          )}
        </div>
      ),
    },

    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      width: 130,

      render: (category) => (
        <Tag>
          {category || "N/A"}
        </Tag>
      ),
    },

    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,

      render: (priority) =>
        getPriorityTag(priority),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,

      render: (status) =>
        getStatusTag(status),
    },

    {
      title: "Assigned To",
      dataIndex: "assigned_agent_name",
      key: "assigned_agent_name",
      width: 160,

      render: (name) =>
        name ? (
          <Text>{name}</Text>
        ) : (
          <Text type="secondary">
            Unassigned
          </Text>
        ),
    },

    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,

      render: (date) =>
        date
          ? new Date(date).toLocaleDateString(
              "en-GB"
            )
          : "N/A",
    },

    // ===================================================
    // Actions
    // ===================================================

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 280,

            render: (_, record) => {
        // Normalize role
        const normalizedRole = String(userRole || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        // Normalize ticket status
        const normalizedStatus = String(record.status || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        const isAdmin = normalizedRole === "admin";

        const isSuperAdmin =
          normalizedRole === "super_admin";

        const isAgent =
          normalizedRole === "agent";

        const isResolved =
          normalizedStatus === "resolved";

        const isAssignedToCurrentAgent =
          Number(record.assigned_agent_id) ===
          Number(currentUserId);

        const canAssign =
          isAdmin || isSuperAdmin;

        // ==========================================
        // CLOSE PERMISSION
        // ==========================================
        //
        // Super Admin -> Any Resolved ticket
        // Admin       -> Any Resolved ticket
        // Agent       -> Own assigned Resolved ticket
        //
        // ==========================================

        const canClose =
          isResolved &&
          (
            isSuperAdmin ||
            isAdmin ||
            (
              isAgent &&
              isAssignedToCurrentAgent
            )
          );

        return (
          <Space
            size="small"
            wrap
          >
            {/* View */}

            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`/tickets/${record.id}`)
              }
            >
              View
            </Button>

            {/* Assign / Reassign */}

            {canAssign && (
              <Button
                type="primary"
                icon={<UserSwitchOutlined />}
                onClick={() =>
                  openAssignModal(record)
                }
              >
                {record.assigned_agent_name
                  ? "Reassign"
                  : "Assign"}
              </Button>
            )}

            {/* Close */}

            {canClose && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={
                  closeLoadingId === record.id
                }
                disabled={
                  closeLoadingId !== null &&
                  closeLoadingId !== record.id
                }
                onClick={() =>
                  handleCloseTicket(record)
                }
              >
                Close
              </Button>
            )}
          </Space>
        );
      },

    },
  ];

  // =====================================================
  // Render
  // =====================================================

  return (
    <div>
      {/* Header */}

      <Row
        justify="space-between"
        align="middle"
        style={{
          marginBottom: 20,
        }}
      >
        <Col>
          <Title
            level={3}
            style={{
              margin: 0,
            }}
          >
            All Tickets
          </Title>

          <Text type="secondary">
            View and manage all support tickets
          </Text>
        </Col>

        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTickets}
            loading={loading}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Agent Information */}

      {userRole === "agent" && (
        <Alert
          message="Agent Ticket Access"
          description="You can view all tickets. You can update and close tickets assigned to you."
          type="info"
          showIcon
          style={{
            marginBottom: 20,
          }}
        />
      )}

      {/* Filters */}

      <Card
        style={{
          marginBottom: 20,
          borderRadius: 10,
        }}
      >
        <Row gutter={[12, 12]}>
          <Col
            xs={24}
            sm={12}
            md={10}
            lg={10}
          >
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search ticket, subject, requester..."
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
            lg={5}
          >
            <Select
              style={{
                width: "100%",
              }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  label: "All Status",
                  value: "All",
                },
                {
                  label: "Open",
                  value: "Open",
                },
                {
                  label: "Assigned",
                  value: "Assigned",
                },
                {
                  label: "In Progress",
                  value: "In Progress",
                },
                {
                  label: "Pending User",
                  value: "Pending User",
                },
                {
                  label: "Resolved",
                  value: "Resolved",
                },
                {
                  label: "Closed",
                  value: "Closed",
                },
                {
                  label: "Reopened",
                  value: "Reopened",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
            lg={5}
          >
            <Select
              style={{
                width: "100%",
              }}
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                {
                  label: "All Priorities",
                  value: "All",
                },
                {
                  label: "Low",
                  value: "Low",
                },
                {
                  label: "Medium",
                  value: "Medium",
                },
                {
                  label: "High",
                  value: "High",
                },
                {
                  label: "Critical",
                  value: "Critical",
                },
              ]}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={2}
            lg={4}
          >
            <Button
              block
              onClick={() => {
                setSearchText("");
                setStatusFilter("All");
                setPriorityFilter("All");
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Ticket Table */}

      <Card
        style={{
          borderRadius: 10,
        }}
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredTickets}
          scroll={{
            x: 1600,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} tickets`,
          }}
          locale={{
            emptyText: "No tickets found",
          }}
        />
      </Card>

      {/* Assign Modal */}

      <Modal
        title={
          selectedTicket?.assigned_agent_name
            ? "Reassign Ticket"
            : "Assign Ticket"
        }
        open={assignModalOpen}
        onCancel={() => {
          if (!assignLoading) {
            setAssignModalOpen(false);
            setSelectedTicket(null);
            setSelectedAgent(null);
          }
        }}
        onOk={handleAssignTicket}
        okText="Assign Ticket"
        cancelText="Cancel"
        confirmLoading={assignLoading}
      >
        {selectedTicket && (
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <Text strong>
              Ticket:
            </Text>{" "}
            {selectedTicket.ticket_number}

            <br />

            <Text strong>
              Subject:
            </Text>{" "}
            {selectedTicket.subject}
          </div>
        )}

        <Select
          style={{
            width: "100%",
          }}
          placeholder="Select an agent"
          value={selectedAgent}
          onChange={setSelectedAgent}
          showSearch
          optionFilterProp="label"
          options={agents.map((agent) => ({
            value: Number(agent.id),
            label: `${agent.full_name} (${agent.employee_id || agent.email})`,
          }))}
        />
      </Modal>
    </div>
  );
};

export default AllTickets;

