import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer, // Panel trượt từ cạnh màn hình (dùng cho menu mobile)
  List,
  ListItem,
  ListItemText,
  useMediaQuery, // Hook để kiểm tra kích thước màn hình
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  // Lấy thông tin người dùng và hàm setUser từ AuthContext
  const { user, setUser } = useContext(AuthContext);
  // State lưu phần tử anchor cho menu dropdown (vị trí hiển thị menu)
  const [anchorEl, setAnchorEl] = useState(null);

  // State cho notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const navigate = useNavigate();
  // Lấy theme của MUI để sử dụng trong useMediaQuery
  const theme = useTheme();
  // Kiểm tra xem màn hình có phải là kích thước di động không (nhỏ hơn breakpoint medium)
  // Nếu isMobile = true: đang xem trên điện thoại, false: đang xem trên máy tính
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRole = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

  const handleMenuOpen = (event) => {
    // Điều này giúp tránh việc menu tự động đóng ngay khi mở do sự kiện click
    event.stopPropagation();
    // Lưu phần tử được click (avatar) làm điểm neo để hiển thị menu
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the profile menu
  const handleMenuClose = () => {
    // Đặt anchorEl về null để đóng menu dropdown
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // Mảng chứa thông tin các liên kết chính trong menu
  const navLinks = [
    { label: "Dashboard", path: "/dashboard", protected: true },
    { label: "Plan", path: "/plan", protected: true },
    { label: "Tracking", path: "/tracking", protected: true },
    { label: "Leaderboard", path: "/leaderboard", protected: false },
    { label: "Blog", path: "/blog", protected: false },
  ];

  // Hàm xử lý click vào navigation link
  const handleNavClick = (event, link) => {
    // Nếu link cần đăng nhập mà user chưa đăng nhập
    if (link.protected && (!user || !user.id)) {
      event.preventDefault(); // Ngăn navigation
      setNotificationMessage("You need to login to access " + link.label);
      setShowNotification(true);
      return;
    }
    // Nếu đã đăng nhập hoặc link không cần bảo vệ thì cho phép navigation bình thường
  };

  // Hàm đóng notification
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Hook useEffect để xử lý sự kiện click ra ngoài menu profile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (anchorEl && !anchorEl.contains(event.target)) {
        setAnchorEl(null);
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
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        top: 0,
        zIndex: 1000,
        backgroundColor: " rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "black",
            }}
          >
            <MuiLink
              component={RouterLink} // Sử dụng RouterLink để điều hướng nội bộ
              to="/"
              underline="none"
              color="inherit"
              sx={{ textDecoration: "none" }}
            >
              BreatheFree
            </MuiLink>
          </Typography>
        </Box>
        {!isAdminRole && !isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            {navLinks.map((item) => (
              <MuiLink
                key={item.label} // Key là bắt buộc khi render danh sách trong React
                component={RouterLink}
                to={item.path}
                underline="none"
                color="text.primary"
                onClick={(event) => handleNavClick(event, item)}
                sx={{
                  fontWeight: "bold",
                  transition: "0.2s",
                  "&:hover": { color: "#16A34A" },
                }}
              >
                {item.label}
              </MuiLink>
            ))}
          </Box>
        )}
        {/* Nút menu hamburger cho điện thoại - Chỉ hiển thị khi đang xem trên màn hình nhỏ */}
        {isMobile && (
          <IconButton
            edge="start" // Vị trí ở đầu container
            color="inherit"
            aria-label="menu" // Nhãn cho người dùng trình đọc màn hình (accessibility)
            onClick={handleMobileMenuToggle}
            sx={{ color: "black" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </IconButton>
        )}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          {user ? (
            <>
              <Avatar
                alt={user.name}
                src={user.avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  ml: isMobile ? 0 : 18,
                }}
                onClick={handleMenuOpen}
              />
              <Menu
                anchorEl={anchorEl} // Phần tử neo để định vị menu (avatar đã click)
                open={Boolean(anchorEl)} // Menu mở khi anchorEl !== null
                onClose={handleMenuClose}
                anchorOrigin={{
                  // Vị trí gốc neo của menu
                  vertical: "bottom", // Hiển thị dưới phần tử neo
                  horizontal: "right", // Canh phải với phần tử neo
                }}
                transformOrigin={{
                  // Điểm biến đổi của menu
                  vertical: "top", // Từ trên xuống
                  horizontal: "right", // Canh phải
                }}
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
                    Admin
                  </MenuItem>
                )}

                {user.role === "SUPER_ADMIN" && (
                  <MenuItem
                    onClick={() => {
                      navigate("/superadmin");
                      handleMenuClose();
                    }}
                  >
                    Admin (Super Admin)
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {!isMobile && (
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
            </>
          )}
        </Box>
      </Toolbar>

      {/* Menu trượt cho điện thoại di động - Hiển thị từ bên trái màn hình khi mobileMenuOpen = true */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation" // Thuộc tính ARIA cho trình đọc màn hình, chỉ ra đây là phần trình bày
          onClick={handleMobileMenuToggle}
          onKeyDown={handleMobileMenuToggle}
        >
          {/* Danh sách các liên kết điều hướng trên mobile */}
          <List sx={{ pt: 2 }}>
            {user &&
              user.role !== "ADMIN" &&
              user.role !== "SUPER_ADMIN" &&
              navLinks.map((item) => (
                <ListItem
                  button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  onClick={(event) => handleNavClick(event, item)}
                  sx={{
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "rgba(22, 163, 74, 0.1)",
                      "& .MuiListItemText-primary": {
                        color: "#16A34A",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": { fontWeight: "bold" },
                    }}
                  />
                </ListItem>
              ))}

            {/* 👉 Nếu chưa đăng nhập (user = null), hiện nút login/register */}
            {!user && (
              <>
                <ListItem
                  button
                  component={RouterLink}
                  to="/login"
                  sx={{ py: 1.5 }}
                >
                  <ListItemText primary="Log In" />
                </ListItem>
                <ListItem
                  button
                  component={RouterLink}
                  to="/register"
                  sx={{
                    py: 1.5,
                    bgcolor: "rgba(22, 163, 74, 0.1)",
                    "& .MuiListItemText-primary": {
                      color: "#16A34A",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <ListItemText primary="Sign up" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {notificationMessage}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => {
                handleCloseNotification();
                navigate("/login");
              }}
              sx={{
                color: "inherit",
                textDecoration: "underline",
                minWidth: "auto",
                mr: 1,
              }}
            >
              Login
            </Button>
            <Button
              size="small"
              onClick={() => {
                handleCloseNotification();
                navigate("/register");
              }}
              sx={{
                color: "inherit",
                textDecoration: "underline",
                minWidth: "auto",
              }}
            >
              Sign up
            </Button>
          </Box>
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Header;
