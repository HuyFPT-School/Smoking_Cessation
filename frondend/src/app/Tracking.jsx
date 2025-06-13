import React, { useEffect, useState } from "react";
import { Radio, Input, Select, Slider, Button, Tabs } from "antd";
import moment from "moment";
import axios from "axios"; // Import axios
import "antd/dist/reset.css";
import "../App.css";
const { TabPane } = Tabs;

// Khai báo một mảng các lựa chọn (options) để dùng cho select, checkbox, radio,...
const triggerOptions = [
  { label: "Stress", value: "stress" }, // Nhãn hiển thị: Stress | Giá trị lưu: stress
  { label: "Social", value: "social" }, // Nhãn hiển thị: Social | Giá trị lưu: social
  { label: "Habit", value: "habit" }, // Nhãn hiển thị: Habit | Giá trị lưu: habit
  { label: "Breath time", value: "breathtime" }, // Nhãn hiển thị: Breath time | Giá trị lưu: breathtime
  { label: "After meals", value: "aftermeals" }, // Nhãn hiển thị: After meals | Giá trị lưu: aftermeals
  { label: "Drinking Coffee", value: "drinkingcoffee" }, // Nhãn hiển thị: Drinking Coffee | Giá trị lưu: drinkingcoffee
  { label: "Drinking Alcohol", value: "drinkingalcohol" }, // Nhãn hiển thị: Drinking Alcohol | Giá trị lưu: drinkingalcohol
  { label: "Boredom", value: "boredom" }, // Nhãn hiển thị: Boredom | Giá trị lưu: boredom
  { label: "Social Interaction", value: "socialinteraction" }, // Nhãn hiển thị: Social Interaction | Giá trị lưu: socialinteraction
  { label: "Other", value: "other" }, // Nhãn hiển thị: Other | Giá trị lưu: other
];

// Ánh xạ các giá trị trigger
const triggerLabels = {
  stress: "Stress", // Gây căng thẳng
  social: "Social", // Liên quan xã hội
  habit: "Habit", // Thói quen
  other: "Other", // Khác
  breathtime: "Breath time", // Thời gian hít thở
  aftermeals: "After meals", // Sau khi ăn
  drinkingcoffee: "Drinking Coffee", // Uống cà phê
  drinkingalcohol: "Drinking Alcohol", // Uống rượu/bia
  boredom: "Boredom", // Buồn chán
  socialinteraction: "Social Interaction", // Tương tác xã hội
};

