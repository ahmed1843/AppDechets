// services/api.ts

// 1. On met JUSTE l'adresse IP ici
const IP_ADDRESS = "192.168.1.11"; 
const PORT = "8000";

// 2. On construit l'URL proprement
export const API_URL = `http://${IP_ADDRESS}:${PORT}/api`;

export default API_URL;
