import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"; 
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Login from "./app/Login";
import Register from "./app/Register";
import Tracking from "./app/Tracking";
import DashboardPage from "./app/DashboardPage";
import HomePage from "./app/HomePage";
import Plan from "./app/Plan";
import CommunityBlogPage from "./app/CommunityBlogPage"; 
import LeaderboardPage from "./app/LeaderboardPage";
import Profile from "./app/Profile";
import CoachChat from "./app/CoachChat"; 
import AdminPanelPage from "./app/AdminPanelPage";
import SuperAdminPanelPage from "./app/SuperAdminPanelPage";

function AppContent() {
  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/superadmin");

  return (
    <>
      <Header />
      <Routes>
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<CommunityBlogPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/coachchat" element={<CoachChat />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/superadmin" element={<SuperAdminPanelPage />} />
        <Route path="/superadmin/user-profile/:userId" element={<Profile />} />
        <Route path="/admin/user-profile/:userId" element={<Profile />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
