import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "antd";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router";

const Home = () => {
  const [username, setUsername] = useState("Guest");
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUsername(userObj.name || "Guest");
      } catch {
        localStorage.removeItem("user");
        navigate("/login");
      }
    } else {
      navigate("/home");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        py: 6,
        backgroundImage: "linear-gradient(to bottom, #F0FDF4, #FDFEFD)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Row gutter={[32, 32]} align="middle" style={{ padding: "100px 0px" }}>
          <Col xs={24} md={12}>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              fontSize={50}
            >
              Begin Your Journey to a Smoke-Free Life
            </Typography>
            <Typography color="text.secondary" mb={3} fontSize={20}>
              Our platform provides personalized support, community
              encouragement, and evidence-based tools to help you quit smoking
              for good.
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: "#16A34A", mr: 2, fontSize: 14 }}
            >
              Start Your Journey
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: "#16A34A", color: "#16A34A", fontSize: 14 }}
            >
              Learn More
            </Button>
          </Col>
          <Col xs={24} md={12}>
            <Box
              sx={{
                height: 200,
                backgroundColor: "#e5e7eb",
                borderRadius: 2,
                textAlign: "center",
                lineHeight: "200px",
                fontStyle: "italic",
                color: "#6b7280",
              }}
            >
              (Image Placeholder)
            </Box>
          </Col>
        </Row>

        {/* Stats */}
        <Row
          gutter={[24, 24]}
          justify="center"
          style={{
            textAlign: "center",
            padding: "70px 0px",
          }}
        >
          {[
            ["70%", "of smokers want to quit"],
            ["20 min", "to see health improvements"],
            ["10 years", "to reduce lung cancer risk by half"],
            ["$2,000+", "saved annually by quitting"],
          ].map(([value, label], index) => (
            <Col xs={12} md={6} key={index}>
              <Typography variant="h5" fontWeight="bold" fontSize={30}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize={16}>
                {label}
              </Typography>
            </Col>
          ))}
        </Row>

        {/* Support Sections */}
        <Box mt={10} mb={10}>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
            fontSize={48}
          >
            How We Support Your Journey
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            mb={4}
            fontSize={20}
          >
            Our comprehensive approach combines technology, community, and
            evidence-based methods.
          </Typography>
          <Row gutter={[24, 24]}>
            {[
              [
                "Progress Tracking",
                "Log your milestones, track cravings, and celebrate your wins.",
              ],
              [
                "Community Support",
                "Get motivation from others who share your goals.",
              ],
              [
                "Expert Resources",
                "Learn strategies from healthcare professionals.",
              ],
            ].map(([title, desc], index) => (
              <Col xs={24} md={8} key={index}>
                <Card title={title}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontSize={16}
                  >
                    {desc}
                  </Typography>
                  <Button size="small" sx={{ mt: 2, color: "#16A34A" }}>
                    Learn more
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Box>

        {/* Success Stories */}
        <Box mt={10} mb={10}>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
            fontSize={48}
          >
            Success Stories
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            mb={4}
            fontSize={20}
          >
            Hear from people who have successfully quit smoking with our
            platform.
          </Typography>
          <Row gutter={[24, 24]}>
            {[
              {
                name: "Michael, 42",
                note: "Smoke-free for 8 weeks",
                text: "After 20 years of smoking, I never thought I could quit. This platform changed everything — the tools, support, and progress tracking made all the difference.",
              },
              {
                name: "Sarah, 35",
                note: "Smoke-free for 6 months",
                text: "Using the community support and daily progress check-ins really kept me motivated. I feel healthier, more energized, and free from cravings.",
              },
            ].map((story, index) => (
              <Col xs={24} md={12} key={index}>
                <Card bordered>
                  <Typography fontWeight="bold">{story.name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={1}
                  >
                    {story.note}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {story.text}
                  </Typography>
                </Card>
              </Col>
            ))}
          </Row>
        </Box>

        {/* Logout */}
        <Box mt={8} textAlign="center">
          <Typography mb={2}>
            👋 Welcome back, <strong>{username}</strong>!
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
