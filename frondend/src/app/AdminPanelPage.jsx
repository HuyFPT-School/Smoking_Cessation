import "../App.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommunityBlogPage from "./CommunityBlogPage";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  UserOutlined,
  CheckCircleOutlined,
  AreaChartOutlined,
  RiseOutlined,
  MessageOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Descriptions, Avatar, Modal, Spin, Alert, Button } from "antd";

const AdminPanelPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const tabs = [
    { label: "Dashboard", path: "dashboard", icon: <DashboardOutlined /> },
    { label: "Users", path: "users", icon: <TeamOutlined /> },
    { label: "Content", path: "content", icon: <FileTextOutlined /> },
  ];

  // Lấy userId từ localStorage (đã lưu khi đăng nhập)
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  // Gọi API lấy dashboard
  const fetchAdminDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/dashboard");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load dashboard data");
    }
  };

  // Gọi API lấy danh sách user (tùy theo quyền của người gọi)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/users?currentAdminId=${userId}`);
      return res.data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        days: u.daysSmokeFree,
        avatarUrl: u.avatarUrl,
      }));
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load user list");
    }
  };

  const deleteUserById = async (targetUserId) => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/delete-user/${targetUserId}?currentAdminId=${userId}`);
      alert("✅ User deleted successfully");
      fetchUsers().then(setUsers); // load lại danh sách
    } catch (err) {
      console.error("❌ Delete failed", err);
      const message =
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data || "Failed to delete user";
      alert(`❌ ${message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && (activeAdminTab === "dashboard" || activeAdminTab === "users")) {
        setError("Please log in to access this page");
        navigate("/login");
      }
    });

    if (activeAdminTab === "dashboard") {
      setIsLoading(true);
      setError(null);
      fetchAdminDashboard()
        .then((data) => {
          setDashboardStats(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load dashboard data", err);
          setError(err.message);
          setIsLoading(false);
          if (err.message.includes("log in")) {
            navigate("/login");
          }
        });
    } else if (activeAdminTab === "users") {
      setIsLoading(true);
      setError(null);
      fetchUsers()
        .then((data) => {
          setUsers(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load user list", err);
          setError(err.message);
          setIsLoading(false);
          if (err.message.includes("log in")) {
            navigate("/login");
          }
        });
    }

    return () => unsubscribe();
  }, [activeAdminTab, navigate]);

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const handleDeleteUser = (user) => {
    setOpenMenu(null);
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      deleteUserById(user.id);
    }
  };

  const handleUserProfile = async (user) => {
    setIsModalOpen(true);
    setLoadingUserDetail(true);
    setSelectedUser(user);

    try {
      const response = await axios.get(`http://localhost:8080/api/admin/user/${user.id}`);
      console.log("Fetched data:", response.data); // Xem có đúng dữ liệu không
      setUserProfile(response.data); // CHỈ LẤY PHẦN PROFILE
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
    } finally {
      setLoadingUserDetail(false);
    }
  };


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
              Admin Page
            </div>
            <div className="admin-subtitle">Manage users and platform content</div>
          </div>
        </div>
      </header>
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <a
            key={tab.path}
            href={`#${tab.path}`}
            className={`tab-item ${activeAdminTab === tab.path ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveAdminTab(tab.path);
            }}
          >
            {tab.icon} {tab.label}
          </a>
        ))}
      </div>
      <div>
        {activeAdminTab === "dashboard" && (
          <div>
            {isLoading ? (
              <Spin tip="Loading dashboard...">
                <div style={{ minHeight: 200 }} />
              </Spin>
            ) : error ? (
              <Alert
                message={error}
                type="error"
                showIcon
                action={
                  error.includes("log in") ? (
                    <Button type="primary" onClick={() => navigate("/login")}>
                      Log In
                    </Button>
                  ) : null
                }
              />
            ) : (
              <>
                <div className="dashboard-grid">
                  <div className="dashboard-card-admin">
                    <div className="card-icon">
                      <UserOutlined />
                    </div>
                    <div className="card-label">Total Users</div>
                    <div className="card-value">{dashboardStats?.totalUsers ?? "N/A"}</div>
                    <div className="card-sub">{dashboardStats?.growthRate ?? "N/A"}% from last month</div>
                  </div>
                  <div className="dashboard-card-admin">
                    <div className="card-icon">
                      <RiseOutlined />
                    </div>
                    <div className="card-label">Success Rate</div>
                    <div className="card-value">{dashboardStats?.successRate ?? "N/A"}%</div>
                    <div className="card-sub">Users who quit successfully</div>
                  </div>
                  <div className="dashboard-card-admin">
                    <div className="card-icon">
                      <MessageOutlined />
                    </div>
                    <div className="card-label">Support Requests</div>
                    <div className="card-value">N/A</div>
                    <div className="card-sub-sub">Pending responses (no API yet)</div>
                  </div>
                </div>
                <div className="section-box" style={{ marginTop: "20px" }}>
                  <div className="section-title">Platform Analytics</div>
                  <div className="dashboard-grid analytics-section">
                    <div className="analytics-card">

                      <div className="analytics-title">
                        <UserOutlined /> New Users
                      </div>
                      <div className="analytics-value">{dashboardStats?.newUsersThisMonth ?? "N/A"}</div>
                      <div className="analytics-sub">This month</div>
                    </div>
                    <div className="analytics-card">

                      <div className="analytics-title">
                        <CheckCircleOutlined style={{ color: "#52c41a" }} /> Smoke-Free Rate
                      </div>
                      <div className="analytics-value">{dashboardStats?.overallSmokeFreeRate ?? "N/A"}%</div>
                      <div className="analytics-sub">+{dashboardStats?.lastMonthSmokeFreeRate ?? "N/A"}% from last month</div>
                    </div>
                    <div className="analytics-card">

                      <div className="analytics-title">
                        <AreaChartOutlined style={{ color: "#9254de" }} /> Avg. Days Quit
                      </div>
                      <div className="analytics-value">{dashboardStats?.averageDailyUsers ?? "N/A"}</div>
                      <div className="analytics-sub">Per successful user</div>
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
                          style={{ width: `${dashboardStats?.firstWeekPercent ?? 0}%` }}
                        ></div>
                      </div>
                      <div className="progress-percent">{dashboardStats?.firstWeekPercent ?? "N/A"}%</div>
                    </div>
                  </div>
                  <div className="progress-row">
                    <div className="progress-label">First Month (8–30 days)</div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-track">
                        <div
                          className="bar-orange"
                          style={{ width: `${dashboardStats?.firstMonthPercent ?? 0}%` }}
                        ></div>
                      </div>
                      <div className="progress-percent">{dashboardStats?.firstMonthPercent ?? "N/A"}%</div>
                    </div>
                  </div>
                  <div className="progress-row">
                    <div className="progress-label">3 Months+ (90+ days)</div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-track">
                        <div
                          className="bar-green"
                          style={{ width: `${dashboardStats?.threeMonthsOrMorePercent ?? 0}%` }}
                        ></div>
                      </div>
                      <div className="progress-percent">{dashboardStats?.threeMonthsOrMorePercent ?? "N/A"}%</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {activeAdminTab === "users" && (
          <div>
            {isLoading ? (
              <Spin tip="Loading user list...">
                <div style={{ minHeight: 200 }} />
              </Spin>
            ) : error ? (
              <Alert
                message={error}
                type="error"
                showIcon
                action={
                  error.includes("log in") ? (
                    <Button type="primary" onClick={() => navigate("/login")}>
                      Log In
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className="users-wrapper">
                <div className="user-header">
                  <div>
                    <div className="user-title">User Management</div>
                    <div className="user-sub">Manage all users and their progress</div>
                  </div>
                </div>
                {users.map((user, index) => (
                  <div className="user-row" key={index}>
                    <div className="user-left">
                      <div className="avatar">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        )}
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
                        <div className="smoke-days">{user.days} days smoke-free</div>
                      </div>
                    </div>
                    <div className="user-action-wrapper">
                      <MoreOutlined className="admin-action" onClick={() => toggleMenu(index)} />
                      {openMenu === index && (
                        <div className="user-dropdown">
                          <div className="dropdown-item delete-option" onClick={() => handleDeleteUser(user)}>
                            <DeleteOutlined /> Delete User
                          </div>
                          <div className="dropdown-item" onClick={() => handleUserProfile(user)}>
                            <UserOutlined /> User Profile
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeAdminTab === "content" && (
          <div>
            <div className="section-box">
              <div className="section-title">
                <FileTextOutlined style={{ color: "#000" }} /> Admin Community Management
              </div>
              <div className="section-sub">View and manage community blog posts</div>
              <CommunityBlogPage />
            </div>
          </div>
        )}
      </div>


      <Modal
        title={ "User Profile"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {loadingUserDetail ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Spin tip="Loading..." />
          </div>
        ) : (
          <div>
            {/* Avatar và tên từ entity User */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Avatar
                size={80}
                src={selectedUser?.avatarUrl}
                icon={!selectedUser?.avatarUrl && selectedUser?.name?.[0]}
                style={{ backgroundColor: "#87d068" }}
              />
              <div style={{ fontWeight: "bold", marginTop: 8 }}>
                {selectedUser?.name || "N/A"}
              </div>

            </div>

            {/* Thông báo nếu chưa có profile */}
            {!userProfile && (
              <p style={{ marginTop: 12, color: "#888", textAlign: "center" }}>
                User này chưa điền thông tin hồ sơ.
              </p>
            )}


            {/* Bảng Descriptions */}
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Phone">{userProfile?.phone || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Birthdate">{userProfile?.birthdate || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Gender">{userProfile?.gender || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Smoking Age">{userProfile?.smokingAge ?? "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Years Smoked">{userProfile?.yearsSmoked ?? "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Occupation">{userProfile?.occupation || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Health Status">{userProfile?.healthStatus || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Bio">{userProfile?.bio || "No bio provided."}</Descriptions.Item>
            </Descriptions>
          </div>
        )}


      </Modal>


    </div>
  ); // Added the missing closing parenthesis here
};

export default AdminPanelPage;