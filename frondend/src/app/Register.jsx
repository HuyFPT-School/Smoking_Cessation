import React, { useContext, useState } from "react";
import {
  Box, 
  Button, 
  Checkbox, 
  Container, 
  FormControlLabel, 
  Link, 
  TextField, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import axios from "axios";

const Register = () => {
  // Các state (trạng thái) để lưu thông tin người dùng nhập vào form
  const [Username, setUserName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [agreeTerms, setAgreeTerms] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 

  // State để theo dõi trạng thái loading (đang xử lý) - ngăn user bấm nhiều lần
  const [isLoading, setIsLoading] = useState(false);

  // State cho email verification
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  // Các state để quản lý thông báo (snackbar)
  const [open, setOpen] = useState(false); 
  const [snackbarMsg, setSnackbarMsg] = useState(""); 
  const [snackbarType, setSnackbarType] = useState("success"); 

  const navigate = useNavigate();
  // Lấy hàm setUser từ AuthContext để cập nhật thông tin người dùng đã đăng nhập
  const { setUser } = useContext(AuthContext);

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

  // Hàm gửi email xác nhận
  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      showSnackbar("Verification email has been sent! Please check your inbox.", "success");
    } catch (error) {
      console.error("Error sending verification email:", error);
      showSnackbar("Unable to send verification email. Please try again.", "error");
    }
  };

  // Hàm kiểm tra trạng thái xác nhận email
  const checkEmailVerification = async () => {
    if (!tempUser) return;
    
    setCheckingVerification(true);
    try {
      await reload(tempUser);
      if (tempUser.emailVerified) {
        showSnackbar("Email has been verified successfully!", "success");
        setShowVerificationDialog(false);
        
        // Tiếp tục với quá trình đăng ký
        const idToken = await tempUser.getIdToken(true);
        await fetchUserFromBackend(idToken);
      } else {
        showSnackbar("Email has not been verified yet. Please check your inbox.", "warning");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      showSnackbar("Error occurred while checking email verification.", "error");
    } finally {
      setCheckingVerification(false);
    }
  };

  // Hàm gửi lại email xác nhận
  const resendVerificationEmail = async () => {
    if (tempUser) {
      await sendVerificationEmail(tempUser);
    }
  };

  const fetchUserFromBackend = async (idToken) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/user/me", 
        { name: Username }, 
        {
          headers: {
            Authorization: `Bearer ${idToken}`, 
          },
        }
      );
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      showSnackbar(" Registration successful!", "success");
      navigate("/home");
    } catch (err) {
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

  async function handleSubmit(event) {
    // Ngăn chặn hành vi mặc định của form (reload trang)
    event.preventDefault();

    // Bật trạng thái loading để ngăn user bấm nhiều lần
    setIsLoading(true);

    if (!agreeTerms) {
      showSnackbar("⚠️ You must agree to the terms and policies.", "warning");
      setIsLoading(false);
      return; 
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password 
      );

      await updateProfile(result.user, {
        displayName: Username, 
      });

      // Lưu user tạm thời và gửi email xác nhận
      setTempUser(result.user);
      await sendVerificationEmail(result.user);
      setShowVerificationDialog(true);

    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        showSnackbar(
          "Email already exists. Please use another email.",
          "error"
        );
      } else if (err.code === "auth/weak-password") {
        showSnackbar(
          "Password is too weak. Please use a stronger password.",
          "error"
        );
      } else {
        showSnackbar("Registration failed. Please try again.", "error");
      }
    } finally {
      // Dù thành công hay thất bại, đều tắt trạng thái loading
      setIsLoading(false);
    }
  }
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 8, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in your details to register
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth 
            label="Username" 
            margin="normal" 
            value={Username} 
            onChange={(e) => setUserName(e.target.value)} 
            required 
          />
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
            helperText="Password must be more than 6 characters" 
            required
            error={password.length > 0 && password.length < 6}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)} 
                color="success" 
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
            sx={{ mt: 1 }} 
          />

          {/* Nút Register */}
          <Button
            fullWidth
            type="submit" 
            variant="contained" 
            disabled={isLoading}
            sx={{
              mt: 2, 
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803d" }, 
            }}
          >
            {isLoading ? "Registering..." : "Register"}{" "}
          </Button>
        </form>

        <Typography align="center" variant="body2" mt={3}>
          Already have an account?{" "}
          <MuiLink
            component={RouterLink} 
            to="/login" 
            underline="none"
            color="inherit"
            sx={{ color: "#16A34A", fontWeight: "bold" }}
          >
            Login
          </MuiLink>
        </Typography>
      </Paper>

      {/* Dialog xác nhận email */}
      <Dialog 
        open={showVerificationDialog} 
        onClose={() => {}} // Không cho phép đóng bằng cách click ra ngoài
        maxWidth="sm"
        fullWidth
        className="email-verification-dialog"
        PaperProps={{
          className: "email-verification-content"
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Email Verification
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We have sent a verification email to:
          </Typography>
          <Typography 
            variant="body1" 
            fontWeight="bold" 
            className="verification-email-text"
            sx={{ mb: 2 }}
          >
            {email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please check your inbox and click on the verification link, 
            then click the "Check Verification" button below.
          </Typography>
          
          {verificationSent && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Verification email has been sent successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={checkEmailVerification}
            disabled={checkingVerification}
            className="verification-button"
            sx={{
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            {checkingVerification ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Checking...
              </>
            ) : (
              "Check Verification"
            )}
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={resendVerificationEmail}
            disabled={checkingVerification}
            sx={{
              borderColor: "#16A34A",
              color: "#16A34A",
              "&:hover": { 
                borderColor: "#15803d",
                bgcolor: "rgba(22, 163, 74, 0.04)"
              },
            }}
          >
            Resend verification email
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setShowVerificationDialog(false);
              // Xóa user tạm thời nếu hủy
              if (tempUser) {
                tempUser.delete().catch(console.error);
                setTempUser(null);
              }
              setVerificationSent(false);
            }}
            sx={{ color: "text.secondary", mt: 1 }}
          >
            Cancel registration
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={open} 
        autoHideDuration={3000} 
        onClose={() => setOpen(false)} 
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} 
      >
        <Alert
          severity={snackbarType} // Loại alert (success/error/warning)
          onClose={() => setOpen(false)} 
          sx={{ width: "100%" }}
        >
          {snackbarMsg} 
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
