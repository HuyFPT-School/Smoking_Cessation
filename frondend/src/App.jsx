import { BrowserRouter, Route, Routes } from "react-router";
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

function App() {
  const { Content } = Layout;
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Content className="dashboard-content-wrapper">
          <Routes>
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Content>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
