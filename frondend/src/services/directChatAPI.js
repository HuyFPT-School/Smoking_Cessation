import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const directChatAPI = {
  // Send message via REST API
  sendMessage: async (message) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/direct-chat/messages/send`,
      message
    );
    return response.data;
  },

  // Get user's chat rooms
  getUserChatRooms: async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/direct-chat/rooms/${userId}`
    );
    return response.data;
  },

  // Create or get chat room between member and coach
  createOrGetChatRoom: async (memberId, coachId) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/direct-chat/rooms/create`,
      null,
      {
        params: { memberId, coachId },
      }
    );
    return response.data;
  },

  // Get messages for a specific room
  getRoomMessages: async (roomId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/direct-chat/messages/${roomId}`
    );
    return response.data;
  },

  // Get available coaches
  getAvailableCoaches: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/direct-chat/coaches`);
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (roomId, userId) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/direct-chat/messages/mark-read`,
      null,
      {
        params: { roomId, userId },
      }
    );
    return response.data;
  },
};
