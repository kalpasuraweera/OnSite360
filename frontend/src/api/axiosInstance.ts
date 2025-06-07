import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const instance = axios.create({
  baseURL: "localhost:3000", // Adjust the base URL as needed
  timeout: 10000, // Set a timeout for requests
});

instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
