import React, { useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

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
  const [currentStep, setCurrentStep] = useState(1);
  // State để lưu ngày cai thuốc được chọn, mặc định là 5/6/2025
  const [selectedDate, setSelectedDate] = useState(new Date("2025-06-05"));
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

  // Ngày hiện tại được đặt cố định là 1/5/2025 để tạo lịch
  const currentDate = new Date(2025, 4, 1);
  const days = [];

  // Tạo lịch cho tháng 5 năm 2025
  for (let i = 0; i < 35; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i - currentDate.getDay());
    // Thêm các ô ngày vào mảng days, với class tương ứng
    days.push(
      <div
        key={i}
        className={`plan-calendar-day ${
          date.getMonth() === 4 ? "plan-current-month" : "plan-other-month"
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
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  const handleComplete = () => {
    setShowCompleteNotification(true); // Hiển thị thông báo hoàn thành
    setTimeout(() => setShowCompleteNotification(false), 3000); // Ẩn sau 3 giây
  };

  // Tính số ngày từ hiện tại đến ngày cai thuốc (không được sử dụng trong code hiện tại)

  const quitDate = selectedDate;

  // Dữ liệu cho biểu đồ hiển thị lộ trình cai thuốc
  const chartData = {
    labels: [
      "Today",
      `Quit Date (${quitDate.toLocaleDateString("en-US")})`,
      "3 days",
      "1 week",
    ],
    datasets: [
      {
        label: "Cigarettes per day",
        data: [cigarettesPerDay, 0, 0, 0], // Giảm từ số điếu hiện tại xuống 0
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
    <div className="plan-tracking-container">
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
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {rewards.map((item, index) => (
                  <li key={index} style={{ marginBottom: 12 }}>
                    <div>
                      <span role="img" aria-label="milestone">
                        📍
                      </span>{" "}
                      <Text strong>Milestone:</Text> {item.milestone}
                    </div>
                    <div>
                      <span role="img" aria-label="reward">
                        🎁
                      </span>{" "}
                      <Text strong>Reward:</Text> {item.reward}
                    </div>
                  </li>
                ))}
              </ul>
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
        <div className="plan-step-container">
          <Text strong className="plan-step-title">
            Quit plan summary
          </Text>
          <Text className="plan-step-description">
            Review your quit plan before completing
          </Text>

          <div className="plan-summary-grid">
            <div className="plan-summary-item">
              <span role="img" aria-label="calendar">
                📅
              </span>
              <Text strong className="plan-summary-label">
                Quit date:
              </Text>
              <Text>{selectedDate.toLocaleDateString("en-US")}</Text>
            </div>

            <div className="plan-summary-item">
              <span role="img" aria-label="target">
                🎯
              </span>
              <Text strong className="plan-summary-label">
                Quit method:
              </Text>
              <Text>{quitMethod || "Not selected"}</Text>
            </div>

            <div className="plan-summary-item">
              <span role="img" aria-label="cigarette">
                🚬
              </span>
              <Text strong className="plan-summary-label">
                Current cigarettes:
              </Text>
              <Text>{cigarettesPerDay} cigarettes per day</Text>
            </div>

            <div className="plan-summary-item">
              <span role="img" aria-label="info">
                ℹ️
              </span>
              <Text strong className="plan-summary-label">
                Triggers:
              </Text>
              <Text>
                {triggers.length > 0
                  ? triggers.join(", ")
                  : "No triggers selected"}
              </Text>
            </div>

            <div className="plan-summary-item">
              <span role="img" aria-label="check">
                ✅
              </span>
              <Text strong className="plan-summary-label">
                Coping strategies:
              </Text>
              <Text>
                {copingStrategies.length > 0
                  ? copingStrategies.join(", ")
                  : "No coping strategies selected"}
              </Text>
            </div>

            <div className="plan-summary-item">
              <span role="img" aria-label="gift">
                🎁
              </span>
              <Text strong className="plan-summary-label">
                Rewards:
              </Text>
              {rewards.length > 0 ? (
                <ul>
                  {rewards.map((item, index) => (
                    <li key={index}>
                      <Text strong>{item.milestone}</Text> – {item.reward}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text>No rewards set up</Text>
              )}
            </div>
          </div>

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

export default Body;
