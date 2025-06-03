import React, { useState, useEffect } from "react"; // Thêm useEffect
import { DatePicker } from "antd";
import dayjs from "dayjs";
import axios from "axios"; // Thêm axios

import {
  Row,
  Col,
  Checkbox,
  Typography,
  Button,
  InputNumber,
  Input,
  Modal,
  Form,
  Radio,
} from "antd";
import { Line } from "react-chartjs-2"; // Import Line chart từ react-chartjs-2 để hiển thị biểu đồ
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Import các thành phần cần thiết để cấu hình Chart.js
import "../index.css";
import { Select } from "antd";
import {
  DeleteOutlined,
  PushpinOutlined,
  GiftOutlined,
  CalendarOutlined, // Added
  AimOutlined, // Added
  AuditOutlined, // Added for cigarettes
  WarningOutlined, // Added for triggers/info
  SolutionOutlined, // Added for coping strategies/approved
  TeamOutlined, // Added for support network
  ReadOutlined, // Added for notes
  CheckCircleOutlined, // Added for step title
} from "@ant-design/icons";
const { Option } = Select;

const { Text } = Typography;
const { TextArea } = Input;

// Đăng ký các thành phần của Chart.js để sử dụng
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Component chính để tạo kế hoạch cai thuốc lá
const Body = () => {
  // State để theo dõi bước hiện tại trong quy trình tạo kế hoạch
  const [currentStep, setCurrentStep] = useState(1); // State để lưu ngày cai thuốc được chọn, mặc định là ngày hiện tại
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State để lưu phương pháp cai thuốc (Cold Turkey, Gradual reduction, v.v.)
  const [quitMethod, setQuitMethod] = useState("");
  // State để lưu số lượng điếu thuốc hút mỗi ngày
  const [cigarettesPerDay, setCigarettesPerDay] = useState(20);
  // State để lưu các yếu tố kích hoạt hút thuốc
  const [triggers, setTriggers] = useState([]);
  // State để lưu các chiến lược đối phó với cơn thèm thuốc
  const [copingStrategies, setCopingStrategies] = useState([]);
  // State để lưu mạng lưới hỗ trợ (gia đình, bạn bè, v.v.)
  const [supportNetwork, setSupportNetwork] = useState([]);
  // State để lưu ghi chú bổ sung cho bước 4
  const [additionalNotes, setAdditionalNotes] = useState("");
  // State để lưu danh sách phần thưởng khi đạt mốc quan trọng
  const [rewards, setRewards] = useState([]);
  // State để kiểm soát hiển thị modal thêm phần thưởng
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Khởi tạo instance Form của Ant Design để quản lý form trong modal
  const [form] = Form.useForm();
  // State để hiển thị thông báo khi thêm phần thưởng thành công
  const [showNotification, setShowNotification] = useState(false);
  // State để hiển thị thông báo khi hoàn thành kế hoạch
  const [showCompleteNotification, setShowCompleteNotification] =
    useState(false);

  // Function to handle deleting a reward
  const handleDeleteReward = (indexToDelete) => {
    setRewards((prevRewards) =>
      prevRewards.filter((_, index) => index !== indexToDelete)
    );
  };

  // Sử dụng tháng hiện tại để tạo lịch
  const currentDate = new Date();
  currentDate.setDate(1); // Đặt về ngày đầu tiên của tháng hiện tại
  const days = [];

  // Lấy userId từ localStorage
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const userId = userObj ? userObj.id : null;

  // useEffect để lấy dữ liệu kế hoạch khi component được mount hoặc userId thay đổi
  useEffect(() => {
    const fetchPlanData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:8080/api/plans/user/${userId}` // Điều chỉnh API endpoint
        );
        if (response.status === 200 && response.data) {
          const plan = response.data;
          setSelectedDate(new Date(plan.quitDate));
          setQuitMethod(plan.quitMethod);
          setCigarettesPerDay(plan.cigarettesPerDay);
          setTriggers(plan.triggers || []);
          setCopingStrategies(plan.copingStrategies || []);
          setSupportNetwork(plan.supportNetwork || []);
          setAdditionalNotes(plan.additionalNotes || "");
          setRewards(plan.rewards || []);
          // If a plan is loaded, navigate to the review step (assumed to be step 5)
          // so the user can see their existing plan and the timeline.
          // Please adjust '5' if your review/complete step number is different.
          setCurrentStep(5);
        }
      } catch (error) {
        console.error("Error fetching plan data:", error);
        // Xử lý trường hợp không có kế hoạch hoặc lỗi
      }
    };

    fetchPlanData();
  }, [userId]);

  // Tạo lịch cho tháng 5 năm 2025
  for (let i = 0; i < 35; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i - currentDate.getDay()); // Thêm các ô ngày vào mảng days, với class tương ứng
    days.push(
      <div
        key={i}
        className={`plan-calendar-day ${
          date.getMonth() === currentDate.getMonth()
            ? "plan-current-month"
            : "plan-other-month"
        } ${
          date.toDateString() === selectedDate.toDateString()
            ? "plan-selected-day"
            : ""
        }`}
        onClick={() => setSelectedDate(date)}
      >
        {date.getDate()}
      </div>
    );
  }

  // Danh sách các ngày trong tuần để hiển thị trên lịch

  // Danh sách các yếu tố kích hoạt hút thuốc
  const smokingTriggers = [
    "Stress",
    "Drinking coffee",
    "Social situations",
    "Watching TV",
    "Before bedtime",
    "After meals",
    "Boredom",
    "Driving",
    "After waking up",
    "On the phone",
  ];

  // Chia danh sách yếu tố kích hoạt thành hai cột để hiển thị
  const half = Math.ceil(smokingTriggers.length / 2);
  const leftColumnTriggers = smokingTriggers.slice(0, half);
  const rightColumnTriggers = smokingTriggers.slice(half);

  // Hàm xử lý khi chọn hoặc bỏ chọn yếu tố kích hoạt
  const handleTriggerChange = (trigger) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter((t) => t !== trigger));
    } else {
      setTriggers([...triggers, trigger]);
    }
  };

  // Danh sách các chiến lược đối phó với cơn thèm thuốc
  const copingStrategiesList = [
    "Drink water",
    "Take a short walk",
    "Meditate",
    "Use relaxation app",
    "Read a book",
    "Deep breathing",
    "Sugar-free candy/gum",
    "Call support person",
    "Journal writing",
    "Play games",
  ];

  // Chia danh sách chiến lược đối phó thành hai cột
  const halfCoping = Math.ceil(copingStrategiesList.length / 2);
  const leftCopingStrategies = copingStrategiesList.slice(0, halfCoping);
  const rightCopingStrategies = copingStrategiesList.slice(halfCoping);

  // Hàm xử lý khi chọn hoặc bỏ chọn chiến lược đối phó
  const handleCopingStrategyChange = (strategy) => {
    if (copingStrategies.includes(strategy)) {
      setCopingStrategies(copingStrategies.filter((s) => s !== strategy));
    } else {
      setCopingStrategies([...copingStrategies, strategy]);
    }
  };

  // Danh sách mạng lưới hỗ trợ
  const supportNetworkList = [
    "Family",
    "Quit smoking apps",
    "Friends",
    "Doctor",
    "Quit smoking counselor",
    "Quit smoking support group",
  ];

  // Chia danh sách mạng lưới hỗ trợ thành hai cột
  const halfSupport = Math.ceil(supportNetworkList.length / 2);
  const leftSupportNetwork = supportNetworkList.slice(0, halfSupport);
  const rightSupportNetwork = supportNetworkList.slice(halfSupport);

  // Hàm xử lý khi chọn hoặc bỏ chọn mạng lưới hỗ trợ
  const handleSupportNetworkChange = (support) => {
    if (supportNetwork.includes(support)) {
      setSupportNetwork(supportNetwork.filter((s) => s !== support));
    } else {
      setSupportNetwork([...supportNetwork, support]);
    }
  };

  // Hàm xử lý thay đổi phương pháp cai thuốc
  const handleQuitMethodChange = (method) => {
    setQuitMethod(method);
  };

  // Hàm hiển thị modal khi nhấn nút "Add reward"
  const handleAddReward = () => {
    setIsModalVisible(true);
  };

  // Hàm xử lý khi xác nhận thêm phần thưởng trong modal
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Thêm phần thưởng mới vào danh sách
        setRewards([
          ...rewards,
          { milestone: values.milestone, reward: values.reward },
        ]);
        setIsModalVisible(false); // Đóng modal
        form.resetFields(); // Xóa dữ liệu form
        setShowNotification(true); // Hiển thị thông báo thành công
        setTimeout(() => setShowNotification(false), 3000); // Ẩn thông báo sau 3 giây
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // Hàm xử lý khi hủy modal
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Hàm xử lý khi nhấn nút hoàn thành kế hoạch
  const handleComplete = async () => {
    // Thêm async
    if (!userId) {
      console.error("User ID not found in localStorage");
      // Optionally, display a message to the user
      return;
    }

    const planData = {
      userId,
      quitDate: selectedDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      quitMethod,
      cigarettesPerDay,
      triggers,
      copingStrategies,
      supportNetwork,
      additionalNotes,
      rewards,
    };

    try {
      // Kiểm tra xem đã có kế hoạch cho userId này chưa
      let existingPlan = null;
      try {
        const checkResponse = await axios.get(
          `http://localhost:8080/api/plans/user/${userId}`
        );
        if (checkResponse.status === 200 && checkResponse.data) {
          existingPlan = checkResponse.data;
        }
      } catch (error) {
        // Không tìm thấy kế hoạch, không sao cả, sẽ tạo mới
        if (error.response && error.response.status !== 404) {
          console.error("Error checking for existing plan:", error);
          // Xử lý lỗi khác 404 nếu cần
        }
      }

      let response;
      if (existingPlan && existingPlan.id) {
        // Nếu có kế hoạch, cập nhật (PUT)
        response = await axios.put(
          `http://localhost:8080/api/plans/${existingPlan.id}`, // Giả sử API cập nhật theo planId
          planData
        );
      } else {
        // Nếu không có, tạo mới (POST)
        response = await axios.post(
          "http://localhost:8080/api/plans",
          planData
        );
      }

      if (response.status === 200 || response.status === 201) {
        setShowCompleteNotification(true); // Hiển thị thông báo hoàn thành
        setTimeout(() => setShowCompleteNotification(false), 3000); // Ẩn sau 3 giây
        console.log("Plan saved successfully:", response.data);
      } else {
        console.error("Failed to save plan:", response.status, response.data);
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      // Optionally, display an error message to the user
    }
  };
  // Tính dữ liệu cho biểu đồ dựa trên phương pháp cai thuốc
  const calculateChartData = () => {
    const today = new Date();
    const quitDate = selectedDate;

    // Tính toán các mốc thời gian
    const threeDaysAfter = new Date(quitDate);
    threeDaysAfter.setDate(quitDate.getDate() + 3);

    const oneWeekAfter = new Date(quitDate);
    oneWeekAfter.setDate(quitDate.getDate() + 7);

    // Format dates for display
    const formatDate = (date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const labels = [
      `Today (${formatDate(today)})`,
      `Quit Date (${formatDate(quitDate)})`,
      `3 days (${formatDate(threeDaysAfter)})`,
      `1 week (${formatDate(oneWeekAfter)})`,
    ];

    // Tính toán số ngày từ hôm nay đến ngày cai thuốc
    const daysUntilQuit = Math.ceil((quitDate - today) / (1000 * 60 * 60 * 24));

    let data = []; // Xác định dữ liệu dựa trên phương pháp cai thuốc và thời gian

    switch (quitMethod) {
      case "Cold Turkey": {
        if (daysUntilQuit <= 0) {
          // Nếu quit date là hôm nay hoặc trong quá khứ
          data = [cigarettesPerDay, 0, 0, 0];
        } else {
          // Nếu quit date trong tương lai, vẫn duy trì số điếu hiện tại đến ngày cai thuốc, sau đó giảm đột ngột
          data = [cigarettesPerDay, 0, 0, 0];
        }
        break;
      }
      case "Gradual reduction": {
        const midPoint = Math.ceil(cigarettesPerDay / 2);

        if (daysUntilQuit <= 0) {
          // Nếu đã đến ngày cai thuốc
          data = [cigarettesPerDay, midPoint, Math.floor(midPoint / 2), 0];
        } else {
          // Nếu chưa đến, giảm dần đều từ hôm nay đến ngày cai thuốc
          const dailyReduction = Math.max(
            1,
            (cigarettesPerDay - midPoint) / Math.max(daysUntilQuit, 1)
          );
          const quitDayValue = Math.max(
            Math.round(cigarettesPerDay - dailyReduction * daysUntilQuit),
            midPoint
          );

          data = [
            cigarettesPerDay,
            quitDayValue,
            Math.floor(quitDayValue / 2),
            0,
          ];
        }
        break;
      }
      case "Nicotine Replacement Therapy (NRT)": {
        // Với NRT, số điếu giảm nhanh vào ngày cai thuốc nhưng không triệt để
        const quitDayValue = Math.round(cigarettesPerDay * 0.2);
        const threeDaysValue = Math.round(cigarettesPerDay * 0.1);

        if (daysUntilQuit <= 0) {
          // Nếu đã đến hoặc qua ngày cai thuốc
          data = [cigarettesPerDay, quitDayValue, threeDaysValue, 0];
        } else if (daysUntilQuit <= 3) {
          // Nếu còn 1-3 ngày trước ngày cai thuốc, đã bắt đầu sử dụng NRT với liều lượng thấp
          const preQuitReduction = cigarettesPerDay * 0.9;
          data = [
            Math.round(preQuitReduction),
            quitDayValue,
            threeDaysValue,
            0,
          ];
        } else {
          // Nếu còn hơn 3 ngày trước ngày cai thuốc
          data = [cigarettesPerDay, quitDayValue, threeDaysValue, 0];
        }
        break;
      }
      case "Prescription medication": {
        // Với thuốc kê đơn, bắt đầu giảm từ trước ngày cai thuốc
        let todayValue = cigarettesPerDay;

        // Nếu dùng thuốc, có thể đã bắt đầu giảm từ trước ngày cai thuốc
        if (daysUntilQuit > 7) {
          // Nếu còn hơn 1 tuần trước ngày cai thuốc
          todayValue = Math.round(cigarettesPerDay * 0.85);
        } else if (daysUntilQuit > 0) {
          // Nếu còn ít hơn 1 tuần trước ngày cai thuốc
          todayValue = Math.round(cigarettesPerDay * 0.7);
        }

        data = [
          todayValue,
          Math.round(cigarettesPerDay * 0.4),
          Math.round(cigarettesPerDay * 0.15),
          0,
        ];
        break;
      }
      default: {
        // Nếu không chọn phương pháp, mặc định là Cold Turkey
        data = [cigarettesPerDay, 0, 0, 0];
      }
    }
    return { labels, data };
  };
  // Lấy dữ liệu biểu đồ từ hàm tính toán
  const chartDataValues = calculateChartData();

  // Dữ liệu cho biểu đồ hiển thị lộ trình cai thuốc
  const chartData = {
    labels: chartDataValues.labels,
    datasets: [
      {
        label: "Cigarettes per day",
        data: chartDataValues.data,
        borderColor: "#16A34A",
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Cấu hình cho biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Your Quit Plan Timeline" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Cigarettes" },
      },
      x: {
        title: { display: true, text: "Timeline" },
      },
    },
  };

  return (
    <div
      className="plan-tracking-container"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      {/* Tiêu đề và phụ đề của kế hoạch */}
      <Text strong className="plan-plan-title">
        Create a Quit Plan
      </Text>
      <Text className="plan-plan-subtitle">
        Create a personalized quit plan to increase your chances of success
      </Text>
      {/* Thanh tiến trình hiển thị các bước */}
      <div className="plan-progress-bar">
        {/* Hiển thị các bước với trạng thái active hoặc completed */}
        <div
          className={`plan-step ${
            currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""
          }`}
        >
          1
        </div>
        <div
          className={`plan-step ${
            currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""
          }`}
        >
          2
        </div>
        <div
          className={`plan-step ${
            currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""
          }`}
        >
          3
        </div>
        <div
          className={`plan-step ${
            currentStep === 4 ? "active" : currentStep > 4 ? "completed" : ""
          }`}
        >
          4
        </div>
        <div
          className={`plan-step ${
            currentStep === 5 ? "active" : currentStep > 5 ? "completed" : ""
          }`}
        >
          5
        </div>
        {/* Nhãn cho các bước */}
        <div className="plan-step-labels">
          <span>Set goals</span>
          <span>Current habits</span>
          <span>Coping strategies</span>
          <span>Rewards</span>
          <span>Review & Complete</span>
        </div>
      </div>
      {currentStep === 1 && (
        <div className="plan-step-container">
          <Text strong className="plan-step-title">
            Set quit goals
          </Text>
          <Text className="plan-step-description">
            Choose a quit date and method that works for you
          </Text>

          {/* Lịch để chọn ngày cai thuốc */}
          <div className="plan-form-group">
            <Text className="plan-form-label">Quit date</Text>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={(date) => setSelectedDate(date?.toDate())}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 10, color: "#555" }}>
              Ngày đã chọn: {selectedDate.toLocaleDateString("vi-VN")}
            </div>
          </div>

          {/* Chọn phương pháp cai thuốc */}
          <div className="plan-form-group">
            <span className="plan-quit-method-title">Quit method</span>
            <Radio.Group
              value={quitMethod}
              onChange={(e) => handleQuitMethodChange(e.target.value)}
            >
              <div className="plan-option-wrapper">
                <Radio value="Cold Turkey">
                  <div>
                    <span className="plan-option-title">Cold Turkey</span>
                    <span className="plan-option-description">
                      Stop smoking completely on your chosen quit date
                    </span>
                  </div>
                </Radio>
              </div>
              <div className="plan-option-wrapper">
                <Radio value="Gradual reduction">
                  <div>
                    <span className="plan-option-title">Gradual reduction</span>
                    <span className="plan-option-description">
                      Gradually reduce the number of cigarettes each day until
                      your quit date
                    </span>
                  </div>
                </Radio>
              </div>
              <div className="plan-option-wrapper">
                <Radio value="Nicotine Replacement Therapy (NRT)">
                  <div>
                    <span className="plan-option-title">
                      Nicotine Replacement Therapy (NRT)
                    </span>
                    <span className="plan-option-description">
                      Use nicotine replacement products like patches, gum, or
                      spray
                    </span>
                  </div>
                </Radio>
              </div>
              <div className="plan-option-wrapper">
                <Radio value="Prescription medication">
                  <div>
                    <span className="plan-option-title">
                      Prescription medication
                    </span>
                    <span className="plan-option-description">
                      Use prescription medications like Varenicline or Bupropion
                      to help quit smoking
                    </span>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </div>

          {/* Nút điều hướng - Chỉ hiển thị nút Next */}
          <div className="plan-nav-buttons">
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={() => setCurrentStep(2)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* Bước 2: Thói quen hút thuốc hiện tại */}
      {currentStep === 2 && (
        <div className="plan-step-container">
          <Text strong className="plan-step-title">
            Current smoking habits
          </Text>
          <Text className="plan-step-description">
            Tell us about your current smoking habits
          </Text>

          <div className="plan-form-group">
            <Text className="plan-form-label">Current cigarettes per day</Text>
            <InputNumber
              min={0}
              value={cigarettesPerDay}
              onChange={(value) => setCigarettesPerDay(value)}
              className="plan-custom-input"
            />
          </div>

          <div className="plan-form-group">
            <Text className="plan-form-label">Smoking triggers</Text>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {leftColumnTriggers.map((trigger, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={triggers.includes(trigger)}
                      onChange={() => handleTriggerChange(trigger)}
                    >
                      {trigger}
                    </Checkbox>
                  </div>
                ))}
              </Col>
              <Col span={12}>
                {rightColumnTriggers.map((trigger, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={triggers.includes(trigger)}
                      onChange={() => handleTriggerChange(trigger)}
                    >
                      {trigger}
                    </Checkbox>
                  </div>
                ))}
              </Col>
            </Row>
          </div>

          {/* Nút điều hướng - Hiển thị cả Back và Next */}
          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={() => setCurrentStep(3)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* Bước 3: Chiến lược đối phó */}
      {currentStep === 3 && (
        <div className="plan-step-container">
          <Text strong className="plan-step-title">
            Strategies to cope with cravings
          </Text>
          <Text className="plan-step-description">
            Plan how to cope with cravings and build a support network
          </Text>

          <div className="plan-form-group">
            <Text className="plan-form-label">
              Coping strategies for cigarette cravings
            </Text>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {leftCopingStrategies.map((strategy, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={copingStrategies.includes(strategy)}
                      onChange={() => handleCopingStrategyChange(strategy)}
                    >
                      {strategy}
                    </Checkbox>
                  </div>
                ))}
              </Col>
              <Col span={12}>
                {rightCopingStrategies.map((strategy, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={copingStrategies.includes(strategy)}
                      onChange={() => handleCopingStrategyChange(strategy)}
                    >
                      {strategy}
                    </Checkbox>
                  </div>
                ))}
              </Col>
            </Row>
          </div>

          <div className="plan-form-group">
            <Text className="plan-form-label">Support network</Text>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {leftSupportNetwork.map((support, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={supportNetwork.includes(support)}
                      onChange={() => handleSupportNetworkChange(support)}
                    >
                      {support}
                    </Checkbox>
                  </div>
                ))}
              </Col>
              <Col span={12}>
                {rightSupportNetwork.map((support, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={supportNetwork.includes(support)}
                      onChange={() => handleSupportNetworkChange(support)}
                    >
                      {support}
                    </Checkbox>
                  </div>
                ))}
              </Col>
            </Row>
          </div>

          {/* Nút điều hướng - Hiển thị cả Back và Next */}
          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={() => setCurrentStep(4)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* // Bước 4: Thiết lập phần thưởng */}
      {currentStep === 4 && (
        <div className="plan-step-container">
          <Text strong className="plan-step-title">
            Set up rewards
          </Text>
          <Text className="plan-step-description">
            Create motivation by setting up rewards for important milestones
          </Text>

          <div className="plan-form-group">
            <Text className="plan-form-label">
              Rewards for important milestones
            </Text>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
              }}
            >
              <Button
                type="primary"
                className="plan-nav-button"
                onClick={handleAddReward}
              >
                Add reward
              </Button>
            </div>

            {showNotification && (
              <div
                style={{
                  backgroundColor: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  marginBottom: "10px",
                  color: "#52c41a",
                  fontSize: "14px",
                }}
              >
                ✓ Reward added successfully!
              </div>
            )}

            {rewards.length === 0 ? (
              <Text className="plan-form-label" style={{ color: "#666" }}>
                No rewards added yet. Add rewards to create motivation!
              </Text>
            ) : (
              <div style={{ marginTop: "20px" }}>
                <Typography.Title level={4}>Your Reward:</Typography.Title>
                {rewards.map((rewardItem, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Text strong>
                        <PushpinOutlined style={{ marginRight: "8px" }} />
                        Milestone:
                      </Text>{" "}
                      {rewardItem.milestone} <br />
                      <Text strong>
                        <GiftOutlined style={{ marginRight: "8px" }} />
                        Reward:
                      </Text>{" "}
                      {rewardItem.reward}
                    </div>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteReward(index)} // Correctly call handleDeleteReward
                      danger
                      aria-label="Delete reward"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal để thêm phần thưởng */}
          <Modal
            title="Add reward"
            visible={isModalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="Add"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="milestone"
                label="Important milestone"
                rules={[
                  {
                    required: true,
                    message: "Please select an important milestone!",
                  },
                ]}
              >
                <Select
                  placeholder="Select a milestone"
                  style={{ width: "100%" }}
                >
                  <Option value="1 day without smoking">
                    1 day without smoking
                  </Option>
                  <Option value="3 days without smoking">
                    3 days without smoking
                  </Option>
                  <Option value="1 week without smoking">
                    1 week without smoking
                  </Option>
                  <Option value="2 weeks without smoking">
                    2 weeks without smoking
                  </Option>
                  <Option value="1 month without smoking">
                    1 month without smoking
                  </Option>
                  <Option value="3 months without smoking">
                    3 months without smoking
                  </Option>
                  <Option value="6 months without smoking">
                    6 months without smoking
                  </Option>
                  <Option value="1 year without smoking">
                    1 year without smoking
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reward"
                label="Reward"
                rules={[{ required: true, message: "Please enter a reward!" }]}
              >
                <Input placeholder="Example: A special dinner" />
              </Form.Item>
            </Form>
          </Modal>

          <div className="plan-form-group">
            <Text className="plan-form-label">Additional notes</Text>
            <TextArea
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Additional notes about your quit plan..."
              className="plan-custom-input"
            />
          </div>

          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(3)}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={() => setCurrentStep(5)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {/* // Bước 5: Xem lại và Hoàn thành */}
      {currentStep === 5 && (
        <div className="plan-container" style={{ padding: "20px" }}>
          <Typography.Title level={2} style={{ textAlign: "center" }}>
            <CheckCircleOutlined
              style={{ marginRight: "8px", color: "#52c41a" }}
            />
            Review quit plan
          </Typography.Title>
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography.Paragraph
              style={{ fontSize: "16px", marginBottom: "12px" }}
            >
              <Text style={{ fontSize: "16px" }} strong>
                <CalendarOutlined
                  style={{
                    marginRight: "8px",
                    color: "#16A34A",
                    fontSize: "16px",
                  }}
                />
                Start date:
              </Text>{" "}
              <br />
              {selectedDate.toLocaleDateString("vi-VN")}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{ fontSize: "16px", marginBottom: "12px" }}
            >
              <Text style={{ fontSize: "16px" }} strong>
                <AimOutlined
                  style={{
                    fontSize: "16px",
                    marginRight: "8px",
                    color: "#16A34A",
                  }}
                />
                Methods of quitting smoking:
              </Text>{" "}
              <br />
              {quitMethod || "Chưa chọn"}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{ fontSize: "16px", marginBottom: "12px" }}
            >
              <Text style={{ fontSize: "16px" }} strong>
                <AuditOutlined
                  style={{
                    marginRight: "8px",
                    color: "#16A34A",
                    fontSize: "16px",
                  }}
                />
                Number of cigarettes per day (before quitting):
              </Text>{" "}
              <br />
              {cigarettesPerDay} cigarettes every day
            </Typography.Paragraph>

            <Typography.Title
              level={4}
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <WarningOutlined
                style={{
                  marginRight: "8px",
                  color: "#16A34A",
                }}
              />
              Triggers:
            </Typography.Title>
            {triggers.length > 0 ? (
              <ul
                style={{
                  listStyleType: "none",
                  paddingLeft: "20px",
                  fontSize: "16px",
                }}
              >
                {triggers.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      marginRight: "5px",
                      padding: "5px 10px",
                      backgroundColor: "#FEF2F2",
                      borderRadius: "20px",
                      border: "1px solid #E4E4E7",
                      display: "inline",
                      fontWeight: "200",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <Text italic> No triggers are selected.</Text>
            )}

            <Typography.Title
              level={4}
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <SolutionOutlined
                style={{ marginRight: "8px", color: "#16A34A" }}
              />
              Coping strategies:
            </Typography.Title>
            {copingStrategies.length > 0 ? (
              <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
                {copingStrategies.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      marginRight: "5px",
                      padding: "5px 10px",
                      backgroundColor: "#F0FDF4",
                      borderRadius: "20px",
                      border: "1px solid #E4E4E7",
                      display: "inline",
                      fontWeight: "200",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <Text italic> No coping strategy was selected.</Text>
            )}

            <Typography.Title
              level={4}
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <TeamOutlined style={{ marginRight: "8px", color: "#16A34A" }} />
              Support Network:
            </Typography.Title>
            {supportNetwork.length > 0 ? (
              <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
                {supportNetwork.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      marginRight: "5px",
                      padding: "5px 10px",
                      backgroundColor: "rgb(249, 249, 190)",
                      borderRadius: "20px",
                      border: "1px solid #E4E4E7",
                      display: "inline",
                      fontWeight: "200",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <Text italic> No support network selected.</Text>
            )}

            <Typography.Title
              level={4}
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <GiftOutlined style={{ marginRight: "8px", color: "#16A34A" }} />
              Reward:
            </Typography.Title>
            {rewards.length > 0 ? (
              rewards.map((rewardItem, index) => (
                <div
                  key={index}
                  style={{ paddingLeft: "20px", marginBottom: "10px" }}
                >
                  <Text strong>
                    <PushpinOutlined style={{ marginRight: "8px" }} />
                    Milestone:
                  </Text>{" "}
                  {rewardItem.milestone} <br />
                  <Text strong>
                    <GiftOutlined style={{ marginRight: "8px" }} />
                    Reward:
                  </Text>{" "}
                  {rewardItem.reward}
                </div>
              ))
            ) : (
              <Text italic> No rewards are set.</Text>
            )}

            <Typography.Title
              level={4}
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <ReadOutlined style={{ marginRight: "8px", color: "#16A34A" }} />
              Notes:
            </Typography.Title>
            <Text italic>{additionalNotes || "No additional notes"}</Text>
          </div>

          {/* Chart display */}
          <div className="plan-chart-section">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Nút điều hướng - Hiển thị cả Back và Complete */}
          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(4)}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={handleComplete}
            >
              Complete
            </Button>
          </div>
          {showCompleteNotification && (
            <div
              style={{
                backgroundColor: "#f6ffed",
                border: "1px solid rgb(41, 90, 4)",
                borderRadius: "6px",
                padding: "8px 12px",
                marginTop: "10px",
                color: "#52c41a",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ✓ Quit plan saved successfully!
            </div>
          )}
        </div>
      )}
      {/* Phần lời khuyên để cai thuốc thành công */}
      <div className="plan-advice-section">
        <Text strong className="plan-advice-title">
          Tips for a successful quit plan
        </Text>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="plan-advice-card">
              <Text strong className="plan-advice-card-title">
                Prepare thoroughly
              </Text>
              <p className="plan-advice-card-text">
                Take time to plan your quit journey. Remove cigarettes, lighters
                and prepare coping tools ahead of your quit date.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="plan-advice-card">
              <Text strong className="plan-advice-card-title">
                Identify triggers
              </Text>
              <p className="plan-advice-card-text">
                Understand the situations, emotions, and activities that make
                you want to smoke.
              </p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="plan-advice-card">
              <Text strong className="plan-advice-card-title">
                Seek support
              </Text>
              <p className="plan-advice-card-text">
                Tell friends and family about your quit plan. Join support
                groups or seek professional counseling if needed.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Body; // Đảm bảo export đúng component
