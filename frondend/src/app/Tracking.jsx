import React, { useEffect, useState } from "react";
import { Radio, Input, Select, Slider, Button, Tabs } from "antd";
import moment from "moment";
import axios from "axios"; // Import axios
import "antd/dist/reset.css";
import "../App.css";
const { TabPane } = Tabs;

// Khởi tạo danh sách các tùy chọn cho trigger
const triggerOptions = [
  { label: "Stress", value: "stress" },
  { label: "Social", value: "social" },
  { label: "Habit", value: "habit" },
  { label: "Breath time", value: "breathtime" },
  { label: "After meals", value: "aftermeals" },
  { label: "Drinking Coffee", value: "drinkingcoffee" },
  { label: "Drinking Alcohol", value: "drinkingalcohol" },
  { label: "Boredom", value: "boredom" },
  { label: "Social Interaction", value: "socialinteraction" },
  { label: "Other", value: "other" },
];

// Ánh xạ các giá trị trigger
const triggerLabels = {
  stress: "Stress",
  social: "Social",
  habit: "Habit",
  other: "Other",
  breathtime: "Breath time",
  aftermeals: "After meals",
  drinkingcoffee: "Drinking Coffee",
  drinkingalcohol: "Drinking Alcohol",
  boredom: "Boredom",
  socialinteraction: "Social Interaction",
};

