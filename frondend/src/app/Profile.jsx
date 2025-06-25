import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Card,
  Typography,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Spin,
  Row,
  Col,
  Statistic,
} from "antd";
import { Snackbar, Alert } from "@mui/material";
import {
  SettingOutlined,
  CameraOutlined,
  UserOutlined,
  HeartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CrownOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import axios from "axios";
import moment from "moment";
import "../App.css";
import { useParams } from "react-router-dom";


const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const { userId: paramUserId } = useParams(); // lấy từ URL nếu có
  // Lấy thông tin người dùng và hàm cập nhật thông tin người dùng từ context AuthContext
  const { user, setUser } = useContext(AuthContext);
  // Khai báo trạng thái để điều khiển việc hiển thị modal (true = hiển thị, false = ẩn)
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Trạng thái lưu thông tin chi tiết của người dùng (profile), ban đầu là null
  const [userData, setUserData] = useState(null);
  // Trạng thái cho biết có đang trong quá trình tải dữ liệu hay không, dùng để hiện loading spinner
  const [loading, setLoading] = useState(false);
  // Tạo một đối tượng form của Ant Design để thao tác với các trường dữ liệu trong form (như set value, validate, reset)
  const [form] = Form.useForm();
  // Trạng thái lưu dữ liệu bảng xếp hạng (leaderboard), ví dụ như top người dùng có điểm cao nhất
  const [leaderboardData, setLeaderboardData] = useState(null);
  // Trạng thái cờ cho biết người dùng có đang thực hiện liên kết tài khoản Google hay không
  // Dùng để disable nút hoặc hiện loading khi đang liên kết
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // Trạng thái quản lý hiển thị snackbar(thông báo)
  const [snackbar, setSnackbar] = useState({
    open: false, // ban đầu không hiển thị
    message: "", // nội dung rỗng
    severity: "info", // mặc định là thông báo thông tin (có thể đổi thành success, error...)
  });

  // Hàm tiện ích (helper function) để hiển thị snackbar
  const showSnackbar = (message, severity = "info") => {
    // Cập nhật trạng thái snackbar để hiển thị thông báo với nội dung và mức độ nhất định
    setSnackbar({
      open: true, // mở snackbar (hiển thị)
      message, // nội dung thông báo, được truyền vào khi gọi hàm
      severity, // mức độ cảnh báo ('info' mặc định, hoặc 'success', 'error', 'warning')
    });
  };

  // Hàm tiện ích (helper function) để đóng snackbar (ẩn thông báo)
  const handleCloseSnackbar = (event, reason) => {
    // Nếu lý do đóng là do người dùng click ra ngoài (clickaway), thì không làm gì cả
    if (reason === "clickaway") {
      return; // Giữ nguyên snackbar, không đóng
    }
    // Cập nhật trạng thái snackbar: chỉ thay đổi `open` thành `false` để ẩn thông báo
    setSnackbar((prev) => ({ ...prev, open: false })); // giữ nguyên các giá trị cũ (message, severity),  open : false :đóng snackbar
  };
  // Lấy chuỗi JSON người dùng từ localStorage
  const userStr = localStorage.getItem("user");
  // Nếu userStr tồn tại thì parse (chuyển từ JSON thành object), nếu không thì trả về null
  const userObj = userStr ? JSON.parse(userStr) : null;
  // In ra console để kiểm tra cấu trúc đối tượng người dùng
  console.log("User object from localStorage:", userObj);
  // Tạo một danh sách các tên trường có thể chứa ngày tháng
  if (userObj) {
    const possibleDateFields = [
      "createAt",
      "createdAt",
      "registrationDate",
      "registerDate",
      "joinDate",
      "dateCreated",
    ];
    // In ra console để biết mình đang kiểm tra trường nào
    console.log("Checking date fields in user object:");
    // Lặp qua từng tên trường có thể là ngày tháng
    possibleDateFields.forEach((field) => {
      // Nếu object user có trường đó
      if (userObj[field]) {
        // In ra giá trị ngày tháng để xem dữ liệu
        console.log(`Found date field ${field}:`, userObj[field]);
      }
    });
  }

  const localUserId = userObj ? userObj.id : null;
  // const userId = userObj ? userObj.id : null;

  // Chọn userId cần fetch profile
  const userId = paramUserId || localUserId;


  // Fetch profile data on component mount
  useEffect(() => {
    // hàm bất đồng bộ gọi API lấy dữ liệu hồ sơ.
    const fetchProfileData = async () => {
      //Nếu không có userId, thì dừng hàm lại, không gọi API nữa.
      if (!userId) return;

      setLoading(true); // Bật trạng thái đang tải (loading): khi gọi 1 api mất 1 khoảng time -> hiển thị 1 vòng xoay
      try {
        //gọi endpoint lấy thông tin hồ sơ của người dùng dựa vào userId
        const response = await axios.get(
          `http://localhost:8080/api/profile/user/${userId}`
        );
        if (response.status === 200) {
          //Lấy dữ liệu JSON từ phản hồi API và gán vào biến profileData.
          const profileData = response.data;
          //In dữ liệu hồ sơ người dùng ra console để có thể kiểm tra khi debug.
          console.log("Profile data from API:", profileData);

          //Kiểm tra các trường ngày trong dữ liệu hồ sơ
          const possibleDateFields = [
            "createAt",
            "createdAt",
            "registrationDate",
            "registerDate",
            "joinDate",
            "dateCreated",
          ];
          //Duyệt qua từng tên trường trong danh sách để kiểm tra xem profileData có chứa trường đó không.
          possibleDateFields.forEach((field) => {
            //Nếu hồ sơ có tồn tại trường đó không rỗng/null), thì xử lý tiếp
            if (profileData[field]) {
              // In ra console tên trường ngày và giá trị ngày được tìm thấy
              console.log(
                `Found date field ${field} in profile data:`,
                profileData[field]
              );
            }
          });
          // update data hồ sơ người dùng (profileData) vào state userData
          setUserData(profileData);

          //  gán giá trị mặc định cho form
          form.setFieldsValue({
            name: profileData.name, // Gán tên người dùng vào ô "Họ tên".
            phone: profileData.phone, // gán sdt
            birthdate: profileData.birthdate //Dùng thư viện moment() để chuyển chuỗi ngày sang định dạng chuẩn mà DatePicker hiểu.
              ? moment(profileData.birthdate, "DD/MM/YYYY")
              : null, // ko có ngày gán null
            gender: profileData.gender, // giới tính
            bio: profileData.bio, // mô tả , giới thiệu bản thân
            smokingAge: profileData.smokingAge, // tuổi bắt đầu hút thuốc
            yearsSmoked: profileData.yearsSmoked, //năm đã hút thuốc
            occupation: profileData.occupation, // nghề nghiệp
            healthStatus: profileData.healthStatus, // tình trạng sức khỏe
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          //Kiểm tra xem lỗi có phải là “Không tìm thấy” (Not Found) hay không.

          console.log("No profile found, user can create one"); // ko tìm thấy , tạo mới
        } else {
          console.error("Error fetching profile data:", error); // nếu ko p 404, in ra lỗi
          showSnackbar("Failed to load profile data", "error"); // hiển thị thanh thông báo
        }
      } finally {
        setLoading(false); // dù có lỗi hay ko thì cx dừng quá trình load
      }
    };

    fetchProfileData();
  }, [userId, form]);

  useEffect(() => {
    // khai báo 1 hàm bất đồng bộ để gọi api leaderboard
    const fetchLeaderboardData = async () => {
      //Nếu userId chưa có (chưa đăng nhập), thì không làm gì cả
      if (!userId) return;

      try {
        // params là nơi bạn truyền các tham số (query string) để đính kèm vào URL.
        const params = {
          currentUserId: userId, //gửi ID người dùng hiện tại để backend biết bạn là ai.
          timeRange: "all", //gửi yêu cầu muốn lấy thống kê theo toàn thời gian.
        };
        // gọi api leaderboard kèm theo params
        const response = await axios.get(
          "http://localhost:8080/api/leaderboard",
          { params }
        );

        if (response.status === 200) {
          //lấy thông tin người dùng hiện tại trong bảng xếp hạng (currentUser) và lưu vào leaderboardData.
          setLeaderboardData(response.data.currentUser);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        //Nếu có lỗi (API hỏng, mất mạng...), in lỗi ra console
      }
    };

    fetchLeaderboardData(); // gọi hàm
  }, [userId]);

  const showModal = () => {
    // mở một hộp thoại (Modal)
    setIsModalVisible(true);
  };

  const handleOk = () => {
    // hàm submit khi ng dùng nhập thông tin và nhấn lưu
    form.submit(); //Gửi toàn bộ dữ liệu form để xử lý (như lưu vào DB hoặc gọi API).
  };

  const handleCancel = () => {
    // hàm khi ng dùng nhấn cancel ở form nhập
    setIsModalVisible(false); // đóng modal
    if (userData) {
      //nếu ng dùng có thông tin
      form.setFieldsValue({
        // gán giá trị cho các trường trong form
        name: userData.name, // tên
        phone: userData.phone, // số điện thoại
        birthdate: userData.birthdate //Dùng thư viện moment() để chuyển chuỗi ngày sang định dạng chuẩn mà DatePicker hiểu.
          ? moment(userData.birthdate, "DD/MM/YYYY")
          : null,
        gender: userData.gender, // giới tính
        bio: userData.bio, // tiểu sử bản thân
        smokingAge: userData.smokingAge, //tuổi bắt đầu hút thuốc
        yearsSmoked: userData.yearsSmoked, // số năm hút thuốc
        occupation: userData.occupation, //nghề nghiệp
        healthStatus: userData.healthStatus, // tình trạng sức khỏe
      });
    }
  };
  const handleFinish = async (values) => {
    // hàm bất đồng bộ nhận vào 1 value: là những j nhập vào form
    if (!userId) {
      // check userid có tồn tại ko
      showSnackbar("User ID not found", "error"); // hiện thông báo lỗi
      return; // end tại đây
    }

    setLoading(true); // chặn người dùng gửi data khi đang load data
    try {
      //Chuyển đổi giá trị DatePicker sang định dạng chuỗi DD/MM/YYYY
      if (values.birthdate) {
        values.birthdate = values.birthdate.format("DD/MM/YYYY");
      }

      const profileData = {
        ...values, // giữ lại những trường cũ mà ng dùng đã nhập trong form
        userId: userId.toString(), // thêm userid và chuyển sang chuỗi
      };
      //Gửi một POST request đến server để cập nhật hoặc lưu hồ sơ người dùng với dữ liệu từ profileData
      const response = await axios.post(
        "http://localhost:8080/api/profile",
        profileData
      );

      if (response.status === 200) {
        setUserData(response.data); //Cập nhật dữ liệu hồ sơ mới vào state

        //Nếu người dùng đã thay đổi tên (name)
        if (values.name && values.name !== user?.name) {
          const updatedUser = {
            ...user, //sao chép toàn bộ thuộc tính từ object user vào object mới
            name: values.name, // Ghi đè trường name nếu có tên mới (values.name)
          };
          setUser(updatedUser); // Cập nhật lại state user với dữ liệu mới (updatedUser)
          //lưu thông tin người dùng (đã cập nhật) vào trình duyệt của bạn (localStorage).
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setIsModalVisible(false); // hàm đóng modal chỉnh sửa hồ sơ
        showSnackbar("Profile updated successfully!", "success"); // thông báo update thành công
      }
    } catch (error) {
      console.error("Error saving profile:", error); // ghi lỗi chi tiết trong console
      showSnackbar("Failed to save profile. Please try again.", "error"); //snackbar báo lỗi cho ng dùng
    } finally {
      setLoading(false); // tắt loading
    }
  };

  //hàm bất đồng bộ liên kết với google
  const handleLinkGoogleAccount = async () => {
    //auth.currentUser là thông tin người dùng hiện tại đã đăng nhập
    //Kiểm tra xem đã có ai đăng nhập chưa.
    if (!auth.currentUser) {
      showSnackbar("Please log in first", "error"); // nếu chưa thì show thông báo
      return;
    }

    setLinkingGoogle(true); //Hiển thị trạng thái linking.
    try {
      const provider = new GoogleAuthProvider(); //Mở popup để người dùng đăng nhập Google.
      const result = await linkWithPopup(auth.currentUser, provider); //Liên kết tài khoản Google với tài khoản hiện tại.

      //Lấy token mới có chứa thông tin Google.
      const idToken = await result.user.getIdToken(true);

      //Gửi token về server để cập nhật dữ liệu backend.
      const response = await axios.post(
        "http://localhost:8080/api/user/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`, //// gửi kèm ID Token trong header
          },
        }
      );

      if (response.status === 200) {
        //lấy dữ liệu người dùng được cập nhật từ phản hồi (response) của API
        const updatedUser = response.data.user || response.data;
        setUser(updatedUser); //Cập nhật user mới vào state hiện tại
        // Ghi thông tin user vào localStorage của trình duyệt dưới dạng chuỗi JSON
        //Để ghi nhớ thông tin user giữa các lần tải lại trang.
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showSnackbar(
          // hiển thị thông báo thành công
          "🎉 Google account linked successfully! You can now login with Google or Email/Password.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error linking Google account:", error); // in ra log lỗi
      if (error.code === "auth/popup-closed-by-user") {
        //Người dùng tự tay đóng cửa sổ popup (bấm dấu x) trước khi hoàn tất thao tác
        showSnackbar("Google linking cancelled.", "info"); // hiện thông báo người dùng đã hủy thao tác
      } else if (error.code === "auth/credential-already-in-use") {
        //Tài khoản Google đang định liên kết đã được người khác dùng trước đó
        //Thông báo lỗi bằng snackbar để người dùng hiểu và chọn tài khoản Google khác
        showSnackbar(
          "This Google account is already linked to another user.",
          "error"
        );
      } else if (error.code === "auth/provider-already-linked") {
        //Kiểm tra xem có đúng là lỗi do provider đã liên kết trước không
        //Tài khoản Google này đã được liên kết với tài khoản của bạn rồi.
        showSnackbar(
          "Google account is already linked to your account.",
          "info"
        );
      } else {
        // thông báo thất bại
        showSnackbar(
          "Failed to link Google account. Please try again.",
          "error"
        );
      }
    } finally {
      setLinkingGoogle(false); //hoàn tất hoặc hủy quá trình liên kết.
    }
  };
  const calculateAge = (birthdate) => {
    //Nếu birthdate là null, undefined, hoặc rỗng thì không xử lý nữa, trả về chuỗi rỗng ""
    if (!birthdate) return "";

    let birthDate; //biến kiểu Date dùng để tính tuổi sau này.
    if (typeof birthdate === "string") {
      //Kiểm tra xem birthdate có phải kiểu chuỗi hay không (ví dụ "01/05/1990")
      const [day, month, year] = birthdate.split("/"); // Dùng .split("/") để tách chuỗi theo dấu /,
      birthDate = new Date(year, month - 1, day); // Tạo một đối tượng Date từ các phần đã tách.
    } else {
      //Dòng này giúp chuyển birthdate về kiểu Date, ưu tiên dùng .toDate() nếu là đối tượng moment/dayjs, ngược lại dùng new Date(birthdate).
      birthDate = birthdate.toDate ? birthdate.toDate() : new Date(birthdate);
    }

    if (isNaN(birthDate.getTime())) {
      // nếu ngày sinh ko hợp lệ vd tháng 13, ngày 32, ko tính tuổi , trả về chuỗi rỗng
      return "";
    }

    const today = new Date(); // lấy ngày hôm nay
    let age = today.getFullYear() - birthDate.getFullYear(); //Trừ năm hiện tại với năm sinh
    const monthDiff = today.getMonth() - birthDate.getMonth(); //So sánh tháng hiện tại với tháng sinh.
    //monthDiff < 0 → chưa đến tháng sinh → chưa đến sinh nhật,  monthDiff === 0 → kiểm tra tiếp ngày.
    if (
      monthDiff < 0 || // chưa đến tháng sinh && ngày sinh thì trừ đi 1 tuổi
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age > 0 ? `${age} years old` : ""; //Nếu tuổi > 0 thì trả về chuỗi, ko thì return rỗng
  };
  const formatMemberSinceDate = (dateValue) => {
    // định dạng ngày ng dùng tham gia
    //Nếu không có ngày → trả mặc định
    if (!dateValue) return "15/04/2023";

    //In giá trị ngày để debug
    console.log("Formatting date value:", dateValue);

    try {
      //Kiểm tra nếu dateValue là chuỗi (string)
      if (typeof dateValue === "string") {
        // Kiểm tra xem chuỗi có phải chuỗi mảng kiểu "[2023,6,15]" không
        if (dateValue.startsWith("[") && dateValue.endsWith("]")) {
          try {
            //Dùng JSON.parse để chuyển chuỗi "[2023,6,15]" thành mảng [2023, 6, 15]
            const dateArray = JSON.parse(dateValue);
            if (Array.isArray(dateArray) && dateArray.length >= 3) {
              //Kiểm tra xem có đúng là mảng không, và có ít nhất 3 phần tử:ngày tháng năm
              const year = dateArray[0];
              const month = dateArray[1]; //Gán lần lượt giá trị năm, tháng, ngày từ mảng.
              const day = dateArray[2];
              return moment([year, month - 1, day]).format("DD/MM/YYYY"); // Dùng moment.js để tạo đối tượng ngày, rồi format theo kiểu dd/mm/yyyy
            }
          } catch (e) {
            console.error("Failed to parse date array string:", e); // log ra lỗi to debug
          }
        }

        //Chuyển đổi giá trị DatePicker sang định dạng chuỗi DD/MM/YYYY
        const formats = [
          "YYYY-MM-DDTHH:mm:ss", // ISO 8601, chuẩn Java hay dùng (ví dụ: "2023-06-15T14:30:00")
          "YYYY-MM-DD HH:mm:ss", // Dạng chuẩn SQL (ví dụ: "2023-06-15 14:30:00")
          "YYYY-MM-DD", // Chỉ ngày, không giờ (ví dụ: "2023-06-15")
          "DD/MM/YYYY", // Định dạng ngày phổ biến ở VN/EU
          "MM/DD/YYYY", // Định dạng Mỹ (tháng/ngày/năm)
        ];

        for (const format of formats) {
          //Duyệt qua từng định dạng ngày trong mảng `formats`
          const parsed = moment(dateValue, format, true); //parse dateValue thành ngày hợp lệ với moment.js.
          if (parsed.isValid()) {
            //Nếu thành công, trả về ngày đã định dạng chuẩn kiểu DD/MM/YYYY.
            return parsed.format("DD/MM/YYYY");
          }
        }

        // Chuyển dateValue (ngày đầu vào) thành chuỗi định dạng "DD/MM/YYYY" nếu hợp lệ.
        const memberDate = moment(dateValue); //Dùng moment() để chuyển dateValue thành đối tượng moment.
        if (memberDate.isValid()) {
          // check memberDate có hợp lệ hay ko
          return memberDate.format("DD/MM/YYYY"); // định dạng lại ngày theo kiểu dd/mm/yyyy
        }
      }

      // Nếu dateValue là mảng như [2023, 4, 15], thì chuyển nó thành ngày "15/04/2023" bằng moment.
      //Kiểm tra xem dateValue có phải là mảng ít nhất 3 phần tử không (tức [year, month, day]).
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const year = dateValue[0];
        const month = dateValue[1]; //Lấy từng phần tử ra từ mảng:
        const day = dateValue[2];
        return moment([year, month - 1, day]).format("DD/MM/YYYY"); // trả về theo định dạng
      }

      console.error("Invalid date format for createAt:", dateValue); // log ra lỗi để debug
      return "15/04/2023"; // nếu ko đc định dạng , thì trả về ngày mặc định
    } catch (error) {
      console.error("Error formatting date:", error); // log ra lỗi
      return "15/04/2023"; // nếu ko đc định dạng , thì trả về ngày mặc định
    }
  };
  // ngày bắt đầu trở thành thành viên
  const getMemberSinceDate = () => {
    console.log("Finding member since date"); // log ra ngày thành viên đã bắt đầu

    // mảng chứa các tên trường ngày
    const dateFields = [
      "createAt",
      "createdAt",
      "registrationDate",
      "registerDate",
      "joinDate",
      "dateCreated",
      "created",
    ];

    //lấy ngày tạo tài khoản từ userObj (được lưu trong localStorage).
    if (userObj) {
      // check userObj  có tồn tại hay ko
      for (const field of dateFields) {
        // lặp qua các trường có trong mảng trường
        if (userObj[field]) {
          // kiểm tra trường đang xét có tồn tại trong object hay ko
          console.log(`Using date from userObj.${field}`); // In ra console thông tin về trường nào đã được dùng để lấy ngày.
          return formatMemberSinceDate(userObj[field]); // Gọi hàm formatMemberSinceDate(...) để định dạng ngày theo ý muốn
        }
      }
    }

    // tìm ngày thành viên từ userData nếu không tìm được từ userObj
    if (userData) {
      // check userData có tồn tại ko
      for (const field of dateFields) {
        // duyệt qua các trường ngày
        if (userData[field]) {
          //Nếu userData có một trong các trường đang duyệt->sử dụng
          console.log(`Using date from userData.${field}`); //In ra console để biết đang sử dụng trường nào từ userData
          //Gọi hàm formatMemberSinceDate(...) để định dạng ngày (ví dụ chuyển từ "2023-04-15T10:00:00Z" thành "15/04/2023").
          return formatMemberSinceDate(userData[field]);
        }
      }

      //kiểm tra và lấy ngày tạo tài khoản
      if (userData.user) {
        // Kiểm tra xem trong userData có thuộc tính user không.
        for (const field of dateFields) {
          // duyệt qua các trường
          if (userData.user[field]) {
            // Kiểm tra xem trong userData.user có tồn tại trường đang duyệt không
            console.log(`Using date from userData.user.${field}`); // In ra thông tin log để lập trình viên biết đang lấy ngày từ đâu
            //Nếu tìm thấy ngày → gọi hàm formatMemberSinceDate() để định dạng lại ngày (ví dụ từ dạng ISO → thành "15/04/2023").
            return formatMemberSinceDate(userData.user[field]);
          }
        }
      }
    }

    //Nếu chúng ta có dữ liệu bảng xếp hạng với ngày tạo
    //Kiểm tra xem đối tượng leaderboardData có tồn tại và có chứa trường creationDate hoặc createDate không
    if (leaderboardData?.creationDate || leaderboardData?.createDate) {
      // Nếu cả hai trường cùng tồn tại, thì lấy creationDate trước
      const date = leaderboardData.creationDate || leaderboardData.createDate;
      // In ra console để thông báo rằng ngày đã được lấy từ dữ liệu leaderboard
      console.log("Using date from leaderboard data");
      //Gọi hàm định dạng ngày formatMemberSinceDate(...), chuyển ngày thành dạng dễ đọc (ví dụ: 15/04/2023).
      return formatMemberSinceDate(date);
    }

    console.log("No date found, using default date"); // ko tìm thấy ngày hợp lệ trong bất kì nguồn nào

    return "15/04/2023"; // trả về ngày mặc định
  };
  //tổng hợp các thống kê chính (summary) của người dùng trong ứng dụng theo dõi việc bỏ thuốc
  const summaryStats = {
    smokeFreeDays: leaderboardData?.consecutiveSmokFreeDays || 0, //Lấy số ngày liên tiếp không hút thuốc từ leaderboardData, nếu undefined mặc định là 0
    achievementPoints: leaderboardData?.totalPoints || 0, //Lấy tổng số điểm thành tựu từ leaderboardData.totalPoints, nếu ko có mặc định là 0
    memberSince: getMemberSinceDate(), //Gọi hàm getMemberSinceDate() mà bạn đã viết ở trên để lấy ngày người dùng trở thành thành viên
    rank: leaderboardData?.rank || "-", //Lấy xếp hạng hiện tại của người dùng trong bảng xếp hạng., nếu undefined thì ko có thông tin
  };

  if (loading && !userData) {
    // nếu loading đang là true và userdata vẫn chưa có-> trả về giao diện loading
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className="profile-container"
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Header Section */}
      <div
        className="cover-photo"
        style={{
          background: "linear-gradient(135deg, #99E3B5 0%, #92B6EF 100%)",
          backgroundSize: "cover",
          borderRadius: "12px 12px 0 0",
          height: "300px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          icon={<SettingOutlined />}
          className="settings-btn"
          onClick={showModal}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Settings
        </Button>

        {/* Google Account Link Button */}
        <Button
          icon={<GoogleOutlined />}
          className="google-link-btn"
          onClick={handleLinkGoogleAccount}
          loading={linkingGoogle}
          style={{
            position: "absolute",
            top: "16px",
            right: "120px",
            backgroundColor: "rgba(234, 67, 53, 0.9)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Link Google
        </Button>
      </div>
      <div
        className="profile-info"
        style={{
          backgroundColor: "white",
          borderRadius: "0 0 12px 12px",
          padding: "0 24px 24px 24px",
          position: "relative",
          marginBottom: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="avatar-wrapper"
          style={{
            position: "absolute",
            top: "-50px",
            left: "24px",
          }}
        >
          <Avatar
            size={100}
            src={user?.avatarUrl}
            icon={!user?.avatarUrl && <CameraOutlined />}
            style={{
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          />
        </div>
        <div
          className="text-content"
          style={{
            paddingTop: "60px",
          }}
        >
          <Title
            level={2}
            className="user-name"
            style={{
              margin: "0 0 8px 0",
              color: "#262626",
              fontSize: "28px",
            }}
          >
            {userData?.name || "User Name"}
            {/*nếu có data hiển thị tên, chưa có mặc định là user name*/}
          </Title>
          <Text
            className="user-description"
            style={{
              color: "#8c8c8c",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            {userData // hiển thị Ngày sinh (nếu có), Giới tính (nếu có), Tuổi (tính từ ngày sinh, nếu có), nhăn cách bằng .
              ? `${userData.birthdate ? `Born on ${userData.birthdate}` : ""} ${
                  userData.gender ? `• ${userData.gender}` : ""
                } ${
                  calculateAge(userData.birthdate)
                    ? `• ${calculateAge(userData.birthdate)}`
                    : ""
                }` // nếu chưa có hiện thị mặc định
              : "On a journey to quit smoking. Every day is a new victory!"}
          </Text>
        </div>
      </div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#e8f5e9",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <HeartOutlined
                style={{
                  fontSize: "32px",
                  color: "#4caf50",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#2e7d32",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {/*số ngày liên tiếp ko hút thuốc*/}
                {summaryStats.smokeFreeDays}
              </Title>
              <Text
                style={{
                  color: "#388e3c",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Days on the streak
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#e3f2fd",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <TrophyOutlined
                style={{
                  fontSize: "32px",
                  color: "#1976d2",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#1565c0",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {summaryStats.achievementPoints}
                {/*tổng số điểm thành tựu*/}
              </Title>
              <Text
                style={{
                  color: "#1976d2",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Total Points
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#fff8e1",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <CalendarOutlined
                style={{
                  fontSize: "32px",
                  color: "#ff8f00",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#ef6c00",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {summaryStats.memberSince}
                {/*ngày người dùng trỏ thành thành viên*/}
              </Title>
              <Text
                style={{
                  color: "#f57c00",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Member Since
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "#fce4ec",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "8px" }}>
              <CrownOutlined
                style={{
                  fontSize: "32px",
                  color: "#c2185b",
                  marginBottom: "8px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: "0",
                  color: "#ad1457",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                #{summaryStats.rank}
                {/*rank của thành viên*/}
              </Title>
              <Text
                style={{
                  color: "#c2185b",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Rank
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
      <Card
        className="info-card"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "none",
        }}
      >
        {!userData && (
          <div
            className="info-content"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "linear-gradient(145deg, #f8f9fa, #e9ecef)",
              borderRadius: "12px",
              margin: "24px",
            }}
          >
            <SettingOutlined
              style={{
                fontSize: "64px",
                color: "#6c757d",
                marginBottom: "24px",
                display: "block",
              }}
            />
            <Title
              level={3}
              style={{
                color: "#495057",
                marginBottom: "16px",
                fontSize: "24px",
              }}
            >
              No Personal Information
            </Title>
            <Text
              style={{
                color: "#6c757d",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "32px",
                display: "block",
                maxWidth: "400px",
                margin: "0 auto 32px auto",
              }}
            >
              You haven't updated your personal information yet. Click the
              button below to add information and complete your profile.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<SettingOutlined />}
              onClick={showModal}
              style={{
                borderRadius: "8px",
                height: "48px",
                paddingLeft: "32px",
                paddingRight: "32px",
                fontSize: "16px",
                fontWeight: "500",
                background: "#16A34A",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Update Information
            </Button>
          </div>
        )}
        {userData && (
          <div className="user-info-display" style={{ padding: "24px" }}>
            <Title
              level={3}
              style={{
                marginBottom: "24px",
                textAlign: "center",
                color: "#1890ff",
                fontSize: "24px",
              }}
            >
              <UserOutlined style={{ marginRight: "8px" }} />
              Personal Information
            </Title>

            {/* Combined Information Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              {/* Personal Details Card */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#495057",
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  📋 Basic Information
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Full Name:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.name || "Not updated"}
                      {/* hiển thị tên , nêú ko có hiện not update*/}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Phone Number:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.phone || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Date of Birth:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.birthdate || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Gender:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.gender || "Not updated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health & Lifestyle Card */}
              <div
                style={{
                  backgroundColor: "#f0f8f0",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #d4edda",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#28a745",
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  🏥 Health & Habits
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Started smoking at age:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.smokingAge || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Years of smoking:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.yearsSmoked || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Occupation:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.occupation || "Not updated"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6c757d", fontWeight: "500" }}>
                      Health status:
                    </span>
                    <span style={{ color: "#212529", fontWeight: "600" }}>
                      {userData.healthStatus || "Not updated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {userData.bio && (
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #ffeaa7",
                  marginBottom: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: "#856404",
                    marginBottom: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  💭 Bio
                </Title>
                <Text
                  style={{
                    color: "#856404",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    fontStyle: "italic",
                  }}
                >
                  "{userData.bio}"
                </Text>
              </div>
            )}
          </div>
        )}
      </Card>
      <Modal
        title="Account Information"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Update Information"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Phone Number *"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please enter your phone number!",
              },
              {
                pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                message: "Please enter a valid Vietnamese phone number!",
              },
            ]}
          >
            <Input
              type="tel"
              placeholder="0123456789 or +84123456789"
              maxLength={15}
            />
          </Form.Item>
          <Form.Item
            label="Full Name *"
            name="name"
            rules={[
              { required: true, message: "Please enter your full name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
              { max: 50, message: "Name must not exceed 50 characters!" },
              {
                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                message: "Name can only contain letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter your full name" maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Date of Birth *"
            name="birthdate"
            rules={[
              { required: true, message: "Please select your date of birth!" },
            ]}
          >
            <DatePicker
              placeholder="Select date of birth"
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                const today = moment().endOf("day");
                const maxAge = moment().subtract(100, "years");
                const minAge = moment().subtract(13, "years");

                return (
                  current &&
                  (current > minAge || // Quá trẻ (dưới 13 tuổi)
                    current < maxAge || // Quá già (trên 100 tuổi)
                    current > today) // Tương lai
                );
              }}
            />
          </Form.Item>
          <Form.Item
            label="Gender *"
            name="gender"
            rules={[{ required: true, message: "Please select your gender!" }]}
          >
            <Select placeholder="Select gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Bio"
            name="bio"
            rules={[
              { max: 500, message: "Bio must not exceed 500 characters!" },
            ]}
          >
            <Input.TextArea
              placeholder="Tell us about your journey to quit smoking..."
              maxLength={500}
              showCount
              rows={4}
            />
          </Form.Item>
          {/* Smoking Age - Simple version without Promise */}
          <Form.Item
            label="Age started smoking"
            name="smokingAge"
            rules={[
              {
                required: true,
                message: "Please enter the age you started smoking!",
              },
              {
                type: "number",
                min: 5,
                max: 80,
                message: "Age must be between 5 and 80!",
                transform: (value) => {
                  return value ? Number(value) : value;
                },
              },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter numbers only!",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter age (e.g., 16)"
              min="5"
              max="80"
            />
          </Form.Item>

          {/* Years of Smoking - Simple version without Promise */}
          <Form.Item
            label="Years of smoking"
            name="yearsSmoked"
            rules={[
              {
                required: true,
                message: "Please enter the number of years you smoked!",
              },
              {
                type: "number",
                min: 0,
                max: 70,
                message: "Years must be between 0 and 70!",
                transform: (value) => {
                  return value ? Number(value) : value;
                },
              },
              {
                pattern: /^[0-9]+$/,
                message: "Please enter numbers only!",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter number of years"
              min="0"
              max="70"
            />
          </Form.Item>
          <Form.Item
            label="Occupation"
            name="occupation"
            rules={[
              {
                max: 100,
                message: "Occupation must not exceed 100 characters!",
              },
            ]}
          >
            <Input placeholder="Enter occupation" maxLength={100} />
          </Form.Item>
          <Form.Item label="Health status" name="healthStatus">
            <Select placeholder="Select health status">
              <Option value="excellent">Excellent</Option>
              <Option value="good">Good</Option>
              <Option value="fair">Fair</Option>
              <Option value="poor">Poor</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* MUI Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
