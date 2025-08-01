import React, { useEffect, useState } from "react";
import { Radio, Input, Select, Slider, Button, Tabs } from "antd";
import moment from "moment";
import axios from "axios"; 
import "antd/dist/reset.css";
import "../App.css";
const { TabPane } = Tabs;

// Khai báo một mảng các lựa chọn (options) để dùng cho select, checkbox, radio,...
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
  const [incidents, setIncidents] = useState([]);

  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:8080/api/tracking/user/${userId}`
        );

        if (response.status === 200) {
          setIncidents(response.data); 
        } else {
          setIncidents([]);
        }
      } catch (error) {
        setIncidents([]); 
        console.error("Error fetching tracking data:", error); 
      }
    };

    fetchTrackingData();
  }, [userId]); 

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang khi submit form

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    const newIncident = {
      date: selectedDate.format("YYYY-MM-DD"), 
      time, 
      location, 
      trigger, 
      satisfaction:
        activityType === "smoking" ? satisfaction : cravingIntensity,
      type: activityType, 
      notes, 
      userId: userId, 
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/tracking", 
        newIncident 
      );

      if (response.status === 200 || response.status === 201) {
        setIncidents([...incidents, newIncident]);

        // Reset lại form về trạng thái mặc định sau khi submit thành công
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
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
    }
  };

  const getChartDataFromIncidents = () => {
    // Lấy ngày bắt đầu của tuần hiện tại dựa trên ngày đang được chọn (selectedDate)
    // Mặc định startOf("week") là Chủ nhật (theo moment.js)
    const weekStart = selectedDate.clone().startOf("week");

    // Mảng chứa tên các ngày trong tuần để dùng làm nhãn trên biểu đồ
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Duyệt qua từng ngày trong tuần để tính số lượng sự kiện (incident)
    return weekDays.map((day, index) => {
      // Tính ngày cụ thể ứng với chỉ số index (0 là Chủ nhật, 1 là Thứ 2, ...)
      const date = weekStart.clone().add(index, "days");

      // Định dạng ngày thành chuỗi YYYY-MM-DD để so sánh với dữ liệu trong incidents
      const dateStr = date.format("YYYY-MM-DD");

      // Lọc danh sách incidents để đếm số lượng sự kiện xảy ra đúng ngày và đúng loại hoạt động (activityType)
      const count = incidents.filter((incident) => {
        return incident.date === dateStr && incident.type === activityType;
      }).length;

      // Trả về đối tượng chứa tên ngày, số lần hoạt động (smoking), và chuỗi ngày
      return { day, smoking: count, date: dateStr };
    });
  };

  const generateCalendarDays = () => {
    // Lấy ngày đầu tiên trong tháng hiện tại (ví dụ: 1/6/2025)
    const startOfMonth = currentMonth.clone().startOf("month");

    // Lấy ngày cuối cùng trong tháng hiện tại (ví dụ: 30/6/2025)
    const endOfMonth = currentMonth.clone().endOf("month");

    // Lấy thứ trong tuần của ngày đầu tiên trong tháng (0 = Chủ nhật, 1 = Thứ hai, ..., 6 = Thứ bảy)
    const startDay = startOfMonth.day();

    // Lấy số ngày trong tháng hiện tại (ví dụ: 30 cho tháng 6)
    const daysInMonth = endOfMonth.date();

    // Tính số ô trống phía trước ngày đầu tiên của tháng trong calendar (chuyển Chủ nhật thành 6, các ngày khác trừ 1)
    // Mục đích: để calendar bắt đầu từ Thứ Hai (startOffset là số ô trống cần thêm)
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    // Tổng số ô trong calendar cho tháng này (bao gồm cả các ô trống trước và các ngày thực của tháng)
    const totalDays = daysInMonth + startOffset;

    // Tính số tuần cần hiển thị (làm tròn lên để đủ các ô ngày trong tuần)
    const weeks = Math.ceil(totalDays / 7);

    // Mảng lưu các ngày sẽ được hiển thị trên calendar (cả ngày trong tháng và các ngày từ tháng trước, tháng sau)
    const days = [];

    // Vòng lặp tạo các ô ngày "mượn" từ tháng trước để lấp đầy các ô trống đầu tháng
    for (let i = 0; i < startOffset; i++) {
      // Tính ngày của tháng trước tương ứng với ô trống hiện tại (ví dụ: nếu startOffset = 3, i=0 là ngày -3, i=1 là ngày -2, ...)
      const prevMonthDay = startOfMonth
        .clone()
        .subtract(startOffset - i, "days");
      // Đẩy ngày này vào mảng ngày với isCurrentMonth = false (không phải tháng hiện tại)
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Vòng lặp tạo các ô ngày thực sự trong tháng hiện tại, từ ngày 1 đến ngày cuối cùng
    for (let i = 1; i <= daysInMonth; i++) {
      // Tạo ngày hiện tại của tháng, ví dụ 1/6, 2/6, ..., 30/6
      const day = startOfMonth.clone().date(i);
      // Đẩy ngày này vào mảng ngày với isCurrentMonth = true
      days.push({ date: day, isCurrentMonth: true });
    }

    // Tính số ô ngày còn thiếu để đủ hoàn thành các tuần (7 ngày mỗi tuần)
    const remainingDays = weeks * 7 - days.length;

    // Vòng lặp tạo các ô ngày "mượn" từ tháng sau để lấp đầy phần cuối calendar
    for (let i = 1; i <= remainingDays; i++) {
      // Tính ngày tương ứng từ tháng sau, bắt đầu từ ngày đầu tiên sau ngày cuối tháng
      const nextMonthDay = endOfMonth.clone().add(i, "days");
      // Đẩy ngày này vào mảng ngày với isCurrentMonth = false
      days.push({ date: nextMonthDay, isCurrentMonth: false });
    }

    // Trả về mảng các ngày đã được chuẩn bị đầy đủ cho calendar (bao gồm cả ngày của tháng trước và tháng sau)
    return days;
  };

  const renderCalendar = () => {
    // Gọi hàm generateCalendarDays() để lấy danh sách các ngày cần hiển thị trong calendar
    const days = generateCalendarDays();

    // Mảng tên các ngày trong tuần, bắt đầu từ Thứ Hai đến Chủ Nhật
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Trả về JSX để render calendar
    return (
      <div className="calendar-wrapper">
        {/* Phần header của calendar chứa nút điều hướng và thông tin tháng, năm */}
        <div className="calendar-header">
          {/* Nút quay lại tháng trước */}
          <button
            className="calendar-nav-button"
            onClick={() =>
              // Khi click, thay đổi state currentMonth về tháng trước (clone để không làm thay đổi gốc)
              setCurrentMonth(currentMonth.clone().subtract(1, "month"))
            }
          >
            &lt; {/* Dấu < */}
          </button>
          {/* Hiển thị tháng và năm hiện tại theo định dạng: Month 6 Year 2025 */}
          <span className="calendar-month-year">
            Month {currentMonth.format("M")} Year {currentMonth.format("YYYY")}
          </span>
          {/* Nút chuyển sang tháng kế tiếp */}
          <button
            className="calendar-nav-button"
            onClick={() =>
              // Khi click, thay đổi state currentMonth về tháng tiếp theo
              setCurrentMonth(currentMonth.clone().add(1, "month"))
            }
          >
            &gt; {/* Dấu > */}
          </button>
        </div>

        {/* Phần lưới calendar hiển thị các ngày trong tuần và các ngày của tháng */}
        <div className="calendar-grid">
          {/* Render các ngày trong tuần (Mon, Tue, ...) */}
          {weekdays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}
          {/* Render từng ngày trong mảng days trả về từ generateCalendarDays */}
          {days.map((day, index) => (
            <div
              key={index}
              // Gán class để phân biệt ngày trong tháng hiện tại hay ngày mượn từ tháng khác,
              // và đánh dấu ngày được chọn
              className={`calendar-day ${
                day.isCurrentMonth ? "current-month" : "other-month"
              } ${selectedDate.isSame(day.date, "day") ? "selected-day" : ""}`}
              onClick={() => {
                // Khi click vào 1 ngày, cập nhật ngày được chọn và cập nhật luôn tháng hiện tại
                setSelectedDate(day.date);
                setCurrentMonth(day.date);
              }}
            >
              {/* Hiển thị số ngày (ví dụ: 1, 2, ..., 30) */}
              {day.date.date()}
            </div>
          ))}
        </div>
        {/* Hiển thị ngày được chọn theo định dạng DD/MM/YYYY */}
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
                  <span className="bar-label">{data.day}</span>{" "}
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
    const weekStart = selectedDate.clone().startOf("week"); // Lấy ngày bắt đầu của tuần từ ngày được chọn (selectedDate)
    const weekEnd = selectedDate.clone().endOf("week"); // Lấy ngày kết thúc của tuần từ ngày được chọn
    {
      /*Duyệt qua toàn bộ mảng incidents (danh sách các sự kiện), và lọc lại những sự kiện thỏa điều kiện bên dưới*/
    }
    return incidents.filter((incident) => {
      const incidentDate = moment(incident.date); //Tạo một đối tượng thời gian từ incident.date bằng thư viện moment
      return (
        incidentDate.isSameOrAfter(weekStart, "day") && //Kiểm tra xem sự kiện có xảy ra sau hoặc đúng ngày bắt đầu tuần hay không
        incidentDate.isSameOrBefore(weekEnd, "day") && //Và sự kiện cũng phải xảy ra trước hoặc đúng ngày kết thúc tuần
        incident.type === activityType //Đồng thời, loại sự kiện (type) phải trùng với loại hoạt động được chọn
      );
    });
  };

  // Gọi hàm getWeekIncidents() để lấy danh sách các sự kiện xảy ra trong tuần đã chọn
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

    // Gọi hàm getWeekIncidents() để lấy các sự kiện xảy ra trong tuần hiện tại
    const weekIncidents = getWeekIncidents();
    weekIncidents.forEach((incident) => {
      if (incident.trigger in triggerCount) {
        // kiểm tra xem cái skien hiện tại có trong triggerCount ko , có thì tăng số đếm
        triggerCount[incident.trigger]++;
      }
    });
    return triggerCount;
  };
  // Gọi hàm countTriggers() để lấy số lần xuất hiện của từng trigger trong tuần
  const triggerCounts = countTriggers();

  // Duyệt qua tất cả các key (tức là các loại trigger) trong triggerCounts bằng Object.keys(...), và
  // dùng .map() để chuyển mỗi trigger thành một object mới có định dạng { label, value }.
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
                {/*tạo 2 sự lựa chọn để ngdungf chọn */}
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
                style={{ backgroundColor: "#16A34A", color: "#fff" }}
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
                  {filteredIncidents.map(
                    (
                      incident,
                      index 
                    ) => (
                      <tr key={index}>
                        {/*Tạo 1 dòng trong bảng cho mỗi sự kiện (mỗi incident).*/}
                        <td>{moment(incident.date).format("DD/MM/YYYY")}</td>
                        <td>{incident.time}</td>
                        <td>{incident.location || "-"}</td>
                        <td>{incident.trigger}</td>
                        <td>{incident.satisfaction}/10</td>
                        <td>{incident.notes}</td>
                      </tr>
                    )
                  )}
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
                {/*Tạo một bản sao của selectedDate và chuyển nó về ngày đầu tuần(t2)*/}
                {selectedDate.clone().endOf("week").format("DD/MM/YYYY")}
                {/*cuối tuần*/}
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
                  {triggersData.map(
                    (
                      trigger,
                      index 
                    ) => (
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
                    )
                  )}
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
