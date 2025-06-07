import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Card,
  Typography,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  message,
  Spin,
} from "antd";
import {
  SettingOutlined,
  CameraOutlined,
  UserOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import moment from "moment";
import "../App.css";

const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Get user ID from localStorage
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profile/user/${userId}`
        );
        if (response.status === 200) {
          const profileData = response.data;
          setUserData(profileData);

          // Set form fields with existing data
          form.setFieldsValue({
            name: profileData.name,
            phone: profileData.phone,
            birthdate: profileData.birthdate
              ? moment(profileData.birthdate, "DD/MM/YYYY")
              : null,
            gender: profileData.gender,
            bio: profileData.bio,
            smokingAge: profileData.smokingAge,
            yearsSmoked: profileData.yearsSmoked,
            occupation: profileData.occupation,
            healthStatus: profileData.healthStatus,
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet, that's okay
          console.log("No profile found, user can create one");
        } else {
          console.error("Error fetching profile data:", error);
          message.error("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, form]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const handleFinish = async (values) => {
    if (!userId) {
      message.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      // Convert DatePicker value to string format DD/MM/YYYY
      if (values.birthdate) {
        values.birthdate = values.birthdate.format("DD/MM/YYYY");
      }

      // Add userId to the payload
      const profileData = {
        ...values,
        userId: userId.toString(),
      };

      const response = await axios.post(
        "http://localhost:8080/api/profile",
        profileData
      );

      if (response.status === 200) {
        setUserData(response.data);
        setIsModalVisible(false);
        message.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";

    let birthDate;
    if (typeof birthdate === "string") {
      const [day, month, year] = birthdate.split("/");
      birthDate = new Date(year, month - 1, day);
    } else {
      // Handle moment/dayjs object
      birthDate = birthdate.toDate ? birthdate.toDate() : new Date(birthdate);
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age > 0 ? `${age} years old` : "";
  };

  if (loading && !userData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className="profile-container"
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Header Section */}
      <div
        className="cover-photo"
        style={{
          background: "linear-gradient(135deg, #99E3B5 0%, #92B6EF 100%)",
          backgroundSize: "cover",
          borderRadius: "12px 12px 0 0",
          height: "300px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          icon={<SettingOutlined />}
          className="settings-btn"
          onClick={showModal}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Settings
        </Button>
      </div>
      <div
        className="profile-info"
        style={{
          backgroundColor: "white",
          borderRadius: "0 0 12px 12px",
          padding: "0 24px 24px 24px",
          position: "relative",
          marginBottom: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="avatar-wrapper"
          style={{
            position: "absolute",
            top: "-50px",
            left: "24px",
          }}
        >
          <Avatar
            size={100}
            src={user?.avatarUrl}
            icon={!user?.avatarUrl && <CameraOutlined />}
            style={{
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          />
        </div>
        <div
          className="text-content"
          style={{
            paddingTop: "60px",
          }}
        >
          <Title
            level={2}
            className="user-name"
            style={{
              margin: "0 0 8px 0",
              color: "#262626",
              fontSize: "28px",
            }}
          >
            {userData?.name || "User Name"}
          </Title>
          <Text
            className="user-description"
            style={{
              color: "#8c8c8c",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            {" "}
            {userData
              ? `${userData.birthdate ? `Born on ${userData.birthdate}` : ""} ${
                  userData.gender ? `• ${userData.gender}` : ""
                } ${
                  calculateAge(userData.birthdate)
                    ? `• ${calculateAge(userData.birthdate)}`
                    : ""
                }`
              : "On a journey to quit smoking. Every day is a new victory!"}
          </Text>
        </div>
      </div>
      <Card
        className="info-card"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "none",
        }}
      >
        {!userData && (
          <div
            className="info-content"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
              borderRadius: "12px",
              margin: "24px",
            }}
          >
            <SettingOutlined
              style={{
                fontSize: "64px",
                color: "#6c757d",
                marginBottom: "24px",
                display: "block",
              }}
            />
            <Title
              level={3}
              style={{
                color: "#495057",
                marginBottom: "16px",
                fontSize: "24px",
              }}
            >
              No Personal Information
            </Title>
            <Text
              style={{
                color: "#6c757d",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "32px",
                display: "block",
                maxWidth: "400px",
                margin: "0 auto 32px auto",
              }}
            >
              You haven't updated your personal information yet. Click the
              button below to add information and complete your profile.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<SettingOutlined />}
              onClick={showModal}
              style={{
                borderRadius: "8px",
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontSize: "16px",
                fontWeight: "500",
                background: "#16A34A",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Update Information
            </Button>
          </div>
        )}
        {userData && (
          <div className="user-info-display" style={{ padding: "24px" }}>
            <Title
              level={3}
              style={{
                marginBottom: "24px",
                textAlign: "center",
                color: "#1890ff",
                fontSize: "24px",
              }}
            >
              {" "}
              <UserOutlined style={{ marginRight: "8px" }} />
              Personal Information
            </Title>

            {/* Combined Information Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              {/* Personal Details Card */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#495057",
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  📋 Basic Information
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Full Name:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.name || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Phone Number:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.phone || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Date of Birth:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.birthdate || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Gender:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.gender || "Not updated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health & Lifestyle Card */}
              <div
                style={{
                  backgroundColor: "#f0f8f0",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #d4edda",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#28a745",
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  🏥 Health & Habits
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Started smoking at age:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.smokingAge || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Years of smoking:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.yearsSmoked || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Occupation:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.occupation || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Health status:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.healthStatus || "Not updated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {userData.bio && (
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #ffeaa7",
                  marginBottom: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#856404",
                    marginBottom: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  💭 Bio
                </Title>
                <Text
                  style={{
                    color: "#856404",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    fontStyle: "italic",
                  }}
                >
                  "{userData.bio}"
                </Text>
              </div>
            )}
          </div>
        )}
      </Card>{" "}
      <Modal
        title="Account Information"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Update Information"
        cancelText="Cancel"
      >
        {" "}
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Phone Number *"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please enter your phone number!",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter numbers only!",
              },
            ]}
          >
            <Input type="number" placeholder="1234567890" />
          </Form.Item>{" "}
          <Form.Item label="Full Name *" name="name" initialValue="SSSSS">
            <Input placeholder="Enter your full name" />
          </Form.Item>{" "}
          <Form.Item label="Date of Birth *" name="birthdate">
            <DatePicker
              placeholder="Select date of birth"
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                // Disable future dates
                return current && current > moment().endOf("day");
              }}
            />
          </Form.Item>
          <Form.Item label="Gender *" name="gender">
            <Select placeholder="Select gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Bio"
            name="bio"
            initialValue="On a journey to quit smoking. Every day is a new victory!"
          >
            <Input placeholder="On a journey to quit smoking. Every day is a new victory!" />
          </Form.Item>{" "}
          <Form.Item label="Age started smoking" name="smokingAge">
            <Input type="number" placeholder="Enter age" />
          </Form.Item>
          <Form.Item label="Years of smoking" name="yearsSmoked">
            <Input type="number" placeholder="Enter number of years" />
          </Form.Item>{" "}
          <Form.Item label="Occupation" name="occupation">
            <Input placeholder="Enter occupation" />
          </Form.Item>
          <Form.Item label="Health status" name="healthStatus">
            <Select placeholder="Select health status">
              <Option value="excellent">Excellent</Option>
              <Option value="good">Good</Option>
              <Option value="fair">Fair</Option>
              <Option value="poor">Poor</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
