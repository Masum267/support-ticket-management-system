import React from "react";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Row,
  Tag,
  Typography,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const Profile = () => {
  const user = getUser();

  const role = String(user.role_name || "User")
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        My Profile
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            style={{
              textAlign: "center",
              height: "100%",
            }}
          >
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            >
              {user.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Title level={4} style={{ marginBottom: 4 }}>
              {user.full_name || "User"}
            </Title>

            <Text type="secondary">
              {user.email || "No email available"}
            </Text>

            <div style={{ marginTop: 16 }}>
              <Tag color="blue">{role}</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Personal Information">
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              bordered
            >
              <Descriptions.Item
                label={
                  <>
                    <IdcardOutlined /> Employee ID
                  </>
                }
              >
                {user.employee_id || "Not available"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserOutlined /> Full Name
                  </>
                }
              >
                {user.full_name || "Not available"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <MailOutlined /> Email
                  </>
                }
              >
                {user.email || "Not available"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> Phone
                  </>
                }
              >
                {user.phone || "Not available"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ApartmentOutlined /> Department
                  </>
                }
              >
                {user.department_name || "Not available"}
              </Descriptions.Item>

              <Descriptions.Item label="Role">
                <Tag color="blue">{role}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Account Status">
                <Tag color="green">
                  {user.status || "Active"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

