import React, { useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Card,
  Space,
  Divider,
  Alert,
  Spin,
  Result,
} from "antd";
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { vnpayAPI } from "../services/vnpayAPI";

const { Title, Text } = Typography;

const PaymentModal = ({ visible, onCancel, userId }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState("info"); // info, processing, success, error

  console.log("PaymentModal rendered with visible:", visible);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStep("processing");

    try {
      const result = await vnpayAPI.createPaymentUrl(userId, 50000);

      if (result.paymentUrl) {
        // Chuyển hướng đến VNPay
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Không thể tạo link thanh toán");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep("error");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (paymentStep) {
      case "processing":
        return (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: "20px" }}>
              Đang chuyển hướng đến VNPay...
            </Title>
            <Text type="secondary">Vui lòng đợi trong giây lát</Text>
          </div>
        );

      case "error":
        return (
          <Result
            status="error"
            title="Lỗi thanh toán"
            subTitle="Không thể tạo link thanh toán. Vui lòng thử lại sau."
            extra={[
              <Button
                key="retry"
                type="primary"
                onClick={() => setPaymentStep("info")}
              >
                Thử lại
              </Button>,
              <Button key="cancel" onClick={onCancel}>
                Đóng
              </Button>,
            ]}
          />
        );

      default:
        return (
          <div>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <MessageOutlined
                style={{
                  fontSize: "48px",
                  color: "#22C55E",
                  marginBottom: "16px",
                }}
              />
              <Title level={3} style={{ margin: 0 }}>
                Kích hoạt tính năng Direct Chat
              </Title>
              <Text type="secondary">
                Trò chuyện trực tiếp với các chuyên gia ngừng hút thuốc
              </Text>
            </div>

            {/* Pricing Card */}
            <Card
              style={{
                marginBottom: "24px",
                background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                border: "none",
              }}
            >
              <div style={{ textAlign: "center", color: "white" }}>
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  50.000 VND
                </Title>
                <Text
                  style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px" }}
                >
                  Sử dụng trọn đời
                </Text>
              </div>
            </Card>

            {/* Features */}
            <div style={{ marginBottom: "24px" }}>
              <Title level={5}>Những gì bạn nhận được:</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#22C55E", fontSize: "16px" }}
                  />
                  <Text>Trò chuyện trực tiếp với chuyên gia</Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#22C55E", fontSize: "16px" }}
                  />
                  <Text>Hỗ trợ 24/7 trong quá trình cai thuốc</Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#22C55E", fontSize: "16px" }}
                  />
                  <Text>Tư vấn cá nhân hóa theo tình trạng</Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#22C55E", fontSize: "16px" }}
                  />
                  <Text>Không giới hạn số lượng tin nhắn</Text>
                </div>
              </Space>
            </div>

            <Divider />

            {/* Security Info */}
            <Alert
              message="Thanh toán an toàn"
              description="Giao dịch được bảo mật bởi VNPay - Cổng thanh toán hàng đầu Việt Nam"
              type="info"
              icon={<SafetyOutlined />}
              style={{ marginBottom: "24px" }}
            />

            {/* Payment Button */}
            <Button
              type="primary"
              size="large"
              block
              icon={<CreditCardOutlined />}
              onClick={handlePayment}
              loading={loading}
              style={{
                height: "48px",
                background: "#22C55E",
                borderColor: "#22C55E",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Thanh toán với VNPay
            </Button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Bằng cách thanh toán, bạn đồng ý với{" "}
                <a href="/terms" style={{ color: "#22C55E" }}>
                  Điều khoản sử dụng
                </a>
              </Text>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      zIndex={10000}
    >
      {renderContent()}
    </Modal>
  );
};

export default PaymentModal;
