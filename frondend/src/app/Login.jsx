import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const showSnackbar = (message, type = "success") => {
    setSnackbarMsg(message);
    setSnackbarType(type);
    setOpen(true);
  };

  const fetchUserFromBackend = async (idToken) => {
    try {
      const res = await axios.get("http://localhost:8080/api/user/me", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const user = res.data;
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      navigate(user.role === "ADMIN" ? "/admin" : "/home");
    } catch (err) {
      console.error("Error fetching user:", err);
      showSnackbar("Failed to load user info", "error");
    }
  };

  const handleEmailPasswordLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await fetchUserFromBackend(idToken);
    } catch (err) {
      console.error("Firebase login error:", err);
      showSnackbar("Incorrect email or password", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
