import axios from 'axios';

// REMPLACE par l'adresse IP du PC qui fait tourner Laravel
// Garde bien le :8000/api à la fin
const API_URL = "http://192.168.1.10:8000/api/"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;
