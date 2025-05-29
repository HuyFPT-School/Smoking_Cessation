import React, { useState } from "react";
import { Radio, Input, Select, Slider, Button, Tabs } from "antd";
import moment from "moment";
import "antd/dist/reset.css"; // Thêm CSS của antd để đảm bảo giao diện đẹp
import "../App.css"; // Nhập file CSS tùy chỉnh cho ứng dụng
const { TabPane } = Tabs;

// Khởi tạo danh sách các tùy chọn cho trigger, đây là các giá trị người dùng có thể chọn
const triggerOptions = [
  { label: "Stress", value: "stress" },
  { label: "Social", value: "social" },
  { label: "Habit", value: "habit" },
  { label: "Other", value: "other" },
];

// Ánh xạ các giá trị trigger sang nhãn tiếng Việt (dùng nội bộ để tính toán, không hiển thị trên UI)
const triggerLabels = {
  stress: "Stress",
  social: "Social",
  habit: "Habit",
  other: "Other",
};

// Dữ liệu giả lập cho biểu đồ trong tab "Chart", hiển thị số lần hút thuốc và thèm thuốc mỗi ngày
const chartData = [
  { day: "Mon", smoking: 5, craving: 7 }, // T2
  { day: "Tue", smoking: 4, craving: 6 }, // T3
  { day: "Wed", smoking: 6, craving: 9 }, // T4
  { day: "Thu", smoking: 3, craving: 5 }, // T5
  { day: "Fri", smoking: 2, craving: 4 }, // T6
  { day: "Sat", smoking: 4, craving: 6 }, // T7
  { day: "Sun", smoking: 1, craving: 3 }, // CN
];

