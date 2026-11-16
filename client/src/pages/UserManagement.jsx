import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  LockOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      console.log("Users API Response:", response.data);

      if (response.data?.success) {
        setUsers(response.data.users || []);
      } else {
        message.error(
          response.data?.message || "Failed to load users"
        );
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role_id);
    setRoleModalOpen(true);
  };

  const updateRole = async () => {
    if (!selectedUser || !selectedRole) {
      return;
    }

    try {
      const response = await api.patch(
        `/admin/users/${selectedUser.id}/role`,
        {
          role_id: Number(selectedRole),
        }
      );

      if (response.data?.success) {
        message.success(
          "User role updated successfully"
        );

        setRoleModalOpen(false);
        setSelectedUser(null);
        setSelectedRole(null);

        fetchUsers();
      }
    } catch (error) {
      console.error("Update Role Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to update user role"
      );
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const changePassword = async () => {
    if (!selectedUser) {
      return;
    }

    if (!newPassword) {
      message.warning("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      message.warning(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      const response = await api.patch(
        `/admin/users/${selectedUser.id}/password`,
        {
          new_password: newPassword,
        }
      );

      if (response.data?.success) {
        message.success(
          "User password changed successfully"
        );

        setPasswordModalOpen(false);
        setSelectedUser(null);
        setNewPassword("");
      }
    } catch (error) {
      console.error("Change Password Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to change password"
      );
    }
  };

  const changeStatus = async (user) => {
    const newStatus =
      user.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      const response = await api.patch(
        `/admin/users/${user.id}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data?.success) {
        message.success(
          `User status changed to ${newStatus}`
        );

        fetchUsers();
      }
    } catch (error) {
      console.error("Change Status Error:", error);

      message.error(
        error.response?.data?.message ||
          "Failed to change user status"
      );
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      employee: "blue",
      agent: "cyan",
      manager: "purple",
      admin: "orange",
      super_admin: "red",
    };

    return colors[role] || "default";
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <Text strong>{record.full_name}</Text>
          <br />
          <Text type="secondary">
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Employee ID",
      dataIndex: "employee_id",
      key: "employee_id",
      render: (value) => value || "N/A",
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (value) => value || "N/A",
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Active"
              ? "green"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => openRoleModal(record)}
          >
            Role
          </Button>

          <Button
            size="small"
            icon={<LockOutlined />}
            onClick={() =>
              openPasswordModal(record)
            }
          >
            Password
          </Button>

          <Button
            size="small"
            danger={record.status === "Active"}
            onClick={() =>
              changeStatus(record)
            }
          >
            {record.status === "Active"
              ? "Deactivate"
              : "Activate"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title
            level={2}
            style={{ marginBottom: 4 }}
          >
            User Management
          </Title>

          <Text type="secondary">
            Manage users, roles, passwords and
            account status
          </Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchUsers}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card>
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
          }}
          locale={{
            emptyText: "No users found",
          }}
        />
      </Card>

      <Modal
        title={`Change Role - ${
          selectedUser?.full_name || ""
        }`}
        open={roleModalOpen}
        onCancel={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
        }}
        onOk={updateRole}
        okText="Update Role"
      >
        <Select
          style={{ width: "100%" }}
          value={selectedRole}
          onChange={setSelectedRole}
          options={[
            {
              value: 1,
              label: "Employee",
            },
            {
              value: 2,
              label: "Agent",
            },
            {
              value: 3,
              label: "Manager",
            },
            {
              value: 4,
              label: "Admin",
            },
            {
              value: 5,
              label: "Super Admin",
            },
          ]}
        />
      </Modal>

      <Modal
        title={`Change Password - ${
          selectedUser?.full_name || ""
        }`}
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          setSelectedUser(null);
          setNewPassword("");
        }}
        onOk={changePassword}
        okText="Change Password"
      >
        <Input.Password
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          size="large"
        />
      </Modal>
    </div>
  );
};

export default UserManagement;