const Tracking = () => {
  // Khởi tạo state lưu ngày được chọn (mặc định là ngày hiện tại)
  const [selectedDate, setSelectedDate] = useState(moment());

  // Khởi tạo state lưu tháng hiện tại đang hiển thị trong lịch (mặc định là tháng hiện tại)
  const [currentMonth, setCurrentMonth] = useState(moment());

  // Khởi tạo state lưu giờ hiện tại (theo định dạng hh:mm A, ví dụ: 08:30 AM)
  const [time, setTime] = useState(moment().format("hh:mm A"));

  // Khởi tạo state lưu địa điểm nhập từ người dùng (mặc định là gợi ý ví dụ)
  const [location, setLocation] = useState("E.g., Balcony, Coffee shop");

  // Khởi tạo state lưu nguyên nhân kích hoạt hành vi (trigger), mặc định là "stress"
  const [trigger, setTrigger] = useState("stress");

  // Khởi tạo state lưu mức độ hài lòng sau hành vi, mặc định là 10 (thang điểm)
  const [satisfaction, setSatisfaction] = useState(10);

  // Khởi tạo state lưu mức độ thèm muốn (craving), mặc định là 5
  const [cravingIntensity, setCravingIntensity] = useState(5);

  // Khởi tạo state lưu ghi chú người dùng nhập vào
  const [notes, setNotes] = useState("");

  // Khởi tạo state lưu loại hoạt động (ví dụ: smoking), mặc định là "smoking"
  const [activityType, setActivityType] = useState("smoking");

  // Khởi tạo state lưu danh sách các sự kiện (incidents), ban đầu là mảng rỗng
  const [incidents, setIncidents] = useState([]);

  // Lấy chuỗi thông tin user từ localStorage (nếu có)
  const userStr = localStorage.getItem("user");

  // Parse chuỗi JSON thành object, nếu không có thì null
  const userObj = userStr ? JSON.parse(userStr) : null;

  // Lấy userId từ object user nếu tồn tại, nếu không thì null
  const userId = userObj ? userObj.id : null;

  useEffect(() => {
    // Hàm bất đồng bộ để gọi dữ liệu tracking từ backend
    const fetchTrackingData = async () => {
      // Nếu chưa có userId thì không thực hiện gì cả
      if (!userId) return;

      try {
        // Gọi API GET đến backend để lấy dữ liệu log của userId
        const response = await axios.get(
          `http://localhost:8080/api/tracking/user/${userId}`
        );

        // Nếu phản hồi thành công (status code = 200)
        if (response.status === 200) {
          // Cập nhật state incidents bằng dữ liệu trả về từ server
          setIncidents(response.data); // Dữ liệu là một array các incident
        } else {
          // Nếu không thành công thì gán mảng incidents thành rỗng
          setIncidents([]);
        }
      } catch (error) {
        // Nếu có lỗi xảy ra khi gọi API (mạng, server lỗi,...)
        setIncidents([]); // Gán dữ liệu là mảng rỗng để tránh lỗi
        console.error("Error fetching tracking data:", error); // Ghi log lỗi ra console
      }
    };

    // Gọi hàm fetchTrackingData khi component mount hoặc userId thay đổi
    fetchTrackingData();
  }, [userId]); // useEffect sẽ chạy lại mỗi khi userId thay đổi

  const handleSubmit = async (e) => {
    // Đánh dấu đây là một hàm bất đồng bộ (async)
    e.preventDefault(); // Ngăn trình duyệt reload lại trang khi submit form

    // Kiểm tra xem userId có tồn tại không
    if (!userId) {
      console.error("User ID not found in localStorage"); // Ghi log lỗi
      // Tùy chọn: Có thể hiển thị thông báo lỗi cho người dùng
      return; // Không thực hiện gì thêm nếu không có userId
    }

    // Tạo đối tượng mới chứa thông tin sự kiện (incident) từ dữ liệu người dùng nhập
    const newIncident = {
      date: selectedDate.format("YYYY-MM-DD"), // Format ngày thành chuỗi YYYY-MM-DD
      time, // Giờ đã chọn (định dạng: hh:mm AM/PM)
      location, // Địa điểm nhập vào
      trigger, // Nguyên nhân gây hành vi (stress, habit,...)
      satisfaction:
        activityType === "smoking" ? satisfaction : cravingIntensity,
      // Nếu loại hành vi là "smoking" thì lưu mức độ hài lòng (satisfaction)
      // Nếu là loại khác thì lưu mức độ thèm muốn (cravingIntensity)
      type: activityType, // Loại hoạt động (smoking, vaping,...)
      notes, // Ghi chú người dùng nhập
      userId: userId, // ID người dùng lấy từ localStorage
    };

    try {
      // Gửi dữ liệu newIncident lên server thông qua POST request
      const response = await axios.post(
        "http://localhost:8080/api/tracking", // API endpoint trên backend
        newIncident // Dữ liệu gửi đi
      );

      // Nếu response trả về thành công (status code 200 hoặc 201)
      if (response.status === 200 || response.status === 201) {
        // Cập nhật state incidents bằng cách thêm sự kiện mới vào mảng hiện có
        setIncidents([...incidents, newIncident]);

        // Reset lại form về trạng thái mặc định sau khi submit thành công
        setTime(moment().format("hh:mm A"));
        setLocation("E.g., Balcony, Coffee shop");
        setTrigger("stress");
        setSatisfaction(10);
        setCravingIntensity(5);
        setNotes("");

        console.log("Incident recorded successfully:", response.data); // In log thành công
      } else {
        // Nếu response không thành công, ghi log lỗi kèm status và nội dung
        console.error(
          "Failed to record incident:",
          response.status,
          response.data
        );
        // Tùy chọn: Hiển thị thông báo lỗi cho người dùng
      }
    } catch (error) {
      // Nếu có lỗi xảy ra khi gửi dữ liệu (ví dụ server không chạy hoặc mất mạng)
      console.error("Error submitting incident:", error);
      // Tùy chọn: Hiển thị thông báo lỗi cho người dùng
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
    const chartData = getChartDataFromIncidents(); // Lấy dữ liệu biểu đồ từ danh sách các sự kiện (incidents)
    const totalIncidents = chartData.reduce((sum, d) => sum + d.smoking, 0); // Tính tổng số lần hút thuốc trong dữ liệu biểu đồ
    // Hiển thị khoảng tuần
    const weekStart = selectedDate.clone().startOf("week").format("DD/MM");
    // Lấy ngày bắt đầu của tuần từ ngày được chọn và định dạng là "DD/MM"
    const weekEnd = selectedDate.clone().endOf("week").format("DD/MM/YYYY");
    // Lấy ngày kết thúc của tuần từ ngày được chọn và định dạng là "DD/MM/YYYY"

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
              //lặp qua chartData bằng map()
              const heightPx = data.smoking * 20; // tính chều cao cột dựa trên số lần hút thuốc
              // Highlight cột nếu là ngày đang chọn
              //isSelected có giá trị true nếu ngày đang chọn (selectedDate) trùng với ngày của data.date
              const isSelected =
                selectedDate.format("YYYY-MM-DD") === data.date;
              return (
                <div key={index} className="bar-group">
                  <div
                    className="bar smoking"
                    style={{
                      height: `${heightPx}px`, //Gán chiều cao của cột dựa trên giá trị heightPx đã tính trước đó (số lần hút thuốc * 20px)
                      minHeight: data.smoking > 0 ? "20px" : "2px", // nếu có hút thuốc thì height tối thiểu là 20px, ko có : 2px
                      background: isSelected ? "#1890ff" : undefined, //if cột đang đc chọn thì màu xanh, ko thì màu css
                      border: isSelected ? "0px solid #0050b3" : undefined, // giống trên
                    }}
                  />
                  <span className="bar-label">{data.day}</span>{" "}
                  {/* hiển thị ngày trong tuần*/}
                  <span
                    className="bar-value"
                    style={{ fontSize: "12px", color: "#666" }}
                  >
                    {data.smoking} {/* hiển thị số lần hút thuốc*/}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          {/* Hiển thị tổng số sự kiện (hút thuốc hoặc thèm thuốc) trong tuần */}
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
    //triggerCount chứa các loại nguyên nhân phổ biến, giá trị ban đầu = 0
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
      //Duyệt qua từng phần tử (incident) trong mảng weekIncidents
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
            {/*hiển thị giao diện chọn ngày*/}
          </div>
          <div className="record-section">
            <h3>Record Activity</h3>
            <p>Log a smoking incident</p>
            <form onSubmit={handleSubmit} className="tracking-form">
              {/*gọi hàm handleSubmit khi người dùng nhấn nút submit */}
              <Radio.Group
                value={activityType} // Giá trị hiện tại của lựa chọn (được lưu trong state activityType)
                onChange={(e) => setActivityType(e.target.value)} //Khi người dùng chọn một lựa chọn mới, cập nhật activityType
                className="activity-type"
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                {/*tạo 2 sự lựa chọn để ngdungf chọn */}
                <Radio.Button value="craving">Craving Incidents</Radio.Button>
              </Radio.Group>
              {activityType === "smoking" ? ( // nếu activityType đang là "smoking" thì hiện giao diện cho smoking
                <>
                  <div className="form-group">
                    <label>Time</label>
                    <Input
                      value={time}
                      //Cập nhật giá trị time trong state mỗi khi người dùng thay đổi nội dung trong ô nhập thời gian.
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="06:36 PM"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)} // cho ng dùng nhập địa điểm xảy ra sự liện
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
                      onChange={(value) => setTrigger(value)} // cho ng dùng chọn cái nguyên nhân xảy ra hành vi bằng option
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
                      onChange={(value) => setSatisfaction(value)} // ng dùng chọn mức độ hài lòng bằng thanh kéo
                      min={1}
                      max={10}
                    />
                    <p>
                      Current: {satisfaction} -{" "}
                      {/*nếu <=3 mức độ hài lòng là low , <=7 thì medium, còn lại thì là hight */}
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
                      //Cập nhật giá trị time trong state mỗi khi người dùng thay đổi nội dung trong ô nhập thời gian.
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="06:36 PM"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)} // cho ng dùng nhập địa điểm xảy ra sự liện
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
                      onChange={(value) => setTrigger(value)} // cho ng dùng chọn cái nguyên nhân xảy ra hành vi bằng option
                      options={triggerOptions}
                    />
                  </div>
                  <div className="form-group">
                    <label>Craving Intensity Level (1-10)</label>
                    {/*đánh giá mức độ cơn thèm thuốc*/}
                    <Slider
                      style={{
                        padding: "4px",
                        border: "0px",
                      }}
                      value={cravingIntensity} //Gán giá trị hiện tại của thanh trượt (lưu trong state cravingIntensity).
                      onChange={(value) => setCravingIntensity(value)} //Cập nhật state khi người dùng thay đổi giá trị slider.
                      min={1}
                      max={10}
                    />
                    <p>
                      {/*nếu <=3 mức độ cơn thèm thuốc là low , <=7 thì medium, còn lại thì là hight */}
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
                {/*Ô nhập nhiều dòng, phù hợp văn bnr dài */}
                <Input.TextArea
                  value={notes} //Hiển thị nội dung hiện tại từ biến notes.
                  onChange={(e) => setNotes(e.target.value)} //Cập nhật notes khi người dùng nhập.
                  placeholder="Emotions, thoughts, effectiveness of coping strategy..."
                  rows={3}
                />
              </div>
              <Button
                //Gửi thông tin đã nhập vào biểu mẫu (thời gian, địa điểm, trigger, ghi chú...)
                // để ghi lại một hành vi hút thuốc hoặc cơn thèm thuốc.
                style={{ backgroundColor: "#16A34A", color: "#fff" }}
                htmlType="submit"
                className="submit-button"
              >
                {activityType === "smoking" // hiển thị đúng loại sự kiện (hút thuốc, thèm thuốc)
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
                value={activityType} //Gắn giá trị hiện tại (state) để hiển thị lựa chọn đang chọn.
                onChange={(e) => setActivityType(e.target.value)} //Khi người dùng chọn mục khác → cập nhật lại activityType.
                className="activity-type"
                style={{ marginBottom: "10px" }}
              >
                <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                {/*hiển thị 2 lựa chọn*/}
                <Radio.Button value="craving">Craving Incidents</Radio.Button>
              </Radio.Group>
            </div>
            {/* Gọi hàm renderChart để hiển thị biểu đồ tùy theo lựa chọn (smoking hoặc craving).*/}
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
                  value={activityType} //Gắn giá trị hiện tại (state) để hiển thị lựa chọn đang chọn.
                  onChange={(e) => setActivityType(e.target.value)} //Khi người dùng chọn mục khác → cập nhật lại activityType.
                  className="activity-type"
                >
                  <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                  {/*hiển thị 2 lựa chọn*/}
                  <Radio.Button value="craving">Craving Incidents</Radio.Button>
                </Radio.Group>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Week: {selectedDate.clone().startOf("week").format("DD/MM")} -{" "}
                  {/*lấy ngày bắt đầu tuần*/}
                  {selectedDate.clone().endOf("week").format("DD/MM/YYYY")}
                  {/*lấy ngày bắt đầu tuần*/}
                </span>
              </div>
            </div>
            {filteredIncidents.length === 0 ? ( //Kiểm tra xem danh sách sự kiện đã lọc trong tuần hiện tại có rỗng không.
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>No {activityType} incidents recorded yet.</p>
                <p>Start recording your activities to see the log data.</p>
              </div>
            ) : (
              // Nếu có dữ liệu, hiển thị bảng ghi chép chi tiết các sự kiện
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Trigger</th>
                    <th>
                      {/*// Tùy theo loại hoạt động, tiêu đề sẽ là 'Satisfaction' (nếu hút thuốc) hoặc 'Intensity' (nếu thèm thuốc)*/}
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
                      index //Lặp qua các sự kiện đã lọc trong tuần (filteredIncidents)
                    ) => (
                      <tr key={index}>
                        {/*Tạo 1 dòng trong bảng cho mỗi sự kiện (mỗi incident).*/}
                        <td>{moment(incident.date).format("DD/MM/YYYY")}</td>
                        {/*ngày sự kiện*/}
                        <td>{incident.time}</td>
                        {/*Thời gian diễn ra sự kiện*/}
                        <td>{incident.location || "-"}</td>
                        {/*nơi diễn ra*/}
                        <td>{incident.trigger}</td>
                        {/*nguyên nhân*/}
                        <td>{incident.satisfaction}/10</td>
                        {/* mức độ hài lòng*/}
                        <td>{incident.notes}</td>
                        {/*ghi chú*/}
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
                  value={activityType} //Liên kết trạng thái hiện tại (activityType) với nhóm radio.
                  onChange={(e) => setActivityType(e.target.value)} //Cập nhật trạng thái khi người dùng thay đổi lựa chọn.
                  className="activity-type"
                  style={{ marginRight: "15px" }}
                >
                  <Radio.Button value="smoking">Smoking Incidents</Radio.Button>
                  {/*2 sự lựa chọn*/}
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
            {incidents.length === 0 ? ( //Kiểm tra nếu không có dữ liệu sự kiện nào
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
                      index // Duyệt qua mảng triggersData để vẽ từng thanh trigger
                    ) => (
                      <div key={index} className="trigger-bar-group">
                        <span className="trigger-label">{trigger.label}</span>
                        {/*Nhãn trigger (ví dụ: Stress, Habit, ... ) */}
                        <div
                          // Thanh thể hiện độ dài tỉ lệ theo số lượng trigger
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
                            }%`, // Tính chiều dài thanh theo phần trăm
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                          }}
                        >
                          <span className="trigger-value">{trigger.value}</span>
                          {/* Số lượng trigger hiển thị trên thanh */}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p>
                  Chart shows the most common triggers leading to{" "}
                  {/* Nếu activityType là "smoking" thì hiển thị "smoking", ngược lại hiển thị "craving" */}
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
