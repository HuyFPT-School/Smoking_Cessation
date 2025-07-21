import { Card, Row, Col, Typography, Divider } from "antd";
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const Contact = () => {
  return (
    <div style={{ padding: "60px 24px", backgroundColor: "#f0fff0", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "48px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Title level={2} style={{ color: "#237804", fontSize: "32px", fontWeight: 800, textAlign: "center" }}>
          📞 Contact Us
        </Title>
        <Paragraph style={{ textAlign: "center", fontSize: "18px", color: "#595959", marginBottom: 32, lineHeight: 1.7 }}>
          We're here to support your quit-smoking journey. Reach out anytime!
        </Paragraph>

        <Divider style={{ borderColor: "#e6f4ea" }} />

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ color: "#135200", fontSize: "20px" }}>
              <MailOutlined style={{ marginRight: 8 }} />
              Email
            </Title>
            <Paragraph style={{ fontSize: "16px", lineHeight: 1.6 }}>support@scsp-platform.com</Paragraph>

            <Title level={4} style={{ color: "#135200", fontSize: "20px" }}>
              <PhoneOutlined style={{ marginRight: 8 }} />
              Phone
            </Title>
            <Paragraph style={{ fontSize: "16px", lineHeight: 1.6 }}>+84 123 456 789</Paragraph>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4} style={{ color: "#135200", fontSize: "20px" }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              Office
            </Title>
            <Paragraph style={{ fontSize: "16px", lineHeight: 1.6 }}>
              10th Floor, HealthTech Tower<br />
              District 1, Ho Chi Minh City, Vietnam
            </Paragraph>
            <Text type="secondary" style={{ fontSize: "14px" }}>We usually respond within 24 hours.</Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Contact;
