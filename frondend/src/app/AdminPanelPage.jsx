import "../App.css";
import React, { useState, useEffect } from "react";
import CommunityBlogPage from "./CommunityBlogPage";
import {
  UserOutlined,
  CheckCircleOutlined,
  AreaChartOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  RiseOutlined,
  MessageOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
  // Đã xóa các import không còn sử dụng sau khi loại bỏ Notifications, Reports, Analytics, Edit, và Add User
} from "@ant-design/icons";
// Đã xóa import useLocation và useNavigate vì không sử dụng

const AdminPanelPage = () => {
  // Sử dụng useState để theo dõi tab hiện tại thay vì dựa vào URL
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");

  const [progressData, setProgressData] = useState({
    firstWeek: 25,
    firstMonth: 35,
    threeMonths: 40,
  });

  useEffect(() => {
    setTimeout(() => {
      setProgressData({
        firstWeek: 25,
        firstMonth: 35,
        threeMonths: 40,
      });
    }, 500);
  }, []);
  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      days: 45,
      // Đã xóa coach property theo yêu cầu
      // Đã xóa status property
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
      days: 29,
      // Đã xóa coach property theo yêu cầu
      // Đã xóa status property
    },
    {
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "+1 234 567 8902",
      days: 40,
      // Đã xóa coach property theo yêu cầu
      // Đã xóa status property
    },
  ]; // Đã xóa defaultPosts, activeTab, posts, isLoading (không còn cần thiết)
  // State để theo dõi dropdown menu đang mở
  const [openMenu, setOpenMenu] = useState(null); // Đã xóa useEffect fetch posts - không cần thiết vì sẽ sử dụng CommunityBlogPage
  const tabs = [
    { label: "Dashboard", path: "dashboard", icon: <DashboardOutlined /> },
    { label: "Users", path: "users", icon: <TeamOutlined /> },
    { label: "Content", path: "content", icon: <FileTextOutlined /> },
    // Đã xóa tab Notifications, Reports và Analytics theo yêu cầu
  ];

  // Hàm xử lý khi click vào icon 3 dấu chấm
  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };
  // Hàm xử lý khi click vào "Delete User"
  const handleDeleteUser = (user) => {
    // Đây là nơi để thêm logic xóa user thực tế (gọi API, etc.)
    alert(`Deleting user: ${user.name}`);
    setOpenMenu(null);
  };

  // Hàm xử lý khi click vào "Update to Admin"
  const handleUpdateToAdmin = (user) => {
    // Đây là nơi để thêm logic update user thành admin (gọi API, etc.)
    alert(`Updating user: ${user.name} to Admin role`);
    setOpenMenu(null);
  };
  // Đã xóa các biến và effect của notifications không còn sử dụng
  // Logs dữ liệu mẫu - Comment lại vì hiện tại chưa được sử dụng
  // Có thể dùng sau này để hiển thị trong tab System Logs
  /*
  const logs = [
    {
      timestamp: "2024-03-15 14:32:45",
      level: "Error",
      message: "Database connection failed: timeout after 30s",
      source: "Database",
      user: "System",
    },
    {
      timestamp: "2024-03-15 14:30:12",
      level: "Info",
      message: "User authentication successful",
      source: "Auth",
      user: "john@example.com",
    },
    {
      timestamp: "2024-03-15 14:28:56",
      level: "Warning",
      message: "High CPU usage detected: 85%",
      source: "System",
      user: "System",
    },
    {
      timestamp: "2024-03-15 14:25:33",
      level: "Info",
      message: "Scheduled notification sent to 156 users",
      source: "Notification",
      user: "admin@breathefree.com",
    },
    {
      timestamp: "2024-03-15 14:28:18",
      level: "Success",
      message: "Database backup completed successfully",
      source: "Backup",
      user: "System",
    },
    {
      timestamp: "2024-03-15 14:15:42",
      level: "Error",
      message: "API rate limit exceeded for external service",
      source: "API",
      user: "System",
    },
  ];
  */
  // Đã xóa các biến và hàm xử lý cho reports không còn sử dụng

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <header className="admin-header">
        <div className="admin-header-top">
          <div className="admin-logo">
            <div className="admin-logo-title">
              <span role="img" aria-label="shield">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3.75L4.875 6.375v4.41c0 5.13 3.492 9.716 7.125 10.465 3.633-.749 7.125-5.335 7.125-10.465v-4.41L12 3.75z"
                  />
                </svg>
              </span>
              Admin Dashboard
            </div>
            <div className="admin-subtitle">
              Manage users and platform content
            </div>
          </div>
          {/* Đã xóa buttons Settings và Add Coach theo yêu cầu */}
        </div>
      </header>
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <a
            key={tab.path}
            href={`#${tab.path}`}
            className={`tab-item ${
              activeAdminTab === tab.path ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveAdminTab(tab.path);
            }}
          >
            {tab.icon} {tab.label}
          </a>
        ))}
      </div>
      {activeAdminTab === "dashboard" && (
        <div>
          <div className="dashboard-grid">
            <div className="dashboard-card-admin">
              <div className="card-icon">
                <UserOutlined />
              </div>
              <div className="card-label">Total Users</div>
              <div className="card-value">1.247</div>
              <div className="card-sub">+15.2% from last month</div>
            </div>
            {/* Đã xóa Active Users card theo yêu cầu */}
            <div className="dashboard-card-admin">
              <div className="card-icon">
                <RiseOutlined />
              </div>
              <div className="card-label">Success Rate</div>
              <div className="card-value">68%</div>
              <div className="card-sub">Users who quit successfully</div>
            </div>
            <div className="dashboard-card-admin">
              <div className="card-icon">
                <MessageOutlined />
              </div>
              <div className="card-label">Support Requests</div>
              <div className="card-value">23</div>
              <div className="card-sub">Pending responses</div>
            </div>
          </div>
          <div className="section-box" style={{ marginTop: "20px" }}>
            <div className="section-title">Platform Analytics</div>
            <div className="dashboard-grid analytics-section">
              <div className="analytics-card">
                <div className="analytics-title">
                  <UserOutlined /> New Users
                </div>
                <div className="analytics-value">156</div>
                <div className="analytics-sub">This month</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-title">
                  <CheckCircleOutlined style={{ color: "#52c41a" }} /> Success
                  Rate
                </div>
                <div className="analytics-value">68%</div>
                <div className="analytics-sub">+5% from last month</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-title">
                  <AreaChartOutlined style={{ color: "#9254de" }} /> Avg. Days
                  Quit
                </div>
                <div className="analytics-value">42</div>
                <div className="analytics-sub">Per successful user</div>
              </div>
              {/* Đã xóa Engagement analytics card theo yêu cầu */}
            </div>
          </div>
          <div className="section-box">
            <div className="section-title">User Progress Distribution</div>

            <div className="progress-row">
              <div className="progress-label">First Week (1–7 days)</div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <div
                    className="bar-red"
                    style={{ width: `${progressData.firstWeek}%` }}
                  ></div>
                </div>
                <div className="progress-percent">
                  {progressData.firstWeek}%
                </div>
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-label">First Month (8–30 days)</div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <div
                    className="bar-orange"
                    style={{ width: `${progressData.firstMonth}%` }}
                  ></div>
                </div>
                <div className="progress-percent">
                  {progressData.firstMonth}%
                </div>
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-label">3 Months+ (90+ days)</div>
              <div className="progress-bar-container">
                <div className="progress-bar-track">
                  <div
                    className="bar-green"
                    style={{ width: `${progressData.threeMonths}%` }}
                  ></div>
                </div>
                <div className="progress-percent">
                  {progressData.threeMonths}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeAdminTab === "users" && (
        <div>
          <div className="users-wrapper">
            <div className="user-header">
              <div>
                <div className="user-title">User Management</div>
                <div className="user-sub">
                  Manage all users and their progress
                </div>
              </div>
              {/* Đã xóa search và Add User buttons theo yêu cầu */}
            </div>

            {users.map((user, index) => (
              <div className="user-row" key={index}>
                <div className="user-left">
                  <div className="avatar">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <div className="user-contact">
                      <span>
                        <MailOutlined /> {user.email}
                      </span>
                      <span>
                        <PhoneOutlined /> {user.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="user-right">
                  <div className="right-top">
                    <div className="smoke-days">
                      {user.days} days smoke-free
                    </div>
                    {/* Đã xóa status indicator (active/inactive) theo yêu cầu */}
                  </div>
                  {/* Đã xóa thông tin Coach theo yêu cầu */}
                </div>
                <div className="user-action-wrapper">
                  <MoreOutlined
                    className="admin-action"
                    onClick={() => toggleMenu(index)}
                  />
                  {openMenu === index && (
                    <div className="user-dropdown">
                      <div
                        className="dropdown-item delete-option"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <DeleteOutlined /> Delete User
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => handleUpdateToAdmin(user)}
                      >
                        <UserOutlined /> Update to Admin
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}{" "}
      {activeAdminTab === "content" && (
        <div>
          <div className="section-box">
            <div className="section-title">
              <FileTextOutlined style={{ color: "#000" }} /> Community Blog
            </div>
            <div className="section-sub">
              View and manage community blog posts
            </div>

            {/* Embed the CommunityBlogPage component */}
            <CommunityBlogPage />
          </div>
        </div>
      )}
      {/* Đã xóa các tab Notifications và Reports theo yêu cầu */}
    </div>
  );
};

export default AdminPanelPage;
