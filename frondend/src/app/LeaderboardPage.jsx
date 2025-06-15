import { Segmented } from "antd"; // Nhập component Segmented từ thư viện Ant Design để tạo các nút chọn (weekly, monthly, all time)
import { useState, useContext, useEffect } from "react"; // Nhập các hook từ React: useState để quản lý state, useContext để lấy dữ liệu từ context, useEffect để xử lý side effects
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
} from "antd"; // Nhập các component từ Ant Design: Card (thẻ), Row/Col (hệ thống lưới), Button (nút), Avatar (hình đại diện), Typography (văn bản), Divider (đường phân cách), Spin (loading), message (thông báo)
import { Link } from "react-router-dom"; // Nhập Link từ react-router-dom để tạo liên kết điều hướng
import {
  ClockCircleOutlined,
  FileDoneOutlined,
  UserOutlined,
} from "@ant-design/icons"; // Nhập các icon từ Ant Design để hiển thị biểu tượng
import { TrophyOutlined } from "@ant-design/icons"; // Nhập icon TrophyOutlined để hiển thị cúp cho người dẫn đầu
import "antd/dist/reset.css"; // Nhập file CSS reset của Ant Design để chuẩn hóa giao diện
import React from "react"; // Nhập React để sử dụng JSX
import { ArrowUpOutlined } from "@ant-design/icons"; // Nhập icon ArrowUpOutlined để hiển thị mũi tên lên (biểu thị thứ hạng)
import { AuthContext } from "../context/AuthContext"; // Nhập AuthContext để lấy thông tin người dùng hiện tại
import axios from "axios"; // Nhập axios để thực hiện các yêu cầu HTTP (gọi API)

const { Text, Title } = Typography; // Lấy các component Text và Title từ Typography để hiển thị văn bản với kiểu dáng khác nhau

