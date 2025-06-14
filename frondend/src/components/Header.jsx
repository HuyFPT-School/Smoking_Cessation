import React, { useContext, useEffect, useState } from "react";
import {
  AppBar, // Thanh điều hướng chính ở trên cùng
  Toolbar, // Container bên trong AppBar để bố trí các thành phần
  Typography, // Component văn bản với các kiểu dáng khác nhau
  Box, // Component container đa năng (tương tự div nhưng có thêm styling)
  Button, // Nút bấm tiêu chuẩn
  IconButton, // Nút bấm dạng biểu tượng, thường nhỏ và tròn
  Avatar, // Hiển thị ảnh đại diện người dùng
  Menu, // Menu dropdown
  MenuItem, // Mục trong menu dropdown
  Drawer, // Panel trượt từ cạnh màn hình (dùng cho menu mobile)
  List, // Danh sách các mục
  ListItem, // Mục trong danh sách
  ListItemText, // Văn bản trong mục danh sách
  useMediaQuery, // Hook để kiểm tra kích thước màn hình
  useTheme, // Hook để truy cập theme MUI
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
// Import context xác thực người dùng
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  // Lấy thông tin người dùng và hàm setUser từ AuthContext
  const { user, setUser } = useContext(AuthContext);
  // State lưu phần tử anchor cho menu dropdown (vị trí hiển thị menu)
  const [anchorEl, setAnchorEl] = useState(null);
  // Hook điều hướng của react-router
  const navigate = useNavigate();
  // Lấy theme của MUI để sử dụng trong useMediaQuery
  const theme = useTheme();
  // Kiểm tra xem màn hình có phải là kích thước di động không (nhỏ hơn breakpoint medium)
  // Nếu isMobile = true: đang xem trên điện thoại, false: đang xem trên máy tính
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // State để điều khiển trạng thái đóng/mở của menu di động
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle opening the profile menu
  const handleMenuOpen = (event) => {
    // Ngăn sự kiện lan truyền (bubbling) lên các phần tử cha
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

  // Toggle the mobile navigation drawer
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMobileMenuOpen(false); // Đóng menu di động khi đăng xuất
    navigate("/login");
  };

  // Mảng chứa thông tin các liên kết chính trong menu
  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Plan", path: "/plan" },
    { label: "Tracking", path: "/tracking" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Blog", path: "/blog" },
    { label: "CoachChat", path: "/coachchat" },
  ];

  // Hook useEffect để xử lý sự kiện click ra ngoài menu profile
  useEffect(() => {
    // Hàm xử lý khi người dùng click vào bất kỳ vị trí nào trên trang
    const handleClickOutside = (event) => {
      if (anchorEl && !anchorEl.contains(event.target)) {
        // Đóng menu bằng cách đặt anchorEl về null
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
            disableRipple //Tắt hiệu ứng gợn sóng khi nhấp vào nút
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
            {/* MuiLink: Component liên kết của MUI */}
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
        {user?.role !== "ADMIN" && !isMobile && (
          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            {navLinks.map((item) => (
              <MuiLink
                key={item.label} // Key là bắt buộc khi render danh sách trong React
                component={RouterLink} // Sử dụng RouterLink để điều hướng nội bộ
                to={item.path}
                underline="none"
                color="text.primary"
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
                  ml: isMobile ? 0 : 18, // Margin-left: 0px trên mobile, 18 * 8px = 144px trên desktop
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
                {/* Hiển thị tùy chọn Quản trị chỉ khi người dùng có vai trò ADMIN */}
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
              {!isMobile && (
                <>
                  <Button
                    variant="outlined" // Kiểu nút có viền, không có nền
                    color="success" // Màu xanh lá (màu thành công)
                  >
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
                  <Button
                    variant="contained" // Kiểu nút có nền màu đậm
                    color="success" // Màu xanh lá (màu thành công)
                  >
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
        anchor="left" // Hiển thị từ cạnh trái màn hình
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation" // Thuộc tính ARIA cho trình đọc màn hình, chỉ ra đây là phần trình bày
          onClick={handleMobileMenuToggle}
          onKeyDown={handleMobileMenuToggle} // Đóng menu khi nhấn phím (như Esc)
        >
          {/* Danh sách các liên kết điều hướng trên mobile */}
          <List sx={{ pt: 2 }}>
            {user?.role !== "ADMIN" &&
              navLinks.map((item) => (
                <ListItem
                  button // Thuộc tính để hiển thị như nút có thể click
                  key={item.label} // Key là bắt buộc khi render danh sách trong React
                  component={RouterLink}
                  to={item.path}
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
                  {/* Text hiển thị tên của liên kết */}
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": { fontWeight: "bold" },
                    }}
                  />
                </ListItem>
              ))}
            {/* Các nút Đăng nhập/Đăng ký trên mobile - Hiển thị khi chưa đăng nhập */}
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
    </AppBar>
  );
};

export default Header;
