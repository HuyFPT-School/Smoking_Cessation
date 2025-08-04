// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    user: {
      me: "/api/user/me",
      login: "/api/auth/login",
      register: "/api/auth/register",
    },
    admin: {
      dashboard: "/api/admin/dashboard",
      users: "/api/admin/users",
      deleteUser: "/api/admin/delete-user",
    },
    tracking: "/api/tracking",
    community: "/api/community",
    leaderboard: "/api/leaderboard",
    aiCoach: "/api/ai-coach",
    websocket: "/ws",
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = () => {
  return `${API_BASE_URL}/ws`;
};

export default apiConfig;
