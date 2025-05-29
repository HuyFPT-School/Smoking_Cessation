import { AuthProvider } from "./context/AuthContext";
import Login from "./app/Login";
import Register from "./app/Register";
import Home from "./app/Home";
import Tracking from "./app/Tracking";
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardPage from "./app/DashboardPage";


function App() {
  // gọi layout
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
 