import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Link,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";
import { Link as MuiLink } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, setUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    event.stopPropagation(); // chặn lan
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (anchorEl && !anchorEl.contains(event.target)) {
        setAnchorEl(null); // đóng menu nếu click ra ngoài
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [anchorEl]);

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "white",
        boxShadow: 2,
        top: 0,
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo + Brand */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            disableRipple
            component={RouterLink}
            to="/"
            sx={{ mr: 1 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
            <MuiLink
              component={RouterLink}
              to="/home"
              underline="none"
              color="inherit"
              sx={{ textDecoration: "none" }}
            >
              BreatheFree
            </MuiLink>
          </Typography>
        </Box>

        {/* Menu */}
        {user?.role !== "ADMIN" && (
          <Box sx={{ display: "flex", gap: 3 }}>
            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Plan", path: "/plan" },
              { label: "Tracking", path: "/tracking" },
              { label: "Leaderboard", path: "/leaderboard" },
              { label: "Blog", path: "/blog" },
            ].map((item) => (
              <MuiLink
                key={item.label}
                component={RouterLink}
                to={item.path}
                underline="none"
                color="text.primary"
                sx={{
                  fontWeight: "bold", // hoặc 600 hoặc 700 tuỳ ý
                  transition: "0.2s",
                  "&:hover": { color: "#16A34A" },
                }}
              >
                {item.label}
              </MuiLink>
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {user ? (
            <>
              {/* ✅ Avatar nên KHÔNG bị gói trong Box onClick */}
              <Avatar
                alt={user.name}
                src={user.avatarUrl}
                sx={{ width: 36, height: 36, cursor: "pointer", ml: 18 }}
                onClick={handleMenuOpen}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem disabled>
                  {user.name} ({user.role})
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleMenuClose();
                  }}
                >
                  Profile
                </MenuItem>
                {user.role === "ADMIN" && (
                  <MenuItem
                    onClick={() => {
                      navigate("/admin");
                      handleMenuClose();
                    }}
                  >
                    Quản trị
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button variant="outlined" color="success">
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  underline="none"
                  color="inherit"
                  sx={{ textDecoration: "none" }}
                >
                  Log In
                </MuiLink>
              </Button>
              <Button variant="contained" color="success">
                <MuiLink
                  component={RouterLink}
                  to="/register"
                  underline="none"
                  color="inherit"
                  sx={{ textDecoration: "none" }}
                >
                  Sign up
                </MuiLink>
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