const Tracking = () => {
  // Khởi tạo các state để quản lý dữ liệu trong form và giao diện
  const [selectedDate, setSelectedDate] = useState(moment("2025-04-17")); // Ngày được chọn mặc định là 17/04/2025
  const [currentMonth, setCurrentMonth] = useState(moment("2025-04-17")); // Tháng hiện tại để hiển thị lịch
  const [time, setTime] = useState(moment().format("hh:mm A")); // Thời gian hiện tại, định dạng 12 giờ (VD: 06:36 PM)
  const [location, setLocation] = useState("E.g., Balcony, Coffee shop"); // Vị trí mặc định cho form Smoking
  const [trigger, setTrigger] = useState("stress"); // Trigger mặc định
  const [satisfaction, setSatisfaction] = useState(10); // Mức độ hài lòng, dùng cho Smoking (1-10)
  const [cravingIntensity, setCravingIntensity] = useState(5); // Độ mạnh cơn thèm, dùng cho Cravings (1-10)
  const [copingStrategy, setCopingStrategy] = useState(""); // Chiến lược đối phó, dùng cho Cravings
  const [notes, setNotes] = useState(""); // Ghi chú bổ sung
  const [activityType, setActivityType] = useState("smoking"); // Loại hoạt động: "smoking" hoặc "craving"
  const [incidents, setIncidents] = useState([]); // Danh sách các bản ghi (Smoking hoặc Craving)

  // Hàm xử lý khi người dùng submit form để ghi lại hoạt động (Smoking hoặc Craving)
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form (reload trang)
    const newIncident = {
      date: selectedDate.format("YYYY-MM-DD"), // Ngày của bản ghi
      time, // Thời gian
      ...(activityType === "smoking" && {
        // Nếu là Smoking, thêm các thông tin liên quan
        location,
        trigger,
        satisfaction,
        type: "smoking",
      }),
      ...(activityType === "craving" && {
        // Nếu là Craving, thêm các thông tin liên quan
        trigger,
        cravingIntensity,
        copingStrategy,
        type: "craving",
      }),
      notes, // Ghi chú
    };
    setIncidents([...incidents, newIncident]); // Thêm bản ghi mới vào danh sách
    // Reset các trường sau khi submit
    setLocation("E.g., Balcony, Coffee shop");
    setNotes("");
    setCopingStrategy("");
  };

  // Hàm tạo danh sách các ngày trong tháng để hiển thị trên lịch
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.clone().startOf("month"); // Ngày đầu tiên của tháng
    const endOfMonth = currentMonth.clone().endOf("month"); // Ngày cuối cùng của tháng
    const startDay = startOfMonth.day(); // Ngày đầu tháng là thứ mấy (0: CN, 1: T2, ..., 6: T7)
    const daysInMonth = endOfMonth.date(); // Số ngày trong tháng

    const startOffset = startDay === 0 ? 6 : startDay - 1; // Tính offset để T2 là cột đầu tiên
    const totalDays = daysInMonth + startOffset; // Tổng số ngày cần hiển thị (bao gồm ngày của tháng trước)
    const weeks = Math.ceil(totalDays / 7); // Số tuần cần hiển thị
    const days = []; // Danh sách các ngày sẽ hiển thị trên lịch

    // Thêm các ngày của tháng trước để lấp đầy các ô đầu tiên
    for (let i = 0; i < startOffset; i++) {
      const prevMonthDay = startOfMonth
        .clone()
        .subtract(startOffset - i, "days");
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Thêm các ngày của tháng hiện tại
    for (let i = 1; i <= daysInMonth; i++) {
      const day = startOfMonth.clone().date(i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Thêm các ngày của tháng sau để lấp đầy các ô còn lại
    const remainingDays = weeks * 7 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = endOfMonth.clone().add(i, "days");
      days.push({ date: nextMonthDay, isCurrentMonth: false });
    }

    return days;
  };

  // Hàm vẽ lịch dạng lưới để người dùng chọn ngày
  const renderCalendar = () => {
    const days = generateCalendarDays(); // Lấy danh sách các ngày từ hàm generateCalendarDays
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Tên các ngày trong tuần bằng tiếng Anh

    return (
      <div className="calendar-wrapper">
        {/* Phần tiêu đề của lịch, hiển thị tháng và năm, cùng với nút điều hướng */}
        <div className="calendar-header">
          <button
            className="calendar-nav-button"
            onClick={() =>
              setCurrentMonth(currentMonth.clone().subtract(1, "month"))
            }
          >
            &lt; {/* Nút để quay lại tháng trước */}
          </button>
          <span className="calendar-month-year">
            Month {currentMonth.format("M")} Year {currentMonth.format("YYYY")}{" "}
            {/* Hiển thị tháng và năm hiện tại */}
          </span>
          <button
            className="calendar-nav-button"
            onClick={() =>
              setCurrentMonth(currentMonth.clone().add(1, "month"))
            }
          >
            &gt; {/* Nút để chuyển sang tháng sau */}
          </button>
        </div>
        {/* Phần lưới hiển thị các ngày */}
        <div className="calendar-grid">
          {/* Hiển thị tên các ngày trong tuần (T2 - CN) */}
          {weekdays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}
          {/* Hiển thị các ngày trong tháng */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day.isCurrentMonth ? "current-month" : "other-month"
              } ${selectedDate.isSame(day.date, "day") ? "selected-day" : ""}`}
              onClick={() => {
                setSelectedDate(day.date); // Cập nhật ngày được chọn
                setCurrentMonth(day.date); // Cập nhật tháng hiện tại
              }}
            >
              {day.date.date()} {/* Hiển thị số ngày (VD: 1, 2, 3, ...) */}
            </div>
          ))}
        </div>
        <p>Selected Date: {selectedDate.format("DD/MM/YYYY")}</p>{" "}
        {/* Hiển thị ngày đã chọn */}
      </div>
    );
  };

  // Hàm vẽ biểu đồ trong tab "Chart", hiển thị số lần hút thuốc và thèm thuốc
  const renderChart = () => {
    return (
      <div className="chart-container">
        {chartData.map((data, index) => (
          <div key={index} className="chart-bar-group">
            {/* Thanh biểu đồ cho Smoking */}
            <div
              className="chart-bar smoking"
              style={{ height: `${data.smoking * 10}px` }}
            />
            {/* Thanh biểu đồ cho Craving */}
            <div
              className="chart-bar craving"
              style={{ height: `${data.craving * 10}px` }}
            />
            <span className="chart-label">{data.day}</span>{" "}
            {/* Nhãn ngày (Mon, Tue, ...) */}
          </div>
        ))}
      </div>
    );
  };

  // Lọc danh sách các bản ghi để hiển thị trong tab "Log"
  const filteredIncidents = incidents.filter((incident) =>
    activityType === "smoking"
      ? incident.type === "smoking"
      : incident.type === "craving"
  );

  // Hàm đếm số lần xuất hiện của từng trigger để hiển thị trong tab "Triggers"
  const countTriggers = () => {
    const triggerCount = { stress: 0, social: 0, habit: 0, other: 0 }; // Khởi tạo object để đếm
    incidents.forEach((incident) => {
      if (incident.trigger in triggerCount) {
        triggerCount[incident.trigger]++; // Tăng số đếm cho trigger tương ứng
      }
    });
    return triggerCount;
  };

  const triggerCounts = countTriggers(); // Lấy số lần xuất hiện của từng trigger
  // Chuyển dữ liệu trigger sang định dạng dùng cho biểu đồ trong tab "Triggers"
  const triggersData = Object.keys(triggerCounts).map((key) => ({
    label: triggerLabels[key], // Nhãn tiếng Việt dùng nội bộ
    value: triggerCounts[key], // Số lần xuất hiện
  }));

  return (
    <div className="tracking-page">
      {/* Phần ghi nhận hoạt động (Record Activity) */}
      <div className="tracking-section">
        <h2>Record Activity</h2>
        <p>Track your smoking incidents or cravings</p>
        <div className="tracking-content">
          {/* Phần lịch để chọn ngày */}
          <div className="calendar-section">
            <h3>Select Date</h3>
            <p>Choose a date to record activity or view data</p>
            {renderCalendar()}
          </div>
          {/* Phần form để ghi nhận hoạt động */}
          <div className="record-section">
            <h3>Record Activity</h3>
            <p>Log a smoking incident or craving</p>
            <form onSubmit={handleSubmit} className="tracking-form">
              {/* Radio button để chọn loại hoạt động: Smoking hoặc Craving */}
              <Radio.Group
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="activity-type"
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                <Radio.Button value="craving">Cravings</Radio.Button>
              </Radio.Group>
              {/* Form cho Smoking */}
              {activityType === "smoking" && (
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
                      {satisfaction === 1
                        ? "Low satisfaction"
                        : "High satisfaction"}
                    </p>
                  </div>
                </>
              )}
              {/* Form cho Craving */}
              {activityType === "craving" && (
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
                    <label>Trigger</label>
                    <Select
                      value={trigger}
                      onChange={(value) => setTrigger(value)}
                      options={triggerOptions}
                    />
                  </div>
                  <div className="form-group">
                    <label>Craving Intensity (1-10)</label>
                    <Slider
                      value={cravingIntensity}
                      onChange={(value) => setCravingIntensity(value)}
                      min={1}
                      max={10}
                    />
                    <p>
                      {cravingIntensity === 1
                        ? "Mild"
                        : cravingIntensity === 10
                        ? "Very intense"
                        : ""}
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Coping Strategy</label>
                    <Input
                      value={copingStrategy}
                      onChange={(e) => setCopingStrategy(e.target.value)}
                      placeholder="What did you do to cope?"
                    />
                  </div>
                </>
              )}
              {/* Trường ghi chú chung cho cả Smoking và Craving */}
              <div className="form-group">
                <label>Notes</label>
                <Input.TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Emotions, thoughts, effectiveness of coping strategy..."
                  rows={3}
                />
              </div>
              {/* Nút submit để gửi form */}
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                {activityType === "smoking"
                  ? "RECORD SMOKING INCIDENT"
                  : "RECORD CRAVING"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Phần phân tích dữ liệu (Data Analysis) */}
      <div className="data-analysis-section">
        <h2>Data Analysis</h2>
        <p>Better understand your smoking habits</p>
        <Tabs defaultActiveKey="chart">
          {/* Tab Chart: Hiển thị biểu đồ số lần hút thuốc và thèm thuốc */}
          <TabPane tab="Chart" key="chart">
            <div className="chart-header">
              <div className="chart-legend">
                <span className="legend smoking">Smoking Incidents</span>
                <span className="legend craving">Cravings</span>
              </div>
              <Select defaultValue="last7days" style={{ width: 120 }}>
                <Select.Option value="last7days">Last 7 Days</Select.Option>
              </Select>
            </div>
            {renderChart()}
          </TabPane>
          {/* Tab Log: Hiển thị danh sách các bản ghi */}
          <TabPane tab="Log" key="log">
            <div className="log-header">
              <Radio.Group
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="activity-type"
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                <Radio.Button value="craving">Cravings</Radio.Button>
              </Radio.Group>
            </div>
            <table className="log-table">
              <thead>
                <tr>
                  {activityType === "smoking" && (
                    <>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Trigger</th>
                      <th>Intensity</th>
                      <th>Notes</th>
                    </>
                  )}
                  {activityType === "craving" && (
                    <>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Trigger</th>
                      <th>Intensity</th>
                      <th>Coping Action</th>
                      <th>Notes</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident, index) => (
                  <tr key={index}>
                    {activityType === "smoking" && (
                      <>
                        <td>{moment(incident.date).format("DD/MM/YYYY")}</td>
                        <td>{incident.time}</td>
                        <td>{incident.location || "-"}</td>
                        <td>{incident.trigger}</td>
                        <td>{incident.satisfaction}/10</td>
                        <td>{incident.notes}</td>
                      </>
                    )}
                    {activityType === "craving" && (
                      <>
                        <td>{moment(incident.date).format("DD/MM/YYYY")}</td>
                        <td>{incident.time}</td>
                        <td>{incident.trigger}</td>
                        <td>{incident.cravingIntensity}/10</td>
                        <td>{incident.copingStrategy || "-"}</td>
                        <td>{incident.notes}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </TabPane>
          {/* Tab Triggers: Hiển thị biểu đồ các trigger phổ biến */}
          <TabPane tab="Triggers" key="triggers">
            <h3>Most Common Triggers</h3>
            <div className="trigger-chart">
              {triggersData.map((trigger, index) => (
                <div key={index} className="trigger-bar-group">
                  <span className="trigger-label">{trigger.label}</span>{" "}
                  {/* Hiển thị nhãn trigger (giữ tiếng Việt nội bộ) */}
                  <div
                    className="trigger-bar"
                    style={{
                      width: `${
                        trigger.value > 0
                          ? (trigger.value /
                              Math.max(...triggersData.map((t) => t.value))) *
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
              Chart shows the most common triggers leading to smoking or
              cravings
            </p>
          </TabPane>
        </Tabs>
      </div>

      {/* Phần gợi ý để vượt qua cơn thèm thuốc */}
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
