import { Segmented } from 'antd';
import { useState } from "react";
import { Card, Row, Col, Button,  Avatar, Typography, Divider } from "antd";
import { Link } from "react-router-dom";
import { ClockCircleOutlined, FileDoneOutlined, UserOutlined } from '@ant-design/icons';
import { TrophyOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import React from 'react';
import {
  FilterOutlined,
  TeamOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";



const { Text, Title } = Typography;


// Component chính hiển thị trang Leaderboard
const LeaderboardPage = () => {
  // State dùng để lưu khoảng thời gian hiển thị bảng xếp hạng
  const [timeRange, setTimeRange] = useState('This Week');

  // Dữ liệu giả lập về bảng xếp hạng người dùng
  const leaderboardData = [
    { id: 1, rank: 1, name: "Nguyễn Văn A", tier: "Platinum", totalPoints: 1500, weeklyPoints: 250, monthlyPoints: 700, startDate: "2025-05-01" },
    { id: 2, rank: 2, name: "Trần Thị B", tier: "Platinum", totalPoints: 1350, weeklyPoints: 220, monthlyPoints: 650, startDate: "2025-05-022" },
    { id: 3, rank: 3, name: "Lê Văn C", tier: "Platinum", totalPoints: 1200, weeklyPoints: 200, monthlyPoints: 600, startDate: "2025-05-05" },
    { id: 4, rank: 4, name: "Phạm Thị D", tier: "Gold", totalPoints: 850, weeklyPoints: 180, monthlyPoints: 550, startDate: "2025-05-07" },
    { id: 5, rank: 5, name: "Hoàng Văn E", tier: "Gold", totalPoints: 750, weeklyPoints: 160, monthlyPoints: 500, startDate: "2025-05-09" },
    { id: 6, rank: 6, name: "Ngô Thị F", tier: "Gold", totalPoints: 650, weeklyPoints: 140, monthlyPoints: 450, startDate: "2025-05-11" },
    { id: 7, rank: 7, name: "Đỗ Văn G", tier: "Bronze", totalPoints: 500, weeklyPoints: 120, monthlyPoints: 400, startDate: "2025-05-13" },
    { id: 8, rank: 8, name: "Vũ Thị H", tier: "Bronze", totalPoints: 450, weeklyPoints: 100, monthlyPoints: 350, startDate: "2025-05-15" },
    { id: 9, rank: 9, name: "Đặng Văn I", tier: "Platinum", totalPoints: 1100, weeklyPoints: 90, monthlyPoints: 300, startDate: "2025-05-17" },
    { id: 10, rank: 10, name: "Bùi Thị K", tier: "Gold", totalPoints: 800, weeklyPoints: 80, monthlyPoints: 280, startDate: "2025-05-18" },
    { id: 11, rank: 11, name: "Trần Văn L", tier: "Gold", totalPoints: 700, weeklyPoints: 70, monthlyPoints: 260, startDate: "2025-05-19" },
    { id: 12, rank: 12, name: "Lê Thị M", tier: "Bronze", totalPoints: 550, weeklyPoints: 60, monthlyPoints: 240, startDate: "2025-05-20" },
    { id: 13, rank: 13, name: "Phạm Văn N", tier: "Platinum", totalPoints: 1300, weeklyPoints: 50, monthlyPoints: 220, startDate: "2025-05-21" },
    { id: 14, rank: 14, name: "Hoàng Thị O", tier: "Gold", totalPoints: 900, weeklyPoints: 45, monthlyPoints: 200, startDate: "2025-05-22" },
    { id: 15, rank: 15, name: "Ngô Văn P", tier: "Gold", totalPoints: 650, weeklyPoints: 40, monthlyPoints: 180, startDate: "2025-05-23" },
    { id: 16, rank: 16, name: "Đỗ Thị Q", tier: "Bronze", totalPoints: 400, weeklyPoints: 35, monthlyPoints: 160, startDate: "2025-05-24" },
    { id: 17, rank: 17, name: "Vũ Văn R", tier: "Platinum", totalPoints: 1400, weeklyPoints: 30, monthlyPoints: 140, startDate: "2025-05-25" },
    { id: 18, rank: 18, name: "Đặng Thị S", tier: "Gold", totalPoints: 750, weeklyPoints: 25, monthlyPoints: 120, startDate: "2025-05-26" },
    { id: 19, rank: 19, name: "Bùi Văn T", tier: "Gold", totalPoints: 600, weeklyPoints: 20, monthlyPoints: 100, startDate: "2025-05-27" },
    { id: 20, rank: 20, name: "Trần Thị U", tier: "Bronze", totalPoints: 350, weeklyPoints: 15, monthlyPoints: 80, startDate: "2025-05-28" },
    { id: 21, rank: 21, name: "Lê Văn V", tier: "Bronze", totalPoints: 300, weeklyPoints: 10, monthlyPoints: 60, startDate: "2025-05-29" },
    { id: 22, rank: 22, name: "Phạm Thị X", tier: "Bronze", totalPoints: 200, weeklyPoints: 5, monthlyPoints: 40, startDate: "2025-05-30" },
    { id: 23, rank: 23, name: "Hoàng Văn Y", tier: "Platinum", totalPoints: 1100, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-01" },
    { id: 24, rank: 24, name: "Ngô Thị Z", tier: "Gold", totalPoints: 800, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-05" },
    { id: 25, rank: 25, name: "Đỗ Văn AA", tier: "Platinum", totalPoints: 1300, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-10" },
    { id: 26, rank: 26, name: "Vũ Thị BB", tier: "Gold", totalPoints: 900, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-15" },
    { id: 27, rank: 27, name: "Đặng Văn CC", tier: "Gold", totalPoints: 700, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-20" },
    { id: 28, rank: 28, name: "Bùi Thị DD", tier: "Bronze", totalPoints: 500, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-25" },
    { id: 29, rank: 29, name: "Trần Văn EE", tier: "Platinum", totalPoints: 1200, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-30" },
    { id: 30, rank: 30, name: "Lê Thị FF", tier: "Diamond", totalPoints: 4000, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-04-01" },
    { id: 31, rank: 31, name: "Nguyễn Văn GG", tier: "Legend", totalPoints: 7000, weeklyPoints: 0, monthlyPoints: 0, startDate: "2025-03-01" },
  ];

   // Định nghĩa màu nền theo từng cấp bậc (tier) của người dùng
  const tierColors = {
    Legend: '#D3C9FF',
    Diamond: '#F8632F',
    Platinum: '#97D0EF',
    Gold: '#F4C220',
    Silver: '#F9FAFB',
    Bronze: '#FFFBEB'
  };

  // Ngày hiện tại được cố định là 31/05/2025
  const currentDate = new Date('2025-05-31');
  
  // Tính toán ngày bắt đầu của tuần hiện tại (bắt đầu từ Chủ Nhật)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());           // Chuyển sang Chủ nhật của tuần hiện tại
  startOfWeek.setHours(0, 0, 0, 0);

   // Tính toán ngày bắt đầu của tháng hiện tại
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Hàm lọc dữ liệu theo khoảng thời gian người dùng chọn
  const getFilteredData = () => {
    let filteredData = [...leaderboardData];

     // Tính số ngày không hút thuốc từ startDate đến ngày hiện tại
    filteredData = filteredData.map(user => {
      const startDate = new Date(user.startDate);
      const timeDiff = currentDate.getTime() - startDate.getTime();
      const daysSinceStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24));     // Chuyển đổi mili giây thành ngày
      return { ...user, days: daysSinceStart >= 0 ? daysSinceStart : 0 };      // Đảm bảo số ngày không âm
    });
    

    // Lọc theo từng khoảng thời gian
    if (timeRange === 'This Week') {
      // Lọc những người dùng hoạt động trong tuần hiện tại (startDate >= startOfWeek)
      filteredData = filteredData
        .filter(user => {
          const startDate = new Date(user.startDate);
          return startDate >= startOfWeek;
        })
        .sort((a, b) => b.weeklyPoints - a.weeklyPoints)          // Sắp xếp theo điểm hàng tuần
        .slice(0, 15)                                             // Giới hạn hiển thị cho 15 người dùng hàng đầu
        .map((user, index) => ({ ...user, rank: index + 1 }));    // Phân lại hạng
    

    } else if (timeRange === 'This Month') {
      // Lọc người dùng hoạt động trong tháng hiện tại (startDate >= startOfMonth)
      filteredData = filteredData
        .filter(user => {
          const startDate = new Date(user.startDate);
          return startDate >= startOfMonth;
        })
        .sort((a, b) => b.monthlyPoints - a.monthlyPoints)        // Sắp xếp theo điểm hàng tháng
        .slice(0, 15)                                             // Giới hạn hiển thị cho 15 người dùng hàng đầu
        .map((user, index) => ({ ...user, rank: index + 1 }));    // Phân lại hạng


    } else if (timeRange === 'All Time') {
      // Hiển thị tất cả người dùng, được sắp xếp theo tổng điểm
      filteredData = filteredData
        .sort((a, b) => b.totalPoints - a.totalPoints)            // Sắp xếp theo điểm tổng
        .slice(0, 15)                                             // Giới hạn hiển thị cho 15 người dùng hàng đầu
        .map((user, index) => ({ ...user, rank: index + 1 }));    // Phân lại hạng
    }

    return filteredData;
  };

  const filteredLeaderboardData = getFilteredData();

   // Hàm hiển thị bảng xếp hạng chung
  const renderLeaderboard = (data, title) => (

    // Tiêu để
    <div className="leaderboard-section">
      <p style={{ color: "#000", margin: "0 0 0 0", fontWeight: "bolder", fontSize: "22px", marginBottom: "7px" }}>
        {title}
      </p>
      <p style={{ color: "#595959", margin: "0 0 16px 0" }}>
        Updated at 00:00 every {timeRange === 'This Week' ? 'Sunday' : timeRange === 'This Month' ? '1st of the month' : 'day'}
      </p>

      {/* Tên của các cột data */}
      <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 24]} className="leaderboard-header">
        <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Rank</Col>
        <Col span={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>User</Col>
        <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Badge</Col>
        <Col span={4}>Smoke-Free Days</Col>
        <Col span={2}>Points</Col>
        <Col span={2}></Col>
      </Row>

       {/* Render data ra bảng xếp hạng */}
      {data.length === 0 ? (
        <p>No users found for {timeRange}.</p>
      ) : (
        // Loading data ra các cột cho từng user theo index
        data.map((user, index) => (
          <React.Fragment key={user.id}>

            <Row
              gutter={[{ xs: 8, sm: 16, md: 24 }, 0]}
              className={`leaderboard-card ${user.tier.toLowerCase()}`}
              style={{ padding: '10px',transition: 'background-color 0.3s ease',':hover': { backgroundColor: '#f5f5f5'} }}
            >
              {/* Cột Rank */}
              <Col span={2}>
                <div className="Rank-list"
                     style={{ backgroundColor: user.rank === 1 ? '#fadb14' : user.rank === 2 ? '#d9d9d9' : user.rank === 3 ? '#fa8c16' : "#fff" }}
                >
                     {user.rank}
                </div>
              </Col>
               
              {/* Cột User */}
              <Col span={6} style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                <Avatar size={50}
                        className="bg-gray-300"
                        style={{display: 'block',backgroundColor: '#f0f0f0', marginRight: '10px'}}
                />
                        {user.name}
              </Col>

              {/* Cột Badge */}
              <Col span={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="user-tier" 
                     style={{ backgroundColor: tierColors[user.tier] || '#fff' }}
                >
                     {user.tier}
                </div>
              </Col>

              {/* Cột Smoke-Free Days */}
              <Col span={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   {user.days}
              </Col>

              {/* Cột Point */}
              <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <strong>
                  {timeRange === 'This Week' ? user.weeklyPoints : timeRange === 'This Month' ? user.monthlyPoints : user.totalPoints}
                </strong>
              </Col>

              {/* Cột view */}
              <Col span={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Link to={`/profile/${user.id}`}>View</Link>
                   {/* KHI NÀO CÓ TRANG PROFILE THIF XỬ LẠI Ở ĐÂY */}
              </Col>

            </Row>
            {index < data.length - 1 && <Divider style={{ margin: '0' }} />}     {/* Thêm dấu gạch ngang giữa các user */}
          </React.Fragment>
        ))
      )}
    </div>
  );
  // Kết thúc bảng xếp hạng chung 

  return (
    <div className="Leaderboard-Backgroup">

      {/* Hàng welcome cho trang Leaderboard */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#262626", marginBottom: "5px", fontWeight: "700", fontSize: '30px' }}>
            Leaderboard
          </h2>
          <p style={{ color: "#595959", margin: 0 }}>
            Track your progress and others' in the smoking cessation journey
          </p>
        </div>
        <div>
          <Button icon={<FilterOutlined />} style={{ marginLeft: "8px", marginRight: "8px" }}>
            Filter
          </Button>
          <Button icon={<TeamOutlined />}>
            Friends
          </Button>
        </div>
      </div>
      

      {/* Bảng hiển thị user đang dùng trang web */}
      <Card className="user-highlight-card">
        <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 16]} align="middle">
          <Col xs={24} sm={12} md={12}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="user-avatar-container">
                <div className="user-avatar" />
                <span className="user-rank">42</span>
              </div>
              <div className="user-info" style={{ marginLeft: '16px' }}>
                <div className="user-name">Bạn</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="user-tier" style={{ backgroundColor: tierColors['Silver'] || '#fff' }}>
                    Silver
                  </div>
                  <p className="user-days">14 smoke-free days</p>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="user-points-title">Points</div>
              <div className="user-points-value">620</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="user-rank-title">Rank</div>
              <div className="user-rank-value">
                    42 <ArrowUpOutlined style={{ color: "#52c41a" }} />
              </div>
            </div>
            {/* Link liên kết tới trang profile */}
            <Link to="/profile">
              <Button type="primary" className="view-profile-button">
                    View Profile
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* Top 3 Users */}
      <Row gutter={[{ xs: 8, sm: 16, md: 24 }, 16]} style={{ marginBottom: '20px' }}>
        {filteredLeaderboardData.slice(0, 3).map((user) => (

          <Col xs={24} sm={12} md={8} key={user.id}>
            <Card
              className="flex flex-col items-center text-center shadow-lg"
              style={{borderRadius: '8px', padding: '16px', backgroundColor: user.rank === 1 ? '#fffbe6' : '#ffffff',height: '310px',boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}}
            >

              <div style={{display: 'flex',justifyContent: 'center',marginBottom: '1rem' }}>
                <div style={{position: 'relative',width: '70px',height: '70px'}}>
                  {/* avatar */}
                  <Avatar
                    size={64}
                    className="bg-gray-300"
                    style={{display: 'block',backgroundColor: '#f0f0f0',border: user.rank === 1 ? '2px solid #fadb14' : '2px solid transparent'}}
                  />
                   {/* rank */}
                  <div className="Rank-avatar"
                       style={{backgroundColor: user.rank === 1 ? '#fadb14' : user.rank === 2 ? '#d9d9d9' : '#fa8c16' }}
                  >
                      {user.rank}
                  </div>
                </div>
              </div>
              

              <div style={{display: 'flex',flexDirection: 'column',alignItems: 'center',gap: '4px'}}> 
                 {/* name */}
                 <Title level={4} style={{ marginBottom: 0 }}>
                    {user.name}
                 </Title>
                 {/* tier */}
                 <div className="user-tier" style={{ backgroundColor: tierColors[user.tier] || '#fff' }}>
                    {user.tier}
                 </div>
                 {/* smoke-days free */}
                 <Text style={{ color: '#666' }}>
                    {user.days} smoke-free days
                 </Text>
                 {/* point */}
                 <Text strong style={{ fontSize: '1.125rem' }}>
                    {timeRange === 'This Week' ? user.weeklyPoints : timeRange === 'This Month' ? user.monthlyPoints : user.totalPoints} điểm
                 </Text>
                 {user.rank === 1 && <TrophyOutlined style={{ marginTop: '8px', fontSize: '24px', color: '#fadb14' }} />}  {/* Cup cho top 1 */}
              </div>

            </Card>
          </Col>
        ))}
      </Row>
      
       {/* 3 nút chọn week, month, all */}
      <Segmented
        className="custom-segmented"
        options={['This Week', 'This Month', 'All Time']}
        value={timeRange}
        onChange={setTimeRange}
        style={{ marginBottom: 24 }}
        block
      />
      

      {/* Gọi hàm renderLeaderboard, khi thay đổi timeRange để render bảng xếp hạng */}
      {timeRange === 'This Week' && renderLeaderboard(filteredLeaderboardData, "This Week's Leaderboard")}
      {timeRange === 'This Month' && renderLeaderboard(filteredLeaderboardData, "This Month's Leaderboard")}
      {timeRange === 'All Time' && renderLeaderboard(filteredLeaderboardData, "All Time Leaderboard")}
      

      
      {/* Phần Hướng dẫn "How Points are Calculated" */}
      <Card className="points-card">

        {/* Tiêu để */}
        <Title level={3} className="card-title">
             How Points are Calculated
        </Title>
        <Text className="card-subtitle">
             Understand how we calculate points and rankings
        </Text>

        {/* Container */}
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>

          {/* Cột Smoke-Free Days */}
          <Col span={8}>
            <div className="points-column">
              <ClockCircleOutlined className="column-icon" />
              <Text strong className="column-title">
                Smoke-Free Days
              </Text>
              <div className="points-list">
                <Text className="points-item">Each smoke-free day: +10 points</Text>
                <Text className="points-item">7-day streak: +50 points</Text>
                <Text className="points-item">30-day streak: +200 points</Text>
              </div>
            </div>
          </Col>
          
          {/* Cột Achievements */}
          <Col span={8}>
            <div className="points-column">
              <FileDoneOutlined className="column-icon" />
              <Text strong className="column-title">
                Achievements
              </Text>
              <div className="points-list">
                <Text className="points-item">Unlock achievements: +20-100 points</Text>
                <Text className="points-item">Complete goals: +30 points</Text>
                <Text className="points-item">Reach new milestones: +50 points</Text>
              </div>
            </div>
          </Col>
          
          {/* Cột Community Activity */}
          <Col span={8}>
            <div className="points-column">
              <UserOutlined className="column-icon" />
              <Text strong className="column-title">
                Community Activity
              </Text>
              <div className="points-list">
                <Text className="points-item">Share progress: +5 points</Text>
                <Text className="points-item">Help others: +10 points</Text>
                <Text className="points-item">Contribute posts: +20 points</Text>
              </div>
            </div>
          </Col>

        </Row>

      </Card>
      {/* Kết thúc "How Points are Calculated" */}
      
    </div>
  );
};

export default LeaderboardPage;