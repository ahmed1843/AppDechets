import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// ✅ Une seule IP à changer ici
export const API_URL = Platform.OS === 'web'
  ? "http://127.0.0.1:8000/api"
  : "http://192.168.1.179:8000/api";

// Instance axios avec configuration optimisée
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 🔥 Évite que l'app mobile freeze indéfiniment si le serveur Laravel est injoignable
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Intercepteur — injecte le token Sanctum automatiquement
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // 🛡️ Sécurité : Si AsyncStorage échoue, la requête part quand même sans crash de l'app
      console.error("Erreur lors de la récupération du token :", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;