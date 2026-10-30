import axios from 'axios';
import Constants from 'expo-constants';

// Finds the backend address.
// 1. If EXPO_PUBLIC_API_URL is set in .env, use that.
// 2. Otherwise use the same computer that Expo is running on (works even when your Wi-Fi IP changes).
function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // hostUri looks like "10.54.235.6:8081" -> we keep only the IP
  const hostUri = Constants.expoConfig?.hostUri;
  const computerIp = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  return `http://${computerIp}:8000/api`;
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
});

// Saves the login token so every request sends it
export function setToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Turns an axios error into a message we can show the user
export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
  if (error?.message === 'Network Error') return 'Cannot reach the server. Is the backend running?';
  return 'Something went wrong';
}

export default api;
