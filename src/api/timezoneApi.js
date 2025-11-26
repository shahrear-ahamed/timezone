import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Get user's browser timezone preference
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn("Unable to detect timezone, using default:", error);
    return "UTC"; // Fallback to UTC if detection fails
  }
};

// Add request interceptor to include viewer-timezone header
api.interceptors.request.use(
  (config) => {
    config.headers["viewer-timezone"] = getUserTimezone();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchTimezones = async () => {
  const response = await api.get("/timezone");
  return response.data.data;
};

export const createTimezone = async (timezoneData) => {
  const response = await api.post("/timezone", timezoneData);
  return response.data.data;
};

export const fetchDailySubmissions = async () => {
  const response = await api.get("/timezone/chart");
  return response.data.data;
};
