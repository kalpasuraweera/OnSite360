import axios, { AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Set a timeout for requests
});

// Flag to track if a token refresh is in progress
let isRefreshing = false;
// Store for queued requests that should be retried after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: unknown;
}> = [];

// Process the queue of failed requests
const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    // Skip adding Authorization header for /auth routes
    if (
      config.url &&
      /^\/?auth(\/|$)/.test(
        config.url.startsWith(BASE_URL)
          ? config.url.replace(BASE_URL, "")
          : config.url
      )
    ) {
      return config;
    }
    const accessToken = useAuthStore.getState().accessToken; // Get the access token from the auth store
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If the error is not 401 or the original request doesn't exist, reject immediately
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Skip token refresh logic for /auth routes
    if (
      originalRequest.url &&
      /^\/?auth(\/|$)/.test(
        originalRequest.url.startsWith(BASE_URL)
          ? originalRequest.url.replace(BASE_URL, "")
          : originalRequest.url
      )
    ) {
      return Promise.reject(error);
    }

    // Prevent duplicate refresh requests
    if (isRefreshing) {
      // Queue this request to be retried after token refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      })
        .then(() => {
          return instance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    try {
      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      if (!refreshToken) {
        // No refresh token available, reject and logout
        authStore.logout();
        throw new Error("No refresh token available");
      }

      // Call your refresh token endpoint
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      // Update tokens in store
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      authStore.setTokens(accessToken, newRefreshToken);

      // Update Authorization header for the original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Process the queue and reset the refreshing flag
      processQueue();
      isRefreshing = false;

      // Retry the original request with the new token
      return instance(originalRequest);
    } catch (refreshError) {
      // Token refresh failed, process queue with error and reset flag
      processQueue(
        refreshError instanceof Error
          ? refreshError
          : new Error("Token refresh failed")
      );
      isRefreshing = false;

      // Logout user since refresh token is invalid
      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    }
  }
);

export default instance;
