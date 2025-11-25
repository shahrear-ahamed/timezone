import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/app-data',
});

export const fetchTimezones = async () => {
  const response = await api.get('/timezone');
  return response.data.data;
};

export const createTimezone = async (timezoneData) => {
  const response = await api.post('/timezone', timezoneData);
  return response.data.data;
};
