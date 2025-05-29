import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Layout } from 'antd';
import DashboardPage from './app/DashboardPage';
import Tracking from "./app/Tracking"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 

// gọi layout
const { Content } = Layout;

function App() {
  return (
    <>
      <Router>
      <Layout>
        <Header />
        <Content className="dashboard-content-wrapper">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
    </>
  );
}

export default App;
 