
import axios from "axios";
import { getToken, logout } from "../utils/auth";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Automatically attach the token to API requests
API.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios/browser set the correct Content-Type.
    // FormData needs multipart/form-data with a boundary.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data != null) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Do not redirect when login or another auth request fails
    const isAuthRequest = requestUrl.includes("/auth/");

    if (status === 401 && !isAuthRequest) {
      logout();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
