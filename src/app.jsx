import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Watch from "./pages/Watch";
import Tweets from "./pages/Tweets";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo";
import Dashboard from "./pages/Dashboard";
import LikedVideos from "./pages/LikedVideos";
import History from "./pages/History";
import Healthcheck from "./pages/Healthcheck";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Subscriptions from "./pages/Subscriptions";
import Playlists from "./pages/Playlists.jsx";

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const isLoading = useSelector((s) => s.auth.isLoading);
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const isLoading = useSelector((s) => s.auth.isLoading);
  if (isLoading) return null;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Public */}
          <Route index element={<Home />} />
          <Route path="watch/:videoId" element={<Watch />} />
          <Route path="channel/:username" element={<Channel />} />
          <Route path="about" element={<About />} />

          {/* Guest only */}
          <Route
            path="login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Protected */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="tweets"
            element={
              <ProtectedRoute>
                <Tweets />
              </ProtectedRoute>
            }
          />
          <Route
            path="upload"
            element={
              <ProtectedRoute>
                <UploadVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="liked"
            element={
              <ProtectedRoute>
                <LikedVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="playlists"
            element={
              <ProtectedRoute>
                <Playlists />
              </ProtectedRoute>
            }
          />

          {/* Public system */}
          <Route path="healthcheck" element={<Healthcheck />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
