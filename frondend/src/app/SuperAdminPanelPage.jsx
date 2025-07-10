import "../App.css";
import React, { useState, useEffect, useCallback } from "react";
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
  SearchOutlined,
} from "@ant-design/icons";
import { Descriptions, Avatar, Modal, Spin, Alert, Button, Input } from "antd";

const SuperAdminPanelPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  // State lưu từ khóa tìm kiếm cho tab người dùng thường
  const [userSearchTerm, setUserSearchTerm] = useState("");
  // State lưu từ khóa tìm kiếm cho tab quản trị viên
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  // Danh sách người dùng đã lọc theo từ khóa tìm kiếm
  const [filteredUsers, setFilteredUsers] = useState([]);
  // Danh sách quản trị viên đã lọc theo từ khóa tìm kiếm
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const navigate = useNavigate();

  const tabs = [
    { label: "Dashboard", path: "dashboard", icon: <DashboardOutlined /> },
    { label: "Users", path: "users", icon: <TeamOutlined /> },
    { label: "Admins", path: "admins", icon: <TeamOutlined /> },
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
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/users?currentAdminId=${userId}`);
      return res.data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        avatarUrl: u.avatarUrl,
      }));
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load user list");
    }
  }, [userId]);

  // Gọi API lấy danh sách admin (tùy theo quyền của người gọi)
  const fetchAdmins = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/admins?currentAdminId=${userId}`);
      return res.data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "N/A",
        avatarUrl: u.avatarUrl,
      }));
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load admin list");
    }
  }, [userId]);

  const demoteAdminById = async (targetAdminId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/demote/${targetAdminId}?currentAdminId=${userId}`
      );
      alert("✅ Admin demoted to USER successfully");
      fetchUsers().then(setUsers); // load lại danh sách người dùng
    } catch (err) {
      console.error("❌ Demotion failed", err);
      const message =
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data || "Failed to demote admin";
      alert(`❌ ${message}`);
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

  const promoteUserToAdmin = async (targetUserId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/promote/${targetUserId}?currentAdminId=${userId}`
      );
      alert("✅ User promoted to ADMIN successfully");
      fetchUsers().then(setUsers); // load lại danh sách
    } catch (err) {
      console.error("❌ Promote failed", err);
      const message =
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data || "Failed to promote user";
      alert(`❌ ${message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && (activeAdminTab === "dashboard" || activeAdminTab === "users" || activeAdminTab === "admin")) {
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
          // Khởi tạo danh sách người dùng đã lọc với toàn bộ dữ liệu ban đầu
          setFilteredUsers(data);
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
    } else if (activeAdminTab === "admins") {
      setIsLoading(true);
      setError(null);
      fetchAdmins()
        .then((data) => {
          setAdmins(data);
          // Khởi tạo danh sách quản trị viên đã lọc với toàn bộ dữ liệu ban đầu
          setFilteredAdmins(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load admin list", err);
          setError(err.message);
          setIsLoading(false);
          if (err.message.includes("log in")) {
            navigate("/login");
          }
        });
    }

    return () => unsubscribe();
  }, [activeAdminTab, navigate, fetchUsers, fetchAdmins, userId]);

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const handleDemoteAdmin = (user) => {
    setOpenMenu(null);
    if (window.confirm(`Are you sure you want to demote admin ${user.name}?`)) {
      demoteAdminById(user.id);
    }
  };
  const handleDeleteUser = (user) => {
    setOpenMenu(null);
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      deleteUserById(user.id);
    }
  };
  const handlePromoteAdmin = (user) => {
    setOpenMenu(null);
    if (window.confirm(`Are you sure you want to promote user ${user.name}?`)) {
      promoteUserToAdmin(user.id);
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

  // Effect hook để lọc danh sách người dùng thường khi từ khóa tìm kiếm hoặc danh sách người dùng thay đổi
  useEffect(() => {
    if (userSearchTerm.trim() === "") {
      // Nếu từ khóa tìm kiếm trống, hiển thị tất cả người dùng
      setFilteredUsers(users);
    } else {
      // Tìm kiếm không phân biệt hoa thường
      const lowerCaseSearchTerm = userSearchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.email.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
  }, [userSearchTerm, users]);

  // Effect hook để lọc danh sách quản trị viên khi từ khóa tìm kiếm hoặc danh sách quản trị viên thay đổi
  useEffect(() => {
    if (adminSearchTerm.trim() === "") {
      // Nếu từ khóa tìm kiếm trống, hiển thị tất cả quản trị viên
      setFilteredAdmins(admins);
    } else {
      // Tìm kiếm không phân biệt hoa thường
      const lowerCaseSearchTerm = adminSearchTerm.toLowerCase();
      setFilteredAdmins(
        admins.filter(
          (admin) =>
            admin.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            admin.email.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
  }, [adminSearchTerm, admins]);

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
              SuperAdmin Page
            </div>
            <div className="admin-subtitle">Manage users/admins and platform content</div>
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
                  <div className="user-search">
                    <Input
                      placeholder="Search by name or email"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                  </div>
                </div>
                {filteredUsers.map((user, index) => (
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
                    <div className="user-action-wrapper">
                      <MoreOutlined className="admin-action" onClick={() => toggleMenu(index)} />
                      {openMenu === index && (
                        <div className="user-dropdown">
                          <div className="dropdown-item" onClick={() => handlePromoteAdmin(user)}>
                            <UserOutlined /> Promote to Admin
                          </div>
                          <div className="dropdown-item" onClick={() => handleUserProfile(user)}>
                            <UserOutlined /> User Profile
                          </div>
                          <div className="dropdown-item delete-option" onClick={() => handleDeleteUser(user)}>
                            <DeleteOutlined /> Delete User
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

        {activeAdminTab === "admins" && (
          <div>
            {isLoading ? (
              <Spin tip="Loading admin list...">
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
                    <div className="user-title">Admin Management</div>
                    <div className="user-sub">Manage all admins and their progress</div>
                  </div>
                  <div className="user-search">
                    <Input
                      placeholder="Search by name or email"
                      value={adminSearchTerm}
                      onChange={(e) => setAdminSearchTerm(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                  </div>
                </div>
                {filteredAdmins.map((user, index) => (
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
                    <div className="user-action-wrapper">
                      <MoreOutlined className="admin-action" onClick={() => toggleMenu(index)} />
                      {openMenu === index && (
                        <div className="user-dropdown">
                          <div className="dropdown-item delete-option" onClick={() => handleDemoteAdmin(user)}>
                            <DeleteOutlined /> Demote Admin
                          </div>
                          <div className="dropdown-item" onClick={() => handleUserProfile(user)}>
                            <UserOutlined /> Admin Profile
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
                <FileTextOutlined style={{ color: "#000" }} /> SuperAdmin Community Management
              </div>
              <div className="section-sub">View and manage community blog posts</div>
              <CommunityBlogPage />
            </div>
          </div>
        )}
      </div>
      <Modal
        title={
          selectedUser?.role === "ADMIN"
            ? "ADMIN Profile"
            : "User Profile"
        }
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
                {selectedUser?.role === "ADMIN"
                  ? "Admin này chưa điền thông tin hồ sơ."
                  : "User này chưa điền thông tin hồ sơ."}
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

export default SuperAdminPanelPage;