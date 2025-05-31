import React, { useState } from "react";
import { Radio, Input, Select, Slider, Button, Tabs } from "antd";
import moment from "moment";
import "antd/dist/reset.css";
import "../App.css";
const { TabPane } = Tabs;

// Khởi tạo danh sách các tùy chọn cho trigger
const triggerOptions = [
  { label: "Stress", value: "stress" },
  { label: "Social", value: "social" },
  { label: "Habit", value: "habit" },
  { label: "Other", value: "other" },
];

// Ánh xạ các giá trị trigger
const triggerLabels = {
  stress: "Stress",
  social: "Social",
  habit: "Habit",
  other: "Other",
};

const Tracking = () => {
  const [selectedDate, setSelectedDate] = useState(moment("2025-04-17"));
  const [currentMonth, setCurrentMonth] = useState(moment("2025-04-17"));
  const [time, setTime] = useState(moment().format("hh:mm A"));
  const [location, setLocation] = useState("E.g., Balcony, Coffee shop");
  const [trigger, setTrigger] = useState("stress");
  const [satisfaction, setSatisfaction] = useState(10);
  const [notes, setNotes] = useState("");
  const [activityType, setActivityType] = useState("smoking");
  // Thay đổi: Bắt đầu với mảng rỗng thay vì dữ liệu mẫu
  const [incidents, setIncidents] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIncident = {
      date: selectedDate.format("YYYY-MM-DD"),
      time,
      location,
      trigger,
      satisfaction,
      type: "smoking",
      notes,
    };
    setIncidents([...incidents, newIncident]);
    // Reset form
    setTime(moment().format("hh:mm A"));
    setLocation("E.g., Balcony, Coffee shop");
    setTrigger("stress");
    setSatisfaction(10);
    setNotes("");
  };

  const getChartDataFromIncidents = () => {
    const today = new Date();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return weekDays.map((day, index) => {
      // Get date for each day in the last 7 days
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index)); // Last 7 days including today
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      const count = incidents.filter((incident) => {
        return incident.date === dateStr && incident.type === "smoking";
      }).length;

      return { day, smoking: count };
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
    // Đặt giá trị tối đa cố định hoặc tính toán một cách hợp lý
    const maxVal = Math.max(...chartData.map((d) => d.smoking), 10); // Tối thiểu là 10
    const totalIncidents = chartData.reduce((sum, d) => sum + d.smoking, 0);

    console.log("Chart Data:", chartData);
    console.log("Max Value:", maxVal);

    return (
      <div className="chart-container">
        <div className="chart-header">
          <span className="chart-title">Smoking Incidents</span>
          <Select defaultValue="last7days" style={{ width: 120 }}>
            <Select.Option value="last7days">Last 7 Days</Select.Option>
          </Select>
        </div>
        {totalIncidents === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No smoking incidents recorded yet.</p>
            <p>Start recording your activities to see the chart data.</p>
          </div>
        ) : (
          <div className="chart-bars">
            {chartData.map((data, index) => {
              // Tính chiều cao theo pixel thay vì phần trăm
              const heightPx = data.smoking * 20; // Mỗi incident = 20px

              return (
                <div key={index} className="bar-group">
                  <div
                    className="bar smoking"
                    style={{
                      height: `${heightPx}px`,
                      minHeight: data.smoking > 0 ? "20px" : "2px",
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
          Total incidents this week: {totalIncidents}
        </div>
      </div>
    );
  };

  const filteredIncidents = incidents.filter(
    (incident) => incident.type === "smoking"
  );

  const countTriggers = () => {
    const triggerCount = { stress: 0, social: 0, habit: 0, other: 0 };
    incidents.forEach((incident) => {
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
              </Radio.Group>
              <>
                <div className="form-group">
                  <label>Time</label>
                  <Input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="06:36 PM"
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
                    value={trigger}
                    onChange={(value) => setTrigger(value)}
                    options={triggerOptions}
                  />
                </div>
                <div className="form-group">
                  <label>Satisfaction Level (1-10)</label>
                  <Slider
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
                RECORD SMOKING INCIDENT
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
            {renderChart()}
          </TabPane>
          <TabPane tab="Log" key="log">
            <div className="log-header">
              <Radio.Group
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="activity-type"
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
              </Radio.Group>
            </div>
            {filteredIncidents.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>No smoking incidents recorded yet.</p>
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
                    <th>Intensity</th>
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
            <h3>Most Common Triggers</h3>
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
                <p>Chart shows the most common triggers leading to smoking</p>
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
              Delay: Wait 5-10 minutes, the craving will pass
              <br />
              Deep breathing: Breathe deeply and slowly
              <br />
              Drink water: Drink a glass of water slowly
              <br />
              Do something else: Distract yourself
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
