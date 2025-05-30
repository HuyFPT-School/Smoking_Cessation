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
import Plan from "./app/Plan";
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
