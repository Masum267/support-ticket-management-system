import React, { useCallback, useEffect, useState } from "react";
import { App as AntApp, Badge, Button, Card, Empty, List, Space, Spin, Tag, Typography } from "antd";
import { BellOutlined, CheckOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;

const Notifications = () => {
  const { message } = AntApp.useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markRead = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: 1 } : item));
    } catch (error) {
      message.error(error.response?.data?.message || "Could not mark notification as read");
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId("all");
    try {
      await api.patch("/notifications/read-all");
      setNotifications((items) => items.map((item) => ({ ...item, is_read: 1 })));
      message.success("All notifications marked as read");
    } catch (error) {
      message.error(error.response?.data?.message || "Could not update notifications");
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = notifications.filter((item) => !Number(item.is_read)).length;

  return (
    <div style={{ padding: 24 }}>
      <RowPlaceholder />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>Notifications</Title>
          <Badge count={unreadCount} showZero />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadNotifications}>Refresh</Button>
          <Button type="primary" icon={<CheckOutlined />} disabled={!unreadCount} loading={busyId === "all"} onClick={markAllRead}>Mark all as read</Button>
        </Space>
      </div>
      <Card>
        {loading ? <Spin /> : notifications.length ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{ background: Number(item.is_read) ? "transparent" : "#f6faff", padding: 16 }}
                actions={!Number(item.is_read) ? [
                  <Button key="read" size="small" type="link" loading={busyId === item.id} onClick={() => markRead(item.id)}>Mark as read</Button>,
                ] : []}
              >
                <List.Item.Meta
                  avatar={<BellOutlined style={{ fontSize: 22, color: Number(item.is_read) ? "#999" : "#1677ff", marginTop: 4 }} />}
                  title={<Space wrap><Text strong>{item.title}</Text>{!Number(item.is_read) && <Tag color="blue">Unread</Tag>}</Space>}
                  description={<><div>{item.message}</div><Text type="secondary">{new Date(item.created_at).toLocaleString()}</Text></>}
                />
              </List.Item>
            )}
          />
        ) : <Empty description="No notifications yet" />}
      </Card>
    </div>
  );
};

// Kept as a tiny component so page structure stays valid while rendering the heading.
const RowPlaceholder = () => null;

export default Notifications;
