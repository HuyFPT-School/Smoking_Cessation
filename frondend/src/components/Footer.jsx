import React from "react";
import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import { CopyrightOutlined, HeartOutlined } from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

function Footer() {
  return (
    <AntFooter
      style={{ background: "#f5f5f5", padding: "40px 80px 20px 80px" }}
    >
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space direction="vertical">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="green"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              <Title level={4} style={{ margin: 0 }}>
                BreatheFree
              </Title>
            </div>
            <Text type="secondary">
              Supporting your journey to a smoke-free life with evidence-based
              tools and community support.
            </Text>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Platform</Title>
          <Space direction="vertical">
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Dashboard
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Plan
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Tracking
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Blog
            </Link>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Company</Title>
          <Space direction="vertical">
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Contact
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Careers
            </Link>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Legal</Title>
          <Space direction="vertical">
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Cookie Policy
            </Link>
          </Space>
        </Col>
      </Row>
      <Divider style={{ borderColor: "#e5e7eb" }} />

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Text type="secondary">
          <CopyrightOutlined /> 2025 BreatheFree. All rights reserved.
        </Text>
      </div>
    </AntFooter>
  );
}

export default Footer;
