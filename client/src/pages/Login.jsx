
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setLoginError("");

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (status === 429) {
        setLoginError(
          serverMessage ||
            "Too many login attempts. Please try again after 5 minutes."
        );
      } else {
        setLoginError(
          serverMessage || "Login failed. Please try again."
        );
      }
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
          "linear-gradient(135deg, #1677ff 0%, #001529 100%)",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 65,
              height: 65,
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#1677ff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LoginOutlined
              style={{
                fontSize: 30,
                color: "#fff",
              }}
            />
          </div>

          <Title level={2} style={{ marginBottom: 5 }}>
            Welcome Back
          </Title>

          <Text type="secondary">
            Sign in to Support Ticket Management System
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleLogin}
          onValuesChange={() => setLoginError("")}
          autoComplete="off"
        >
          {loginError && (
            <Alert
              message="Login Failed"
              description={loginError}
              type="error"
              showIcon
              closable
              onClose={() => setLoginError("")}
              style={{ marginBottom: 20 }}
            />
          )}

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
              size="large"
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>

          <div
            style={{
              textAlign: "center",
              marginTop: 12,
            }}
          >
            <Text type="secondary">
              Don't have an account?
            </Text>

            <Button
              type="link"
              icon={<UserAddOutlined />}
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
