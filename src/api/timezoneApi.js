import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchTimezones = async () => {
  const response = await api.get('/timezone');
  return response.data.data;
};

export const createTimezone = async (timezoneData) => {
  const response = await api.post('/timezone', timezoneData);
  return response.data.data;
};

export const fetchDailySubmissions = async () => {
  const response = await api.get('/timezone/chart');
  return response.data.data;
};
