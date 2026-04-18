import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import { store } from "./store/store.js";
import "./index.css";
import App from "./App.jsx";
import toast, { Toaster } from "react-hot-toast";

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];

      let message = "Too many requests. Please try again later.";

      if (retryAfter) {
        const seconds = parseInt(retryAfter);
        if (seconds >= 3600) {
          const hours = Math.ceil(seconds / 3600);
          message = `Too many requests. Please try again in ${hours} hour${hours > 1 ? "s" : ""}.`;
        } else if (seconds >= 60) {
          const minutes = Math.ceil(seconds / 60);
          message = `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
        } else {
          message = `Too many requests. Please try again in ${seconds} second${seconds > 1 ? "s" : ""}.`;
        }
      }

      toast.error(message, { duration: 5000 });
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
