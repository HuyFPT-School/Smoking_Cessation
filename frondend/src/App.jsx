import { BrowserRouter, Route, Routes } from "react-router-dom"; // Sửa "react-router" thành "react-router-dom"
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Login from "./app/Login";
import Register from "./app/Register";
import Home from "./app/Home";
import Tracking from "./app/Tracking";
import DashboardPage from "./app/DashboardPage";
import { Layout } from "antd";
import HomePage from "./app/HomePage";
import Plan from "./app/Plan";
import CommunityBlogPage from "./app/CommunityBlogPage"; // Thêm import cho CommunityBlogPage
import LeaderboardPage from "./app/LeaderboardPage";
import Profile from "./app/Profile";
function App() {
  const { Content } = Layout;
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />

        <Routes>
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blog" element={<CommunityBlogPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
