
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Input,
  App as AntApp,
  Timeline,
  Descriptions,
  Select,
  Modal,
  Spin,
  Empty,
} from "antd";

import {
  ArrowLeftOutlined,
  SendOutlined,
  ReloadOutlined,
  EditOutlined,
  UserOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { getUser } from "../utils/auth";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TicketDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = getUser();
  const { message } = AntApp.useApp();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);

  const [comment, setComment] = useState("");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  /* =========================
     Fetch Ticket
  ========================= */

  const fetchTicket = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/tickets/${id}`);

      if (response.data?.success) {
        setTicket(response.data.ticket);
      } else {
        message.error(
          response.data?.message || "Failed to load ticket"
        );
      }
    } catch (error) {
      console.error("Ticket fetch error:", error);

      message.error(
        error.response?.data?.message || "Failed to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Fetch Comments
  ========================= */

  const fetchComments = async () => {
    try {
      const response = await api.get(`/tickets/${id}/comments`);

      if (response.data?.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error("Comments fetch error:", error);
    }
  };

  /* =========================
     Fetch History
  ========================= */

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/tickets/${id}/history`);

      if (response.data?.success) {
        setHistory(response.data.history || []);
      }
    } catch (error) {
      console.error("History fetch error:", error);
    }
  };

  /* =========================
     Load Everything
  ========================= */

  const loadTicketData = async () => {
    await Promise.all([
      fetchTicket(),
      fetchComments(),
      fetchHistory(),
    ]);
  };

  useEffect(() => {
    if (id) {
      loadTicketData();
    }
  }, [id]);

  /* =========================
     Add Comment
  ========================= */

  const handleAddComment = async () => {
    if (!comment.trim()) {
      message.warning("Please enter a comment");
      return;
    }

    try {
      setCommentLoading(true);

      const response = await api.post(`/tickets/${id}/comments`, {
        comment: comment.trim(),
        is_internal: false,
      });

      if (response.data?.success) {
        message.success("Comment added successfully");

        setComment("");

        await fetchComments();
        await fetchHistory();
      } else {
        message.error(
          response.data?.message || "Failed to add comment"
        );
      }
    } catch (error) {
      console.error("Add comment error:", error);

      message.error(
        error.response?.data?.message || "Failed to add comment"
      );
    } finally {
      setCommentLoading(false);
    }
  };

  /* =========================
     Open Employee Status Modal
  ========================= */

  const openStatusModal = (status) => {
    setSelectedStatus(status);
    setStatusModalOpen(true);
  };

  /* =========================
     Update Employee Status
  ========================= */

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }

    try {
      setStatusLoading(true);

      const response = await api.patch(`/tickets/${id}/status`, {
        status: selectedStatus,
      });

      if (response.data?.success) {
        message.success("Ticket status updated successfully");

        setStatusModalOpen(false);
        setSelectedStatus("");

        await fetchTicket();
        await fetchHistory();
      } else {
        message.error(
          response.data?.message || "Failed to update ticket status"
        );
      }
    } catch (error) {
      console.error("Status update error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to update ticket status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  /* =========================
     Open Ticket Action Modal
  ========================= */

  const openTicketActionModal = (type) => {
    setActionType(type);
    setActionModalOpen(true);
  };

  /* =========================
     Confirm Resolve / Close
  ========================= */

  const handleConfirmTicketAction = async () => {
    try {
      setTicketActionLoading(true);

      let response;

      if (actionType === "resolve") {
        response = await api.patch(`/tickets/${id}/agent-status`, {
          status: "Resolved",
        });
      } else if (actionType === "close") {
        response = await api.patch(`/tickets/${id}/close`);
      } else {
        return;
      }

      if (response.data?.success) {
        message.success(
          actionType === "resolve"
            ? "Ticket resolved successfully"
            : "Ticket closed successfully"
        );

        setActionModalOpen(false);
        setActionType("");

        await fetchTicket();
        await fetchHistory();
      } else {
        message.error(
          response.data?.message || "Ticket action failed"
        );
      }
    } catch (error) {
      console.error("Ticket action error:", error);

      message.error(
        error.response?.data?.message || "Failed to update ticket"
      );
    } finally {
      setTicketActionLoading(false);
    }
  };

  /* =========================
     Status Tag
  ========================= */

  const getStatusTag = (status) => {
    const statusMap = {
      Open: "blue",
      Assigned: "cyan",
      "In Progress": "processing",
      "Pending User": "orange",
      Resolved: "green",
      Closed: "default",
      Reopened: "purple",
    };

    return (
      <Tag color={statusMap[status] || "default"}>
        {status || "Unknown"}
      </Tag>
    );
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
     Format Date
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
     History Color
  ========================= */

  const getHistoryColor = (action) => {
    if (action === "Ticket Created") {
      return "green";
    }

    if (
      action === "Ticket Assigned" ||
      action === "Ticket Assigned to Agent"
    ) {
      return "blue";
    }

    if (action === "Status Updated") {
      return "orange";
    }

    if (action === "Ticket Closed") {
      return "red";
    }

    return "gray";
  };

  /* =========================
     User Role & Permissions
  ========================= */

  const normalizedRole = String(user?.role_name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const isEmployee = normalizedRole === "employee";

  const canManageTickets = [
    "agent",
    "manager",
    "admin",
    "super_admin",
  ].includes(normalizedRole);

  const canResolveTicket =
    canManageTickets &&
    !["Resolved", "Closed"].includes(ticket?.status);

  const canCloseTicket =
    canManageTickets &&
    ticket?.status === "Resolved";

  const canSetPendingUser =
    isEmployee && ticket?.status === "Open";

  const canReopen =
    isEmployee && ticket?.status === "Closed";

  /* =========================
     Loading
  ========================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  /* =========================
     Ticket Not Found
  ========================= */

  if (!ticket) {
    return (
      <Empty description="Ticket not found">
        <Button
          type="primary"
          onClick={() => navigate("/tickets")}
        >
          Back to My Tickets
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/tickets")}
          >
            Back
          </Button>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              Ticket Details
            </Title>

            <Text type="secondary">
              {ticket.ticket_number}
            </Text>
          </div>
        </Space>

        <Button
          icon={<ReloadOutlined />}
          onClick={loadTicketData}
        >
          Refresh
        </Button>
      </div>

      {/* Ticket Information */}

      <Card
        title="Ticket Information"
        style={{ marginBottom: 20 }}
      >
        <Descriptions
          bordered
          column={{
            xs: 1,
            sm: 2,
            md: 2,
          }}
        >
          <Descriptions.Item label="Ticket Number">
            <Text strong>{ticket.ticket_number}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            {getStatusTag(ticket.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Subject">
            {ticket.subject}
          </Descriptions.Item>

          <Descriptions.Item label="Priority">
            {getPriorityTag(ticket.priority)}
          </Descriptions.Item>

          <Descriptions.Item label="Category">
            {ticket.category || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Department">
            {ticket.department_name ||
              ticket.department ||
              "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Location">
            {ticket.location || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Created">
            {formatDate(ticket.created_at)}
          </Descriptions.Item>

          <Descriptions.Item label="Assigned To">
            {ticket.assigned_agent_name ||
              ticket.assigned_to_name ||
              ticket.assigned_to ||
              "Not Assigned"}
          </Descriptions.Item>

          <Descriptions.Item label="Description">
            <Paragraph style={{ marginBottom: 0 }}>
              {ticket.description || "No description provided."}
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Employee Actions */}

      {isEmployee &&
        (canSetPendingUser || canReopen) && (
          <Card
            title="Ticket Actions"
            style={{ marginBottom: 20 }}
          >
            <Space wrap>
              {canSetPendingUser && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openStatusModal("Pending User")}
                >
                  Mark as Pending User
                </Button>
              )}

              {canReopen && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => openStatusModal("Reopened")}
                >
                  Reopen Ticket
                </Button>
              )}
            </Space>
          </Card>
        )}

      {/* Staff Ticket Actions */}

      {canManageTickets &&
        (canResolveTicket || canCloseTicket) && (
          <Card
            title="Ticket Actions"
            style={{ marginBottom: 20 }}
          >
            <Space wrap>
              {canResolveTicket && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={ticketActionLoading}
                  disabled={ticketActionLoading}
                  onClick={() => openTicketActionModal("resolve")}
                >
                  Resolve Ticket
                </Button>
              )}

              {canCloseTicket && (
                <Button
                  danger
                  icon={<LockOutlined />}
                  loading={ticketActionLoading}
                  disabled={ticketActionLoading}
                  onClick={() => openTicketActionModal("close")}
                >
                  Close Ticket
                </Button>
              )}
            </Space>
          </Card>
        )}

      {/* Requester Information */}

      <Card
        title={
          <Space>
            <UserOutlined />
            Requester Information
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Descriptions
          bordered
          column={{
            xs: 1,
            sm: 2,
          }}
        >
          <Descriptions.Item label="Name">
            {ticket.requester_name ||
              ticket.full_name ||
              "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Employee ID">
            {ticket.employee_id || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {ticket.requester_email ||
              ticket.email ||
              "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Phone">
            {ticket.requester_phone ||
              ticket.phone ||
              "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Comments */}

      <Card
        title={
          <Space>
            <UserOutlined />
            Comments
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        {comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No comments yet"
          />
        ) : (
          <Space
            direction="vertical"
            size="middle"
            style={{ width: "100%" }}
          >
            {comments.map((item) => (
              <Card
                key={item.id}
                size="small"
                style={{
                  background: item.is_internal
                    ? "#fff7e6"
                    : "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <UserOutlined />

                    <Text strong>
                      {item.user_name ||
                        item.full_name ||
                        "User"}
                    </Text>

                    {item.is_internal ? (
                      <Tag color="orange">Internal</Tag>
                    ) : (
                      <Tag color="blue">Public</Tag>
                    )}
                  </Space>

                  <Text
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    {formatDate(item.created_at)}
                  </Text>
                </div>

                <Paragraph
                  style={{
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.comment}
                </Paragraph>
              </Card>
            ))}
          </Space>
        )}

        <Divider />

        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          maxLength={1000}
          showCount
        />

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={commentLoading}
            onClick={handleAddComment}
          >
            Add Comment
          </Button>
        </div>
      </Card>

      {/* Ticket History */}

      <Card
        title={
          <Space>
            <HistoryOutlined />
            Ticket History
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        {history.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No history available"
          />
        ) : (
          <Timeline
            items={history.map((item) => ({
              color: getHistoryColor(item.action),

              dot:
                item.action === "Ticket Created" ? (
                  <ClockCircleOutlined />
                ) : undefined,

              children: (
                <div>
                  <Text strong>{item.action}</Text>

                  <br />

                  {item.old_value !== null &&
                    item.old_value !== undefined &&
                    item.new_value !== null &&
                    item.new_value !== undefined && (
                      <Text>
                        {item.old_value} → {item.new_value}
                      </Text>
                    )}

                  {item.old_value === null &&
                    item.new_value && (
                      <Text>{item.new_value}</Text>
                    )}

                  <br />

                  <Text type="secondary">
                    By {item.user_name || "System"} •{" "}
                    {formatDate(item.created_at)}
                  </Text>
                </div>
              ),
            }))}
          />
        )}
      </Card>

      {/* Employee Status Update Modal */}

      <Modal
        open={statusModalOpen}
        title="Update Ticket Status"
        onCancel={() => {
          if (!statusLoading) {
            setStatusModalOpen(false);
            setSelectedStatus("");
          }
        }}
        onOk={handleStatusUpdate}
        confirmLoading={statusLoading}
        okText="Update Status"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Current Status: </Text>
          {getStatusTag(ticket.status)}
        </div>

        <Select
          style={{ width: "100%" }}
          value={selectedStatus || undefined}
          onChange={setSelectedStatus}
          placeholder="Select new status"
          options={[
            ...(ticket.status === "Open"
              ? [
                  {
                    value: "Pending User",
                    label: "Pending User",
                  },
                ]
              : []),

            ...(ticket.status === "Closed"
              ? [
                  {
                    value: "Reopened",
                    label: "Reopened",
                  },
                ]
              : []),
          ]}
        />
      </Modal>

      {/* Resolve / Close Confirmation Modal */}

      <Modal
        open={actionModalOpen}
        title={
          actionType === "resolve"
            ? "Resolve Ticket"
            : "Close Ticket"
        }
        onCancel={() => {
          if (!ticketActionLoading) {
            setActionModalOpen(false);
            setActionType("");
          }
        }}
        onOk={handleConfirmTicketAction}
        confirmLoading={ticketActionLoading}
        okText={
          actionType === "resolve"
            ? "Resolve"
            : "Close Ticket"
        }
        cancelText="Cancel"
        okButtonProps={
          actionType === "close"
            ? { danger: true }
            : {}
        }
      >
        {actionType === "resolve"
          ? "Are you sure you want to mark this ticket as Resolved?"
          : "Are you sure you want to close this resolved ticket?"}
      </Modal>
    </div>
  );
};

export default TicketDetails;
