import React, { useState, useEffect } from "react";

// Component HealthMilestones để hiển thị các cột mốc sức khỏe sau khi bỏ thuốc lá
const HealthMilestones = ({ quitDate }) => {
  // State để theo dõi các cột mốc đã đạt được
  const [milestones, setMilestones] = useState({
    "20 minutes": false,
    "12 hours": false,
    "2-3 weeks": false,
    "1-3 months": false,
  });

  // useEffect hook để tính toán cột mốc dựa trên quitDate
  useEffect(() => {
    // Sử dụng quitDate từ props, mặc định là ngày hiện tại nếu không có
    const startDate = quitDate ? new Date(quitDate) : new Date();

    // Hàm cập nhật trạng thái cột mốc
    const updateMilestones = () => {
      const now = new Date();
      const timeDiff = now - startDate;
      const minutesPassed = timeDiff / (1000 * 60);
      const hoursPassed = minutesPassed / 60;
      const daysPassed = hoursPassed / 24;

      const achieved = {
        "20 minutes": minutesPassed >= 20,
        "12 hours": hoursPassed >= 12,
        "2-3 weeks": daysPassed >= 14,
        "1-3 months": daysPassed >= 30,
      };

      setMilestones((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(achieved)) {
          return achieved;
        }
        return prev;
      });
    };

    updateMilestones();
    const interval = setInterval(updateMilestones, 1000);
    return () => clearInterval(interval);
  }, [quitDate]); // Thêm quitDate vào dependency array để cập nhật khi prop thay đổi

  // Hàm hỗ trợ để xác định trạng thái hiển thị của cột mốc
  const getStatus = (time) => (milestones[time] ? "Achieved" : "Coming soon");

  return (
    <div
      className="health-milestones"
      style={{
        paddingBottom: "60px",
      }}
    >
      <div
        className="milestone-grid"
        style={{
          maxHeight: "180px",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        <div
          className={`milestone-col ${
            milestones["20 minutes"] ? "achieved" : ""
          }`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6ffe6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = milestones["20 minutes"]
              ? "#e6ffe6"
              : "#fff")
          }
        >
          <span className="milestone-icon"></span>
          <div>
            <strong>20 minutes</strong>
            <p>Your heart rate and blood pressure drop</p>
          </div>
          <span className="status">{getStatus("20 minutes")}</span>
        </div>
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

export default HealthMilestones;