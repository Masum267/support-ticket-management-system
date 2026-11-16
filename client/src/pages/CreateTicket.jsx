import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Upload,
  message,
  Space,
} from "antd";

import {
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_URL = "http://localhost:5000/api";

const CreateTicket = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // =====================================================
  // CATEGORY LIST
  // =====================================================
  const categories = [
    {
      value: 1,
      label: "Hardware",
    },
    {
      value: 2,
      label: "Software",
    },
    {
      value: 3,
      label: "Network",
    },
    {
      value: 4,
      label: "Email",
    },
    {
      value: 5,
      label: "Printer",
    },
    {
      value: 6,
      label: "Security",
    },
    {
      value: 7,
      label: "Other",
    },
  ];

  // =====================================================
  // CHECK LOGIN
  // =====================================================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // =====================================================
  // CREATE TICKET
  // =====================================================
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        message.error("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      const payload = {
        subject: values.subject.trim(),
        description: values.description.trim(),
        category_id: Number(values.category_id),
        priority: values.priority,
        location: values.location?.trim() || null,
      };

      console.log("Create Ticket Payload:", payload);

      const response = await axios.post(
        `${API_URL}/tickets`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        message.success(
          response.data.message || "Ticket created successfully!"
        );

        form.resetFields();

        // Go to My Tickets after successful creation
        setTimeout(() => {
          navigate("/tickets");
        }, 700);
      } else {
        message.error(
          response.data?.message || "Failed to create ticket."
        );
      }
    } catch (error) {
      console.error("Create Ticket Error:", error);

      if (error.response?.status === 401) {
        message.error(
          "Your session has expired. Please login again."
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      message.error(
        error.response?.data?.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
        }}
      >
        <Title level={2} style={{ marginBottom: 4 }}>
          Create New Ticket
        </Title>

        <Text type="secondary">
          Submit a new support request to the IT team.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{
            marginTop: 30,
            maxWidth: 900,
          }}
        >
          {/* =====================================================
              SUBJECT + PRIORITY
          ====================================================== */}
          <Row gutter={20}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[
                  {
                    required: true,
                    message: "Please enter ticket subject",
                  },
                  {
                    min: 3,
                    message:
                      "Subject must be at least 3 characters",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter ticket subject"
                  maxLength={150}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Priority"
                name="priority"
                initialValue="Medium"
                rules={[
                  {
                    required: true,
                    message: "Please select priority",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select priority"
                  options={[
                    {
                      value: "Low",
                      label: "Low",
                    },
                    {
                      value: "Medium",
                      label: "Medium",
                    },
                    {
                      value: "High",
                      label: "High",
                    },
                    {
                      value: "Critical",
                      label: "Critical",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* =====================================================
              CATEGORY + LOCATION
          ====================================================== */}
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Category"
                name="category_id"
                rules={[
                  {
                    required: true,
                    message: "Please select category",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select category"
                  options={categories}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Location"
                name="location"
              >
                <Input
                  size="large"
                  placeholder="Example: Head Office"
                  maxLength={150}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* =====================================================
              DESCRIPTION
          ====================================================== */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please describe your problem",
              },
              {
                min: 10,
                message:
                  "Description must be at least 10 characters",
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Describe your issue in detail..."
              maxLength={2000}
              showCount
            />
          </Form.Item>

          {/* =====================================================
              ATTACHMENT
          ====================================================== */}
          <Form.Item label="Attachment">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                Upload File
              </Button>
            </Upload>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 6,
                fontSize: 12,
              }}
            >
              Attachment upload will be connected to the
              ticket system later.
            </Text>
          </Form.Item>

          {/* =====================================================
              SUBMIT
          ====================================================== */}
          <Form.Item style={{ marginTop: 25 }}>
            <Space>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
              >
                {loading ? "Creating Ticket..." : "Submit Ticket"}
              </Button>

              <Button
                size="large"
                onClick={() => form.resetFields()}
                disabled={loading}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTicket;