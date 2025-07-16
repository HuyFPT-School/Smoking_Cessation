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
  Spin,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import { Snackbar, Alert } from "@mui/material";
import {
  SettingOutlined,
  CameraOutlined,
  UserOutlined,
  HeartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CrownOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import axios from "axios";
import moment from "moment";
import "../App.css";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const { userId: paramUserId } = useParams(); // lấy từ URL nếu có
  // Lấy thông tin người dùng và hàm cập nhật thông tin người dùng từ context AuthContext
  const { user, setUser } = useContext(AuthContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  // Tạo một đối tượng form của Ant Design để thao tác với các trường dữ liệu trong form (như set value, validate, reset)
  const [form] = Form.useForm();
  const [leaderboardData, setLeaderboardData] = useState(null);
  // Trạng thái cờ cho biết người dùng có đang thực hiện liên kết tài khoản Google hay không
  // Dùng để disable nút hoặc hiện loading khi đang liên kết
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    // Nếu lý do đóng là do người dùng click ra ngoài (clickaway), thì không làm gì cả
    if (reason === "clickaway") {
      return; // Giữ nguyên snackbar, không đóng
    }
    // Cập nhật trạng thái snackbar: chỉ thay đổi `open` thành `false` để ẩn thông báo
    setSnackbar((prev) => ({ ...prev, open: false })); // giữ nguyên các giá trị cũ (message, severity),  open : false :đóng snackbar
  };
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  console.log("User object from localStorage:", userObj);
  if (userObj) {
    const possibleDateFields = [
      "createAt",
      "createdAt",
      "registrationDate",
      "registerDate",
      "joinDate",
      "dateCreated",
    ];
    console.log("Checking date fields in user object:");
    possibleDateFields.forEach((field) => {
      if (userObj[field]) {
        console.log(`Found date field ${field}:`, userObj[field]);
      }
    });
  }

  const localUserId = userObj ? userObj.id : null;
  const userId = paramUserId || localUserId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setLoading(true); // Bật trạng thái đang tải (loading): khi gọi 1 api mất 1 khoảng time -> hiển thị 1 vòng xoay
      try {
        const response = await axios.get(
          `http://localhost:8080/api/profile/user/${userId}`
        );
        if (response.status === 200) {
          const profileData = response.data;
          console.log("Profile data from API:", profileData);

          //Kiểm tra các trường ngày trong dữ liệu hồ sơ
          const possibleDateFields = [
            "createAt",
            "createdAt",
            "registrationDate",
            "registerDate",
            "joinDate",
            "dateCreated",
          ];
          possibleDateFields.forEach((field) => {
            if (profileData[field]) {
              console.log(
                `Found date field ${field} in profile data:`,
                profileData[field]
              );
            }
          });
          // update data hồ sơ người dùng (profileData) vào state userData
          setUserData(profileData);

          //  gán giá trị mặc định cho form
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
          console.log("No profile found, user can create one");
        } else {
          console.error("Error fetching profile data:", error);
          showSnackbar("Failed to load profile data", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, form]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!userId) return;

      try {
        // params là nơi bạn truyền các tham số (query string) để đính kèm vào URL.
        const params = {
          currentUserId: userId, //gửi ID người dùng hiện tại để backend biết bạn là ai.
          timeRange: "all", //gửi yêu cầu muốn lấy thống kê theo toàn thời gian.
        };
        const response = await axios.get(
          "http://localhost:8080/api/leaderboard",
          { params }
        );

        if (response.status === 200) {
          setLeaderboardData(response.data.currentUser);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboardData();
  }, [userId]);

  const handleAvatarUpload = async ({ file }) => {
    // 1. Kiểm tra file trước khi tải lên
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files (JPG, PNG, GIF)!");
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be less than 2MB!");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "avatar_unsigned");

    try {
      // 2. Tải ảnh lên Cloudinary
      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dt6uoyt1t/image/upload",
        formData
      );
      const newAvatarUrl = cloudinaryResponse.data.secure_url;

      if (!auth.currentUser) {
        showSnackbar("User is not logged in, cannot update.", "error");
        setUploadingAvatar(false);
        return;
      }
      const idToken = await auth.currentUser.getIdToken(true);

      // 4. Cập nhật URL avatar mới vào backend VỚI HEADER XÁC THỰC
      const backendResponse = await axios.post(
        `http://localhost:8080/api/user/avatar`,
        { avatarUrl: newAvatarUrl }, // Body của request
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (backendResponse.status === 200) {
        // 5. Cập nhật state và localStorage để UI thay đổi ngay lập tức
        const updatedAvatarUrl = backendResponse.data.avatarUrl;
        const updatedUser = { ...user, avatarUrl: updatedAvatarUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (userData) {
          setUserData((prevData) => ({
            ...prevData,
            user: { ...prevData.user, avatarUrl: updatedAvatarUrl },
          }));
        }

        showSnackbar("Profile picture updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
      showSnackbar("Profile picture update failed. Please try again.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit(); //Gửi toàn bộ dữ liệu form để xử lý (như lưu vào DB hoặc gọi API).
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (userData) {
      form.setFieldsValue({
        name: userData.name,
        phone: userData.phone,
        birthdate: userData.birthdate
          ? moment(userData.birthdate, "DD/MM/YYYY")
          : null,
        gender: userData.gender,
        bio: userData.bio,
        smokingAge: userData.smokingAge,
        yearsSmoked: userData.yearsSmoked,
        occupation: userData.occupation,
        healthStatus: userData.healthStatus,
      });
    }
  };
  const handleFinish = async (values) => {
    if (!userId) {
      showSnackbar("User ID not found", "error");
      return;
    }

    setLoading(true); // chặn người dùng gửi data khi đang load data
    try {
      //Chuyển đổi giá trị DatePicker sang định dạng chuỗi DD/MM/YYYY
      if (values.birthdate) {
        values.birthdate = values.birthdate.format("DD/MM/YYYY");
      }

      const profileData = {
        ...values, // giữ lại những trường cũ mà ng dùng đã nhập trong form
        userId: parseInt(userId) || userId, // thêm userid
      };

      const response = await axios.post(
        "http://localhost:8080/api/profile",
        profileData
      );

      if (response.status === 200) {
        setUserData(response.data); //Cập nhật dữ liệu hồ sơ mới vào state

        //Nếu người dùng đã thay đổi tên (name)
        if (values.name && values.name !== user?.name) {
          const updatedUser = {
            ...user, //sao chép toàn bộ thuộc tính từ object user vào object mới
            name: values.name, // Ghi đè trường name nếu có tên mới (values.name)
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setIsModalVisible(false);
        showSnackbar("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showSnackbar("Failed to save profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogleAccount = async () => {
    //auth.currentUser là thông tin người dùng hiện tại đã đăng nhập
    //Kiểm tra xem đã có ai đăng nhập chưa.
    if (!auth.currentUser) {
      showSnackbar("Please log in first", "error");
      return;
    }

    setLinkingGoogle(true); //Hiển thị trạng thái linking.
    try {
      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(auth.currentUser, provider);

      const idToken = await result.user.getIdToken(true);

      const response = await axios.post(
        "http://localhost:8080/api/user/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data.user || response.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showSnackbar(
          "🎉 Google account linked successfully! You can now login with Google or Email/Password.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error linking Google account:", error);
      if (error.code === "auth/popup-closed-by-user") {
        showSnackbar("Google linking cancelled.", "info");
      } else if (error.code === "auth/credential-already-in-use") {
        showSnackbar(
          "This Google account is already linked to another user.",
          "error"
        );
      } else if (error.code === "auth/provider-already-linked") {
        showSnackbar(
          "Google account is already linked to your account.",
          "info"
        );
      } else {
        // thông báo thất bại
        showSnackbar(
          "Failed to link Google account. Please try again.",
          "error"
        );
      }
    } finally {
      setLinkingGoogle(false); //hoàn tất hoặc hủy quá trình liên kết.
    }
  };
  const calculateAge = (birthdate) => {
    //Nếu birthdate là null, undefined, hoặc rỗng thì không xử lý nữa, trả về chuỗi rỗng ""
    if (!birthdate) return "";

    let birthDate; //biến kiểu Date dùng để tính tuổi sau này.
    if (typeof birthdate === "string") {
      //Kiểm tra xem birthdate có phải kiểu chuỗi hay không (ví dụ "01/05/1990")
      const [day, month, year] = birthdate.split("/"); // Dùng .split("/") để tách chuỗi theo dấu /,
      birthDate = new Date(year, month - 1, day); // Tạo một đối tượng Date từ các phần đã tách.
    } else {
      //Dòng này giúp chuyển birthdate về kiểu Date, ưu tiên dùng .toDate() nếu là đối tượng moment/dayjs, ngược lại dùng new Date(birthdate).
      birthDate = birthdate.toDate ? birthdate.toDate() : new Date(birthdate);
    }

    if (isNaN(birthDate.getTime())) {
      // nếu ngày sinh ko hợp lệ vd tháng 13, ngày 32, ko tính tuổi , trả về chuỗi rỗng
      return "";
    }

    const today = new Date(); // lấy ngày hôm nay
    let age = today.getFullYear() - birthDate.getFullYear(); //Trừ năm hiện tại với năm sinh
    const monthDiff = today.getMonth() - birthDate.getMonth(); //So sánh tháng hiện tại với tháng sinh.
    //monthDiff < 0 → chưa đến tháng sinh → chưa đến sinh nhật,  monthDiff === 0 → kiểm tra tiếp ngày.
    if (
      monthDiff < 0 || // chưa đến tháng sinh && ngày sinh thì trừ đi 1 tuổi
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age > 0 ? `${age} years old` : ""; //Nếu tuổi > 0 thì trả về chuỗi, ko thì return rỗng
  };
  const formatMemberSinceDate = (dateValue) => {
    // định dạng ngày ng dùng tham gia
    //Nếu không có ngày → trả mặc định
    if (!dateValue) return "N/A";

    //In giá trị ngày để debug
    console.log("Formatting date value:", dateValue);

    try {
      if (typeof dateValue === "string") {
        // Kiểm tra xem chuỗi có phải chuỗi mảng kiểu "[2023,6,15]" không
        if (dateValue.startsWith("[") && dateValue.endsWith("]")) {
          try {
            //Dùng JSON.parse để chuyển chuỗi "[2023,6,15]" thành mảng [2023, 6, 15]
            const dateArray = JSON.parse(dateValue);
            if (Array.isArray(dateArray) && dateArray.length >= 3) {
              //Kiểm tra xem có đúng là mảng không, và có ít nhất 3 phần tử:ngày tháng năm
              const year = dateArray[0];
              const month = dateArray[1]; //Gán lần lượt giá trị năm, tháng, ngày từ mảng.
              const day = dateArray[2];
              return moment([year, month - 1, day]).format("DD/MM/YYYY"); // Dùng moment.js để tạo đối tượng ngày, rồi format theo kiểu dd/mm/yyyy
            }
          } catch (e) {
            console.error("Failed to parse date array string:", e);
          }
        }

        //Chuyển đổi giá trị DatePicker sang định dạng chuỗi DD/MM/YYYY
        const formats = [
          "YYYY-MM-DDTHH:mm:ss", // ISO 8601, chuẩn Java hay dùng (ví dụ: "2023-06-15T14:30:00")
          "YYYY-MM-DD HH:mm:ss", // Dạng chuẩn SQL (ví dụ: "2023-06-15 14:30:00")
          "YYYY-MM-DD", // Chỉ ngày, không giờ (ví dụ: "2023-06-15")
          "DD/MM/YYYY", // Định dạng ngày phổ biến ở VN/EU
          "MM/DD/YYYY", // Định dạng Mỹ (tháng/ngày/năm)
        ];

        for (const format of formats) {
          //Duyệt qua từng định dạng ngày trong mảng `formats`
          const parsed = moment(dateValue, format, true); //parse dateValue thành ngày hợp lệ với moment.js.
          if (parsed.isValid()) {
            return parsed.format("DD/MM/YYYY");
          }
        }

        // Chuyển dateValue (ngày đầu vào) thành chuỗi định dạng "DD/MM/YYYY" nếu hợp lệ.
        const memberDate = moment(dateValue); //Dùng moment() để chuyển dateValue thành đối tượng moment.
        if (memberDate.isValid()) {
          return memberDate.format("DD/MM/YYYY"); // định dạng lại ngày theo kiểu dd/mm/yyyy
        }
      }

      // Nếu dateValue là mảng như [2023, 4, 15], thì chuyển nó thành ngày "15/04/2023" bằng moment.
      // Kiểm tra xem dateValue có phải là mảng ít nhất 3 phần tử không (tức [year, month, day]).
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const year = dateValue[0];
        const month = dateValue[1];
        const day = dateValue[2];
        return moment([year, month - 1, day]).format("DD/MM/YYYY");
      }

      console.error("Invalid date format for createAt:", dateValue);
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };
  // ngày bắt đầu trở thành thành viên
  const getMemberSinceDate = () => {
    console.log("Finding member since date");

    const dateFields = [
      "createAt",
      "createdAt",
      "registrationDate",
      "registerDate",
      "joinDate",
      "dateCreated",
      "created",
    ];

    //lấy ngày tạo tài khoản từ userObj (được lưu trong localStorage).
    if (userObj) {
      for (const field of dateFields) {
        if (userObj[field]) {
          console.log(`Using date from userObj.${field}`);
          return formatMemberSinceDate(userObj[field]); // Gọi hàm formatMemberSinceDate(...) để định dạng ngày theo ý muốn
        }
      }
    }

    // tìm ngày thành viên từ userData nếu không tìm được từ userObj
    if (userData) {
      for (const field of dateFields) {
        if (userData[field]) {
          //Nếu userData có một trong các trường đang duyệt->sử dụng
          console.log(`Using date from userData.${field}`);
          //Gọi hàm formatMemberSinceDate(...) để định dạng ngày (ví dụ chuyển từ "2023-04-15T10:00:00Z" thành "15/04/2023").
          return formatMemberSinceDate(userData[field]);
        }
      }

      //kiểm tra và lấy ngày tạo tài khoản
      if (userData.user) {
        for (const field of dateFields) {
          if (userData.user[field]) {
            // Kiểm tra xem trong userData.user có tồn tại trường đang duyệt không
            console.log(`Using date from userData.user.${field}`); // In ra thông tin log để lập trình viên biết đang lấy ngày từ đâu
            //Nếu tìm thấy ngày → gọi hàm formatMemberSinceDate() để định dạng lại ngày (ví dụ từ dạng ISO → thành "15/04/2023").
            return formatMemberSinceDate(userData.user[field]);
          }
        }
      }
    }

    //Nếu chúng ta có dữ liệu bảng xếp hạng với ngày tạo
    //Kiểm tra xem đối tượng leaderboardData có tồn tại và có chứa trường creationDate hoặc createDate không
    if (leaderboardData?.creationDate || leaderboardData?.createDate) {
      // Nếu cả hai trường cùng tồn tại, thì lấy creationDate trước
      const date = leaderboardData.creationDate || leaderboardData.createDate;
      // In ra console để thông báo rằng ngày đã được lấy từ dữ liệu leaderboard
      console.log("Using date from leaderboard data");
      //Gọi hàm định dạng ngày formatMemberSinceDate(...), chuyển ngày thành dạng dễ đọc (ví dụ: 15/04/2023).
      return formatMemberSinceDate(date);
    }

    console.log("No date found, using default date");

    return "N/A";
  };
  //tổng hợp các thống kê chính (summary) của người dùng trong ứng dụng theo dõi việc bỏ thuốc
  const summaryStats = {
    smokeFreeDays: leaderboardData?.consecutiveSmokFreeDays || 0,
    achievementPoints: leaderboardData?.totalPoints || 0,
    memberSince: getMemberSinceDate(),
    rank: leaderboardData?.rank || "-",
  };

  if (loading && !userData) {
    // nếu loading đang là true và userdata vẫn chưa có-> trả về giao diện loading
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

        <Button
          icon={<GoogleOutlined />}
          className="google-link-btn"
          onClick={handleLinkGoogleAccount}
          loading={linkingGoogle}
          style={{
            position: "absolute",
            top: "16px",
            right: "120px",
            backgroundColor: "rgba(234, 67, 53, 0.9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Link Google
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
          <Upload
            name="avatar"
            showUploadList={false}
            customRequest={handleAvatarUpload} // Gọi hàm upload tùy chỉnh của chúng ta
            accept="image/*" // Chỉ chấp nhận file ảnh
            disabled={uploadingAvatar} // Vô hiệu hóa khi đang tải
          >
            <Spin spinning={uploadingAvatar} tip="Đang tải lên...">
              <Avatar
                size={100}
                src={user?.avatarUrl} // Lấy avatar từ user context để cập nhật ngay
                icon={!user?.avatarUrl && <CameraOutlined />}
                style={{
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  cursor: "pointer", // Thêm con trỏ để người dùng biết có thể click
                }}
              />
            </Spin>
          </Upload>
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
            {userData
              ? `${userData.birthdate ? `Born on ${userData.birthdate}` : ""} ${
                  userData.gender ? `• ${userData.gender}` : ""
                } ${
                  calculateAge(userData.birthdate)
                    ? `• ${calculateAge(userData.birthdate)}`
                    : ""
                }` // nếu chưa có hiện thị mặc định
              : "On a journey to quit smoking. Every day is a new victory!"}
          </Text>
        </div>
      </div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#e8f5e9",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <HeartOutlined
                style={{
                  fontSize: "32px",
                  color: "#4caf50",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#2e7d32",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {/*số ngày liên tiếp ko hút thuốc*/}
                {summaryStats.smokeFreeDays}
              </Title>
              <Text
                style={{
                  color: "#388e3c",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Days on the streak
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#e3f2fd",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <TrophyOutlined
                style={{
                  fontSize: "32px",
                  color: "#1976d2",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#1565c0",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {summaryStats.achievementPoints}
                {/*tổng số điểm thành tựu*/}
              </Title>
              <Text
                style={{
                  color: "#1976d2",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Total Points
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#fff8e1",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <CalendarOutlined
                style={{
                  fontSize: "32px",
                  color: "#ff8f00",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#ef6c00",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {summaryStats.memberSince}
                {/*ngày người dùng trỏ thành thành viên*/}
              </Title>
              <Text
                style={{
                  color: "#f57c00",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Member Since
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#fce4ec",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <CrownOutlined
                style={{
                  fontSize: "32px",
                  color: "#c2185b",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#ad1457",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                #{summaryStats.rank}
                {/*rank của thành viên*/}
              </Title>
              <Text
                style={{
                  color: "#c2185b",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Rank
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
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
              <UserOutlined style={{ marginRight: "8px" }} />
              Personal Information
            </Title>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
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
      </Card>
      <Modal
        title="Account Information"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Update Information"
        cancelText="Cancel"
      >
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
                pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                message: "Please enter a valid Vietnamese phone number!",
              },
            ]}
          >
            <Input
              type="tel"
              placeholder="0123456789 or +84123456789"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item
            label="Full Name *"
            name="name"
            rules={[
              { required: true, message: "Please enter your full name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
              { max: 50, message: "Name must not exceed 50 characters!" },
              {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: "Name can only contain letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter your full name" maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Date of Birth *"
            name="birthdate"
            rules={[
              { required: true, message: "Please select your date of birth!" },
            ]}
          >
            <DatePicker
              placeholder="Select date of birth"
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                // Nếu không phải là ngày hợp lệ, không cần kiểm tra
                const today = moment().endOf("day");
                const maxAge = moment().subtract(100, "years");
                const minAge = moment().subtract(5, "years");
                // Cho phép chọn ngày trong khoảng từ 5 đến 100 tuổi
                return (
                  current &&
                  (current > minAge || current < maxAge || current > today)
                );
              }}
            />
          </Form.Item>
          <Form.Item
            label="Gender *"
            name="gender"
            rules={[{ required: true, message: "Please select your gender!" }]}
          >
            <Select placeholder="Select gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Bio"
            name="bio"
            rules={[
              { max: 500, message: "Bio must not exceed 500 characters!" },
            ]}
          >
            <Input.TextArea
              placeholder="Tell us about your journey to quit smoking..."
              maxLength={500}
              showCount
              rows={4}
            />
          </Form.Item>
          <Form.Item
            label="Age started smoking"
            name="smokingAge"
            rules={[
              {
                required: true,
                message: "Please enter the age you started smoking!",
              },
              {
                type: "number",
                min: 5,
                max: 80,
                message: "Age must be between 5 and 80!",
                transform: (value) => {
                  return value ? Number(value) : value;
                },
              },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter numbers only!",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter age (e.g., 16)"
              min="5"
              max="80"
            />
          </Form.Item>
          <Form.Item
            label="Years of smoking"
            name="yearsSmoked"
            rules={[
              {
                required: true,
                message: "Please enter the number of years you smoked!",
              },
              {
                type: "number",
                min: 0,
                max: 70,
                message: "Years must be between 0 and 70!",
                transform: (value) => {
                  return value ? Number(value) : value;
                },
              },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter numbers only!",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter number of years"
              min="0"
              max="70"
            />
          </Form.Item>
          <Form.Item
            label="Occupation"
            name="occupation"
            rules={[
              {
                max: 100,
                message: "Occupation must not exceed 100 characters!",
              },
            ]}
          >
            <Input placeholder="Enter occupation" maxLength={100} />
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
