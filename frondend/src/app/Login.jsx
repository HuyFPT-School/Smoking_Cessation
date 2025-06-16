import React, { useState, useContext } from "react";
import {
  Box, // Container để bố trí layout
  Button, // Nút bấm
  Container, // Container chính để chứa nội dung
  Paper, // Hộp có bóng đổ (giống như tờ giấy)
  TextField, // Ô input để nhập liệu
  Typography, // Text với các kiểu chữ khác nhau
  Snackbar, // Thông báo popup hiện ở góc màn hình
  Alert, // Thông báo với icon và màu sắc theo loại (success, error, warning)
} from "@mui/material";

// Import hook để điều hướng giữa các trang
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";

// Import các function từ Firebase để xử lý đăng nhập
import {
  signInWithEmailAndPassword, // Đăng nhập bằng email/password
  signInWithPopup, // Đăng nhập bằng popup (Google)
  sendPasswordResetEmail, // Gửi email reset mật khẩu
} from "firebase/auth";

// Import cấu hình Firebase từ file config
import { auth, provider } from "../firebase";

// Import thư viện để gọi API đến server backend
import axios from "axios";

// Import context để quản lý trạng thái user đăng nhập
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  // Khởi tạo các state (trạng thái) để lưu trữ dữ liệu tạm thời
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State để điều khiển việc hiển thị thông báo (true = hiện, false = ẩn)
  const [open, setOpen] = useState(false);

  // State để lưu nội dung thông báo sẽ hiển thị
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // State để lưu loại thông báo (success = thành công, error = lỗi, warning = cảnh báo)
  const [snackbarType, setSnackbarType] = useState("success");

  // State để theo dõi trạng thái loading (đang xử lý) - ngăn user bấm nhiều lần
  const [isLoading, setIsLoading] = useState(false);

  // Hook để điều hướng đến trang khác (ví dụ: từ login chuyển đến home)
  const navigate = useNavigate();

  // Lấy function setUser từ AuthContext để cập nhật thông tin user sau khi đăng nhập
  const { setUser } = useContext(AuthContext);

  const showSnackbar = (message, type = "success") => {
    setSnackbarMsg(message); // Cập nhật nội dung thông báo
    setSnackbarType(type); // Cập nhật loại thông báo (màu sắc, icon)
    setOpen(true); // Hiển thị thông báo
  };
  // Function để lấy thông tin user từ server backend sau khi đăng nhập thành công
  // Nhận vào: idToken (mã token từ Firebase để xác thực)
  const fetchUserFromBackend = async (idToken) => {
    try {
      // Gọi API đến server backend để lấy thông tin user
      // Gửi kèm token trong header Authorization để server biết user nào đang đăng nhập
      const res = await axios.get("http://localhost:8080/api/user/me", {
        headers: {
          Authorization: `Bearer ${idToken}`, // Gửi token để xác thực
        },
      });

      // Lấy dữ liệu user từ response
      const user = res.data;

      // Lưu thông tin user vào localStorage (bộ nhớ trình duyệt) để giữ đăng nhập
      localStorage.setItem("user", JSON.stringify(user));

      // Cập nhật state user trong toàn ứng dụng
      setUser(user);

      // Điều hướng user đến trang phù hợp:
      // - Nếu là ADMIN thì đến trang /admin
      // - Nếu không phải admin thì đến trang /home
      navigate(user.role === "ADMIN" ? "/admin" : "/home");
    } catch (err) {
      // Nếu có lỗi khi gọi API, in lỗi ra console và hiển thị thông báo lỗi
      console.error("Error fetching user:", err);
      if (err.response?.status === 401) {
        showSnackbar("Session expired. Please login again.", "error");
      } else if (err.response?.status === 500) {
        showSnackbar("Server error. Please try again later.", "error");
      } else {
        showSnackbar("Failed to load user info. Please try again.", "error");
      }
    }
  };
  // Function xử lý đăng nhập bằng email và mật khẩu
  // Nhận vào: event (sự kiện submit form)
  const handleEmailPasswordLogin = async (event) => {
    // Ngăn chặn hành vi mặc định của form (reload trang)
    event.preventDefault();

    // Bật trạng thái loading để ngăn user bấm nhiều lần
    setIsLoading(true);

    try {
      // Sử dụng Firebase để đăng nhập bằng email/password
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Lấy token từ user đã đăng nhập để gửi lên server
      const idToken = await result.user.getIdToken();

      // Gọi function để lấy thông tin user từ backend
      await fetchUserFromBackend(idToken);
    } catch (err) {
      // Nếu đăng nhập thất bại, in lỗi và hiển thị thông báo
      console.error("Firebase login error:", err);
      showSnackbar("Incorrect email or password", "error");
    } finally {
      // Dù thành công hay thất bại, đều tắt trạng thái loading
      setIsLoading(false);
    }
  };
  // Function xử lý quên mật khẩu
  // Gửi email reset mật khẩu đến địa chỉ email user nhập
  const handleForgotPassword = async () => {
    // Kiểm tra xem user đã nhập email chưa
    if (!email) {
      showSnackbar("Please enter your email address first", "warning");
      return; // Dừng function nếu chưa nhập email
    }

    try {
      // Sử dụng Firebase để gửi email reset mật khẩu
      await sendPasswordResetEmail(auth, email);
      showSnackbar("Password reset email sent!", "success");
    } catch (error) {
      // Nếu gửi email thất bại, hiển thị thông báo lỗi
      console.error("Error sending password reset email:", error);
      showSnackbar(
        "Failed to send reset email. Please check your email.",
        "error"
      );
    }
  };
  // Function xử lý đăng nhập bằng Google
  // Hiển thị popup Google để user chọn tài khoản và đăng nhập
  const handleGoogleLogin = async () => {
    try {
      // Sử dụng Firebase để đăng nhập bằng Google popup
      // provider là Google Auth Provider đã config trong firebase.js
      const result = await signInWithPopup(auth, provider);

      // Lấy token từ user Google đã đăng nhập
      const idToken = await result.user.getIdToken();

      // Gọi function để lấy thông tin user từ backend
      await fetchUserFromBackend(idToken);
    } catch (error) {
      // Nếu đăng nhập Google thất bại, hiển thị thông báo lỗi
      console.error("Google login failed:", error);
      showSnackbar("Google login failed", "error");
    }
  };
  // Phần return - đây là giao diện (UI) của trang đăng nhập
  return (
    // Container chính của trang, giới hạn chiều rộng tối đa (maxWidth="sm")
    <Container maxWidth="sm">
      {/* Paper tạo ra một hộp có bóng đổ chứa form đăng nhập */}
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 8, borderRadius: 3 }}>
        {/* Box chứa phần header (tiêu đề và mô tả) */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          {/* Tiêu đề chính của trang */}
          <Typography variant="h5" fontWeight="bold" mt={1}>
            Welcome back
          </Typography>
          {/* Mô tả phụ */}
          <Typography variant="body2" color="text.secondary">
            Enter your credentials to access your account
          </Typography>
        </Box>

        {/* Form đăng nhập - khi submit sẽ gọi handleEmailPasswordLogin */}
        <form onSubmit={handleEmailPasswordLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            onClick={handleForgotPassword}
            variant="text"
            sx={{
              mt: 1,
              display: "block",
              textAlign: "right",
              color: "#16A34A",
              fontWeight: "bold",
            }}
          >
            Forgot password?
          </Button>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography align="center" variant="body2" mt={3}>
          Don’t have an account?{" "}
          <MuiLink
            component={RouterLink}
            to="/register"
            underline="none"
            color="inherit"
            sx={{
              textDecoration: "none",
              color: "#16A34A",
              fontWeight: "bold",
            }}
          >
            Sign up
          </MuiLink>
        </Typography>

        <Button
          variant="outlined" // Kiểu nút có viền
          onClick={handleGoogleLogin}
          fullWidth
          sx={{ mt: 2, borderColor: "#16A34A", color: "#16A34A" }}
        >
          Login with Google
        </Button>
      </Paper>

      <Snackbar
        open={open} // Hiển thị khi open = true
        autoHideDuration={3000} // Tự động ẩn sau 3 giây (3000ms)
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Vị trí hiển thị
      >
        <Alert
          severity={snackbarType} // Loại thông báo (success, error, warning, info)
          onClose={() => setOpen(false)} // Function đóng thông báo
          sx={{ width: "100%" }} // Chiều rộng 100%
        >
          {snackbarMsg} {/* Nội dung thông báo */}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
