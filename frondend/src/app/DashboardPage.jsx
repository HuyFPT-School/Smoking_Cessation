import { useState, useEffect } from "react"; // Hook để lưu trạng thái (state) và chạy code khi component render
import { Card, Row, Col, message, Divider, Tag, Segmented } from "antd"; // Ant Design UI components
import { Line } from "@ant-design/charts"; // Thư viện vẽ biểu đồ dạng đường
import { Link, Navigate } from "react-router-dom"; // Điều hướng trang
import { ArrowUpOutlined, DollarCircleOutlined, FireOutlined, FlagOutlined } from "@ant-design/icons"; // Icon từ Ant
import { Client } from "@stomp/stompjs"; // Thư viện STOMP để dùng WebSocket
import SockJS from "sockjs-client"; // Client hỗ trợ kết nối WebSocket

const DashboardPage = () => {
  // useState để lưu trữ dữ liệu dashboard lấy từ backend
  const [dashboardData, setDashboardData] = useState(null);

  // useState lưu dữ liệu dùng để vẽ biểu đồ
  const [chartData, setChartData] = useState([]);

  // Lưu loại biểu đồ đang chọn ("cigarettes" hoặc "averageCravingSatisfaction")
  const [chartMetric, setChartMetric] = useState("cigarettes");

  // Cờ loading để hiển thị trạng thái đang tải
  const [loading, setLoading] = useState(true);

  // Lấy userId từ localStorage (đã lưu khi đăng nhập)
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  // useEffect sẽ chạy khi component được render lần đầu
  useEffect(() => {
    // Nếu không có userId (hoặc userId không hợp lệ) thì hiện lỗi và ngưng xử lý
    if (!userId || isNaN(userId)) {
      console.error("Invalid or missing user ID:", userId);
      message.error("Invalid user ID. Please provide a valid user ID.");
      setLoading(false);
      return;
    }

    // Hàm bất đồng bộ để lấy dữ liệu từ server
    const fetchData = async () => {
      setLoading(true); // bật loading
      try {
        // 1. Gọi API để lấy dữ liệu dashboard
        const dashboardResponse = await fetch(`http://localhost:8080/api/dashboard/${userId}`);
        if (!dashboardResponse.ok) {
          throw new Error(`Failed to fetch dashboard data: ${await dashboardResponse.text()}`);
        }
        const dashboardJson = await dashboardResponse.json();
        setDashboardData(dashboardJson); // Cập nhật vào state

        // 2. Gọi API để lấy dữ liệu lịch sử (dùng cho biểu đồ)
        const historyResponse = await fetch(`http://localhost:8080/api/dashboard/history/${userId}`);
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch history data: ${await historyResponse.text()}`);
        }
        const historyJson = await historyResponse.json();

        // 3. Chuyển đổi dữ liệu thành format phù hợp cho biểu đồ
        const chartData = historyJson.map(item => ({
          day: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          cigarettes: item.cigarettes ?? 0, // Gán 0 nếu null
          averageCravingSatisfaction: item.averageCravingSatisfaction ?? 0,
        }));

        setChartData(chartData); // Cập nhật state biểu đồ
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
      }
    };

    fetchData(); // Gọi hàm lấy dữ liệu

    // Thiết lập WebSocket để nhận dữ liệu cập nhật real-time từ server
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"), // địa chỉ WebSocket
      reconnectDelay: 5000, // nếu mất kết nối thì thử lại sau 5 giây
      onConnect: () => {
        console.log("WebSocket connected");

        // Lắng nghe tin nhắn từ server tại channel tương ứng với user
        client.subscribe(`/topic/dashboard/${userId}`, async message => {
          console.log("WebSocket message received:", message.body);
          const updatedData = JSON.parse(message.body);
          setDashboardData(updatedData); // Cập nhật state dashboard

          // Sau khi nhận được dữ liệu mới, gọi lại API để cập nhật biểu đồ
          try {
            const historyResponse = await fetch(`http://localhost:8080/api/dashboard/history/${userId}`);
            if (historyResponse.ok) {
              const historyJson = await historyResponse.json();
              const chartData = historyJson.map(item => ({
                day: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
                cigarettes: item.cigarettes ?? 0,
                averageCravingSatisfaction: item.averageCravingSatisfaction ?? 0,
              }));
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

    client.activate(); // Kích hoạt kết nối WebSocket

    // Cleanup: khi rời khỏi trang thì đóng kết nối WebSocket
    return () => client.deactivate();
  }, [userId]); // useEffect sẽ chạy lại nếu userId thay đổi

  // Cấu hình cho biểu đồ mức độ thèm thuốc trung bình mỗi ngày
  const satisfactionChartConfig = {
    data: chartData, // Dữ liệu đầu vào (mỗi phần tử có { day, cigarettes, averageCravingSatisfaction })
    xField: "day",   // Trục X là "day" - ví dụ: "15/06"
    yField: "averageCravingSatisfaction", // Trục Y là mức độ thèm thuốc trung bình (0 - 10)

    height: 200,     // Chiều cao biểu đồ
    smooth: true,    // Làm mượt đường nối (đường cong)
    point: {         // Hiển thị các điểm tròn tại mỗi ngày
      size: 4,
      shape: "circle",
    },
    color: "#1890ff", // Màu đường là xanh dương (Ant Design Blue)

    // Cấu hình trục Y
    yAxis: {
      title: { text: "Trung bình Satisfaction (Thèm thuốc)" }, // Tên trục Y
      min: 0,        // Giá trị nhỏ nhất = 0
      max: 10,       // Giá trị lớn nhất = 10
      tickInterval: 1, // Khoảng cách giữa các vạch chia
    },

    // Cấu hình trục X
    xAxis: {
      title: { text: "Ngày" }, // Tên trục X
      label: {
        autoRotate: true, // Tự động xoay nhãn trục X nếu chật
        autoHide: true,   // Tự động ẩn bớt nhãn nếu quá nhiều
      },
    },

    // Tooltip hiển thị khi di chuột vào điểm dữ liệu
    tooltip: {
      showMarkers: true, // Hiện chấm tròn khi hover
      shared: false,     // Tooltip không chia sẻ giữa nhiều điểm
      formatter: datum => ({
        name: "Craving", // Tên hiển thị trong tooltip
        value: datum.averageCravingSatisfaction != null
          ? `${datum.averageCravingSatisfaction.toFixed(4)} vào ${datum.day}` // Hiện giá trị + ngày
          : "N/A", // Nếu không có giá trị
      }),
    },
  };


  // Cấu hình cho biểu đồ số điếu hút mỗi ngày
  const smokingChartConfig = {
    data: chartData,   // Dữ liệu đầu vào giống biểu đồ trên
    xField: "day",     // Trục X là ngày
    yField: "cigarettes", // Trục Y là số điếu thuốc

    height: 200,
    smooth: true,      // Làm mượt đường
    point: {
      size: 4,
      shape: "circle", // Các điểm dữ liệu dạng hình tròn
    },
    color: "#ff4d4f",  // Màu đỏ (cảnh báo, vì hút thuốc là xấu)

    yAxis: {
      title: { text: "Số lượng Smoking" }, // Tên trục Y
      min: 0, // Bắt đầu từ 0
      tickInterval: 1, // Mỗi vạch chia cách nhau 1 đơn vị
    },

    xAxis: {
      title: { text: "Ngày" }, // Tên trục X
      label: {
        autoRotate: true,
        autoHide: true,
      },
    },

    tooltip: {
      showMarkers: true,
      shared: false,
      formatter: datum => ({
        name: "Smoking",
        value: datum.cigarettes != null
          ? `${datum.cigarettes} vào ${datum.day}` // Ví dụ: "3 vào 15/06"
          : "N/A",
      }),
    },
  };


  // Nếu userId sai thì điều hướng về userId mặc định (ví dụ dashboard/1)
  if (!userId || isNaN(userId)) return <Navigate to="/dashboard/1" />;

  // Hiển thị loading khi đang tải
  if (loading) return <div>Loading...</div>;

  // Nếu không có dữ liệu dashboard (null) thì hiển thị thông báo
  if (!dashboardData) return <div>No data available.</div>;

  // Phần dưới là giao diện render (JSX) - không cần comment lại toàn bộ vì đã khá rõ
  // Nếu bạn muốn mình giải thích chi tiết phần render HTML/JSX thì mình có thể tiếp tục



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
            <p className="dashboard-card-subtext">Based on {dashboardData.cigarettesPerDay}/day</p>
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
                    ⚡{trigger}
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

      </Col>
    </div>
  );
};

export default DashboardPage;