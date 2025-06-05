import React, { useState } from "react";
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
} from "antd";
import {
  SettingOutlined,
  CameraOutlined,
  UploadOutlined,
  UserOutlined,
  EnvironmentOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import "../App.css";

const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); // New state for avatar URL
  const [form] = Form.useForm();

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

  const handleFinish = (values) => {
    setUserData(values);
    setIsModalVisible(false);
  };

  const handleCoverUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // New handler for avatar upload
  const handleAvatarUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const [day, month, year] = birthdate.split("/");
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age > 0 ? `${age} tuổi` : "";
  };

  return (
    <div className="profile-container">
      <div
        className="cover-photo"
        style={{
          backgroundImage: coverPhoto
            ? `url(${coverPhoto})`
            : "linear-gradient(to right, #94e5a3, #8ec6f8)",
          backgroundSize: "cover",
        }}
      >
        <Upload
          beforeUpload={handleCoverUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />} className="change-cover-btn">
            Change cover photo
          </Button>
        </Upload>
        <Button
          icon={<SettingOutlined />}
          className="settings-btn"
          onClick={showModal}
        >
          Settings
        </Button>
      </div>

      <div className="profile-info">
        <div className="avatar-wrapper">
          <Upload
            beforeUpload={handleAvatarUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <CameraOutlined />}
              style={{ cursor: "pointer" }}
            />
          </Upload>
        </div>
        <div className="text-content">
          <Title level={3} className="user-name">
            {userData?.name || "SSSSS"}
          </Title>
          <Text className="user-description">
            {userData
              ? `Sinh ngày ${userData.birthdate || "Chưa cập nhật"}, ${
                  userData.gender || "Chưa cập nhật"
                }, ${calculateAge(userData.birthdate) || ""}. ${
                  userData.bio || "Chưa có tiểu sử"
                }`
              : "Đang trong hành trình cai thuốc lá. Mỗi ngày là một chiến thắng mới!"}
          </Text>
        </div>
      </div>

      <Card className="info-card">
        {!userData && (
          <div className="info-content">
            <SettingOutlined style={{ fontSize: 40, color: "#999" }} />
            <Title level={4}>Chưa có thông tin</Title>
            <Text>
              Bạn chưa cập nhật thông tin cá nhân. Hãy nhấn vào nút Settings để
              thêm thông tin.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<SettingOutlined />}
              className="open-settings-btn"
              onClick={showModal}
            >
              Mở Settings
            </Button>
          </div>
        )}
        {userData && (
          <div className="user-info-display">
            <Title level={3}>Thông Tin Người Dùng</Title>
            <div className="info-section basic-info">
              <Title level={4} className="section-title">
                <UserOutlined /> Thông Tin Cơ Bản
              </Title>
              <div className="info-grid">
                <div className="label">Họ và Tên :</div>
                <div className="value">{userData.name || "Chưa cập nhật"}</div>
                <div className="label">Số Điện Thoại :</div>
                <div className="value">{userData.phone || "Chưa cập nhật"}</div>
                <div className="label">Ngày Sinh :</div>
                <div className="value">
                  {userData.birthdate || "Chưa cập nhật"}
                </div>
                <div className="label">Giới Tính :</div>
                <div className="value">
                  {userData.gender || "Chưa cập nhật"}
                </div>
              </div>
            </div>
            <div className="info-section address-info">
              <Title level={4} className="section-title">
                <EnvironmentOutlined /> Thông Tin Địa Chỉ
              </Title>
              <div className="info-grid">
                <div className="label">Địa Chỉ :</div>
                <div className="value">
                  {userData.address || "Chưa cập nhật"}
                </div>
              </div>
            </div>
            <div className="info-section contact-info">
              <Title level={4} className="section-title">
                <HeartOutlined /> Thông Tin Liên Hệ
              </Title>
              <div className="info-grid">
                <div className="label">Tiêu sử :</div>
                <div className="value">{userData.bio || "Chưa cập nhật"}</div>
                <div className="label">Tuổi bắt đầu hút thuốc :</div>
                <div className="value">
                  {userData.smokingAge || "Chưa cập nhật"}
                </div>
                <div className="label">Nghề Nghiệp :</div>
                <div className="value">
                  {userData.occupation || "Chưa cập nhật"}
                </div>
                <div className="label">Ngày bắt đầu hút thuốc :</div>
                <div className="value">
                  {userData.quitDate || "Chưa cập nhật"}
                </div>
                <div className="label">Số năm hút thuốc :</div>
                <div className="value">
                  {userData.yearsSmoked || "Chưa cập nhật"}
                </div>
                <div className="label">Tình trạng sức khỏe :</div>
                <div className="value">
                  {userData.healthStatus || "Chưa cập nhật"}
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              className="open-settings-btn"
              onClick={showModal}
              style={{ marginTop: "16px" }}
            >
              Mở Settings
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title="Thông tin tài khoản"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Cập nhật thông tin"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Số điện thoại *"
            name="phone"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại!",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Vui lòng chỉ nhập số!",
              },
            ]}
          >
            <Input type="number" placeholder="b849984799" />
          </Form.Item>
          <Form.Item label="Họ và tên *" name="name">
            <Input placeholder="Lưu Mỹ Nhất Huy" />
          </Form.Item>
          <Form.Item label="Ngày sinh *" name="birthdate">
            <Input placeholder="22/12/2004" />
          </Form.Item>
          <Form.Item label="Giới tính *" name="gender">
            <Input placeholder="Nam / Nữ" />
          </Form.Item>
          <Form.Item label="Tiêu sử" name="bio">
            <Input placeholder="Nhập tiêu sử cá nhân" />
          </Form.Item>
          <Form.Item label="Tuổi bắt đầu hút thuốc" name="smokingAge">
            <Input type="number" placeholder="Nhập tuổi" />
          </Form.Item>
          <Form.Item label="Ngày bắt đầu hút thuốc" name="quitDate">
            <Input placeholder="Nhập ngày" />
          </Form.Item>
          <Form.Item label="Số năm hút thuốc" name="yearsSmoked">
            <Input type="number" placeholder="Nhập số năm" />
          </Form.Item>
          <Form.Item label="Nghề nghiệp" name="occupation">
            <Input placeholder="Nhập nghề nghiệp" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item label="Tình trạng sức khỏe" name="healthStatus">
            <Select placeholder="Chọn tình trạng sức khỏe">
              <Option value="excellent">Xuất sắc</Option>
              <Option value="good">Tốt</Option>
              <Option value="fair">Khá</Option>
              <Option value="poor">Kém</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
