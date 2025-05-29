import React, { useState, useEffect } from "react";

// Component HealthMilestones để hiển thị các cột mốc sức khỏe sau khi bỏ thuốc lá
const HealthMilestones = () => {
  // State để theo dõi các cột mốc đã đạt được
  const [milestones, setMilestones] = useState({
    "20 minutes": false, // Cột mốc 20 phút không hút thuốc
    "12 hours": false, // Cột mốc 12 giờ không hút thuốc
    "2-3 weeks": false, // Cột mốc 2-3 tuần không hút thuốc
    "1-3 months": false, // Cột mốc 1-3 tháng không hút thuốc
  });

  // useEffect hook để tính toán cột mốc dựa trên thời gian thực
  useEffect(() => {
    // Ngày bắt đầu: 28 ngày trước thời điểm hiện tại (có thể thay bằng giá trị từ người dùng)
    const startDate = new Date("2025-05-25T07:36:00+07:00"); // Truyền dữ liệu vào để đặt thời gian bắt đầu cai nghiện

    // Hàm cập nhật trạng thái cột mốc
    const updateMilestones = () => {
      // Lấy thời gian hiện tại (thời gian thực)
      const now = new Date();

      // Tính khoảng thời gian chênh lệch (miligiây)
      const timeDiff = now - startDate;

      // Chuyển đổi thời gian thành phút, giờ và ngày
      const minutesPassed = timeDiff / (1000 * 60);
      const hoursPassed = minutesPassed / 60;
      const daysPassed = hoursPassed / 24;

      // Cập nhật trạng thái cột mốc dựa trên thời gian đã trôi qua
      const achieved = {
        "20 minutes": minutesPassed >= 20, // Đạt được nếu đã qua 20 phút
        "12 hours": hoursPassed >= 12, // Đạt được nếu đã qua 12 giờ
        "2-3 weeks": daysPassed >= 14, // Đạt được nếu đã qua 14 ngày (2 tuần)
        "1-3 months": daysPassed >= 30, // Đạt được nếu đã qua 30 ngày (1 tháng)
      };

      // Cập nhật state nếu có thay đổi
      setMilestones((prev) => {
        // Chỉ cập nhật nếu trạng thái thay đổi để tránh re-render không cần thiết
        if (JSON.stringify(prev) !== JSON.stringify(achieved)) {
          return achieved;
        }
        return prev;
      });
    };

    // Cập nhật ngay lần đầu
    updateMilestones();

    // Cập nhật mỗi giây để phản ánh thời gian thực
    const interval = setInterval(updateMilestones, 1000); // Cập nhật mỗi 1 giây

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, []); // Mảng rỗng để chỉ chạy khi mount/unmount

  // Hàm hỗ trợ để xác định trạng thái hiển thị của cột mốc
  const getStatus = (time) => (milestones[time] ? "Achieved" : "Coming soon");

  // JSX để render lưới các cột mốc
  return (
    <div
      className="health-milestones"
      style={{
        minHeight: "calc(100vh - 200px)", // Đảm bảo chiều cao tối thiểu trừ 200px
        paddingBottom: "60px", // Thêm đệm dưới để nội dung không sát đáy
      }}
    >
      {/* Container chứa các cột mốc với khả năng cuộn dọc */}
      <div
        className="milestone-grid"
        style={{
          maxHeight: "180px", // Giới hạn chiều cao để hiển thị ~3 cột mốc (~80px mỗi cột)
          overflowY: "auto", // Bật cuộn dọc nếu nội dung vượt quá chiều cao
          paddingRight: "10px", // Thêm đệm phải để tránh thanh cuộn che nội dung
        }}
      >
        {/* Cột mốc: 20 phút */}
        <div
          className={`milestone-col ${
            milestones["20 minutes"] ? "achieved" : ""
          }`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ffe6")
          } // Hiệu ứng hover: nền xanh nhạt
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = milestones["20 minutes"]
              ? "#e6ffe6"
              : "#fff")
          } // Khôi phục màu nền dựa trên trạng thái đạt được
        >
          <span className="milestone-icon"></span>{" "}
          {/* Placeholder cho biểu tượng cột mốc */}
          <div>
            <strong>20 minutes</strong>
            <p>Your heart rate and blood pressure drop</p>
          </div>
          <span className="status">{getStatus("20 minutes")}</span>{" "}
          {/* Hiển thị trạng thái */}
        </div>

        {/* Cột mốc: 12 giờ */}
        <div
          className={`milestone-col ${
            milestones["12 hours"] ? "achieved" : ""
          }`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ffe6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = milestones["12 hours"]
              ? "#e6ffe6"
              : "#fff")
          }
        >
          <span className="milestone-icon"></span>
          <div>
            <strong>12 hours</strong>
            <p>Carbon monoxide levels in your blood drop to normal</p>
          </div>
          <span className="status">{getStatus("12 hours")}</span>
        </div>

        {/* Cột mốc: 2-3 tuần */}
        <div
          className={`milestone-col ${
            milestones["2-3 weeks"] ? "achieved" : ""
          }`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ffe6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = milestones["2-3 weeks"]
              ? "#e6ffe6"
              : "#fff")
          }
        >
          <span className="milestone-icon"></span>
          <div>
            <strong>2-3 weeks</strong>
            <p>Your circulation improves and lung function increases</p>
          </div>
          <span className="status">{getStatus("2-3 weeks")}</span>
        </div>

        {/* Cột mốc: 1-3 tháng */}
        <div
          className={`milestone-col ${
            milestones["1-3 months"] ? "achieved" : ""
          }`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ffe6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = milestones["1-3 months"]
              ? "#e6ffe6"
              : "#fff")
          }
        >
          <span className="milestone-icon"></span>
          <div>
            <strong>1-3 months</strong>
            <p>Your circulation and lung function improve significantly</p>
          </div>
          <span className="status">{getStatus("1-3 months")}</span>
        </div>
      </div>
    </div>
  );
};

// Xuất component để sử dụng ở các phần khác của ứng dụng
export default HealthMilestones;
