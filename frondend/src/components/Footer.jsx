import React from "react";
import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import { CopyrightOutlined, HeartOutlined } from "@ant-design/icons";
import { Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

function Footer() {
  return (
    <AntFooter
      style={{ background: "#f5f5f5", padding: "40px 80px 20px 80px" }}
    >
      {/* Grid layout với 4 cột thông tin */}
      <Row gutter={[32, 32]}>
        {/* Cột 1: Logo và mô tả ứng dụng */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space direction="vertical">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* SVG Logo hình lá - biểu tượng của ứng dụng */}
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
            {/* Mô tả ngắn về ứng dụng */}
            <Text type="secondary">
              Supporting your journey to a smoke-free life with evidence-based
              tools and community support.
            </Text>
          </Space>
        </Col>

        {/* Cột 2: Các liên kết điều hướng trong ứng dụng */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Platform</Title>
          <Space direction="vertical">
            {/* Sử dụng MuiLink với RouterLink để điều hướng nội bộ */}
            <MuiLink
              component={RouterLink}
              to="/Dashboard"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Dashboard
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/Plan"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Plan
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/Tracking"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Tracking
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/Blog"
              style={{
                color: "#71717A",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#09090B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Blog
            </MuiLink>
          </Space>
        </Col>

        {/* Cột 3: Các liên kết về công ty */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Company</Title>
          <Space direction="vertical">
            {/* Links đến trang contact và careers (hiện đang là placeholder) */}
            <Link
              href="/contact"
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
              href="/careers"
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

        {/* Cột 4: Các liên kết pháp lý */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={5}>Legal</Title>
          <Space direction="vertical">
            {/* Links đến các trang điều khoản pháp lý (hiện đang là placeholder) */}
            <Link
              href="/privacy-policy"
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
              href="/terms-of-service"
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
              href="/cookie-policy"
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
      {/* Đường kẻ phân cách */}
      <Divider style={{ borderColor: "#e5e7eb" }} />

      {/* Footer copyright - phần cuối cùng */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Text type="secondary">
          <CopyrightOutlined /> 2025 BreatheFree. All rights reserved.
        </Text>
      </div>
    </AntFooter>
  );
}

export default Footer;
