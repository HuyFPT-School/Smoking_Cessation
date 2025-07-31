import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth, provider } from "../firebase";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  // State quản lý form đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State quản lý thông báo
  const [open, setOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  // State loading
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  // Hiển thị thông báo
  const showSnackbar = (message, type = "success") => {
    setSnackbarMsg(message);
    setSnackbarType(type);
    setOpen(true);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  // Lấy thông tin user từ backend sau khi đăng nhập thành công
  const fetchUserFromBackend = async (idToken) => {
    try {
      // Gọi API lấy thông tin user
      const res = await axios.get("https://smoking-cessation.azurewebsites.net/api/user/me", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const user = res.data;

      // Lưu user vào localStorage và context
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      // Điều hướng theo role
      if (user.role === "SUPER_ADMIN") {
        navigate("/superadmin");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
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
  // Xử lý đăng nhập bằng email/password
  const handleEmailPasswordLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Đăng nhập Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // Lấy thông tin user từ backend
      await fetchUserFromBackend(idToken);
    } catch (err) {
      console.error("Firebase login error:", err);
      showSnackbar("Incorrect email or password", "error");
    } finally {
      setIsLoading(false);
    }
  };
  // Xử lý quên mật khẩu
  const handleForgotPassword = async () => {
    if (!email) {
      showSnackbar("Please enter your email address first", "warning");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showSnackbar("Password reset email sent!", "success");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      showSnackbar(
        "Failed to send reset email. Please check your email.",
        "error"
      );
    }
  };
  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await fetchUserFromBackend(idToken);
    } catch (error) {
      console.error("Google login failed:", error);
      showSnackbar("Google login failed", "error");
    }
  };
  // Giao diện đăng nhập
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 8, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" mt={1}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your credentials to access your account
          </Typography>
        </Box>

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
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          variant="outlined"
          onClick={handleGoogleLogin}
          fullWidth
          sx={{ mt: 2, borderColor: "#16A34A", color: "#16A34A" }}
        >
          Login with Google
        </Button>
      </Paper>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarType}
          onClose={() => setOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
