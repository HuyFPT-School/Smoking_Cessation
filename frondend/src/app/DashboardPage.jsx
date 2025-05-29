import { useState } from 'react';                        // Hook useState để quản lý trạng thái
import { Card, Row, Col, Tabs, Radio, Tag } from 'antd'; // Các thành phần giao diện từ Ant Design
import { Line } from '@ant-design/charts';               // Biểu đồ đường từ thư viện Ant Design Charts
import { Divider } from 'antd';                          // Thành phần phân cách của Ant Design
import { Segmented } from 'antd';                        // Thành phần Segmented để tạo nút chuyển đổi tab
import HealthMilestones from './HealthMilestones';
import { Link } from 'react-router-dom';
       // Nhập component HealthMilestones để hiển thị cột mốc sức khỏe

// Nhập các biểu tượng từ Ant Design Icons
import {
  ArrowUpOutlined,
  DollarCircleOutlined,
  FireOutlined,
  FlagOutlined,
} from '@ant-design/icons';

// Định nghĩa component DashboardPage
const DashboardPage = () => {
  // Khởi tạo state activeTab để theo dõi tab đang được chọn (mặc định là 'Progress')
  const [activeTab, setActiveTab] = useState('Progress');

  // Dữ liệu giả lập cho biểu đồ tiến độ, tạo mảng 28 ngày với giá trị progress ngẫu nhiên
  const data = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1, // Ngày từ 1 đến 28
    progress: 20 + Math.random() * 60, // Giá trị tiến độ ngẫu nhiên từ 20 đến 80
  }));

  // Cấu hình cho biểu đồ đường hiển thị tiến độ
  const chartConfig = {
    data,                                // Dữ liệu cho biểu đồ
    xField: 'day',                       // Trục X là ngày
    yField: 'progress',                  // Trục Y là giá trị tiến độ
    height: 200,                         // Chiều cao biểu đồ
    smooth: true,                        // Làm mượt đường cong
    point: { size: 4, shape: 'circle' }, // Hiển thị các điểm trên biểu đồ
    color: '#52c41a',                    // Màu xanh lá cho biểu đồ
  };

  // Phần JSX để render giao diện
  return (
    // Container chính của trang Dashboard, chứa toàn bộ nội dung
    <div className='Dashboard-Backgroup'>

      {/* Phần chào mừng người dùng */}
      <h2 style={{ color: '#262626', marginBottom: '5px' }}>
        Welcome back, John
        {/* Tiêu đề chào mừng người dùng, hiển thị tên "John" */}
      </h2>
      <p style={{ color: '#595959', marginBottom: '24px' }}>
        You’ve been smoke-free for 28 days. Keep going!
        {/* Thông báo động viên, hiển thị số ngày không hút thuốc (28 ngày) */}
      </p>

      {/* Hàng các khung thông tin đầu tiên */}
      <Row gutter={[24, 24]} className="dashboard-row-spacing">
        {/* Sử dụng Row của Ant Design để tạo bố cục lưới, khoảng cách 24px giữa các cột */}

        {/* Khung 1: Số ngày không hút thuốc */}
        <Col span={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <FireOutlined />
              {/* Biểu tượng ngọn lửa cho khung Days Smoke-Free */}
            </div>
            <div className="dashboard-card-title">Days Smoke-Free</div>
            <p className="dashboard-card-value">28</p>
            {/* Hiển thị số ngày không hút thuốc: 28 ngày */}
            <p className="dashboard-card-subtext">You're on a streak!</p>
            {/* Thông điệp động viên */}
          </div>
        </Col>

        {/* Khung 2: Số tiền tiết kiệm */}
        <Col span={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <DollarCircleOutlined />
              {/* Biểu tượng đồng tiền cho khung Money Saved */}
            </div>
            <div className="dashboard-card-title">Money Saved</div>
            <p className="dashboard-card-value">$280</p>
            <p className="dashboard-card-subtext">Based on $10/day</p>
          </div>
        </Col>

        {/* Khung 3: Số điếu thuốc tránh được */}
        <Col span={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <ArrowUpOutlined />
              {/* Biểu tượng mũi tên lên cho khung Cigarettes Avoided */}
            </div>
            <div className="dashboard-card-title">Cigarettes Avoided</div>
            <p className="dashboard-card-value">560</p>

            <p className="dashboard-card-subtext">Based on 20/day</p>

          </div>
        </Col>

        {/* Khung 4: Cột mốc tiếp theo */}
        <Col span={6}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <FlagOutlined />
              {/* Biểu tượng cờ cho khung Next Milestone */}
            </div>
            <div className="dashboard-card-title">Next Milestone</div>
            <p className="dashboard-card-value">1 Month</p>
            <p className="dashboard-card-subtext">2 days to go</p>
          </div>
        </Col>
      </Row>
      {/* Kết thúc hàng các khung thông tin đầu tiên */}

      {/* Khung Smoking Status */}
      <Card
        title="🚬SMOKING STATUS"
        className="smoking-status-card"
      // Card của Ant Design để hiển thị trạng thái hút thuốc
      >
        <div className="card-content">
          {/* Nội dung bên trong card */}
          <p className="subtitle">Track your smoking habits and cravings</p>


          {/* Bố cục chính của card, chia thành 2 cột lớn */}
          <Row gutter={48} className="main-layout">
            {/* Khoảng cách 48px giữa các cột */}

            {/* Cột trái: Thống kê trạng thái hút thuốc */}
            <Col span={12} className="stats-container">
              {/* Container chứa các thống kê */}

              {/* Hàng 1: Thống kê hôm nay và hôm qua */}
              <Row gutter={32} className="stats-section">
                {/* Khoảng cách 32px giữa các cột con */}

                {/* Thống kê hôm nay */}
                <Col span={12} className="stat-item">
                  <h3>🚬Today</h3>
                  <div className="stat-details">
                    <div><span className="stat-label">Cigarettes:</span> <span style={{ fontWeight: 'bold' }}>0</span></div>
                    {/* Hiển thị số điếu thuốc hôm nay: 0 */}
                    <div><span className="stat-label">Cravings:</span> <span style={{ fontWeight: 'bold' }}>2</span></div>
                    {/* Hiển thị số cơn thèm hôm nay: 2 */}
                  </div>
                </Col>

                {/* Thống kê hôm qua */}
                <Col span={12} className="stat-item">
                  <h3>🚬Yesterday</h3>
                  <div className="stat-details">
                    <div><span className="stat-label">Cigarettes:</span> <span style={{ fontWeight: 'bold' }}>0</span></div>
                    {/* Hiển thị số điếu thuốc hôm qua: 0 */}
                    <div><span className="stat-label">Cravings:</span> <span style={{ fontWeight: 'bold' }}>3</span></div>
                    {/* Hiển thị số cơn thèm hôm qua: 3 */}
                  </div>
                </Col>
              </Row>

              <Divider />
              {/* Đường phân cách giữa các phần thống kê */}

              {/* Hàng 2: Thống kê 7 ngày qua */}
              <Row className="stats-section-last-7-days">
                <Col span={24} className="stat-item">
                  <h3>🚬Last 7 days</h3>
                  <div className="stat-details">
                    <div><span className="stat-label">Total cigarettes:</span> <span style={{ fontWeight: 'bold' }}>1</span></div>

                    <div><span className="stat-label">Total cravings:</span> <span style={{ fontWeight: 'bold' }}>12</span></div>

                    <div><span className="stat-label">Resistance rate:</span> <span style={{ fontWeight: 'bold' }}>92%</span></div>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Cột phải: Các yếu tố kích thích cơn thèm */}
            <Col span={12} className="triggers-section">
              <h3>🔥Common triggers</h3>

              <div className="triggers-list">
                <Tag style={{ backgroundColor: '#ffffff', color: '#666', border: 'none', fontSize: '14px' }}>⚡Căng thẳng</Tag>
                <Tag style={{ backgroundColor: '#ffffff', color: '#666', border: 'none', fontSize: '14px' }}>⚡Sau bữa ăn</Tag>
                <Tag style={{ backgroundColor: '#ffffff', color: '#666', border: 'none', fontSize: '14px' }}>⚡Uống cà phê</Tag>
                {/* Hiển thị danh sách các yếu tố kích thích cơn thèm */}
              </div>
              <Divider />
              {/* Đường phân cách */}
              <p>
                Identifying triggers helps you better prepare to deal with cravings.
              </p>
              <Link to="/tracking" className="record-button">
                Record Smoking Status
              </Link>
            </Col>
          </Row>
        </div>
      </Card>
      {/* Kết thúc khung Smoking Status */}

      {/* Phần thống kê cuối: Tiến độ và Lợi ích sức khỏe */}
      <Col className="Last-item">
        {/* Container chứa toàn bộ phần thống kê cuối */}

        {/* Nút chuyển đổi giữa Progress và Health Benefits */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <Segmented
            options={['Progress', 'Health Benefits']}
            value={activeTab}
            onChange={setActiveTab}
            className="custom-segmented"
          />
          {/* Segmented của Ant Design để chuyển đổi giữa 2 tab: Progress và Health Benefits */}
        </div>

        {/* Tab Progress: Hiển thị biểu đồ tiến độ */}
        {activeTab === 'Progress' && (
          <div style={{ minHeight: 'calc(100vh - 200px)', paddingBottom: '60px' }}>
            <h3>Your Progress</h3>
            <p>Track your smoke-free journey over time</p>
            <Line {...chartConfig} style={{ minHeight: '300px' }} />
          </div>
        )}

        {/* Tab Health Benefits: Hiển thị cột mốc sức khỏe */}
        {activeTab === 'Health Benefits' && (
          <div>
            <h3>Health Improvements</h3>
            <p>See how your body is healing</p>
            <HealthMilestones />
            {/* Component HealthMilestones hiển thị các cột mốc sức khỏe */}
          </div>
        )}
      </Col>
      {/* Kết thúc phần thống kê cuối */}
    </div>
  );
};


export default DashboardPage;