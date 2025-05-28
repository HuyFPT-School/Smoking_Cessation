import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"; // Nhập file CSS tùy chỉnh
import Footer from "./components/Footer"; // Import Footer component
import Header from "./components/Header"; // Import Header component
import Tracking from "./app/Tracking"; // Import Tracking component

function App() {
  return (
    <Router>
      {/* Bao bọc toàn bộ ứng dụng trong Router để hỗ trợ định tuyến */}
      <div className="app-container">
        <Header /> {/* Header hiển thị trên tất cả các trang */}
        <Routes>
          {/* Định nghĩa các route cho ứng dụng */}
          <Route path="/tracking" element={<Tracking />} />{" "}
          {/* Route cho trang Tracking */}
          {/* Route mặc định (trang chủ), bạn có thể thay bằng component khác nếu cần */}
          <Route path="/" element={<div>Welcome to BreatheFree</div>} />
        </Routes>
        <Footer /> {/* Footer hiển thị trên tất cả các trang */}
      </div>
    </Router>
  );
}

export default App;
