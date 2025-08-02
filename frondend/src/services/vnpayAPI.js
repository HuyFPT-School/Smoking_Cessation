import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const vnpayAPI = {
  // Tạo link thanh toán VNPay cho Direct Chat
  createPaymentUrl: async (userId, amount = 50000) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vnpay/create-payment`,
        {
          userId: userId,
          amount: amount, // 50,000 VND cho tính năng Direct Chat
          orderInfo: "Thanh toan tinh nang Direct Chat",
          orderType: "DIRECT_CHAT",
          returnUrl: `${window.location.origin}/direct-chat?payment=success`,
          cancelUrl: `${window.location.origin}/direct-chat?payment=cancel`,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating VNPay payment URL:", error);
      throw error;
    }
  },

  // Xử lý callback từ VNPay (simplified version)
  updatePaymentStatus: async (
    vnp_TxnRef,
    vnp_ResponseCode,
    vnp_TransactionNo
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vnpay/update-payment-status`,
        {
          vnp_TxnRef: vnp_TxnRef,
          vnp_ResponseCode: vnp_ResponseCode,
          vnp_TransactionNo: vnp_TransactionNo,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (vnp_TxnRef) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/vnpay/payment-status/${vnp_TxnRef}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  },

  // Kiểm tra user đã trả phí chưa
  checkUserPaymentStatus: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/vnpay/user-payment-status/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking user payment status:", error);
      throw error;
    }
  },

  // Lấy lịch sử thanh toán của user
  getUserPaymentHistory: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/vnpay/payment-history/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw error;
    }
  },
};
