import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Une seule IP à changer ici
export const API_URL = "http://192.168.1.17:8000/api";

// Instance axios avec token auto-injecté
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Intercepteur — injecte le token Sanctum automatiquement
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token'); // ✅ clé unifiée
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;