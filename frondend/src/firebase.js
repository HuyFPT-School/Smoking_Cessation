// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAy9stgzs8tYUgOAAcMBawghqMubFQa_-g",
  authDomain: "my-project-caaa7.firebaseapp.com",
  projectId: "my-project-caaa7",
  storageBucket: "my-project-caaa7.appspot.com", // ❗ Sửa lại chỗ này: ".app" -> ".app**spot.com**"
  messagingSenderId: "632818763031",
  appId: "1:632818763031:web:a6965a4160ef305e09e352",
  measurementId: "G-NRZC1HWCJ3",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// 👇 Dùng cho đăng nhập Google
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
