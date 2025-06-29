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
const Plan = () => {
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
    // nhận vào 1 index của phần thưởng bạn muốn xóa
    //Hàm cập nhật rewards
    setRewards(
      (
        prevRewards //	Callback nhận state cũ và trả về state mới, luôn trả về giá trị mới nhất của state
      ) => prevRewards.filter((_, index) => index !== indexToDelete)
      //duyệt qua các ptu trong prevRewards, giữ lại các ptu khác indexToDelete, trả về mảng mới đã xóa những ptu cần xóa
    );
  };

  const currentDate = new Date(); // tạo Date đại diện cho ngày và giờ hiện tại
  currentDate.setDate(1); // Đặt về ngày đầu tiên của tháng hiện tại
  const days = []; // chuỗi rỗng lưu các ngày trong tháng

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
          setSelectedDate(new Date(plan.quitDate)); // lấy data từ backend và gán dữ liệu vào các state
          setQuitMethod(plan.quitMethod);
          setCigarettesPerDay(plan.cigarettesPerDay);
          setTriggers(plan.triggers || []);
          setCopingStrategies(plan.copingStrategies || []);
          setSupportNetwork(plan.supportNetwork || []);
          setAdditionalNotes(plan.additionalNotes || "");
          setRewards(plan.rewards || []);

          setCurrentStep(5); // đưa ng dùng đến bước xem lại kế hoạch
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
    // tại mỗi ô lặp tạo 1 date đại diện cho từng ô ngày
    const date = new Date(currentDate); //Tạo một bản sao của currentDaten tránh sửa trực tiếp của currentDate
    date.setDate(currentDate.getDate() + i - currentDate.getDay()); //Tính ngày thực sự hiển thị cho ô i
    days.push(
      <div
        key={i}
        className={`plan-calendar-day ${
          date.getMonth() === currentDate.getMonth()
            ? "plan-current-month" // ngày thuộc tháng hiện tại
            : "plan-other-month" // ngày thuộc tháng trước hoặc sau
        } ${
          date.toDateString() === selectedDate.toDateString()
            ? "plan-selected-day" // ngày đang được chọn
            : ""
        }`}
        onClick={() => setSelectedDate(date)} // chọn ngày khi click
      >
        {date.getDate()}
      </div>
    );
  }

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
  const leftColumnTriggers = smokingTriggers.slice(0, half); // hiển thị bên trái
  const rightColumnTriggers = smokingTriggers.slice(half); // hiển thị bên phải

  // Hàm xử lý khi chọn hoặc bỏ chọn yếu tố kích hoạt
  const handleTriggerChange = (trigger) => {
    // hàm nhận vào trigger
    if (triggers.includes(trigger)) {
      // trigger đã tồn tại trong danh sách (đã chọn)
      setTriggers(triggers.filter((t) => t !== trigger)); //xóa nó ra khỏi mảng (bỏ chọn)
    } else {
      //setTriggers(...) để cập nhật state.
      setTriggers([...triggers, trigger]); //Thêm trigger vào mảng
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
  const leftCopingStrategies = copingStrategiesList.slice(0, halfCoping); //cột trái
  const rightCopingStrategies = copingStrategiesList.slice(halfCoping); // cột phải

  // Hàm xử lý khi chọn hoặc bỏ chọn chiến lược đối phó
  const handleCopingStrategyChange = (strategy) => {
    // hàm nhận vào strategy
    if (copingStrategies.includes(strategy)) {
      // strategy đã tồn tại trong danh sách (đã chọn)
      setCopingStrategies(copingStrategies.filter((s) => s !== strategy)); //xóa nó ra khỏi mảng (bỏ chọn)
    } else {
      //setCopingStrategies(...) để cập nhật state.
      setCopingStrategies([...copingStrategies, strategy]); //Thêm strategy vào mảng
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
    // tham số ng dùng chọn : method
    setQuitMethod(method); //  cập nhật state
  };

  // Hàm hiển thị modal khi nhấn nút "Add reward"
  const handleAddReward = () => {
    setIsModalVisible(true); // khi isModalVisible là true thì giao diện add reward sẽ hiện
  };

  // Hàm  xác nhận thêm phần thưởng trong modal khi nhấn add reward
  const handleModalOk = () => {
    form
      .validateFields() // check xem các ô nhập có hợp lệ ko, Trả về Promise chứa values nếu hợp lệ
      .then((values) => {
        setRewards([
          // Thêm phần thưởng mới vào danh sách
          ...rewards, // copy mảng cũ
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
    setIsModalVisible(false); // ẩn modal
    form.resetFields(); // xóa dữ liệu trong form
  };

  // Khi người dùng nhấn nút "Complete" để hoàn tất kế hoạch cai thuốc, hàm này sẽ được gọi để gửi kế hoạch lên backend.
  const handleComplete = async () => {
    // Thêm async
    if (!userId) {
      console.error("User ID not found in localStorage");
      // Optionally, display a message to the user
      return;
    }
    //Tạo planData chứa all kế hoạch cai thuốc, để gửi lên backend
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
      let existingPlan = null; // biến lưu kế hoạch hiện tại của user
      try {
        const checkResponse = await axios.get(
          `http://localhost:8080/api/plans/user/${userId}`
        );
        if (checkResponse.status === 200 && checkResponse.data) {
          existingPlan = checkResponse.data; // if phản hồi 200 và có data thì gán kế hoạch hiện có cho existingPlan
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
    const today = new Date(); // ngày hiện tại (lấy thời điểm ng dùng đang thao tác)
    const quitDate = selectedDate; // ngày bắt đầu cai thuốc , lấy selectedDate(ng dùng nhập trc đó)

    // Tính toán các mốc thời gian
    const threeDaysAfter = new Date(quitDate); // ngày thứ 3 sau khi bắt đầu cai thuốc
    threeDaysAfter.setDate(quitDate.getDate() + 3);

    const oneWeekAfter = new Date(quitDate); // 1 tuần after cai
    oneWeekAfter.setDate(quitDate.getDate() + 7);

    // Format ngày hiển thị kiểu anh mỹ
    const formatDate = (date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const labels = [
      // mốc time theo định dạng
      `Today (${formatDate(today)})`, // hôm nay
      `Quit Date (${formatDate(quitDate)})`, // ngày bắt đầu cai
      `3 days (${formatDate(threeDaysAfter)})`, // 3 day sau cai
      `1 week (${formatDate(oneWeekAfter)})`, // 1 tuần sau cai
    ];

    // Tính toán số ngày từ hôm nay đến ngày cai thuốc
    const daysUntilQuit = Math.ceil((quitDate - today) / (1000 * 60 * 60 * 24));

    let data = []; //chứa mảng số liệu tương ứng cho biểu đồ.

    switch (quitMethod) {
      case "Cold Turkey": {
        // phương pháp cai thuốc đột ngột
        if (daysUntilQuit <= 0) {
          // người dùng đã bắt đầu hoặc quá ngày => hôm nay bắt đầu bỏ ngay lập tức

          data = [cigarettesPerDay, 0, 0, 0]; // hôm nay : hút bình thường, ngày bỏ thuốc trở đi : 0 điếu
        } else {
          // Nếu quit date trong tương lai, vẫn duy trì số điếu hiện tại đến ngày cai thuốc, sau đó giảm đột ngột
          data = [cigarettesPerDay, 0, 0, 0];
        }
        break;
      }
      case "Gradual reduction": {
        // giảm dần lượng thuốc lá
        const midPoint = Math.ceil(cigarettesPerDay / 2); // giảm 1 nửa số điếu hút

        if (daysUntilQuit <= 0) {
          // Nếu đã đến or qua ngày cai thuốc
          data = [cigarettesPerDay, midPoint, Math.floor(midPoint / 2), 0]; // ngày đầu , giảm 50 , giảm tiếp 1 nửa , cai hoàn toàn
        } else {
          // Nếu chưa đến, giảm dần đều từ hôm nay đến ngày cai thuốc, lượng thuốc giảm về midPoint
          const dailyReduction = Math.max(
            // giảm ít nhất mỗi ngày 1 điếu nếu có thể
            1,
            (cigarettesPerDay - midPoint) / Math.max(daysUntilQuit, 1)
          );
          const quitDayValue = Math.max(
            // Tính số điếu hút vào ngày cai
            //Nếu đã giảm đến mức thấp hơn midPoint, thì lấy midPoint làm giới hạn tối thiểu.
            Math.round(cigarettesPerDay - dailyReduction * daysUntilQuit),
            midPoint
          );

          data = [
            // mảng dữ liệu biểu diễn số điếu thuốc/ngày
            cigarettesPerDay,
            quitDayValue,
            Math.floor(quitDayValue / 2),
            0,
          ];
        }
        break;
      }
      case "Nicotine Replacement Therapy (NRT)": {
        // sử dụng các sản phẩm thay thế nicotin
        // Với NRT, số điếu giảm nhanh vào ngày cai thuốc nhưng không triệt để
        const quitDayValue = Math.round(cigarettesPerDay * 0.2); // Ngày cai: còn hút khoảng 20% so với ban đầu
        const threeDaysValue = Math.round(cigarettesPerDay * 0.1); // 	3 ngày sau cai: còn khoảng 10%

        if (daysUntilQuit <= 0) {
          // Nếu đã đến hoặc qua ngày cai thuốc
          data = [cigarettesPerDay, quitDayValue, threeDaysValue, 0]; // (ví dụ hôm nay 10 điếu , ngày cai : 2, 3 ngày sau : 1, 1 week : 0)
        } else if (daysUntilQuit <= 3) {
          // Nếu còn 1-3 ngày trước ngày cai thuốc, đã bắt đầu sử dụng NRT với liều lượng thấp
          const preQuitReduction = cigarettesPerDay * 0.9; //// (ví dụ hôm nay 9 điếu , ngày cai : 2, 3 ngày sau : 1, 1 week : 0)
          data = [
            Math.round(preQuitReduction),
            quitDayValue,
            threeDaysValue,
            0,
          ];
        } else {
          // Nếu còn hơn 3 ngày trước ngày cai thuốc
          data = [cigarettesPerDay, quitDayValue, threeDaysValue, 0]; // hút bình thường
        }
        break;
      }
      case "Prescription medication": {
        // Với thuốc kê đơn, bắt đầu giảm từ trước ngày cai thuốc
        let todayValue = cigarettesPerDay; // giả định chưa giảm hút

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
          Math.round(cigarettesPerDay * 0.4), // Ngày cai thuốc: còn 40%
          Math.round(cigarettesPerDay * 0.15), // 3 ngày sau cai: còn 15%
          0, // 1 tuần sau cai: cai hẳn
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
    labels: chartDataValues.labels, // ["Today", "Quit Date", "3 days", "1 week"](mốc time hiển thị biểu đồ)
    datasets: [
      // dữ liệu từng dòng biểu đồ
      {
        label: "Cigarettes per day", //tiêu đề hiển thị cho dòng dữ liệu (ví dụ: chú thích ở góc biểu đồ).
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
    responsive: true, // Giúp biểu đồ co giãn theo kích thước màn hình
    plugins: {
      // hiển thị tiêu đề chính cho biểu đồ
      legend: { position: "top" },
      title: { display: true, text: "Your Quit Plan Timeline" },
    },
    scales: {
      // trục dọc
      y: {
        beginAtZero: true, // bắt đầu từ 0
        title: { display: true, text: "Cigarettes" }, // chỉ số lượng điếu hút/ngày
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
      <Text className="plan-plan-title">Create a Quit Plan</Text>
      <Text className="plan-plan-subtitle">
        Create a personalized quit plan to increase your chances of success
      </Text>
      {/* Thanh tiến trình hiển thị các bước */}
      <div className="plan-progress-bar">
        {/* Hiển thị các bước với trạng thái active hoặc completed */}
        <div
          className={`plan-step ${
            // nếu ở bc 1 thì active , qua 1 thì complete, nếu chưa tới bc n ko có class j thêm
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
              value={dayjs(selectedDate)} // ngày chọn cần nhận dayjs object( thư viện ant des)=> date -> dayjs
              //người dùng chọn ngày mới, cập nhật selectedDate trong state. Dùng ?. để tránh lỗi nếu null.
              onChange={(date) => setSelectedDate(date?.toDate())}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 10, color: "#555" }}>
              Selected date: {selectedDate.toLocaleDateString("vi-VN")}{" "}
              {/*cho bt ng dùng chọn ngày nào ,kiểu VN*/}
            </div>
          </div>

          {/* Chọn phương pháp cai thuốc */}
          <div className="plan-form-group">
            <span className="plan-quit-method-title">Quit method</span>
            <Radio.Group
              value={quitMethod}
              // user chọn pp cai mới , lấy giá trị đó truyền vào hàm xử lí để cập nhật state
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
              style={{ backgroundColor: "black", borderColor: "#16A34A" }}
              onClick={() => setCurrentStep(2)} // user click -> setCurrentStep thành 2
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
              onChange={(value) => setCigarettesPerDay(value)} // khi user thay đổi số điếu nhập , cập nhật state
              className="plan-custom-input"
            />
          </div>

          <div className="plan-form-group">
            <Text className="plan-form-label">Smoking triggers</Text>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                {leftColumnTriggers.map(
                  (
                    trigger,
                    index // Lặp qua mảng các trigger ở cột bên trái
                  ) => (
                    <div key={index} className="plan-option-wrapper">
                      <Checkbox
                        checked={triggers.includes(trigger)} // 	Nếu trigger đang được chọn, đánh dấu checkbox.
                        onChange={() => handleTriggerChange(trigger)} // 	Khi user tick/bỏ tick, gọi hàm handleTriggerChange(trigger).
                      >
                        {trigger}
                      </Checkbox>
                    </div>
                  )
                )}
              </Col>
              <Col span={12}>
                {rightColumnTriggers.map(
                  (
                    trigger,
                    index // Lặp qua mảng các trigger ở cột bên phải
                  ) => (
                    <div key={index} className="plan-option-wrapper">
                      <Checkbox
                        checked={triggers.includes(trigger)} // 	Nếu trigger đang được chọn, đánh dấu checkbox.
                        onChange={() => handleTriggerChange(trigger)} // 	Khi user tick/bỏ tick, gọi hàm handleTriggerChange(trigger).
                      >
                        {trigger}
                      </Checkbox>
                    </div>
                  )
                )}
              </Col>
            </Row>
          </div>

          {/* Nút điều hướng - Hiển thị cả Back và Next , nếu bạn ở bc 2 thì có thể quay lại bc 1 và next bc 3*/}
          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(1)}
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#fff",
                color: "#111827",
                padding: "0 20px",
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              style={{ backgroundColor: "black", borderColor: "#16A34A" }}
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
                {leftCopingStrategies.map(
                  (
                    strategy,
                    index // lặp qua các strategy bên trái
                  ) => (
                    <div key={index} className="plan-option-wrapper">
                      <Checkbox
                        //Nếu strategy đã có trong danh sách copingStrategies, thì checkbox sẽ được đánh dấu (ticked).
                        checked={copingStrategies.includes(strategy)}
                        //Khi người dùng tick hoặc bỏ tick checkbox, gọi hàm handleCopingStrategyChange(strategy) để cập nhật danh sách copingStrategies.
                        onChange={() => handleCopingStrategyChange(strategy)}
                      >
                        {strategy}
                      </Checkbox>
                    </div>
                  )
                )}
              </Col>
              <Col span={12}>
                {rightCopingStrategies.map((strategy, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      //Nếu strategy đã có trong danh sách copingStrategies, thì checkbox sẽ được đánh dấu (ticked).
                      checked={copingStrategies.includes(strategy)}
                      //Khi người dùng tick hoặc bỏ tick checkbox, gọi hàm handleCopingStrategyChange(strategy) để cập nhật danh sách copingStrategies.
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
                      checked={supportNetwork.includes(support)} // Checkbox được tick nếu đã chọn
                      onChange={() => handleSupportNetworkChange(support)} // Thay đổi khi click
                    >
                      {support} {/* Hiển thị tên nguồn hỗ trợ*/}
                    </Checkbox>
                  </div>
                ))}
              </Col>
              <Col span={12}>
                {rightSupportNetwork.map((support, index) => (
                  <div key={index} className="plan-option-wrapper">
                    <Checkbox
                      checked={supportNetwork.includes(support)} // Checkbox được tick nếu đã chọn
                      onChange={() => handleSupportNetworkChange(support)} // Thay đổi khi click
                    >
                      {support} {/* Hiển thị tên nguồn hỗ trợ*/}
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
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#fff",
                color: "#111827",
                padding: "0 20px",
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              style={{ backgroundColor: "black", borderColor: "#16A34A" }}
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
                onClick={handleAddReward} // gọi hàm addReward
                style={{
                  backgroundColor: "#F3F4F6",
                  borderColor: "#fff",
                  color: "#111827",
                  padding: "0 20px",
                }}
              >
                Add reward
              </Button>
            </div>

            {showNotification && ( // log ra thông báo thành công
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

            {rewards.length === 0 ? ( // check người dùng chưa thêm phần thưởng
              <Text className="plan-form-label" style={{ color: "#666" }}>
                No rewards added yet. Add rewards to create motivation!
              </Text>
            ) : (
              <div style={{ marginTop: "20px" }}>
                <Typography.Title level={4}>Your Reward:</Typography.Title>
                {rewards.map(
                  (
                    rewardItem,
                    index // nếu đã có phần thưởng liệt kê từng rewardItem bằng map()
                  ) => (
                    <div
                      key={index} // Định danh duy nhất	Giúp React phân biệt các phần tử
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
                        {rewardItem.milestone} <br />{" "}
                        {/*Cột mốc đạt được (VD: 3 ngày không hút thuốc)*/}
                        <Text strong>
                          <GiftOutlined style={{ marginRight: "8px" }} />
                          Reward:
                        </Text>{" "}
                        {rewardItem.reward} {/*phần thưởng tương ứng*/}
                      </div>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteReward(index)} // gọi hàm xóa phần thưởng
                        danger
                        aria-label="Delete reward"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Modal hộp thoại để thêm phần thưởng */}
          <Modal
            title="Add reward"
            visible={isModalVisible} // Điều kiện hiển thị modal (kiểm soát bởi isModalVisible)
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="Add"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                // Đây là các mốc quan trọng
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
              value={additionalNotes} // liên kết additionalNotes giúp ng dùng nhập notes
              onChange={(e) => setAdditionalNotes(e.target.value)} // khi ng dùng nhập note , cập nhật state
              placeholder="Additional notes about your quit plan..."
              className="plan-custom-input"
            />
          </div>

          <div className="plan-nav-buttons">
            {" "}
            {/*back quay lại b3 , next b5*/}
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(3)}
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#fff",
                color: "#111827",
                padding: "0 20px",
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              style={{ backgroundColor: "black", borderColor: "#16A34A" }}
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
            {" "}
            {/*  hiển thị Review quit plan*/}
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
              //ngày người dùng chọn để bắt đầu kế hoạch cai thuốc
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
              {/*Chuyển selectedDate (kiểu Date) thành định dạng ngày Việt Nam (dd/mm/yyyy)*/}
              {selectedDate.toLocaleDateString("vi-VN")}
            </Typography.Paragraph>
            <Typography.Paragraph
              // hiển thị phương pháp cai thuốc
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
              // số lượng thuốc lá hút mỗi ngày trc khi cai
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
              level={4} // tạo tiêu đề cấp độ 4
              style={{
                marginTop: "25px",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <WarningOutlined
                // logo cảnh báo
                style={{
                  marginRight: "8px",
                  color: "#16A34A",
                }}
              />
              Triggers:
            </Typography.Title>
            {/* hiển thị các tác nhaan hây hút thuốc*/}
            {triggers.length > 0 ? ( // Nếu có ít nhất 1 trigger được chọn
              <ul
                style={{
                  listStyleType: "none",
                  paddingLeft: "20px",
                  fontSize: "16px",
                }}
              >
                {triggers.map(
                  (
                    item,
                    i // dùng map( ) để hiển thị ra các trigger dạng thẻ
                  ) => (
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
                  )
                )}
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
            {copingStrategies.length > 0 ? ( // Nếu có ít nhất 1 chiến lược đối phó
              <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
                {copingStrategies.map(
                  (
                    item,
                    i // dùng map để duyệt qua các chiến lược đối phó
                  ) => (
                    <li
                      key={i} // Key duy nhất cho mỗi phần tử trong danh sách
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
                      {item} {/*nội dung chiến lược*/}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <Text italic> No coping strategy was selected.</Text>
            )}

            <Typography.Title
              // hiển thị danh sách hỗ trợ
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
            {supportNetwork.length > 0 ? ( // nếu có ít nhất 1 nền tảng hỗ trợ
              <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
                {supportNetwork.map(
                  (
                    item,
                    i // dùng map để duyệt qua các nền tảng hỗ trợ
                  ) => (
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
                      {item} {/* danh sách hỗ trợ*/}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <Text italic> No support network selected.</Text>
            )}

            <Typography.Title
              // hiển thị rewward
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
            {rewards.length > 0 ? ( // nếu có ít nhất 1 phần thưởng
              rewards.map((rewardItem, index) => (
                <div
                  key={index}
                  style={{ paddingLeft: "20px", marginBottom: "10px" }}
                >
                  <Text strong>
                    {/*mốc quan trọng ng dùng đạt đc*/}
                    <PushpinOutlined style={{ marginRight: "8px" }} />
                    Milestone:
                  </Text>{" "}
                  {rewardItem.milestone} <br />
                  <Text strong>
                    {/* phần thưởng*/}
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
              // ghi chú
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
            {/*nếu ng dùng có nhập ghi chú gọi additionalNotes, ko thì hện thoong báo ko có ghi chú*/}
            <Text italic>{additionalNotes || "No additional notes"}</Text>
          </div>

          {/* Chart display */}
          <div className="plan-chart-section">
            {/*Dùng component <Line /> từ thư viện react-chartjs-2 để hiển thị biểu đồ dạng đường (line chart).*/}
            {/*Dữ liệu được truyền từ chartData, cấu hình từ chartOptions.*/}
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Nút điều hướng - Hiển thị cả Back và Complete */}
          <div className="plan-nav-buttons">
            <Button
              type="default"
              className="plan-nav-button"
              onClick={() => setCurrentStep(4)}
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#fff",
                color: "#111827",
                padding: "0 20px",
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="plan-nav-button"
              onClick={handleComplete}
              style={{ backgroundColor: "black", borderColor: "#16A34A" }}
            >
              Complete
            </Button>
          </div>
          {showCompleteNotification && ( // show log thông báo lưu thành công
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

export default Plan;
