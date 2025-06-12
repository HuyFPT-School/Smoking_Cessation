import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Calendar,
  Checkbox,
  Button,
  Slider,
  Progress,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SmileOutlined,
  HeartOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  SkinOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";
import "../App.css";

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

// HealthChart Component
const HealthChart = ({ labels, datasets }) => {
  const isSavingsChart =
    datasets.length === 1 && datasets[0].label === "Money Saved";

  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "start",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
          font: {
            size: 13,
            weight: "normal",
          },
          color: "#555",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            return isSavingsChart
              ? `Money Saved: $${value}`
              : `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        ticks: {
          stepSize: isSavingsChart ? 5 : 2,
          callback: function (value) {
            return isSavingsChart ? `$${value}` : value;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} height={300} />;
};

const ProgressPage = () => {
  // State for DashboardSummary
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [healthScore, setHealthScore] = useState(7);
  const [moodScore, setMoodScore] = useState(5);
  const [energyScore, setEnergyScore] = useState(5);
  const [cravingScore, setCravingScore] = useState(5);

  // State for ProgressAnalysis
  const [activeTab, setActiveTab] = useState("health");

  const symptomOptions = [
    "Cough",
    "Headache",
    "Insomnia",
    "Nausea",
    "Constipation",
    "Anxiety",
    "Fatigue",
    "Depression",
    "Sore Throat",
    "Lack of Focus",
  ];

  const sampleLabels = ["June 1", "June 3", "June 5", "June 7"];

  const sampleHealthData = [
    {
      label: "Breathing Quality",
      data: [3, 4, 5, 6],
      borderColor: "#52c41a",
      backgroundColor: "rgba(82, 196, 26, 0.2)",
    },
    {
      label: "Energy Level",
      data: [2, 3, 4, 5],
      borderColor: "#1890ff",
      backgroundColor: "rgba(24, 144, 255, 0.2)",
    },
    {
      label: "Mood",
      data: [3, 3, 4, 5],
      borderColor: "#722ed1",
      backgroundColor: "rgba(114, 46, 209, 0.2)",
    },
  ];

  const sampleCravingData = [
    {
      label: "Craving Intensity",
      data: [8, 7, 6, 5],
      borderColor: "#f5222d",
      backgroundColor: "rgba(245, 34, 45, 0.2)",
    },
  ];

  const sampleSavingsData = [
    {
      label: "Money Saved",
      data: [5, 10, 15, 20],
      borderColor: "#d48806",
      backgroundColor: "rgba(250, 173, 20, 0.2)",
    },
  ];

  const benefits = [
    {
      title: "Respiratory System",
      icon: <SmileOutlined />,
      points: [
        "Improved lung function",
        "Reduced coughing and shortness of breath",
        "Lower risk of respiratory infections",
        "Restoration of lung cilia",
      ],
    },
    {
      title: "Cardiovascular System",
      icon: <HeartOutlined />,
      points: [
        "Reduced risk of heart attack",
        "More stable blood pressure",
        "Improved blood circulation",
        "Lower risk of stroke",
      ],
    },
    {
      title: "Mental Health",
      icon: <BulbOutlined />,
      points: [
        "Reduced anxiety and stress",
        "Better sleep quality",
        "Improved focus and concentration",
        "Enhanced overall mood",
      ],
    },
    {
      title: "Appearance",
      icon: <SkinOutlined />,
      points: [
        "Healthier and brighter skin",
        "Whiter teeth with less staining",
        "Fresher breath",
        "Reduced wrinkles and premature aging",
      ],
    },
    {
      title: "Physical Strength",
      icon: <ThunderboltOutlined />,
      points: [
        "Increased stamina and strength",
        "Better physical mobility",
        "Less fatigue",
        "Faster recovery ability",
      ],
    },
    {
      title: "Lower Health Risks",
      icon: <ExclamationCircleOutlined />,
      points: [
        "Lower risk of lung cancer",
        "Reduced risk of chronic obstructive pulmonary disease",
        "Decreased risk of diabetes",
        "Increased average lifespan",
      ],
    },
  ];

  const improvements = [
    {
      title: "Heart Rate & Blood Pressure",
      desc: "Return to normal levels",
      time: "20 minutes",
      status: "done",
    },
    {
      title: "Carbon Monoxide Level",
      desc: "Drops to normal in the bloodstream",
      time: "12 hours",
      status: "done",
    },
    {
      title: "Blood Circulation",
      desc: "Improves, reducing heart attack risk",
      time: "2–3 weeks",
      status: "done",
    },
    {
      title: "Lung Function",
      desc: "Significantly improves; reduced coughing & shortness of breath",
      time: "1–3 months",
      status: "inprogress",
      percent: 70,
    },
    {
      title: "Heart Disease Risk",
      desc: "Reduced to half compared to smokers",
      time: "1 year",
      status: "inprogress",
      percent: 0,
    },
  ];

  const renderProgressContent = () => {
    const contentMap = {
      health: sampleHealthData,
      craving: sampleCravingData,
      savings: sampleSavingsData,
    };

    const dataset = contentMap[activeTab];

    return (
      <div className="progress-content">
        <div className="tab-container">
          {[
            { key: "health", label: "Health", icon: "♡" },
            { key: "craving", label: "Cravings", icon: <FireOutlined /> },
            { key: "savings", label: "Savings", icon: "$" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-button ${isActive ? "active" : ""}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="chart-container">
          {dataset.length > 0 ? (
            <HealthChart labels={sampleLabels} datasets={dataset} />
          ) : (
            <div className="chart-placeholder"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="progress-page">
      {/* Dashboard Summary Section */}
      <h2 className="section-title">Smoking Progress</h2>
      <p className="section-description">
        Track your health improvements and smoke-free journey
      </p>

      <Row gutter={16} className="summary-row">
        {[
          {
            title: "Smoke-Free Days",
            icon: "🕘",
            value: "7",
            color: "#389e0d",
            note: "Keep up the great work!",
            bg: "#f6ffed",
            border: "1px solid #b7eb8f",
          },
          {
            title: "Money Saved",
            icon: "💵",
            value: "$70",
            color: "#096dd9",
            note: "Based on $10/pack",
            bg: "#e6f7ff",
            border: "1px solid #91d5ff",
          },
          {
            title: "Cigarettes Avoided",
            icon: "🚬",
            value: "140",
            color: "#722ed1",
            note: "20 cigarettes/day",
            bg: "#f9f0ff",
            border: "1px solid #d3adf7",
          },
          {
            title: "Health Milestones",
            icon: "❤️",
            value: "3/5",
            color: "#cf1322",
            note: "Milestones achieved",
            bg: "#fff1f0",
            border: "1px solid #ffa39e",
          },
        ].map((item, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card
              className="summary-card"
              style={{ background: item.bg, border: item.border }}
              bodyStyle={{ padding: 0 }}
            >
              <div className="card-header">
                <p className="card-title">{item.title}</p>
                <span className="card-icon">{item.icon}</span>
              </div>
              <div className="card-value" style={{ color: item.color }}>
                {item.value}
              </div>
              <p className="card-note" style={{ color: item.color }}>
                {item.note}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} className="checkin-row">
        <Col xs={24} md={8}>
          <Card className="calendar-card">
            <p className="card-title">Select Date</p>
            <p className="card-description">
              Choose a date to review or record your health status
            </p>
            <Calendar
              fullscreen={false}
              value={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              className="custom-calendar"
              headerRender={({ value, onChange }) => {
                const current = value.clone();
                const months = dayjs.months();
                const years = [];
                for (let i = 2020; i <= 2030; i++) {
                  years.push(
                    <option key={i} value={i}>
                      {i}
                    </option>
                  );
                }
                return (
                  <div className="calendar-header">
                    <select
                      value={current.month()}
                      onChange={(e) =>
                        onChange(current.month(Number(e.target.value)))
                      }
                      className="calendar-select"
                    >
                      {months.map((month, index) => (
                        <option key={month} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={current.year()}
                      onChange={(e) =>
                        onChange(current.year(Number(e.target.value)))
                      }
                      className="calendar-select"
                    >
                      {years}
                    </select>
                  </div>
                );
              }}
            />
            <p className="selected-date">
              Selected date: {selectedDate.format("DD/MM/YYYY")}
            </p>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card className="checkin-card">
            <p className="card-title">Daily Health Check-in</p>
            <p className="card-description">
              Monitor your physical and mental state during your quit journey
            </p>
            <Row gutter={24}>
              <Col span={12}>
                {[
                  {
                    label: "Breathing Quality (1-10)",
                    value: healthScore,
                    onChange: setHealthScore,
                    minLabel: "Shortness of breath",
                    maxLabel: "Easy breathing",
                  },
                  {
                    label: "Mood (1-10)",
                    value: moodScore,
                    onChange: setMoodScore,
                    minLabel: "Low",
                    maxLabel: "Great",
                  },
                ].map(({ label, value, onChange, minLabel, maxLabel }) => (
                  <div key={label} className="slider-container">
                    <div className="slider-header">
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      value={value}
                      onChange={onChange}
                    />
                    <div className="slider-labels">
                      <span>{minLabel}</span>
                      <span>{maxLabel}</span>
                    </div>
                  </div>
                ))}
              </Col>
              <Col span={12}>
                {[
                  {
                    label: "Energy Level (1-10)",
                    value: energyScore,
                    onChange: setEnergyScore,
                    minLabel: "Exhausted",
                    maxLabel: "Energetic",
                  },
                  {
                    label: "Craving Intensity (1-10)",
                    value: cravingScore,
                    onChange: setCravingScore,
                    minLabel: "None",
                    maxLabel: "Very strong",
                  },
                ].map(({ label, value, onChange, minLabel, maxLabel }) => (
                  <div key={label} className="slider-container">
                    <div className="slider-header">
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                    <Slider
                      min={1}
                      max={10}
                      value={value}
                      onChange={onChange}
                    />
                    <div className="slider-labels">
                      <span>{minLabel}</span>
                      <span>{maxLabel}</span>
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
            <p className="symptoms-label">Withdrawal Symptoms</p>
            <Checkbox.Group
              options={symptomOptions}
              className="checkbox-group"
            />
            <p className="notes-label">Additional Notes</p>
            <textarea
              placeholder="Describe how you feel, any symptoms, or changes you've noticed..."
              className="notes-textarea"
            />
            <Button type="primary" className="submit-button">
              Submit Health Log
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Progress Analysis Section */}
      <Card className="progress-card">
        <div className="progress-header">
          <div>
            <h2 className="progress-title">Progress Overview</h2>
            <p className="progress-description">
              Monitor your physical and emotional changes throughout your quit
              journey
            </p>
          </div>
          <button className="filter-button">📅 Last 7 days</button>
        </div>
        {renderProgressContent()}
      </Card>

      {/* Health Improvements Section */}
      <Card className="improvements-card" bodyStyle={{ padding: 0 }}>
        <div className="improvements-header">
          <h2 className="improvements-title">Health Improvements</h2>
          <p className="improvements-description">
            Discover the health benefits you’ve achieved by quitting smoking
          </p>
        </div>
        <div className="improvements-content">
          <div className="improvements-list">
            {improvements.map((item, idx) => {
              const isDone = item.status === "done";
              return (
                <div
                  key={idx}
                  className={`improvement-item ${isDone ? "done" : ""}`}
                >
                  <div className="item-header">
                    <div className="item-info">
                      <span className={`item-icon ${isDone ? "done" : ""}`}>
                        {isDone ? (
                          <CheckCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )}
                      </span>
                      <div>
                        <div className="item-title">{item.title}</div>
                        <div className="item-description">{item.desc}</div>
                      </div>
                    </div>
                    <div className="item-status">
                      <span className="time-badge">{item.time}</span>
                      <span className={`status-text ${isDone ? "done" : ""}`}>
                        {isDone ? "Achieved" : "In Progress"}
                      </span>
                    </div>
                  </div>
                  {!isDone && (
                    <div className="progress-container">
                      <div className="progress-label">Progress</div>
                      <Progress
                        percent={item.percent}
                        strokeColor="#000"
                        trailColor="#f0f0f0"
                        showInfo
                        size="small"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Health Benefits Section */}
      <Card className="benefits-card">
        <h2 className="benefits-title">Health Benefits of Quitting Smoking</h2>
        <p className="benefits-description">
          Positive changes are happening in your body
        </p>
        <Row gutter={[16, 16]}>
          {benefits.map((item, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card className="benefit-item">
                <div className="benefit-header">
                  <span className="benefit-icon">{item.icon}</span>
                  {item.title}
                </div>
                <ul className="benefit-list">
                  {item.points.map((point, i) => (
                    <li key={i} className="benefit-point">
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default ProgressPage;
