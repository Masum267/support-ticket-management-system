
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Select,
  Row,
  Col,
  message,
} from "antd";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setRegistrationError("");

      const response = await api.post("/auth/register", {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        employee_id: values.employee_id,
        department: values.department,
        password: values.password,
      });

      if (response.data?.success) {
        message.success(
          response.data?.message || "Account created successfully"
        );

        navigate("/login");
      } else {
        setRegistrationError(
          response.data?.message || "Registration failed"
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setRegistrationError(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #eaf3ff 0%, #f5f7fa 50%, #ffffff 100%)",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        }}
        styles={{
          body: {
            padding: 36,
          },
        }}
      >
        {/* Header */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #1677ff, #4096ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            ST
          </div>

          <Title level={2} style={{ marginBottom: 6 }}>
            Create Account
          </Title>

          <Text type="secondary">
            Create your account to access the Support
            Ticket Management System
          </Text>
        </div>

        {/* Registration Form */}

        <Form
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={() => setRegistrationError("")}
          requiredMark="optional"
          size="large"
        >
          {registrationError && (
            <Alert
              message="Registration Failed"
              description={registrationError}
              type="error"
              showIcon
              closable
              onClose={() => setRegistrationError("")}
              style={{ marginBottom: 20 }}
            />
          )}

          <Row gutter={16}>
            {/* Full Name */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="full_name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your full name",
                  },
                  {
                    min: 3,
                    message: "Name must be at least 3 characters",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your full name"
                />
              </Form.Item>
            </Col>

            {/* Employee ID */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Employee ID"
                name="employee_id"
                rules={[
                  {
                    required: true,
                    message: "Please enter your employee ID",
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="e.g. EMP003"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Email */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                />
              </Form.Item>
            </Col>

            {/* Phone */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="e.g. 01700000000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Department */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[
                  {
                    required: true,
                    message: "Please select your department",
                  },
                ]}
              >
                <Select
                  placeholder="Select department"
                  suffixIcon={<ApartmentOutlined />}
                  options={[
                    { value: "IT Support", label: "IT Support" },
                    { value: "Human Resources", label: "Human Resources" },
                    { value: "Finance", label: "Finance" },
                    { value: "Accounts", label: "Accounts" },
                    { value: "Administration", label: "Administration" },
                    { value: "Operations", label: "Operations" },
                    { value: "Marketing", label: "Marketing" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Password */}

            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your password",
                  },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters",
                  },
                ]}
                extra="Password must contain at least 8 characters."
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Confirm Password */}

          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue("password") === value
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
            />
          </Form.Item>

          {/* Create Account */}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 46,
                fontWeight: 600,
              }}
            >
              Create Account
            </Button>
          </Form.Item>

          {/* Back to Login */}

          <Button
            type="link"
            block
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
