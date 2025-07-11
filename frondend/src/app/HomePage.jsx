import React, { useContext, useState } from "react";
import { Typography, Button, Row, Col, Card } from "antd";
import {
  RiseOutlined,
  TeamOutlined,
  BookOutlined,
  MessageOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CoachChat from "./CoachChat";
import { AuthContext } from "../context/AuthContext";
const { Title, Paragraph, Text } = Typography;

const stats = [
  { value: "70%", description: "of smokers want to quit" },
  { value: "20 min", description: "to see health improvements" },
  { value: "10 years", description: "to reduce lung cancer risk by half" },
  { value: "$2,000+", description: "saved annually by quitting" },
];

const StatsSection = () => (
  <div style={{ background: "#fff", padding: "60px 24px" }}>
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "15%",
      }}
    >
      {stats.map(
        (
          item,
          index // Lặp qua mảng stats để render từng số liệu.
        ) => (
          <div
            key={index}
            style={{
              flexBasis: "calc((100% - 45%) / 4)",
              textAlign: "center",
              minWidth: "160px",
            }}
          >
            <Text
              style={{ fontSize: "36px", fontWeight: "700", color: "#000" }}
            >
              {/* Hiển thị giá trị số liệu, cỡ chữ 36px, đậm, màu đen */}
              {item.value}
            </Text>
            <Text
              style={{
                fontSize: "16px",
                color: "#595959",
                marginTop: "4px",
                display: "block",
              }}
            >
              {/* Hiển thị mô tả, cỡ chữ 16px, màu xám, xuống dòng */}
              {item.description}
            </Text>
          </div>
        )
      )}
    </div>
  </div>
);

const SupportSection = ({ onNavigate }) => (
  <div style={{ padding: "150px 24px", background: "#f5f7fa" }}>
    {/* Container với padding lớn, nền xám nhạt */}
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Giới hạn chiều rộng, căn giữa */}
      <Title level={1} style={{ textAlign: "center", fontWeight: 700 }}>
        {/* Tiêu đề level 1, căn giữa, đậm */}
        How We Support Your Journey
      </Title>
      <Paragraph
        style={{
          textAlign: "center",
          color: "#8c8c8c",
          marginBottom: "48px",
          fontSize: "20px",
        }}
      >
        {/* Mô tả, căn giữa, màu xám, khoảng cách dưới 48px */}
        Our comprehensive approach combines technology, community, and
        evidence-based methods.
      </Paragraph>
      <Row gutter={[24, 24]} justify="center">
        {/* Lưới Ant Design với khoảng cách 24px, căn giữa */}
        <Col xs={24} md={8}>
          {/* Cột responsive (toàn màn hình trên mobile, 1/3 trên desktop) */}
          <Card variant="borderless" style={cardStyle}>
            {/* Card không viền, sử dụng style từ biến cardStyle */}
            <RiseOutlined style={iconStyle} /> {/* Icon biểu thị tiến trình */}
            <Title level={3}>Progress Tracking</Title> {/* Tiêu đề level 3 */}
            <Paragraph>
              {/* Mô tả chức năng */}
              Monitor your smoke-free days, health improvements, and money
              saved.
            </Paragraph>
            <Button type="link" onClick={() => onNavigate("/tracking")}>
              Learn more
            </Button>
            {/* Nút liên kết */}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={cardStyle}>
            <TeamOutlined style={iconStyle} /> {/* Icon biểu thị cộng đồng */}
            <Title level={3}>Community Support</Title>
            <Paragraph>
              Connect with others on the same journey to stay motivated.
            </Paragraph>
            <Button type="link" onClick={() => onNavigate("/blog")}>
              Learn more
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={cardStyle}>
            <BookOutlined style={iconStyle} /> {/* Icon biểu thị tài nguyên */}
            <Title level={3}>Expert Resources</Title>
            <Paragraph>
              Access evidence-based articles, videos, and practical tips.
            </Paragraph>
            <Button type="link">Learn more</Button>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
);

