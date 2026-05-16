// services/api.ts

// 1. On récupère l'URL du .env
// 2. On met une adresse complète par défaut au cas où (localhost)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:8000/api";

export default API_URL;