const Tracking = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [time, setTime] = useState(moment().format("hh:mm A"));
  const [location, setLocation] = useState("E.g., Balcony, Coffee shop");
  const [trigger, setTrigger] = useState("stress");
  const [satisfaction, setSatisfaction] = useState(10);
  const [cravingIntensity, setCravingIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [activityType, setActivityType] = useState("smoking");
  // Thay đổi: Bắt đầu với mảng rỗng thay vì dữ liệu mẫu
  const [incidents, setIncidents] = useState([]);
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;
  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!userId) return;
      try {
        // GỌI API backend lấy log theo userId (ví dụ: /api/tracking/user/{userId})
        const response = await axios.get(
          `http://localhost:8080/api/tracking/user/${userId}`
        );
        if (response.status === 200) {
          setIncidents(response.data); // data trả về phải là array các incident
        } else {
          setIncidents([]); // Không có data thì set rỗng
        }
      } catch (error) {
        setIncidents([]);
        console.error("Error fetching tracking data:", error);
      }
    };

    fetchTrackingData();
  }, [userId]);

  const handleSubmit = async (e) => {
    // Mark function as async
    e.preventDefault();
    if (!userId) {
      console.error("User ID not found in localStorage");
      // Optionally, display a message to the user
      return;
    }

    const newIncident = {
      date: selectedDate.format("YYYY-MM-DD"),
      time,
      location,
      trigger,
      satisfaction:
        activityType === "smoking" ? satisfaction : cravingIntensity, // Lưu giá trị phù hợp theo loại
      type: activityType,
      notes,
      userId: userId,
    };

    try {
      // Replace 'YOUR_BACKEND_API_ENDPOINT' with your actual API endpoint
      const response = await axios.post(
        "http://localhost:8080/api/tracking",
        newIncident
      );

      if (response.status === 200 || response.status === 201) {
        // Check for successful response
        setIncidents([...incidents, newIncident]);
        // Reset form
        setTime(moment().format("hh:mm A"));
        setLocation("E.g., Balcony, Coffee shop");
        setTrigger("stress");
        setSatisfaction(10);
        setCravingIntensity(5);
        setNotes("");
        console.log("Incident recorded successfully:", response.data);
      } else {
        console.error(
          "Failed to record incident:",
          response.status,
          response.data
        );
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
      // Optionally, display an error message to the user
    }
  };

  const getChartDataFromIncidents = () => {
    // Lấy ngày bắt đầu tuần (Chủ nhật) từ ngày được chọn
    const weekStart = selectedDate.clone().startOf("week");
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return weekDays.map((day, index) => {
      // Tính ngày cho từng ngày trong tuần
      const date = weekStart.clone().add(index, "days");
      const dateStr = date.format("YYYY-MM-DD");
      const count = incidents.filter((incident) => {
        return incident.date === dateStr && incident.type === activityType;
      }).length;
      return { day, smoking: count, date: dateStr };
    });
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.clone().startOf("month");
    const endOfMonth = currentMonth.clone().endOf("month");
    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const startOffset = startDay === 0 ? 6 : startDay - 1;
    const totalDays = daysInMonth + startOffset;
    const weeks = Math.ceil(totalDays / 7);
    const days = [];

    for (let i = 0; i < startOffset; i++) {
      const prevMonthDay = startOfMonth
        .clone()
        .subtract(startOffset - i, "days");
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = startOfMonth.clone().date(i);
      days.push({ date: day, isCurrentMonth: true });
    }

    const remainingDays = weeks * 7 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = endOfMonth.clone().add(i, "days");
      days.push({ date: nextMonthDay, isCurrentMonth: false });
    }

    return days;
  };

  const renderCalendar = () => {
    const days = generateCalendarDays();
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button
            className="calendar-nav-button"
            onClick={() =>
              setCurrentMonth(currentMonth.clone().subtract(1, "month"))
            }
          >
            &lt;
          </button>
          <span className="calendar-month-year">
            Month {currentMonth.format("M")} Year {currentMonth.format("YYYY")}
          </span>
          <button
            className="calendar-nav-button"
            onClick={() =>
              setCurrentMonth(currentMonth.clone().add(1, "month"))
            }
          >
            &gt;
          </button>
        </div>
        <div className="calendar-grid">
          {weekdays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day.isCurrentMonth ? "current-month" : "other-month"
              } ${selectedDate.isSame(day.date, "day") ? "selected-day" : ""}`}
              onClick={() => {
                setSelectedDate(day.date);
                setCurrentMonth(day.date);
              }}
            >
              {day.date.date()}
            </div>
          ))}
        </div>
        <p>Selected Date: {selectedDate.format("DD/MM/YYYY")}</p>
      </div>
    );
  };

  const renderChart = () => {
    const chartData = getChartDataFromIncidents();
    const totalIncidents = chartData.reduce((sum, d) => sum + d.smoking, 0);
    // Hiển thị khoảng tuần
    const weekStart = selectedDate.clone().startOf("week").format("DD/MM");
    const weekEnd = selectedDate.clone().endOf("week").format("DD/MM/YYYY");

    return (
      <div className="chart-container">
        <div className="chart-header">
          <span className="chart-title">
            {activityType === "smoking"
              ? "Smoking Incidents"
              : "Craving Incidents"}
          </span>
          <span style={{ fontSize: "14px", color: "#666", marginLeft: 12 }}>
            Week: {weekStart} - {weekEnd}
          </span>
        </div>
        {totalIncidents === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No {activityType} incidents recorded yet.</p>
            <p>Start recording your activities to see the chart data.</p>
          </div>
        ) : (
          <div className="chart-bars">
            {chartData.map((data, index) => {
              const heightPx = data.smoking * 20;
              // Highlight cột nếu là ngày đang chọn
              const isSelected =
                selectedDate.format("YYYY-MM-DD") === data.date;
              return (
                <div key={index} className="bar-group">
                  <div
                    className="bar smoking"
                    style={{
                      height: `${heightPx}px`,
                      minHeight: data.smoking > 0 ? "20px" : "2px",
                      background: isSelected ? "#1890ff" : undefined,
                      border: isSelected ? "0px solid #0050b3" : undefined,
                    }}
                  />
                  <span className="bar-label">{data.day}</span>
                  <span
                    className="bar-value"
                    style={{ fontSize: "12px", color: "#666" }}
                  >
                    {data.smoking}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Total {activityType} incidents this week: {totalIncidents}
        </div>
      </div>
    );
  };

  // Lọc các sự kiện theo tuần của ngày đang chọn
  const getWeekIncidents = () => {
    const weekStart = selectedDate.clone().startOf("week");
    const weekEnd = selectedDate.clone().endOf("week");

    return incidents.filter((incident) => {
      const incidentDate = moment(incident.date);
      return (
        incidentDate.isSameOrAfter(weekStart, "day") &&
        incidentDate.isSameOrBefore(weekEnd, "day") &&
        incident.type === activityType
      );
    });
  };

  // Sử dụng các sự kiện đã lọc theo tuần thay vì toàn bộ
  const filteredIncidents = getWeekIncidents();

  const countTriggers = () => {
    const triggerCount = {
      stress: 0,
      social: 0,
      habit: 0,
      breathtime: 0,
      other: 0,
      aftermeals: 0,
      drinkingcoffee: 0,
      drinkingalcohol: 0,
      boredom: 0,
      socialinteraction: 0,
    };

    // Chỉ đếm triggers từ các sự kiện trong tuần được chọn
    const weekIncidents = getWeekIncidents();
    weekIncidents.forEach((incident) => {
      if (incident.trigger in triggerCount) {
        triggerCount[incident.trigger]++;
      }
    });
    return triggerCount;
  };

  const triggerCounts = countTriggers();
  const triggersData = Object.keys(triggerCounts).map((key) => ({
    label: triggerLabels[key],
    value: triggerCounts[key],
  }));

  return (
    <div className="tracking-page">
      <div className="tracking-section">
        <h2>Record Activity</h2>
        <p>Track your smoking incidents</p>
        <div className="tracking-content">
          <div className="calendar-section">
            <h3>Select Date</h3>
            <p>Choose a date to record activity or view data</p>
            {renderCalendar()}
          </div>
          <div className="record-section">
            <h3>Record Activity</h3>
            <p>Log a smoking incident</p>
            <form onSubmit={handleSubmit} className="tracking-form">
              <Radio.Group
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="activity-type"
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                <Radio.Button value="craving">Craving Incidents</Radio.Button>
              </Radio.Group>
              {activityType === "smoking" ? (
                <>
                  <div className="form-group">
                    <label>Time</label>
                    <Input
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="06:36 PM"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., Balcony, Coffee shop"
                    />
                  </div>
                  <div className="form-group">
                    <label>Trigger</label>
                    <Select
                      style={{
                        padding: "0px",
                        borderRadius: "6px",
                      }}
                      value={trigger}
                      onChange={(value) => setTrigger(value)}
                      options={triggerOptions}
                    />
                  </div>
                  <div className="form-group">
                    <label>Satisfaction Level (1-10)</label>
                    <Slider
                      style={{
                        padding: "4px",
                        border: "0px",
                      }}
                      value={satisfaction}
                      onChange={(value) => setSatisfaction(value)}
                      min={1}
                      max={10}
                    />
                    <p>
                      Current: {satisfaction} -{" "}
                      {satisfaction <= 3
                        ? "Low satisfaction"
                        : satisfaction <= 7
                        ? "Medium satisfaction"
                        : "High satisfaction"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Time</label>
                    <Input
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="06:36 PM"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., Balcony, Coffee shop"
                    />
                  </div>
                  <div className="form-group">
                    <label>Trigger</label>
                    <Select
                      style={{
                        padding: "0px",
                        borderRadius: "6px",
                      }}
                      value={trigger}
                      onChange={(value) => setTrigger(value)}
                      options={triggerOptions}
                    />
                  </div>
                  <div className="form-group">
                    <label>Craving Intensity Level (1-10)</label>
                    <Slider
                      style={{
                        padding: "4px",
                        border: "0px",
                      }}
                      value={cravingIntensity}
                      onChange={(value) => setCravingIntensity(value)}
                      min={1}
                      max={10}
                    />
                    <p>
                      Current: {cravingIntensity} -{" "}
                      {cravingIntensity <= 3
                        ? "Low intensity"
                        : cravingIntensity <= 7
                        ? "Medium intensity"
                        : "High intensity"}
                    </p>
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Notes</label>
                <Input.TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Emotions, thoughts, effectiveness of coping strategy..."
                  rows={3}
                />
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                {activityType === "smoking"
                  ? "RECORD SMOKING INCIDENT"
                  : "RECORD CRAVING INCIDENT"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="data-analysis-section">
        <h2>Data Analysis</h2>
        <p>Better understand your smoking habits</p>
        <Tabs defaultActiveKey="chart">
          <TabPane tab="Chart" key="chart">
            <div className="chart-header" style={{ marginBottom: "10px" }}>
              <Radio.Group
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="activity-type"
                style={{ marginBottom: "10px" }}
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                <Radio.Button value="craving">Craving Incidents</Radio.Button>
              </Radio.Group>
            </div>
            {renderChart()}
          </TabPane>
          <TabPane tab="Log" key="log">
            <div className="log-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <Radio.Group
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="activity-type"
                >
                  <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                  <Radio.Button value="craving">Craving Incidents</Radio.Button>
                </Radio.Group>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Week: {selectedDate.clone().startOf("week").format("DD/MM")} -{" "}
                  {selectedDate.clone().endOf("week").format("DD/MM/YYYY")}
                </span>
              </div>
            </div>
            {filteredIncidents.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>No {activityType} incidents recorded yet.</p>
                <p>Start recording your activities to see the log data.</p>
              </div>
            ) : (
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Trigger</th>
                    <th>
                      {activityType === "smoking"
                        ? "Satisfaction"
                        : "Intensity"}
                    </th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident, index) => (
                    <tr key={index}>
                      <td>{moment(incident.date).format("DD/MM/YYYY")}</td>
                      <td>{incident.time}</td>
                      <td>{incident.location || "-"}</td>
                      <td>{incident.trigger}</td>
                      <td>{incident.satisfaction}/10</td>
                      <td>{incident.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TabPane>
          <TabPane tab="Triggers" key="triggers">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Radio.Group
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="activity-type"
                  style={{ marginRight: "15px" }}
                >
                  <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                  <Radio.Button value="craving">Craving Incidents</Radio.Button>
                </Radio.Group>
                <h3 style={{ margin: 0 }}>Most Common Triggers</h3>
              </div>
              <span style={{ fontSize: "14px", color: "#666" }}>
                Week: {selectedDate.clone().startOf("week").format("DD/MM")} -{" "}
                {selectedDate.clone().endOf("week").format("DD/MM/YYYY")}
              </span>
            </div>
            {incidents.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>No trigger data available yet.</p>
                <p>Start recording incidents to see trigger analysis.</p>
              </div>
            ) : (
              <>
                <div className="trigger-chart">
                  {triggersData.map((trigger, index) => (
                    <div key={index} className="trigger-bar-group">
                      <span className="trigger-label">{trigger.label}</span>
                      <div
                        className="trigger-bar"
                        style={{
                          width: `${
                            trigger.value > 0
                              ? (trigger.value /
                                  Math.max(
                                    ...triggersData.map((t) => t.value),
                                    1
                                  )) *
                                100
                              : 0
                          }%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                        }}
                      >
                        <span className="trigger-value">{trigger.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p>
                  Chart shows the most common triggers leading to{" "}
                  {activityType === "smoking" ? "smoking" : "craving"}
                </p>
              </>
            )}
          </TabPane>
        </Tabs>
      </div>

      <div className="tips-section">
        <h2>Tips to Overcome Cravings</h2>
        <p>Effective strategies to cope with cravings</p>
        <div className="tips-content">
          <div className="tip-card">
            <h4>The 4D Rule</h4>
            <p>
              <span>Delay:</span> Wait 5-10 minutes, the craving will pass
              <br />
              <span>Deep breathing:</span> Breathe deeply and slowly
              <br />
              <span>Drink water:</span> Drink a glass of water slowly
              <br />
              <span>Do something else:</span> Distract yourself
            </p>
          </div>
          <div className="tip-card">
            <h4>Change Habits</h4>
            <p>
              Identify habits associated with smoking and change them. For
              example, if you usually smoke after meals, brush your teeth
              immediately after eating or take a short walk.
            </p>
          </div>
          <div className="tip-card">
            <h4>Relaxation Techniques</h4>
            <p>
              Practice meditation, yoga, or muscle relaxation exercises when
              feeling stressed instead of smoking. Stress is one of the most
              common triggers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
