import "../App.css";
import React, { useState, useEffect } from "react";
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
  LineChartOutlined as AnalyticsIcon,
  FileTextOutlined,
  BellOutlined,
  FileSearchOutlined,
  SettingOutlined,
  DatabaseOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  ExportOutlined,
  PieChartFilled,
  AppstoreOutlined,
  UserAddOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const AdminPanelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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
      coach: "Dr. Sarah Johnson",
      status: "Active",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
      days: 29,
      coach: "Dr. Michael Chen",
      status: "Inactive",
    },
    {
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "+1 234 567 8902",
      days: 40,
      coach: "Dr. Sarah Johnson",
      status: "Active",
    },
  ];

  const defaultPosts = [
    {
      title: "10 Strategies to Overcome Nicotine Cravings",
      category: "Tips & Strategies",
      date: "2024-03-15",
      views: 1245,
    },
    {
      title: "The Science Behind Nicotine Addiction",
      category: "Education",
      date: "2024-03-10",
      views: 987,
    },
    {
      title: "Success Stories: How I Quit After 20 Years",
      category: "Success Stories",
      date: "2024-03-20",
      views: 0,
    },
  ];

  const defaultResources = [
    {
      title: "Quit Smoking Guidebook",
      type: "PDF",
      category: "Guide",
      downloads: 567,
    },
    {
      title: "Breathing Exercises for Cravings",
      type: "Video",
      category: "Exercise",
      downloads: 423,
    },
    {
      title: "Frequently Asked Questions",
      type: "FAQ",
      category: "Information",
      downloads: 312,
    },
  ];

  const [activeTab, setActiveTab] = useState("Blog Posts");
  const [posts, setPosts] = useState(defaultPosts);
  const [resources, setResources] = useState(defaultResources);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {
        setPosts(defaultPosts);
      });

    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setResources(data);
      })
      .catch(() => {
        setResources(defaultResources);
      });
  }, []);

  const tabs = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlined /> },
    { label: "Users", path: "/users", icon: <TeamOutlined /> },
    { label: "Analytics", path: "/analytics", icon: <AnalyticsIcon /> },
    { label: "Content", path: "/content", icon: <FileTextOutlined /> },
    { label: "Notifications", path: "/notifications", icon: <BellOutlined /> },
    { label: "Reports", path: "/reports", icon: <FileSearchOutlined /> },
  ];

  const [timing, setTiming] = useState("immediate");
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      setNotifications([
        {
          title: "New Feature: Chat with Coach",
          type: "Announcement",
          sentTo: "All Users",
          time: "2024-03-15 14:30",
          openRate: "78%",
          status: "Delivered",
        },
        {
          title: "Weekly Challenge: 7 Days Smoke-Free",
          type: "Challenge",
          sentTo: "Active Users",
          time: "2024-03-10 09:15",
          openRate: "82%",
          status: "Delivered",
        },
        {
          title: "Maintenance Notice: System Update",
          type: "System",
          sentTo: "All Users",
          time: "2024-03-05 18:00",
          openRate: "65%",
          status: "Delivered",
        },
      ]);
    }, 500);
  }, []);

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

  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRangeChange = (e) => {
    const value = e.target.value;
    setSelectedRange(value);
    setShowCustomDates(value === "Custom Range");
    if (value !== "Custom Range") {
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
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
              Manage users, analytics, and platform settings
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-outline">
              <SettingOutlined /> Settings
            </button>
            <button className="btn-primary">
              <UserAddOutlined /> Add Coach
            </button>
          </div>
        </div>
      </header>

      <div className="nav-tabs">
        {tabs.map((tab) => (
          <a
            key={tab.path}
            href={tab.path}
            className={`tab-item ${currentPath === tab.path ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(tab.path);
            }}
          >
            {tab.icon} {tab.label}
          </a>
        ))}
      </div>

      {currentPath === "/" && navigate("/dashboard")}
      {currentPath === "/dashboard" && (
        <div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">
                <UserOutlined />
              </div>
              <div className="card-value">1.247</div>
              <div className="card-label">Total Users</div>
              <div className="card-sub">+15.2% from last month</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">
                <CheckCircleOutlined />
              </div>
              <div className="card-value">892</div>
              <div className="card-label">Active Users</div>
              <div className="card-sub">72% of total users</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">
                <RiseOutlined />
              </div>
              <div className="card-value">68%</div>
              <div className="card-label">Success Rate</div>
              <div className="card-sub">Users who quit successfully</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">
                <MessageOutlined />
              </div>
              <div className="card-value">23</div>
              <div className="card-label">Support Requests</div>
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
              <div className="analytics-card">
                <div className="analytics-title">
                  <BarChartOutlined style={{ color: "#fa8c16" }} /> Engagement
                </div>
                <div className="analytics-value">87%</div>
                <div className="analytics-sub">Daily active users</div>
              </div>
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

      {currentPath === "/users" && (
        <div>
          <div className="users-wrapper">
            <div className="user-header">
              <div>
                <div className="user-title">User Management</div>
                <div className="user-sub">
                  Manage all users and their progress
                </div>
              </div>
              <div className="search-add">
                <input className="search-box" placeholder="Search users..." />
                <button className="add-user-btn">
                  <PlusOutlined /> Add User
                </button>
              </div>
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
                    <span
                      className={`badge ${
                        user.status !== "Active" ? "inactive" : ""
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="coach">Coach: {user.coach}</div>
                </div>
                <MoreOutlined className="user-action" />
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPath === "/analytics" && (
        <div>
          <div className="section-box">
            <div className="section-title">📊 Platform Analytics</div>
            <div className="section-sub">
              Overview of platform performance and user engagement
            </div>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-title">
                  <UserAddOutlined /> New Users
                </div>
                <div className="card-value">156</div>
                <div className="card-title">This month</div>
              </div>
              <div className="analytics-card">
                <div className="card-title">
                  <RiseOutlined /> Success Rate
                </div>
                <div className="card-value">68%</div>
                <div className="card-title">+5% from last month</div>
              </div>
              <div className="analytics-card">
                <div className="card-title">
                  <FieldTimeOutlined /> Avg. Days Quit
                </div>
                <div className="card-value">42</div>
                <div className="card-title">Per successful user</div>
              </div>
              <div className="analytics-card">
                <div className="card-title">
                  <BarChartOutlined /> Engagement
                </div>
                <div className="card-value">87%</div>
                <div className="card-title">Daily active users</div>
              </div>
            </div>
          </div>

          <div className="section-box">
            <div className="section-title">📈 User Progress Distribution</div>
            <div className="section-sub">
              Breakdown of users by their quit journey stage
            </div>

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

      {currentPath === "/content" && (
        <div>
          <div className="section-box">
            <div className="section-title">
              <FileTextOutlined style={{ color: "#000" }} /> Content Management
            </div>
            <div className="section-sub">
              Manage all content including blog posts, resources, and FAQs
            </div>

            <div className="content-header">
              <div className="content-tabs">
                <button
                  className={`tab-btn ${
                    activeTab === "Blog Posts" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("Blog Posts")}
                >
                  Blog Posts
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "Resources" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("Resources")}
                >
                  Resources
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "Create New" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("Create New")}
                >
                  + Create New
                </button>
              </div>
              <input
                className="search-box"
                placeholder={
                  activeTab === "Resources"
                    ? "Search resources..."
                    : "Search posts..."
                }
              />
            </div>

            {activeTab === "Blog Posts" && (
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr key={index}>
                      <td>{post.title}</td>
                      <td>{post.category}</td>
                      <td>{post.date}</td>
                      <td>{post.views}</td>
                      <td>
                        <span className="actions">
                          <EyeOutlined className="action-icon" />
                          <EditOutlined className="action-icon" />
                          <DeleteOutlined className="action-icon delete" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Resources" && (
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Downloads</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((res, index) => (
                    <tr key={index}>
                      <td className="title-cell">
                        <span>
                          {res.type === "PDF" && <span>📄</span>}
                          {res.type === "Video" && <span>📹</span>}
                          {res.type === "FAQ" && <span>❓</span>}
                        </span>
                        <span style={{ color: "#000000" }}>{res.title}</span>
                      </td>
                      <td>{res.type}</td>
                      <td>{res.category}</td>
                      <td>{res.downloads}</td>
                      <td>
                        <span className="actions">
                          <EyeOutlined className="action-icon" />
                          <EditOutlined className="action-icon" />
                          <DeleteOutlined className="action-icon delete" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Create New" && (
              <div className="create-form">
                <div>
                  <label>Content Type</label>
                  <select defaultValue="Blog Post">
                    <option value="">Select Content Type</option>
                    <option value="Blog Post">Blog Post</option>
                    <option value="Resource">Resource</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                </div>
                <div>
                  <label>Category</label>
                  <select defaultValue="Tips & Strategies">
                    <option value="">Select Category</option>
                    <option value="Tips & Strategies">Tips & Strategies</option>
                    <option value="Education">Education</option>
                    <option value="Success Stories">Success Stories</option>
                    <option value="Research & Studies">
                      Research & Studies
                    </option>
                  </select>
                </div>
                <div className="full-width">
                  <label>Title</label>
                  <input type="text" placeholder="Enter content title" />
                </div>
                <div className="full-width">
                  <label>Content</label>
                  <textarea placeholder="Write your content here..."></textarea>
                </div>
                <div className="full-width">
                  <div className="image-upload">
                    <label>Featured Image</label>
                    <p>Drag and drop an image, or click to browse</p>
                    <button>Upload Image</button>
                  </div>
                </div>
                <div className="actions">
                  <button className="save-draft">Save as Draft</button>
                  <button className="publish">Publish</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentPath === "/notifications" && (
        <div>
          <div className="page-wrapper">
            <div className="section-title">Notification System</div>
            <div className="section-sub">
              Send notifications, announcements, and reminders to users
            </div>

            <div className="notify-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Notification Type</label>
                  <select>
                    <option>Announcement</option>
                    <option>Reminder</option>
                    <option>Challenge</option>
                    <option>Achievement</option>
                    <option>System Notice</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select>
                    <option>All Users</option>
                    <option>Active Users</option>
                    <option>Inactive Users (7+ days)</option>
                    <option>New Users (less than 30 days)</option>
                    <option>Users Reporting Cravings</option>
                  </select>
                </div>
              </div>

              <div className="form-group full">
                <label>Notification Title</label>
                <input type="text" placeholder="New Feature Announcement" />
              </div>

              <div className="form-group full">
                <label>Message</label>
                <textarea
                  placeholder="Write your notification message here..."
                  rows={4}
                />
              </div>

              <div className="form-group full">
                <label>Delivery Options</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="timing"
                      value="immediate"
                      checked={timing === "immediate"}
                      onChange={() => setTiming("immediate")}
                    />
                    <SendOutlined className="radio-icon" /> Send Immediately
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="timing"
                      value="later"
                      checked={timing === "later"}
                      onChange={() => setTiming("later")}
                    />
                    <ClockCircleOutlined className="radio-icon" /> Schedule for
                    Later
                  </label>
                </div>
              </div>

              {timing === "later" && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" />
                  </div>
                </div>
              )}

              <div className="form-group full">
                <label>Notification Channels</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked /> Push Notification
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Email
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> In-App Notification
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="preview-btn">Preview</button>
                <button className="send-btn">
                  {timing === "later" ? (
                    <>
                      <CalendarOutlined /> Schedule
                    </>
                  ) : (
                    <>
                      <SendOutlined /> Send Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="page-wrapper">
            <div className="section-title">Recent Notifications</div>
            <div className="section-sub">
              History of notifications sent to users
            </div>

            <table className="notify-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Sent To</th>
                  <th>Date & Time</th>
                  <th>Open Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n, i) => (
                  <tr key={i}>
                    <td>{n.title}</td>
                    <td>{n.type}</td>
                    <td>{n.sentTo}</td>
                    <td>{n.time}</td>
                    <td>{n.openRate}</td>
                    <td className="delivered">
                      <CheckCircleOutlined /> {n.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentPath === "/reports" && (
        <div>
          <div className="section-wrapper">
            <div className="section-title">
              <FileSearchOutlined /> Reports & Analytics
            </div>
            <div className="section-sub">
              Generate detailed reports and export data
            </div>

            <div className="top-controls">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  whiteSpace: "nowrap",
                  flexWrap: "nowrap",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Date Range:</span>
                <select value={selectedRange} onChange={handleRangeChange}>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                  <option>Custom Range</option>
                </select>
                {showCustomDates && (
                  <div className="date-range-custom">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="btn-group">
                <button>
                  <FilterOutlined /> Filters
                </button>
                <button>
                  <ReloadOutlined /> Refresh
                </button>
              </div>
            </div>

            <div className="sub-tabs">
              {[
                "User Reports",
                "Progress Reports",
                "Engagement Reports",
                "Custom Reports",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`sub-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "User Reports" && (
              <div className="report-grid">
                <div className="report-card">
                  <div>
                    <h4>
                      <UserOutlined style={{ color: "#1677ff" }} /> User
                      Registration
                    </h4>
                    <div className="report-chart">📈</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>156</strong> new users
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <PieChartOutlined style={{ color: "#52c41a" }} /> User
                      Demographics
                    </h4>
                    <div className="report-chart">🧩</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>5</strong> age groups
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <BarChartOutlined style={{ color: "#9254de" }} /> User
                      Activity
                    </h4>
                    <div className="report-chart">📊</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>87%</strong> active users
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Progress Reports" && (
              <div className="report-grid">
                <div className="report-card">
                  <div>
                    <h4>
                      <RiseOutlined style={{ color: "#10b981" }} /> Quit Success
                      Rate
                    </h4>
                    <div className="report-chart">📈</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>68%</strong> success rate
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <FieldTimeOutlined style={{ color: "#6366f1" }} /> Average
                      Days Smoke-Free
                    </h4>
                    <div className="report-chart">📊</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>42</strong> days average
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <PieChartFilled style={{ color: "#f97316" }} /> Relapse
                      Triggers
                    </h4>
                    <div className="report-chart">📉</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>5</strong> main triggers
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Engagement Reports" && (
              <div className="report-grid">
                <div className="report-card">
                  <div>
                    <h4>
                      <MessageOutlined style={{ color: "#1677ff" }} /> Coach
                      Chat Usage
                    </h4>
                    <div className="report-chart">📈</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>1,245</strong> messages
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <AppstoreOutlined style={{ color: "#10b981" }} /> Resource
                      Usage
                    </h4>
                    <div className="report-chart">📊</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>3,567</strong> downloads
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>

                <div className="report-card">
                  <div>
                    <h4>
                      <CalendarOutlined style={{ color: "#9254de" }} /> Daily
                      Check-ins
                    </h4>
                    <div className="report-chart">📈</div>
                  </div>
                  <div className="report-detail">
                    <span>
                      <strong>76%</strong> completion rate
                    </span>
                    <button className="export-btn">
                      <ExportOutlined /> Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Custom Reports" && (
              <div className="custom-report-builder">
                <h3>Custom Report Builder</h3>
                <p>Create custom reports with specific metrics and filters</p>

                <div className="input-group">
                  <div>
                    <label>Report Name</label>
                    <input
                      type="text"
                      placeholder="Enter report name"
                      style={{ borderColor: "#ccc", background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label>Report Type</label>
                    <select style={{ borderColor: "#ccc", background: "#fff" }}>
                      <option>Combined Metrics</option>
                      <option>Individual Metric</option>
                      <option>Time-based Comparison</option>
                    </select>
                  </div>
                </div>

                <label>Select Metrics</label>
                <div className="metrics">
                  <label>
                    <input type="checkbox" defaultChecked /> User Registration
                  </label>
                  <label>
                    <input type="checkbox" /> Resource Usage
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Success Rate
                  </label>
                  <label>
                    <input type="checkbox" /> Coach Chat Activity
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Average Days
                    Smoke-Free
                  </label>
                  <label>
                    <input type="checkbox" /> Daily Check-ins
                  </label>
                </div>

                <div className="buttons">
                  <button className="save-btn">Save Template</button>
                  <button className="generate-btn">
                    <BarChartOutlined /> Generate Report
                  </button>
                </div>
              </div>
            )}

            {(activeTab === "User Reports" ||
              activeTab === "Progress Reports" ||
              activeTab === "Engagement Reports") && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button className="download-full">
                  <DownloadOutlined /> Download Full Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
