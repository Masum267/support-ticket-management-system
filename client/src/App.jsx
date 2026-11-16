
import React, { useCallback, useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  DashboardOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
  BellOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
} from "@ant-design/icons";

import { ProLayout } from "@ant-design/pro-components";

import {
  ConfigProvider,
  App as AntApp,
  Avatar,
  Dropdown,
  Badge,
} from "antd";

import enUS from "antd/locale/en_US";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import CreateTicket from "./pages/CreateTicket";
import AssignedTickets from "./pages/AssignedTickets";
import AllTickets from "./pages/AllTickets";
import UserManagement from "./pages/UserManagement";
import TicketDetails from "./pages/TicketDetails";

import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import AIChatbot from "./pages/AIChatbot";

import { getUser, getToken, logout } from "./utils/auth";
import api from "./services/api";

// =====================================================
// PROTECTED ROUTE
// =====================================================
const ProtectedRoute = ({ children }) => {
  const user = getUser();
  const token = getToken();

  if (!token || !user) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =====================================================
// MAIN LAYOUT
// =====================================================
const AppLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const role = user?.role_name;

  const [unreadCount, setUnreadCount] = useState(0);

  // ===================================================
  // FETCH UNREAD NOTIFICATION COUNT
  // ===================================================
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get("/notifications");

      setUnreadCount(
        Number(response.data?.unread_count || 0)
      );
    } catch (error) {
      console.error(
        "Notification Count Error:",
        error
      );
    }
  }, [user?.id]);

  // ===================================================
  // REFRESH NOTIFICATION COUNT
  // ===================================================
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 15000);

    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnreadCount]);

  // Refresh when navigating between pages
  useEffect(() => {
    fetchUnreadCount();
  }, [window.location.pathname, fetchUnreadCount]);

  // ===================================================
  // LOGOUT
  // ===================================================
  const handleLogout = () => {
    logout();
    setUnreadCount(0);

    // Clear the current application state completely
    window.location.replace("/login");
  };

  // ===================================================
  // FORMATTED ROLE
  // ===================================================
  const formattedRole =
    role
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "User";

  // ===================================================
  // SIDEBAR MENU
  // ===================================================
  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <DashboardOutlined />,
    },
  ];

  // ===================================================
  // EMPLOYEE MENU
  // Employee can see only their own tickets
  // ===================================================
  if (role === "employee") {
    menuItems.push(
      {
        path: "/tickets",
        name: "My Tickets",
        icon: <FileTextOutlined />,
      },
      {
        path: "/create-ticket",
        name: "Create Ticket",
        icon: <PlusCircleOutlined />,
      }
    );
  }

  // ===================================================
  // AGENT MENU
  // ===================================================
  if (role === "agent") {
    menuItems.push(
      {
        path: "/all-tickets",
        name: "All Tickets",
        icon: <FileTextOutlined />,
      },
      {
        path: "/assigned-tickets",
        name: "Assigned Tickets",
        icon: <CheckCircleOutlined />,
      }
    );
  }

  // ===================================================
  // MANAGER MENU
  // ===================================================
  if (role === "manager") {
    menuItems.push({
      path: "/all-tickets",
      name: "All Tickets",
      icon: <FileTextOutlined />,
    });
  }

  // ===================================================
  // ADMIN / SUPER ADMIN MENU
  // ===================================================
  if (role === "admin" || role === "super_admin") {
    menuItems.push(
      {
        path: "/all-tickets",
        name: "All Tickets",
        icon: <FileTextOutlined />,
      },
      {
        path: "/users",
        name: "User Management",
        icon: <TeamOutlined />,
      }
    );
  }

  // ===================================================
  // SUPER ADMIN MENU
  // ===================================================
  if (role === "super_admin") {
    menuItems.push({
      path: "/audit-logs",
      name: "Audit Logs",
      icon: <SafetyCertificateOutlined />,
    });
  }

  // ===================================================
  // COMMON MENU
  // ===================================================
  menuItems.push(
    {
      path: "/profile",
      name: "Profile",
      icon: <UserOutlined />,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <SettingOutlined />,
    },
    {
      path: "/notifications",
      name: "Notifications",
      icon: <BellOutlined />,
    },
    {
      path: "/chatbot",
      name: "AI Assistant",
      icon: <RobotOutlined />,
    }
  );

  // ===================================================
  // USER DROPDOWN
  // ===================================================
  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
      },
      {
        key: "notifications",
        icon: <BellOutlined />,
        label: "Notifications",
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
      },
    ],

    onClick: ({ key }) => {
      if (key === "profile") navigate("/profile");
      if (key === "settings") navigate("/settings");
      if (key === "notifications") navigate("/notifications");
      if (key === "logout") handleLogout();
    },
  };

  // ===================================================
  // USER DROPDOWN COMPONENT
  // ===================================================
  const UserDropdown = () => (
    <Dropdown
      menu={userMenu}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "5px 8px",
          cursor: "pointer",
          borderRadius: 8,
          userSelect: "none",
        }}
      >
        <Avatar
          size="small"
          icon={<UserOutlined />}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {user?.full_name || "User"}
          </span>

          <span
            style={{
              fontSize: 11,
              color: "#888",
              marginTop: 3,
            }}
          >
            {formattedRole}
          </span>
        </div>
      </div>
    </Dropdown>
  );

  // ===================================================
  // LAYOUT
  // ===================================================
  return (
    <ProLayout
      title="Support Ticket System"
      logo={false}
      layout="mix"
      fixedHeader
      fixSiderbar
      siderWidth={240}
      location={{
        pathname: window.location.pathname,
      }}
      menu={{
        request: async () => menuItems,
      }}
      avatarProps={undefined}
      actionsRender={() => [
        <span
          key="notification"
          onClick={() => navigate("/notifications")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10px",
            cursor: "pointer",
          }}
        >
          <Badge
            count={unreadCount}
            overflowCount={99}
            size="small"
            offset={[-2, 3]}
          >
            <BellOutlined
              style={{
                fontSize: 19,
                color: "inherit",
              }}
            />
          </Badge>
        </span>,

        <UserDropdown key="user-dropdown" />,
      ]}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) {
              navigate(item.path);
            }
          }}
        >
          {dom}
        </div>
      )}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Employee Pages */}
        <Route
          path="/tickets"
          element={<MyTickets />}
        />

        <Route
          path="/create-ticket"
          element={<CreateTicket />}
        />

        {/* Agent Page */}
        <Route
          path="/assigned-tickets"
          element={
            role === "agent" ? (
              <AssignedTickets />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* All Tickets - Employee Excluded */}
        <Route
          path="/all-tickets"
          element={
            ["agent", "manager", "admin", "super_admin"].includes(role) ? (
              <AllTickets />
            ) : (
              <Navigate to="/tickets" replace />
            )
          }
        />

        {/* Ticket Details - Backend will verify ownership */}
        <Route
          path="/tickets/:id"
          element={<TicketDetails />}
        />

        {/* Admin Pages */}
        <Route
          path="/users"
          element={
            ["admin", "super_admin"].includes(role) ? (
              <UserManagement />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/audit-logs"
          element={
            role === "super_admin" ? (
              <AuditLogs />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/chatbot"
          element={<AIChatbot />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </ProLayout>
  );
};

// =====================================================
// MAIN APP
// =====================================================
const App = () => {
  return (
    <ConfigProvider locale={enUS}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