// Định nghĩa một functional component có tên là SuccessStories, nhận prop là onNavigate (callback điều hướng route)
const SuccessStories = ({ onNavigate, onLogout }) => (
  // Container chính với nền trắng, padding trên 80px, trái/phải 24px, dưới 0
  <div style={{ background: "#fff", padding: "80px 24px 0" }}>
    {/* Wrapper để giới hạn độ rộng tối đa là 960px và căn giữa */}
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      {/* Tiêu đề chính "Success Stories", h2, căn giữa, đậm, font 45px, cách dưới 8px */}
      <Title
        level={2}
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "45px",
          marginBottom: "8px",
        }}
      >
        Success Stories
      </Title>

      {/* Đoạn mô tả ngắn, căn giữa, màu xám, font 20px, cách dưới 48px */}
      <Paragraph
        style={{
          textAlign: "center",
          color: "#595959",
          marginBottom: "48px",
          fontSize: "20px",
        }}
      >
        Hear from people who have successfully quit smoking with our platform.
      </Paragraph>

      {/* Dãy chứa các card câu chuyện, canh giữa, khoảng cách 24px giữa các card, tự động xuống dòng khi hẹp */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Card 1: Câu chuyện của Michael */}
        <Card variant="borderless" style={storyCardStyle}>
          {/* Tên người + tuổi, heading level 3, bỏ margin dưới */}
          <Title level={3} style={{ marginBottom: 0 }}>
            Michael, 42
          </Title>
          {/* Thông tin thời gian bỏ thuốc, màu phụ (xám), xuống dòng, cách dưới 12px */}
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Smoke-free for 1 year and 3 months
          </Text>
          {/* Nội dung chi tiết, chia sẻ cảm nghĩ và kết quả */}
          <Paragraph>
            "After 20 years of smoking, I never thought I could quit. The
            progress tracker and community support made all the difference. I've
            saved over $3,000 and can finally keep up with my kids when playing
            sports."
          </Paragraph>
        </Card>

        {/* Card 2: Câu chuyện của Sarah */}
        <Card variant="borderless" style={storyCardStyle}>
          <Title level={3} style={{ marginBottom: 0 }}>
            Sarah, 35
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Smoke-free for 8 months
          </Text>
          <Paragraph>
            "The cravings management techniques I learned here were
            game-changers. Having a community to turn to during tough moments
            kept me accountable. My sense of smell and taste have returned, and
            I feel like a new person."
          </Paragraph>
        </Card>
      </div>
    </div>

    {/* CTA Section (Call to Action) */}
    <div
      style={{
        marginTop: "72px", // cách phần trên 72px
        padding: "100px 24px", // padding đều, lớn hơn bình thường để nổi bật
        background: "#16A34A", // nền xanh lá
        textAlign: "center", // căn giữa mọi thứ bên trong
        width: "100vw", // kéo rộng toàn bộ chiều ngang viewport
        position: "relative",
        left: "50%", // đẩy nửa viewport qua trái
        transform: "translateX(-50%)", // kéo lại đúng nửa -> đảm bảo full chiều ngang dù trong wrapper hẹp
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Heading CTA: nổi bật, trắng, to, đậm */}
        <Title
          level={2}
          style={{ color: "#fff", fontSize: "50px", fontWeight: 700 }}
        >
          Ready to Begin?
        </Title>
        {/* Mô tả ngắn CTA */}
        <Paragraph style={{ color: "#fff", fontSize: "20px" }}>
          Join thousands who have successfully quit smoking with our support.
        </Paragraph>

        {/* Button group */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Nút đăng ký - gọi hàm điều hướng khi click */}
          <Button
            type="primary"
            style={ctaButtonStyle}
            onClick={() => {
              onLogout();
              onNavigate("/register");
            }}
          >
            Create Free Account
          </Button>

          {/* Nút phụ - không có hành động nhưng giữ style giống nhau */}
          <Button style={ctaButtonStyle}>Explore Resources</Button>
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = ({ onNavigate, onLogout }) => (
  <div
    style={{
      background: "linear-gradient(to bottom, #f0fff4, #ffffff)",
      padding: "200px 24px",
    }}
  >
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Row justify="center" align="middle" gutter={[32, 32]}>
        <Col xs={24} md={13}>
          <Title level={1} style={{ fontWeight: 900, fontSize: "52px" }}>
            <div>Begin Your Journey to a</div>
            <div>Smoke-Free Life</div>
          </Title>
          <Paragraph style={{ fontSize: "21px", color: "#595959" }}>
            Our platform provides personalized support to help you quit.
          </Paragraph>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Button
              type="primary"
              size="large"
              style={primaryButtonStyle}
              onClick={() => {
                onLogout();
                onNavigate("/register");
              }}
            >
              Start Your Journey
            </Button>
            <Button size="large" style={secondaryButtonStyle}>
              Learn More
            </Button>
          </div>
        </Col>
        <Col xs={24} md={11}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingLeft: "20px",
            }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgZW5u-SFd_DPzlc-uZ_yV2YRS1L6XXxXdbw&s"
              alt="Smoke-free journey"
              style={{
                width: "114%",
                maxWidth: "680px",
                height: "auto",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                objectFit: "cover",
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  </div>
);

const cardStyle = {
  textAlign: "center",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  padding: "24px",
  height: "100%",
};

const iconStyle = {
  fontSize: "40px",
  color: "#52c41a",
  marginBottom: "12px",
};

const storyCardStyle = {
  borderRadius: "12px",
  width: "450px",
  maxWidth: "100%",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
};

const ctaButtonStyle = {
  background: "#fff",
  color: "#21252B",
  borderColor: "#fff",
  borderRadius: "6px",
  padding: "20px 32px",
  fontWeight: 600,
};

const primaryButtonStyle = {
  background: "#22c55e",
  borderColor: "#22c55e",
  fontWeight: 600,
  padding: "10px 24px",
  fontSize: "17px",
  borderRadius: "8px",
};

const secondaryButtonStyle = {
  padding: "10px 24px",
  fontSize: "17px",
  borderRadius: "8px",
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { setUser } = useContext(AuthContext);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Reset user state
    setUser(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <HeroSection onNavigate={navigate} onLogout={handleLogout} />
      <StatsSection />
      <SupportSection onNavigate={navigate} />
      <SuccessStories onNavigate={navigate} onLogout={handleLogout} />
      {/* Floating Chat Button */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={toggleChat}
          style={{
            width: "70px",
            height: "70px",
            fontSize: "24px",
            background: "#1FB155",
            border: "none",
            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: isChatOpen ? "none" : "pulse 2s infinite",
          }}
        />
      </div>

      {/* Chat Modal/Sidebar */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: "500px",
            height: "70vh",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close Button */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "30px",
              zIndex: 1002,
            }}
          >
            <Button
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={toggleChat}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #e8e8e8",
                color: "#666",
              }}
            />
          </div>

          {/* Chat Component */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <CoachChat />
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
