import React, { useEffect, useState } from "react";
import { Alert, App as AntApp, Card, Col, Divider, Row, Select, Spin, Switch, Typography } from "antd";
import { BellOutlined, DesktopOutlined, GlobalOutlined, MailOutlined } from "@ant-design/icons";
import api from "../services/api";

const { Title, Text } = Typography;
const defaults = {
  ticket_notifications: 1,
  email_notifications: 1,
  system_notifications: 1,
  language: "English",
};

const Settings = () => {
  const { message } = AntApp.useApp();
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/settings/me")
      .then(({ data }) => {
        if (active && data?.settings) {
          setSettings({
            ...defaults,
            ...data.settings,
            ticket_notifications: Number(data.settings.ticket_notifications),
            email_notifications: Number(data.settings.email_notifications),
            system_notifications: Number(data.settings.system_notifications),
          });
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load settings. Run the database migration first.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const save = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put("/settings/me", next);
      setSettings({ ...defaults, ...data.settings,
        ticket_notifications: Number(data.settings.ticket_notifications),
        email_notifications: Number(data.settings.email_notifications),
        system_notifications: Number(data.settings.system_notifications),
      });
      message.success("Settings saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save settings.");
      message.error("Settings could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { key: "ticket_notifications", title: "Ticket Notifications", description: "Receive updates when tickets are created, assigned, commented on, or closed.", icon: <BellOutlined /> },
    { key: "email_notifications", title: "Email Notifications", description: "Preference for email notifications. Email delivery requires an email service to be configured.", icon: <MailOutlined /> },
    { key: "system_notifications", title: "In-app Notifications", description: "Show ticket updates in the application notification center.", icon: <DesktopOutlined /> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Settings</Title>
        {saving && <Text type="secondary">Saving...</Text>}
      </Row>
      {error && <Alert type="warning" showIcon message={error} style={{ marginBottom: 16 }} />}
      {loading ? <Spin /> : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Notification Preferences">
              {options.map((item, index) => (
                <React.Fragment key={item.key}>
                  {index > 0 && <Divider />}
                  <Row justify="space-between" align="middle" gutter={16}>
                    <Col flex="auto">
                      <Text strong>{item.icon} <span style={{ marginLeft: 8 }}>{item.title}</span></Text>
                      <div><Text type="secondary">{item.description}</Text></div>
                    </Col>
                    <Col>
                      <Switch
                        checked={Boolean(settings[item.key])}
                        loading={saving}
                        onChange={(checked) => save({ [item.key]: checked ? 1 : 0 })}
                      />
                    </Col>
                  </Row>
                </React.Fragment>
              ))}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Application Preferences">
              <Text strong><GlobalOutlined /> <span style={{ marginLeft: 8 }}>Language</span></Text>
              <Select
                value={settings.language || "English"}
                onChange={(language) => save({ language })}
                disabled={saving}
                style={{ width: "100%", marginTop: 12 }}
                options={[{ value: "English", label: "English" }]}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
                English is the currently supported application language.
              </Text>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Settings;
