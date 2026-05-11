import axios from "axios";

const api = axios.create({
  baseURL: "https://marketplace-production-44e3.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("agro_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;