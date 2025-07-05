import { Segmented } from "antd";
import { useState, useContext, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Avatar,
  Typography,
  Divider,
  Spin,
  message,
} from "antd";
import { Link } from "react-router-dom";
import {
  ClockCircleOutlined,
  FileDoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { TrophyOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import React from "react";
import { ArrowUpOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const { Text, Title } = Typography;

const LeaderboardPage = () => {
  const { user } = useContext(AuthContext);

  // State quản lý giao diện và dữ liệu
  const [timeRange, setTimeRange] = useState("weekly");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu bảng xếp hạng
  useEffect(() => {
    const fetchLeaderboardData = async (range = "weekly") => {
      try {
        setLoading(true);
        const params = {
          timeRange: range,
        };

        if (user?.id) {
          params.currentUserId = user.id;
        }

        const response = await axios.get(
          "http://localhost:8080/api/leaderboard",
          { params }
        );

        if (response.status === 200) {
          setLeaderboardData(response.data.leaderboard || []);
          setCurrentUserData(response.data.currentUser);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        message.error("Failed to load leaderboard data");
        setLeaderboardData([]);
        setCurrentUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData(timeRange);
  }, [timeRange, user?.id]);

  // Cấu hình màu tier và thời gian
  const tierColors = {
    Legend: "#D3C9FF",
    Diamond: "#F8632F",
    Platinum: "#97D0EF",
    Gold: "#F4C220",
    Silver: "#F9FAFB",
    Bronze: "#FFFBEB",
  };

  // Ngày hiện tại được cố định là 31/05/2025
  const currentDate = new Date("2025-05-31"); // Tạo đối tượng ngày với giá trị cố định

  // Tính toán ngày bắt đầu của tuần hiện tại (bắt đầu từ Chủ Nhật)
  const startOfWeek = new Date(currentDate); // Tạo bản sao của currentDate
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Đặt ngày về Chủ Nhật của tuần hiện tại
  startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00.000

  // Tính toán ngày bắt đầu của tháng hiện tại
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ); // Tạo ngày đầu tiên của tháng
  startOfMonth.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00.000

  // Hàm lọc dữ liệu bảng xếp hạng theo khoảng thời gian
  const getFilteredData = () => {
    return leaderboardData.map((user, index) => ({
      ...user, // Giữ nguyên các thuộc tính của user
      rank: index + 1, // Thêm thuộc tính rank dựa trên chỉ số (bắt đầu từ 1)
      days: user.consecutiveSmokFreeDays || 0, // Thêm thuộc tính days, mặc định là 0 nếu không có
    }));
  };

  const filteredLeaderboardData = getFilteredData(); // Lấy dữ liệu bảng xếp hạng đã được lọc

  // Hàm hiển thị bảng xếp hạng chung
  const renderLeaderboard = (data, title) => (
    <div className="leaderboard-section">
      <p
        style={{
          color: "#000",
          margin: "0 0 0 0",
          fontWeight: "bolder",
          fontSize: "22px",
          marginBottom: "7px",
        }}
      >
        {title}
      </p>
      <p style={{ color: "#595959", margin: "0 0 16px 0" }}>
        Updated at 00:00 every{" "}
        {timeRange === "weekly"
          ? "Sunday"
          : timeRange === "monthly"
          ? "1st of the month"
          : "day"}
      </p>

      <Row
        gutter={[{ xs: 8, sm: 16, md: 24 }, 24]}
        className="leaderboard-header"
      >
        <Col
          span={2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Rank
        </Col>
        <Col
          span={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          User
        </Col>
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Badge
        </Col>
        <Col
          span={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Consecutive Streak
        </Col>
        <Col
          span={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Points
        </Col>
      </Row>

      {data.length === 0 ? (
        <p>No users found for {timeRange}.</p>
      ) : (
        data.map((user, index) => (
          <React.Fragment key={user.id}>
            <Row
              gutter={[{ xs: 8, sm: 16, md: 24 }, 0]}
              className={`leaderboard-card ${user.tier.toLowerCase()}`}
              style={{
                padding: "10px",
                transition: "background-color 0.3s ease",
                ":hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <Col span={2}>
                <div
                  className="Rank-list"
                  style={{
                    backgroundColor:
                      user.rank === 1
                        ? "#fadb14"
                        : user.rank === 2
                        ? "#d9d9d9"
                        : user.rank === 3
                        ? "#fa8c16"
                        : "#fff",
                  }}
                >
                  {user.rank}
                </div>
              </Col>
              <Col
                span={6}
                style={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                }}
              >
                <Avatar
                  alt={user.name}
                  size={36}
                  src={user.avatarUrl}
                  style={{
                    marginRight: "10px",
                  }}
                />
                {user.name}
              </Col>
              <Col
                span={8}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  className="user-tier"
                  style={{ backgroundColor: tierColors[user.tier] || "#fff" }}
                >
                  {user.tier}
                </div>
              </Col>
              <Col
                span={4}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {user.days}
              </Col>
              <Col
                span={4}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <strong>
                  {timeRange === "weekly"
                    ? user.weeklyPoints
                    : timeRange === "monthly"
                    ? user.monthlyPoints
                    : user.totalPoints}
                </strong>
              </Col>
            </Row>
            {index < data.length - 1 && <Divider style={{ margin: "0" }} />}
          </React.Fragment>
        ))
      )}
    </div>
  );

  return (
    <div className="Leaderboard-Backgroup">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#262626",
              marginBottom: "10px",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            Leaderboard
          </h2>
          <p style={{ color: "#595959", margin: 0, fontSize: "14px" }}>
            Track your progress and others' in the smoking cessation journey
          </p>
        </div>
      </div>

      <Card className="user-highlight-card">
        <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="user-avatar-container">
                <Avatar
                  alt="User"
                  src={user?.avatarUrl}
                  style={{
                    width: 60,
                    height: 60,
                  }}
                />
                <span className="user-rank">
                  {currentUserData?.rank || "N/A"}
                </span>
              </div>
              <div className="user-info" style={{ marginLeft: "16px" }}>
                <div className="user-name" style={{ marginTop: "0px" }}>
                  {user?.name || "User"}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    className="user-tier"
                    style={{
                      backgroundColor:
                        tierColors[currentUserData?.tier || "Bronze"] ||
                        "#FFFBEB",
                    }}
                  >
                    {currentUserData?.tier || "Bronze"}
                  </div>
                  <p className="user-days">
                    {currentUserData?.consecutiveSmokFreeDays || 0} days on the
                    streak
                  </p>
                </div>
              </div>
            </div>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div className="user-points-title">Points</div>
              <div className="user-points-value">
                {timeRange === "weekly"
                  ? currentUserData?.weeklyPoints || 0
                  : timeRange === "monthly"
                  ? currentUserData?.monthlyPoints || 0
                  : currentUserData?.totalPoints || 0}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="user-rank-title">Rank</div>
              <div className="user-rank-value">
                {currentUserData?.rank || "N/A"}
                <ArrowUpOutlined style={{ color: "#52c41a" }} />
              </div>
            </div>
            <Link to="/profile">
              <Button type="primary" className="view-profile-button">
                View Profile
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>
      <Row
        gutter={[{ xs: 8, sm: 16, md: 24 }, 16]}
        style={{ marginBottom: "20px" }}
      >
        {filteredLeaderboardData.slice(0, 3).map((user) => (
          <Col xs={24} sm={12} md={8} key={user.id}>
            <Card
              className="flex flex-col items-center text-center shadow-lg"
              style={{
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: user.rank === 1 ? "#fffbe6" : "#ffffff",
                height: "310px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Avatar
                    alt={user.name}
                    src={user.avatarUrl}
                    size={64}
                    style={{
                      display: "block",
                      border:
                        user.rank === 1
                          ? "2px solid #fadb14"
                          : "2px solid transparent",
                    }}
                  />
                  <div
                    className="Rank-avatar"
                    style={{
                      backgroundColor:
                        user.rank === 1
                          ? "#fadb14"
                          : user.rank === 2
                          ? "#d9d9d9"
                          : "#fa8c16",
                    }}
                  >
                    {user.rank}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Title level={4} style={{ marginBottom: 0 }}>
                  {user.name}
                </Title>
                <div
                  className="user-tier"
                  style={{ backgroundColor: tierColors[user.tier] || "#fff" }}
                >
                  {user.tier}
                </div>
                <Text style={{ color: "#666" }}>
                  {user.days} consecutive smoke-free days
                </Text>
                <Text strong style={{ fontSize: "1.125rem" }}>
                  {timeRange === "weekly"
                    ? user.weeklyPoints
                    : timeRange === "monthly"
                    ? user.monthlyPoints
                    : user.totalPoints}{" "}
                  points
                </Text>
                {user.rank === 1 && (
                  <TrophyOutlined
                    style={{
                      marginTop: "8px",
                      fontSize: "24px",
                      color: "#fadb14",
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Segmented
        className="custom-segmented"
        options={[
          { label: "This Week", value: "weekly" },
          { label: "This Month", value: "monthly" },
          { label: "All Time", value: "all" },
        ]}
        value={timeRange}
        onChange={setTimeRange}
        style={{ marginTop: "24px", marginBottom: "14px" }}
        block
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Loading leaderboard...</p>
        </div>
      ) : (
        <>
          {timeRange === "weekly" &&
            renderLeaderboard(
              filteredLeaderboardData,
              "This Week's Leaderboard"
            )}
          {timeRange === "monthly" &&
            renderLeaderboard(
              filteredLeaderboardData,
              "This Month's Leaderboard"
            )}
          {timeRange === "all" &&
            renderLeaderboard(filteredLeaderboardData, "All Time Leaderboard")}
        </>
      )}
      <Card className="points-card">
        <Title level={3} className="card-title">
          How Points are Calculated
        </Title>
        <Text className="card-subtitle">
          Understand how we calculate points and rankings
        </Text>
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col span={8}>
            <div className="points-column">
              <ClockCircleOutlined className="column-icon" />
              <Text strong className="column-title">
                Daily Progress
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  Accumulated smoke-free days: +8 points each
                </Text>
                <Text className="points-item">
                  Consecutive smoke-free days: +2 bonus each
                </Text>
                <Text className="points-item">Record a craving: +4 points</Text>
                <Text className="points-item" style={{ color: "#ff4d4f" }}>
                  Smoking incident: -15 points
                </Text>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="points-column">
              <FileDoneOutlined className="column-icon" />
              <Text strong className="column-title">
                Streak Bonuses
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  7-day consecutive streak: +40 points
                </Text>
                <Text className="points-item">
                  30-day consecutive streak: +150 points
                </Text>
                <Text className="points-item" style={{ color: "#faad14" }}>
                  Consecutive streaks reset after smoking
                </Text>
                <Text className="points-item" style={{ color: "#52c41a" }}>
                  Accumulated progress never resets
                </Text>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="points-column">
              <UserOutlined className="column-icon" />
              <Text strong className="column-title">
                Leaderboard Views
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  Weekly: Points from last 7 days
                </Text>
                <Text className="points-item">
                  Monthly: Points from last 30 days
                </Text>
                <Text className="points-item">
                  All Time: Total accumulated points
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
