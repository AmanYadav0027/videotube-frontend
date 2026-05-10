import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import { store } from "./store/store.js";
import { logout } from "./store/authSlice.js";
import "./index.css";
import App from "./app.jsx";
import toast, { Toaster } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";
axios.defaults.withCredentials = true;

// ── Token refresh state ───────────────────────────────────────────────────────
// isRefreshing prevents multiple concurrent 401s from each firing their own
// refresh request. All requests that fail while a refresh is in flight are
// queued and resolved/rejected together once the refresh settles.
let isRefreshing = false;
let failedQueue = [];
let is429ToastShowing = false;

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// ── Response interceptor ──────────────────────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 429 handler ───────────────────────────────────────────────────────────
    // ── 429 handler ───────────────────────────────────────────────────────────
    if (error.response?.status === 429) {
      if (!is429ToastShowing) {
        is429ToastShowing = true;
        const retryAfter = error.response.headers["retry-after"];
        let message = "Too many requests. Please try again later.";
        if (retryAfter) {
          const seconds = parseInt(retryAfter);
          if (seconds >= 3600) {
            const hours = Math.ceil(seconds / 3600);
            message = `Too many requests. Try again in ${hours} hour${hours > 1 ? "s" : ""}.`;
          } else if (seconds >= 60) {
            const minutes = Math.ceil(seconds / 60);
            message = `Too many requests. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
          } else {
            message = `Too many requests. Try again in ${seconds} second${seconds > 1 ? "s" : ""}.`;
          }
        }
        toast.error(message, { duration: 5000 });
        setTimeout(() => {
          is429ToastShowing = false;
        }, 6000);
      }
      return Promise.reject(error);
    }

    // ── 401 handler — attempt silent token refresh then retry ─────────────────
    // _retry flag prevents infinite loops if the refresh endpoint itself 401s.
    // Skip refresh for the refresh endpoint itself to avoid infinite recursion.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/refresh-token")
    ) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axios(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token lives in an httpOnly cookie — no body needed.
        await axios.post("/api/v2/users/refresh-token");
        // New access token cookie is now set by the server.
        processQueue(null);
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired/revoked) — log the user out cleanly.
        processQueue(refreshError);
        store.dispatch(logout());
        toast.error("Session expired. Please sign in again.", {
          duration: 4000,
        });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0f1117",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "13px",
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#0f1117",
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
