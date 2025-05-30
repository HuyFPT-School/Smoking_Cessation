import React from "react";
import { Typography, Button, Row, Col, Card } from "antd";
import { RiseOutlined, TeamOutlined, BookOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";


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
      {stats.map((item, index) => (
        <div
          key={index}
          style={{
            flexBasis: "calc((100% - 45%) / 4)",
            textAlign: "center",
            minWidth: "160px",
          }}
        >
          <Text style={{ fontSize: "36px", fontWeight: "700", color: "#000" }}>
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
            {item.description}
          </Text>
        </div>
      ))}
    </div>
  </div>
);

const SupportSection = () => (
  <div style={{ padding: "80px 24px", background: "#f5f7fa" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", fontWeight: 700 }}>
        How We Support Your Journey
      </Title>
      <Paragraph
        style={{
          textAlign: "center",
          color: "#8c8c8c",
          marginBottom: "48px",
          fontSize: "16px",
        }}
      >
        Our comprehensive approach combines technology, community, and
        evidence-based methods.
      </Paragraph>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={8}>
          <Card variant="borderless" style={cardStyle}>
            <RiseOutlined style={iconStyle} />
            <Title level={4}>Progress Tracking</Title>
            <Paragraph>
              Monitor your smoke-free days, health improvements, and money
              saved.
            </Paragraph>
            <Button type="link">Learn more</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={cardStyle}>
            <TeamOutlined style={iconStyle} />
            <Title level={4}>Community Support</Title>
            <Paragraph>
              Connect with others on the same journey to stay motivated.
            </Paragraph>
            <Button type="link">Learn more</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card variant="borderless" style={cardStyle}>
            <BookOutlined style={iconStyle} />
            <Title level={4}>Expert Resources</Title>
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

const SuccessStories = ({ onNavigate }) => (
  <div style={{ background: "#fff", padding: "80px 24px 0" }}>
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "32px",
          marginBottom: "8px",
        }}
      >
        Success Stories
      </Title>
      <Paragraph
        style={{ textAlign: "center", color: "#595959", marginBottom: "48px" }}
      >
        Hear from people who have successfully quit smoking with our platform.
      </Paragraph>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <Card variant="borderless" style={storyCardStyle}>
          <Title level={4} style={{ marginBottom: 0 }}>
            Michael, 42
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Smoke-free for 1 year and 3 months
          </Text>
          <Paragraph>
            "After 20 years of smoking, I never thought I could quit. The
            progress tracker and community support made all the difference. I've
            saved over $3,000 and can finally keep up with my kids when playing
            sports."
          </Paragraph>
        </Card>
        <Card variant="borderless" style={storyCardStyle}>
          <Title level={4} style={{ marginBottom: 0 }}>
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

    <div
      style={{
        marginTop: "72px",
        padding: "64px 24px",
        background: "#16A34A",
        textAlign: "center",
        width: "100vw",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Title level={2} style={{ color: "#fff", fontSize: "28px" }}>
          Ready to Begin?
        </Title>
        <Paragraph style={{ color: "#fff", fontSize: "15px" }}>
          Join thousands who have successfully quit smoking with our support.
        </Paragraph>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Button
            type="primary"
            style={ctaButtonStyle}

            onClick={() => onNavigate("/register")}

          >
            Create Free Account
          </Button>
          <Button style={ctaButtonStyle}>Explore Resources</Button>
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <div
    style={{
      background: "linear-gradient(to bottom, #f0fff4, #ffffff)",
      padding: "96px 24px",
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
            <Button type="primary" size="large" style={primaryButtonStyle}>
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
  fontSize: "28px",
  color: "#52c41a",
  marginBottom: "12px",
};

const storyCardStyle = {
  borderRadius: "12px",
  width: "360px",
  maxWidth: "100%",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
};

const ctaButtonStyle = {
  background: "#fff",
  color: "#21252B",
  borderColor: "#fff",
  borderRadius: "24px",
  padding: "8px 20px",
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
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <SupportSection />
      <SuccessStories onNavigate={navigate} />
    </div>
  );
};

export default HomePage;
