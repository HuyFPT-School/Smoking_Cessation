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
} from "@mui/material";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router";
import { Link as MuiLink } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import axios from "axios";

const Register = () => {
  const [Username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [open, setOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const showSnackbar = (message, type = "success") => {
    setSnackbarMsg(message);
    setSnackbarType(type);
    setOpen(true);
  };

  const fetchUserFromBackend = async (idToken) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/user/me",
        { name: Username }, // Gửi tên người dùng vào body
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const user = res.data.user || res.data; // đề phòng 2 format khác nhau
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      showSnackbar("✅ Registration successful!", "success");
      navigate("/home");
    } catch (err) {
      console.error("Error fetching user:", err);
      showSnackbar("Failed to load user info", "error");
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!agreeTerms) {
      showSnackbar("⚠️ You must agree to the terms and policies.", "warning");
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

      // 🔁 Đợi Firebase cập nhật profile
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🔐 Lấy token mới sau khi update profile (đảm bảo name đúng)
      const idToken = await result.user.getIdToken(true);

      await fetchUserFromBackend(idToken);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        showSnackbar(
          "❌ Email already exists. Please use another email.",
          "error"
        );
      } else {
        showSnackbar("Registration failed. Please try again.", "error");
      }
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
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Password must be more 5 characters"
            required
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

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            Register
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

export default Register;
