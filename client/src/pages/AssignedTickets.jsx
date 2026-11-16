import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Tooltip,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

const AssignedTickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // =====================================================
  // GET ASSIGNED TICKETS
  // =====================================================
  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/assigned");

      if (response.data?.success) {
        setTickets(response.data.tickets || []);
      } else {
        message.error(
          response.data?.message ||
            "Failed to fetch assigned tickets"
        );
      }
    } catch (error) {
      console.error(
        "Fetch Assigned Tickets Error:",
        error
      );

      message.error(
        error.response?.data?.message ||
          "Failed to fetch assigned tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  // =====================================================
  // OPEN STATUS MODAL
  // =====================================================
  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedStatus(ticket.status);
    setStatusModalOpen(true);
  };

  // =====================================================
  // CLOSE STATUS MODAL
  // =====================================================
  const closeStatusModal = () => {
    if (statusLoading) {
      return;
    }

    setStatusModalOpen(false);
    setSelectedTicket(null);
    setSelectedStatus(null);
  };

  // =====================================================
  // UPDATE TICKET STATUS
  // =====================================================
  const handleStatusUpdate = async () => {
    if (!selectedTicket) {
      message.error("Ticket not selected");
      return;
    }

    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }

    if (selectedStatus === selectedTicket.status) {
      message.info(
        "Ticket already has this status"
      );
      return;
    }

    try {
      setStatusLoading(true);

      const response = await api.patch(
        `/tickets/${selectedTicket.id}/agent-status`,
        {
          status: selectedStatus,
        }
      );

      if (response.data?.success) {
        message.success(
          response.data.message ||
            "Ticket status updated successfully"
        );

        setStatusModalOpen(false);
        setSelectedTicket(null);
        setSelectedStatus(null);

        await fetchAssignedTickets();
      } else {
        message.error(
          response.data?.message ||
            "Failed to update ticket status"
        );
      }
    } catch (error) {
      console.error(
        "Update Ticket Status Error:",
        error
      );

      message.error(
        error.response?.data?.message ||
          "Failed to update ticket status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // =====================================================
  // STATUS TAG
  // =====================================================
  const getStatusTag = (status) => {
    const statusColors = {
      Assigned: "cyan",
      "In Progress": "processing",
      "Pending User": "orange",
      Resolved: "green",
      Closed: "default",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status}
      </Tag>
    );
  };

  // =====================================================
  // PRIORITY TAG
  // =====================================================
  const getPriorityTag = (priority) => {
    const priorityColors = {
      Low: "green",
      Medium: "blue",
      High: "orange",
      Critical: "red",
    };

    return (
      <Tag color={priorityColors[priority] || "default"}>
        {priority}
      </Tag>
    );
  };

  // =====================================================
  // FILTER
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
      ticket.requester_employee_id
        ?.toLowerCase()
        .includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    {
      title: "Ticket",
      key: "ticket",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {record.ticket_number}
          </Text>

          <Text type="secondary">
            #{record.id}
          </Text>
        </Space>
      ),
    },

    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 240,
      render: (subject) => (
        <Tooltip title={subject}>
          <Text
            ellipsis
            style={{
              maxWidth: 220,
              display: "block",
            }}
          >
            {subject}
          </Text>
        </Tooltip>
      ),
    },

    {
      title: "Requester",
      key: "requester",
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
          />

          <Space
            direction="vertical"
            size={0}
          >
            <Text strong>
              {record.requester_name || "N/A"}
            </Text>

            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {record.requester_employee_id ||
                record.requester_email ||
                "N/A"}
            </Text>
          </Space>
        </Space>
      ),
    },

    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      width: 130,
      render: (category) =>
        category || "N/A",
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
      width: 140,
      render: (status) =>
        getStatusTag(status),
    },

    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      render: (date) =>
        date
          ? new Date(date).toLocaleString()
          : "N/A",
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 190,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Ticket">
            <Button
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(
                  `/tickets/${record.id}`
                )
              }
            >
              View
            </Button>
          </Tooltip>

          {record.status !== "Resolved" &&
            record.status !== "Closed" && (
              <Tooltip title="Update Status">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() =>
                    openStatusModal(record)
                  }
                >
                  Update
                </Button>
              </Tooltip>
            )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title
              level={3}
              style={{ margin: 0 }}
            >
              Assigned Tickets
            </Title>

            <Text type="secondary">
              Manage tickets assigned to you
            </Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAssignedTickets}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}
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
            placeholder="Search ticket or requester"
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            style={{
              width: 320,
            }}
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{
              width: 190,
            }}
            options={[
              {
                value: "All",
                label: "All Statuses",
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
            ]}
          />
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredTickets}
          scroll={{
            x: 1300,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} tickets`,
          }}
          locale={{
            emptyText:
              "No tickets assigned to you",
          }}
        />
      </Card>

      {/* =====================================================
          STATUS UPDATE MODAL
      ===================================================== */}
      <Modal
        title="Update Ticket Status"
        open={statusModalOpen}
        onCancel={closeStatusModal}
        onOk={handleStatusUpdate}
        okText="Update Status"
        cancelText="Cancel"
        confirmLoading={statusLoading}
        destroyOnClose
      >
        {selectedTicket && (
          <div>
            {/* Ticket Information */}
            <Card
              size="small"
              style={{
                marginBottom: 20,
                background: "#fafafa",
              }}
            >
              <Space
                direction="vertical"
                size={5}
              >
                <Text strong>
                  {selectedTicket.ticket_number}
                </Text>

                <Text>
                  {selectedTicket.subject}
                </Text>

                <Space>
                  {getPriorityTag(
                    selectedTicket.priority
                  )}

                  {getStatusTag(
                    selectedTicket.status
                  )}
                </Space>
              </Space>
            </Card>

            {/* Status Selection */}
            <Text strong>
              Select New Status
            </Text>

            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{
                width: "100%",
                marginTop: 8,
              }}
              options={[
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
              ]}
            />

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 12,
              }}
            >
              Updating the status will be recorded
              in the ticket history.
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AssignedTickets;