// Component chính hiển thị trang Leaderboard
const LeaderboardPage = () => {
  // Lấy thông tin người dùng từ AuthContext
  const { user } = useContext(AuthContext); // Sử dụng useContext để lấy đối tượng user từ AuthContext

  // State để lưu khoảng thời gian hiển thị bảng xếp hạng (weekly, monthly, all time)
  const [timeRange, setTimeRange] = useState("weekly"); // Khởi tạo state timeRange với giá trị mặc định là "weekly"

  // State để lưu dữ liệu bảng xếp hạng
  const [leaderboardData, setLeaderboardData] = useState([]); // Khởi tạo state leaderboardData là mảng rỗng để lưu danh sách người dùng
  const [currentUserData, setCurrentUserData] = useState(null); // Khởi tạo state currentUserData để lưu thông tin người dùng hiện tại
  const [loading, setLoading] = useState(true); // Khởi tạo state loading để kiểm soát trạng thái tải dữ liệu

  // Hook useEffect để gọi API lấy dữ liệu bảng xếp hạng khi component được mount hoặc khi timeRange/user.id thay đổi
  useEffect(() => {
    // Hàm lấy dữ liệu bảng xếp hạng từ API
    const fetchLeaderboardData = async (range = "weekly") => { // Hàm async nhận tham số range với giá trị mặc định là "weekly"
      try {
        setLoading(true); // Bật trạng thái loading khi bắt đầu gọi API
        const params = {
          timeRange: range, // Thêm tham số timeRange vào query của API
        };

        // Chỉ thêm currentUserId vào params nếu user tồn tại và có id
        if (user?.id) {
          params.currentUserId = user.id; // Thêm ID của người dùng hiện tại vào params
        }

        // Gọi API để lấy dữ liệu bảng xếp hạng
        const response = await axios.get(
          "http://localhost:8080/api/leaderboard", // URL của API
          { params } // Truyền params vào yêu cầu GET
        );

        // Kiểm tra nếu API trả về trạng thái thành công
        if (response.status === 200) {
          setLeaderboardData(response.data.leaderboard || []); // Cập nhật state leaderboardData với dữ liệu từ API hoặc mảng rỗng
          setCurrentUserData(response.data.currentUser); // Cập nhật state currentUserData với thông tin người dùng hiện tại
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error); // In lỗi ra console nếu gọi API thất bại
        message.error("Failed to load leaderboard data"); // Hiển thị thông báo lỗi cho người dùng
        setLeaderboardData([]); // Đặt lại leaderboardData là mảng rỗng
        setCurrentUserData(null); // Đặt lại currentUserData là null
      } finally {
        setLoading(false); // Tắt trạng thái loading sau khi hoàn tất gọi API
      }
    };

    // Gọi hàm fetchLeaderboardData với timeRange hiện tại
    fetchLeaderboardData(timeRange); // Luôn gọi API, kể cả khi người dùng chưa đăng nhập
  }, [timeRange, user?.id]); // useEffect chạy lại khi timeRange hoặc user.id thay đổi

  // Định nghĩa màu nền cho từng cấp bậc (tier) của người dùng
  const tierColors = {
    Legend: "#D3C9FF", // Màu nền cho tier Legend
    Diamond: "#F8632F", // Màu nền cho tier Diamond
    Platinum: "#97D0EF", // Màu nền cho tier Platinum
    Gold: "#F4C220", // Màu nền cho tier Gold
    Silver: "#F9FAFB", // Màu nền cho tier Silver
    Bronze: "#FFFBEB", // Màu nền cho tier Bronze
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
    // Vì API đã trả về dữ liệu được lọc và sắp xếp theo timeRange, chỉ cần thêm thứ hạng (rank)
    return leaderboardData.map((user, index) => ({
      ...user, // Giữ nguyên các thuộc tính của user
      rank: index + 1, // Thêm thuộc tính rank dựa trên chỉ số (bắt đầu từ 1)
      days: user.consecutiveSmokFreeDays || 0, // Thêm thuộc tính days, mặc định là 0 nếu không có
    }));
  };

  const filteredLeaderboardData = getFilteredData(); // Lấy dữ liệu bảng xếp hạng đã được lọc

  // Hàm hiển thị bảng xếp hạng chung
  const renderLeaderboard = (data, title) => (
    // Container cho section bảng xếp hạng
    <div className="leaderboard-section">
      {/* Tiêu đề của bảng xếp hạng */}
      <p
        style={{
          color: "#000",
          margin: "0 0 0 0",
          fontWeight: "bolder",
          fontSize: "22px",
          marginBottom: "7px",
        }}
      >
        {title} {/* Hiển thị tiêu đề (ví dụ: This Week's Leaderboard) */}
      </p>
      {/* Thời gian cập nhật bảng xếp hạng */}
      <p style={{ color: "#595959", margin: "0 0 16px 0" }}>
        Updated at 00:00 every{" "}
        {timeRange === "weekly"
          ? "Sunday" // Nếu là weekly, hiển thị "Sunday"
          : timeRange === "monthly"
          ? "1st of the month" // Nếu là monthly, hiển thị "1st of the month"
          : "day"} {/* Nếu là all time, hiển thị "day" */}
      </p>


      {/* Header của bảng xếp hạng (tên các cột) */}
      <Row
        gutter={[{ xs: 8, sm: 16, md: 24 }, 24]}
        className="leaderboard-header"
      >
        {/* Cột Rank */}
        <Col
          span={2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Rank {/* Tiêu đề cột Rank */}
        </Col>
        {/* Cột User */}
        <Col
          span={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          User {/* Tiêu đề cột User */}
        </Col>
        {/* Cột Badge */}
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Badge {/* Tiêu đề cột Badge */}
        </Col>
        {/* Cột Smoke-Free Days */}
        <Col
          span={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Smoke-Free Days {/* Tiêu đề cột Smoke-Free Days */}
        </Col>
        {/* Cột Points */}
        <Col
          span={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Points {/* Tiêu đề cột Points */}
        </Col>
      </Row>


      {/* Hiển thị dữ liệu bảng xếp hạng */}
      {data.length === 0 ? ( // Nếu không có dữ liệu
        <p>No users found for {timeRange}.</p> // Hiển thị thông báo không có người dùng
      ) : (
        // Lặp qua danh sách người dùng để hiển thị từng hàng
        data.map((user, index) => (
          <React.Fragment key={user.id}> {/* Sử dụng Fragment để nhóm các phần tử */}
            <Row
              gutter={[{ xs: 8, sm: 16, md: 24 }, 0]}
              className={`leaderboard-card ${user.tier.toLowerCase()}`} // Class động dựa trên tier của người dùng
              style={{
                padding: "10px",
                transition: "background-color 0.3s ease", // Hiệu ứng chuyển màu khi hover
                ":hover": { backgroundColor: "#f5f5f5" }, // Màu nền khi hover
              }}
            >
              {/* Cột Rank */}
              <Col span={2}>
                <div
                  className="Rank-list"
                  style={{
                    backgroundColor:
                      user.rank === 1
                        ? "#fadb14" // Màu vàng cho rank 1
                        : user.rank === 2
                        ? "#d9d9d9" // Màu bạc cho rank 2
                        : user.rank === 3
                        ? "#fa8c16" // Màu đồng cho rank 3
                        : "#fff", // Màu trắng cho các rank khác
                  }}
                >
                  {user.rank} {/* Hiển thị thứ hạng */}
                </div>
              </Col>
              {/* Cột User */}
              <Col
                span={6}
                style={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                }}
              >
                <Avatar
                  alt={user.name} // Tên người dùng làm alt cho hình ảnh
                  size={36} // Kích thước avatar
                  src={user.avatarUrl} // URL hình ảnh avatar
                  style={{
                    marginRight: "10px", // Khoảng cách bên phải avatar
                  }}
                />
                {user.name} {/* Hiển thị tên người dùng */}
              </Col>
              {/* Cột Badge */}
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
                  style={{ backgroundColor: tierColors[user.tier] || "#fff" }} // Màu nền dựa trên tier của người dùng
                >
                  {user.tier} {/* Hiển thị tier của người dùng */}
                </div>
              </Col>
              {/* Cột Smoke-Free Days */}
              <Col
                span={4}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {user.days} {/* Hiển thị số ngày không hút thuốc */}
              </Col>
              {/* Cột Points */}
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
            {index < data.length - 1 && <Divider style={{ margin: "0" }} />} {/* Thêm đường phân cách giữa các người dùng, trừ người cuối */}
          </React.Fragment>
        ))
      )}
    </div>
  );
  // Kết thúc hàm renderLeaderboard

  return (
    <div className="Leaderboard-Backgroup"> {/* Container chính của trang Leaderboard */}
      {/* Phần chào mừng */}
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
              marginBottom: "5px",
              fontWeight: "700",
              fontSize: "30px",
            }}
          >
            Leaderboard {/* Tiêu đề trang */}
          </h2>
          <p style={{ color: "#595959", margin: 0 }}>
            Track your progress and others' in the smoking cessation journey {/* Mô tả trang */}
          </p>
        </div>
      </div>

      
      {/* Card hiển thị thông tin người dùng hiện tại */}
      <Card className="user-highlight-card">
        <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="user-avatar-container">
                <Avatar
                  alt="User" // Alt cho avatar của người dùng
                  src={user?.avatarUrl} // URL avatar của người dùng
                  style={{
                    width: 60,
                    height: 60, // Kích thước avatar
                  }}
                />
                <span className="user-rank">
                  {currentUserData?.rank || "N/A"} {/* Hiển thị thứ hạng của người dùng hiện tại */}
                </span>
              </div>
              <div className="user-info" style={{ marginLeft: "16px" }}>
                <div className="user-name" style={{ marginTop: "0px" }}>
                  {user?.name || "User"} {/* Hiển thị tên người dùng hoặc "User" nếu không có */}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    className="user-tier"
                    style={{
                      backgroundColor:
                        tierColors[currentUserData?.tier || "Bronze"] ||
                        "#FFFBEB", // Màu nền tier của người dùng hiện tại
                    }}
                  >
                    {currentUserData?.tier || "Bronze"} {/* Hiển thị tier của người dùng */}
                  </div>
                  <p className="user-days">
                    {currentUserData?.consecutiveSmokFreeDays || 0} days on the streak {/* Hiển thị số ngày không hút thuốc */}
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
              <div className="user-points-title">Points</div> {/* Tiêu đề cột điểm */}
              <div className="user-points-value">
                {timeRange === "weekly"
                  ? currentUserData?.weeklyPoints || 0 // Điểm tuần
                  : timeRange === "monthly"
                  ? currentUserData?.monthlyPoints || 0 // Điểm tháng
                  : currentUserData?.totalPoints || 0} {/* Tổng điểm */}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="user-rank-title">Rank</div> {/* Tiêu đề cột thứ hạng */}
              <div className="user-rank-value">
                {currentUserData?.rank || "N/A"} {/* Hiển thị thứ hạng */}
                <ArrowUpOutlined style={{ color: "#52c41a" }} /> {/* Icon mũi tên lên */}
              </div>
            </div>
            <Link to="/profile">
              <Button type="primary" className="view-profile-button">
                View Profile {/* Nút điều hướng đến trang profile */}
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>
      {/* Hiển thị top 3 người dùng */}
      <Row
        gutter={[{ xs: 8, sm: 16, md: 24 }, 16]}
        style={{ marginBottom: "20px" }}
      >
        {filteredLeaderboardData.slice(0, 3).map((user) => ( // Lấy 3 người dùng đầu tiên
          <Col xs={24} sm={12} md={8} key={user.id}>
            <Card
              className="flex flex-col items-center text-center shadow-lg"
              style={{
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: user.rank === 1 ? "#fffbe6" : "#ffffff", // Màu nền đặc biệt cho rank 1
                height: "310px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Hiệu ứng bóng
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
                    alt={user.name} // Alt cho avatar
                    src={user.avatarUrl} // URL avatar
                    size={64} // Kích thước avatar
                    style={{
                      display: "block",
                      border:
                        user.rank === 1
                          ? "2px solid #fadb14" // Viền vàng cho rank 1
                          : "2px solid transparent", // Viền trong suốt cho các rank khác
                    }}
                  />
                  <div
                    className="Rank-avatar"
                    style={{
                      backgroundColor:
                        user.rank === 1
                          ? "#fadb14" // Màu vàng cho rank 1
                          : user.rank === 2
                          ? "#d9d9d9" // Màu bạc cho rank 2
                          : "#fa8c16", // Màu đồng cho rank 3
                    }}
                  >
                    {user.rank} {/* Hiển thị thứ hạng */}
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
                  {user.name} {/* Hiển thị tên người dùng */}
                </Title>
                <div
                  className="user-tier"
                  style={{ backgroundColor: tierColors[user.tier] || "#fff" }} // Màu nền tier
                >
                  {user.tier} {/* Hiển thị tier */}
                </div>
                <Text style={{ color: "#666" }}>
                  {user.days} smoke-free days {/* Hiển thị số ngày không hút thuốc */}
                </Text>
                <Text strong style={{ fontSize: "1.125rem" }}>
                  {timeRange === "weekly"
                    ? user.weeklyPoints // Điểm tuần
                    : timeRange === "monthly"
                    ? user.monthlyPoints // Điểm tháng
                    : user.totalPoints}{" "}
                  points {/* Tổng điểm */}
                </Text>
                {user.rank === 1 && (
                  <TrophyOutlined
                    style={{
                      marginTop: "8px",
                      fontSize: "24px",
                      color: "#fadb14", // Icon cúp vàng cho rank 1
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {/* Nút chọn khoảng thời gian (weekly, monthly, all time) */}
      <Segmented
        className="custom-segmented"
        options={[
          { label: "This Week", value: "weekly" }, // Nút tuần
          { label: "This Month", value: "monthly" }, // Nút tháng
          { label: "All Time", value: "all" }, // Nút tất cả
        ]}
        value={timeRange} // Giá trị hiện tại của timeRange
        onChange={setTimeRange} // Hàm xử lý khi thay đổi lựa chọn
        style={{ marginTop: "24px", marginBottom: "14px" }} // Style cho component Segmented
        block // Chiếm toàn bộ chiều rộng
      />
      {/* Hiển thị bảng xếp hạng dựa trên timeRange */}
      {loading ? ( // Nếu đang tải dữ liệu
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" /> {/* Hiển thị spinner loading */}
          <p style={{ marginTop: "16px" }}>Loading leaderboard...</p> {/* Thông báo đang tải */}
        </div>
      ) : (
        <>
          {timeRange === "weekly" &&
            renderLeaderboard(
              filteredLeaderboardData,
              "This Week's Leaderboard"
            )} {/* Bảng xếp hạng tuần */}
          {timeRange === "monthly" &&
            renderLeaderboard(
              filteredLeaderboardData,
              "This Month's Leaderboard"
            )} {/* Bảng xếp hạng tháng */}
          {timeRange === "all" &&
            renderLeaderboard(filteredLeaderboardData, "All Time Leaderboard")} {/* Bảng xếp hạng tất cả */}
        </>
      )}
      {/* Phần hướng dẫn cách tính điểm */}
      <Card className="points-card">
        <Title level={3} className="card-title">
          How Points are Calculated {/* Tiêu đề phần hướng dẫn */}
        </Title>
        <Text className="card-subtitle">
          Understand how we calculate points and rankings {/* Mô tả phần hướng dẫn */}
        </Text>
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          {/* Cột Daily Progress */}
          <Col span={8}>
            <div className="points-column">
              <ClockCircleOutlined className="column-icon" /> {/* Icon đồng hồ */}
              <Text strong className="column-title">
                Daily Progress {/* Tiêu đề cột */}
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  Accumulated smoke-free days: +8 points each {/* Điểm cho mỗi ngày không hút thuốc */}
                </Text>
                <Text className="points-item">
                  Consecutive smoke-free days: +2 bonus each {/* Điểm thưởng cho chuỗi ngày không hút thuốc */}
                </Text>
                <Text className="points-item">Record a craving: +4 points</Text> {/* Điểm cho việc ghi lại cơn thèm */}
                <Text className="points-item" style={{ color: "#ff4d4f" }}>
                  Smoking incident: -15 points {/* Điểm trừ khi hút thuốc */}
                </Text>
              </div>
            </div>
          </Col>
          {/* Cột Streak Bonuses */}
          <Col span={8}>
            <div className="points-column">
              <FileDoneOutlined className="column-icon" /> {/* Icon tài liệu */}
              <Text strong className="column-title">
                Streak Bonuses {/* Tiêu đề cột */}
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  7-day consecutive streak: +40 points {/* Điểm thưởng cho chuỗi 7 ngày */}
                </Text>
                <Text className="points-item">
                  30-day consecutive streak: +150 points {/* Điểm thưởng cho chuỗi 30 ngày */}
                </Text>
                <Text className="points-item" style={{ color: "#faad14" }}>
                  Consecutive streaks reset after smoking {/* Chuỗi ngày liên tục reset khi hút thuốc */}
                </Text>
                <Text className="points-item" style={{ color: "#52c41a" }}>
                  Accumulated progress never resets {/* Tiến độ tích lũy không reset */}
                </Text>
              </div>
            </div>
          </Col>
          {/* Cột Leaderboard Views */}
          <Col span={8}>
            <div className="points-column">
              <UserOutlined className="column-icon" /> {/* Icon người dùng */}
              <Text strong className="column-title">
                Leaderboard Views {/* Tiêu đề cột */}
              </Text>
              <div className="points-list">
                <Text className="points-item">
                  Weekly: Points from last 7 days {/* Bảng xếp hạng tuần: Điểm 7 ngày qua */}
                </Text>
                <Text className="points-item">
                  Monthly: Points from last 30 days {/* Bảng xếp hạng tháng: Điểm 30 ngày qua */}
                </Text>
                <Text className="points-item">
                  All Time: Total accumulated points {/* Bảng xếp hạng tất cả: Tổng điểm tích lũy */}
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LeaderboardPage; // Xuất component LeaderboardPage để sử dụng ở nơi khác