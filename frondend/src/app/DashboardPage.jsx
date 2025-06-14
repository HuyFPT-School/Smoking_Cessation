import { useState, useEffect } from "react";
import { Card, Row, Col, message } from "antd";
import { Line } from "@ant-design/charts";
import { Divider, Tag, Segmented } from "antd";
import HealthMilestones from "./HealthMilestones";
import { Link, Navigate } from "react-router-dom";
import { ArrowUpOutlined, DollarCircleOutlined, FireOutlined, FlagOutlined } from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const DashboardPage = () => {
  // const [activeTab, setActiveTab] = useState("Progress");
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState("cigarettes");
  const [loading, setLoading] = useState(true);

  // Lấy userId từ localStorage
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  useEffect(() => {
    if (!userId || isNaN(userId)) {
      console.error("Invalid or missing user ID:", userId);
      message.error("Invalid user ID. Please provide a valid user ID.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard data
        const dashboardResponse = await fetch(`http://localhost:8080/api/dashboard/${userId}`);
        if (!dashboardResponse.ok) {
          throw new Error(`Failed to fetch dashboard data: ${await dashboardResponse.text()}`);
        }
        const dashboardJson = await dashboardResponse.json();
        setDashboardData(dashboardJson);

        // Fetch history data
        const historyResponse = await fetch(`http://localhost:8080/api/dashboard/history/${userId}`);
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch history data: ${await historyResponse.text()}`);
        }
        const historyJson = await historyResponse.json();
        console.log("History JSON:", historyJson); // Log dữ liệu từ API
        const chartData = historyJson.map(item => ({
          day: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          cigarettes: item.cigarettes ?? 0, // Gán 0 nếu null
          averageCravingSatisfaction: item.averageCravingSatisfaction ?? 0, // Gán 0 nếu null
        }));
        console.log("Chart Data:", chartData); // Log dữ liệu sau ánh xạ
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");
        client.subscribe(`/topic/dashboard/${userId}`, async message => {
          console.log("WebSocket message received:", message.body);
          const updatedData = JSON.parse(message.body);
          setDashboardData(updatedData);
          try {
            const historyResponse = await fetch(`http://localhost:8080/api/dashboard/history/${userId}`);
            if (historyResponse.ok) {
              const historyJson = await historyResponse.json();
              console.log("WebSocket History JSON:", historyJson);
              const chartData = historyJson.map(item => ({
                day: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
                cigarettes: item.cigarettes ?? 0,
                averageCravingSatisfaction: item.averageCravingSatisfaction ?? 0,
              }));
              console.log("WebSocket Chart Data:", chartData);
              setChartData(chartData);
            } else {
              console.error("History refresh failed:", await historyResponse.text());
            }
          } catch (error) {
            console.error("Error refreshing history:", error);
          }
        });
      },
      onStompError: frame => {
        console.error("STOMP error:", frame);
      },
      onWebSocketError: error => {
        console.error("WebSocket connection error:", error);
      },
      onWebSocketClose: () => {
        console.log("WebSocket closed");
      },
    });
    client.activate();

    return () => client.deactivate();
  }, [userId]);

  // Cấu hình biểu đồ đường cho averageCravingSatisfaction
  const satisfactionChartConfig = {
    data: chartData,
    xField: "day",
    yField: "averageCravingSatisfaction",
    height: 200,
    smooth: true,
    point: { size: 4, shape: "circle" },
    color: "#1890ff",
    yAxis: {
      title: { text: "Trung bình Satisfaction (Thèm thuốc)" },
      min: 0,
      max: 10,
      tickInterval: 1,
    },
    xAxis: {
      title: { text: "Ngày" },
      label: { autoRotate: true, autoHide: true },
    },
    tooltip: {
      showMarkers: true,
      shared: false,
      formatter: datum => ({
        name: "Craving",
        value: datum.averageCravingSatisfaction != null ? `${datum.averageCravingSatisfaction.toFixed(4)} vào ${datum.day}` : "N/A",
      }),
    },
  };

  // Cấu hình biểu đồ đường cho Smoking
  const smokingChartConfig = {
    data: chartData,
    xField: "day",
    yField: "cigarettes",
    height: 200,
    smooth: true,
    point: { size: 4, shape: "circle" },
    color: "#ff4d4f",
    yAxis: {
      title: { text: "Số lượng Smoking" },
      min: 0,
      tickInterval: 1,
    },
    xAxis: {
      title: { text: "Ngày" },
      label: { autoRotate: true, autoHide: true },
    },
    tooltip: {
      showMarkers: true,
      shared: false,
      formatter: datum => ({
        name: "Smoking",
        value: datum.cigarettes != null ? `${datum.cigarettes} vào ${datum.day}` : "N/A",
      }),
    },
  };

  if (!userId || isNaN(userId)) return <Navigate to="/dashboard/1" />;
  if (loading) return <div>Loading...</div>;
  if (!dashboardData) return <div>No data available.</div>;

  return (
    <div className="Dashboard-Backgroup">
      <h2 style={{ color: "#262626", marginBottom: "5px" }}>
        Welcome back, {dashboardData.userName || "User"}
      </h2>
      <p style={{ color: "#595959", marginBottom: "24px" }}>
        You’ve been smoke-free for {dashboardData.daysSmokeFree || 0} days. Keep going!
      </p>

      <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 24]} className="dashboard-row-spacing">
        <Col xs={24} sm={12} md={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <FireOutlined />
            </div>
            <div className="dashboard-card-title">Days Smoke-Free</div>
            <p className="dashboard-card-value">{dashboardData.daysSmokeFree || 0}</p>
            <p className="dashboard-card-subtext">You're on a streak!</p>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <DollarCircleOutlined />
            </div>
            <div className="dashboard-card-title">Money Saved</div>
            <p className="dashboard-card-value">${dashboardData.moneySaved || 0}</p>
            <p className="dashboard-card-subtext">Based on ${dashboardData.cigarettesPerDay * 0.04}/day</p>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <ArrowUpOutlined />
            </div>
            <div className="dashboard-card-title">Cigarettes Avoided</div>
            <p className="dashboard-card-value">{dashboardData.cigarettesAvoided || 0}</p>
            <p className="dashboard-card-subtext">Based on {dashboardData.cigarettesPerDay }/day</p>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <FlagOutlined />
            </div>
            <div className="dashboard-card-title">Next Milestone</div>
            <p className="dashboard-card-value">{dashboardData.nextMilestone || "N/A"}</p>
            <p className="dashboard-card-subtext">{dashboardData.remainingDaysToMilestone || 0} days to go</p>
          </div>
        </Col>
      </Row>

      <Card title="🚬SMOKING STATUS" className="smoking-status-card">
        <div className="card-content">
          <p className="subtitle">Track your smoking habits and cravings</p>
          <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 24]} className="main-layout">
            <Col xs={24} sm={24} md={12} className="stats-container">
              <Row gutter={[{ xs: 8, sm: 16, md: 32 }, 16]} className="stats-section">
                <Col xs={24} sm={12} md={12} className="stat-item">
                  <h3>🚬Today</h3>
                  <div className="stat-details">
                    <div>
                      <span className="stat-label">Cigarettes:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.todayCigarettes || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label">Cravings:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.todayCravings || 0}</span>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={12} className="stat-item">
                  <h3>🚬Yesterday</h3>
                  <div className="stat-details">
                    <div>
                      <span className="stat-label">Cigarettes:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.yesterdayCigarettes || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label">Cravings:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.yesterdayCravings || 0}</span>
                    </div>
                  </div>
                </Col>
              </Row>
              <Divider />
              <Row className="stats-section-last-7-days">
                <Col span={24} className="stat-item">
                  <h3>🚬Last 7 days</h3>
                  <div className="stat-details">
                    <div>
                      <span className="stat-label">Total cigarettes:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.last7DaysCigarettes || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label">Total cravings:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.last7DaysCravings || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label">Resistance rate:</span>{" "}
                      <span style={{ fontWeight: "bold" }}>{dashboardData.resistanceRate || 0}%</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={12} className="triggers-section">
              <h3>🔥Common triggers</h3>
              <div className="triggers-list">
                {dashboardData.topTriggers?.map(trigger => (
                  <Tag
                    key={trigger}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#666",
                      border: "none",
                      fontSize: "14px",
                    }}
                  >
                    ⚡{trigger }
                  </Tag>
                )) || (
                  <>
                    <Tag style={{ backgroundColor: "#ffffff", color: "#666", border: "none", fontSize: "14px" }}>
                      ⚡Căng thẳng
                    </Tag>
                    <Tag style={{ backgroundColor: "#ffffff", color: "#666", border: "none", fontSize: "14px" }}>
                      ⚡Sau bữa ăn
                    </Tag>
                    <Tag style={{ backgroundColor: "#ffffff", color: "#666", border: "none", fontSize: "14px" }}>
                      ⚡Uống cà phê
                    </Tag>
                  </>
                )}
              </div>
              <Divider />
              <p>Identifying triggers helps you better prepare to deal with cravings.</p>
              <Link to="/tracking" className="record-button">
                Record Smoking Status
              </Link>
            </Col>
          </Row>
        </div>
      </Card>

      <Col className="Last-item">
        {/* <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
          <Segmented
            options={["Progress", "Health Benefits"]}
            value={activeTab}
            onChange={setActiveTab}
            className="custom-segmented"
          />
        </div> */}
{/* 
        {activeTab === "Progress" && ( */}
          <div style={{ width: "100%" }}>
            <h3>Your Progress</h3>
            <p>Track your smoking habits over time</p>
            <div style={{ marginBottom: 16 }}>
              <Segmented
                options={[
                  {
                    label: <span style={{ fontWeight: chartMetric === "cigarettes" ? "bold" : "normal" }}>🚬 Smoking chart</span>,
                    value: "cigarettes",
                  },
                  {
                    label: <span style={{ fontWeight: chartMetric === "averageCravingSatisfaction" ? "bold" : "normal" }}>😋Craving chart</span>,
                    value: "averageCravingSatisfaction",
                  },
                ]}
                value={chartMetric}
                onChange={setChartMetric}
                className="custom-segmented"
              />
            </div>
            {chartData.length > 0 ? (
              chartMetric === "averageCravingSatisfaction" ? (
                <Line {...satisfactionChartConfig} style={{ minHeight: "300px", width: "100%" }} />
              ) : (
                <Line {...smokingChartConfig} style={{ minHeight: "300px", width: "100%" }} />
              )
            ) : (
              <div>No tracking data available.</div>
            )}
          </div>
        {/* )} */}

        {/* {activeTab === "Health Benefits" && (
          <div>
            <h3>Health Improvements</h3>
            <p>See how your body is healing</p>
            <HealthMilestones quitDate={dashboardData.quitDate} />
          </div>
        )} */}
      </Col>
    </div>
  );
};

export default DashboardPage;