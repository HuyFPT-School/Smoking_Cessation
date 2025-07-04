import React from "react";
import { Card, Row, Col, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import {
  ReloadOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const EmptyDashboard = ({ onRetry }) => {
  return (
    <div className="Dashboard-Backgroup">
      <Row justify="center" align="middle" style={{ minHeight: "70vh" }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              textAlign: "center",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Empty
              image={
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚭</div>
              }
              imageStyle={{
                height: "auto",
                marginBottom: 24,
              }}
              description={
                <div style={{ padding: "0 20px" }}>
                  <h2
                    style={{
                      color: "#262626",
                      marginBottom: "12px",
                      fontSize: "24px",
                      fontWeight: "600",
                    }}
                  >
                    Dashboard Data Not Available
                  </h2>
                  <p
                    style={{
                      color: "#8c8c8c",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      marginBottom: "24px",
                      maxWidth: "400px",
                      margin: "0 auto 24px auto",
                    }}
                  >
                    We couldn't load your dashboard data right now. This might
                    happen if:
                  </p>

                  <div
                    style={{
                      textAlign: "left",
                      backgroundColor: "#fafafa",
                      padding: "16px",
                      borderRadius: "8px",
                      marginBottom: "24px",
                    }}
                  >
                    <ul
                      style={{
                        color: "#595959",
                        fontSize: "14px",
                        margin: 0,
                        paddingLeft: "20px",
                      }}
                    >
                      <li>
                        You haven't created your smoking cessation plan yet
                      </li>
                      <li>
                        There's a temporary connection issue with our servers
                      </li>
                      <li>Your plan data is still being processed</li>
                    </ul>
                  </div>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={onRetry || (() => window.location.reload())}
                  style={{
                    borderRadius: "8px",
                    height: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    fontWeight: "500",
                  }}
                >
                  Try Again
                </Button>

                <Link to="/plan">
                  <Button
                    type="default"
                    size="large"
                    icon={<PlusOutlined />}
                    style={{
                      borderRadius: "8px",
                      height: "44px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                      fontWeight: "500",
                    }}
                  >
                    Create Plan
                  </Button>
                </Link>
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "20px",
                  backgroundColor: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: "8px",
                }}
              >
                <CalendarOutlined
                  style={{
                    color: "#52c41a",
                    fontSize: "20px",
                    marginBottom: "8px",
                  }}
                />
                <p
                  style={{
                    color: "#389e0d",
                    fontSize: "14px",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  💡 Tip: Create your personalized smoking cessation plan first
                  to unlock your dashboard features!
                </p>
              </div>
            </Empty>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmptyDashboard;
