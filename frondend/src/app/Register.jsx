// Import các thư viện cần thiết cho component đăng ký
import React, { useContext, useState } from "react";
// Import các component giao diện từ Material-UI
import {
  Box, // Container để bố trí layout
  Button, // Nút bấm
  Checkbox, // Ô tick đồng ý điều khoản
  Container, // Container chính của trang
  FormControlLabel, // Label cho checkbox
  Link, // Liên kết
  TextField, // Ô nhập liệu
  Typography, // Text và tiêu đề
  Paper, // Khung nền với shadow
  Snackbar, // Thông báo popup
  Alert, // Thông báo cảnh báo
} from "@mui/material";
// Import hook để điều hướng trang
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
// Import context quản lý trạng thái đăng nhập
import { AuthContext } from "../context/AuthContext";
// Import cấu hình Firebase
import { auth } from "../firebase";
// Import các hàm xác thực từ Firebase
import {
  createUserWithEmailAndPassword, // Tạo tài khoản bằng email/password
  updateProfile, // Cập nhật thông tin profile
} from "firebase/auth";
// Import thư viện gọi API
import axios from "axios";

// Component chính cho trang đăng ký tài khoản
const Register = () => {
  // Các state (trạng thái) để lưu thông tin người dùng nhập vào form
  const [Username, setUserName] = useState(""); // Tên đăng nhập
  const [email, setEmail] = useState(""); // Email
  const [password, setPassword] = useState(""); // Mật khẩu
  const [agreeTerms, setAgreeTerms] = useState(false); // Có đồng ý điều khoản không

  // Các state để quản lý thông báo (snackbar)
  const [open, setOpen] = useState(false); // Có hiển thị thông báo không
  const [snackbarMsg, setSnackbarMsg] = useState(""); // Nội dung thông báo
  const [snackbarType, setSnackbarType] = useState("success"); // Loại thông báo (success/error/warning)

  // Hook để chuyển hướng trang
  const navigate = useNavigate();
  // Lấy hàm setUser từ AuthContext để cập nhật thông tin người dùng đã đăng nhập
  const { setUser } = useContext(AuthContext);
  // Hàm hiển thị thông báo cho người dùng
  const showSnackbar = (message, type = "success") => {
    setSnackbarMsg(message); // Đặt nội dung thông báo
    setSnackbarType(type); // Đặt loại thông báo (success/error/warning)
    setOpen(true); // Hiển thị thông báo
  };
  // Hàm gọi API backend để lấy thông tin chi tiết của user sau khi đăng ký thành công
  const fetchUserFromBackend = async (idToken) => {
    try {
      // Gọi API để lấy thông tin user từ backend
      const res = await axios.post(
        "http://localhost:8080/api/user/me", // Endpoint API
        { name: Username }, // Gửi tên người dùng vào body request
        {
          headers: {
            Authorization: `Bearer ${idToken}`, // Đính kèm token xác thực
          },
        }
      );
      // Lấy dữ liệu user từ response (có thể có format khác nhau)
      const user = res.data;
      // Lưu thông tin user vào localStorage để duy trì đăng nhập
      localStorage.setItem("user", JSON.stringify(user));
      // Cập nhật thông tin user trong context
      setUser(user);
      // Hiển thị thông báo thành công
      showSnackbar(" Registration successful!", "success");
      // Chuyển hướng về trang chủ
      navigate("/home");
    } catch (err) {
      // Xử lý lỗi khi gọi API
      console.error("Error fetching user:", err);
      if (err.response?.data?.message) {
        showSnackbar(err.response.data.message, "error");
      } else if (err.response?.status === 401) {
        showSnackbar("Authentication failed. Please try again.", "error");
      } else if (err.response?.status === 500) {
        showSnackbar("Server error. Please try again later.", "error");
      } else {
        showSnackbar(
          "Failed to complete registration. Please try again.",
          "error"
        );
      }
    }
  };
  // Hàm xử lý khi người dùng submit form đăng ký
  async function handleSubmit(event) {
    // Ngăn chặn hành vi mặc định của form (reload trang)
    event.preventDefault();

    // Kiểm tra xem người dùng đã đồng ý điều khoản chưa
    if (!agreeTerms) {
      showSnackbar("⚠️ You must agree to the terms and policies.", "warning");
      return; // Dừng thực hiện nếu chưa đồng ý
    }

    try {
      // Tạo tài khoản mới bằng Firebase Authentication
      const result = await createUserWithEmailAndPassword(
        auth, // Firebase auth instance
        email, // Email người dùng nhập
        password // Password người dùng nhập
      );

      // Cập nhật tên hiển thị cho user vừa tạo
      await updateProfile(result.user, {
        displayName: Username, // Đặt tên hiển thị
      });

      //  Đợi Firebase cập nhật profile hoàn tất
      await new Promise((resolve) => setTimeout(resolve, 500)); //  Lấy token mới sau khi update profile (đảm bảo name đúng)
      const idToken = await result.user.getIdToken(true);

      // LOẠI BỎ: Không tự động link Google nữa
      // Chỉ đăng ký email/password thuần túy

      // Gọi backend để tạo user trong database
      await fetchUserFromBackend(idToken);
    } catch (err) {
      // Xử lý lỗi khi đăng ký
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        // Email đã được sử dụng
        showSnackbar(
          " Email already exists. Please use another email.",
          "error"
        );
      } else if (err.code === "auth/weak-password") {
        showSnackbar(
          "Password is too weak. Please use a stronger password.",
          "error"
        );
      } else {
        // Lỗi khác
        showSnackbar("Registration failed. Please try again.", "error");
      }
    }
  } // Render giao diện của trang đăng ký
  return (
    <Container maxWidth="sm">
      {/* Paper tạo khung với shadow và padding */}
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 8, borderRadius: 3 }}>
        {/* Phần header của form */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          {/* Tiêu đề chính */}
          <Typography variant="h5" fontWeight="bold">
            Create an account
          </Typography>
          {/* Mô tả phụ */}
          <Typography variant="body2" color="text.secondary">
            Fill in your details to register
          </Typography>
        </Box>

        {/* Form đăng ký với sự kiện onSubmit */}
        <form onSubmit={handleSubmit}>
          {/* Ô nhập Username */}
          <TextField
            fullWidth // Chiếm toàn bộ chiều rộng
            label="Username" // Nhãn hiển thị
            margin="normal" // Margin bình thường
            value={Username} // Giá trị hiện tại
            onChange={(e) => setUserName(e.target.value)} // Cập nhật state khi thay đổi
            required // Bắt buộc phải nhập
          />

          {/* Ô nhập Email */}
          <TextField
            fullWidth
            label="Email"
            type="email" // Kiểu input là email
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Ô nhập Password */}
          <TextField
            fullWidth
            label="Password"
            type="password" // Kiểu input là password (ẩn ký tự)
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Password must be more than 6 characters" // Text hướng dẫn
            required
            error={password.length > 0 && password.length < 6}
          />

          {/* Checkbox đồng ý điều khoản */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms} // Trạng thái được tick hay không
                onChange={(e) => setAgreeTerms(e.target.checked)} // Cập nhật khi thay đổi
                color="success" // Màu xanh lá
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{" "}
                <Link
                  href="#"
                  underline="none"
                  color="#16A34A"
                  fontWeight={"bold"}
                >
                  terms of service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  underline="none"
                  color="#16A34A"
                  fontWeight={"bold"}
                >
                  privacy policy
                </Link>
              </Typography>
            }
            sx={{ mt: 1 }} // Margin top
          />

          {/* Nút Register */}
          <Button
            fullWidth
            type="submit" // Kiểu submit để trigger form onSubmit
            variant="contained" // Nút nền đầy
            sx={{
              mt: 2, // Margin top
              bgcolor: "#16A34A", // Màu nền xanh lá
              "&:hover": { bgcolor: "#15803d" }, // Màu khi hover
            }}
          >
            Register
          </Button>
        </form>

        {/* Phần footer với link đến trang đăng nhập */}
        <Typography align="center" variant="body2" mt={3}>
          Already have an account?{" "}
          <MuiLink
            component={RouterLink} // Sử dụng RouterLink để điều hướng
            to="/login" // Đường dẫn đến trang login
            underline="none"
            color="inherit"
            sx={{ color: "#16A34A", fontWeight: "bold" }}
          >
            Login
          </MuiLink>
        </Typography>
      </Paper>

      {/* Snackbar để hiển thị thông báo */}
      <Snackbar
        open={open} // Có hiển thị hay không
        autoHideDuration={3000} // Tự động ẩn sau 3 giây
        onClose={() => setOpen(false)} // Đóng thông báo
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Vị trí hiển thị
      >
        <Alert
          severity={snackbarType} // Loại alert (success/error/warning)
          onClose={() => setOpen(false)} // Đóng khi click X
          sx={{ width: "100%" }}
        >
          {snackbarMsg} {/* Nội dung thông báo */}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Export component Register để sử dụng ở nơi khác
export default Register;
