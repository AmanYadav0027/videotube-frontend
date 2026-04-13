import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Watch from "./pages/Watch.jsx";
import Tweets from "./pages/Tweets.jsx";
import Channel from "./pages/Channel.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import History from "./pages/History.jsx";
import Healthcheck from "./pages/Healthcheck.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Playlists from "./pages/Playlists.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import PageTransition from "./components/PageTransition.jsx";
import Notifications from "./pages/Notifications.jsx";
import Support from "./pages/Support.jsx";

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
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
          <Route
            path="playlist/:playlistId"
            element={
              <ProtectedRoute>
                <PlaylistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Public system */}
          <Route path="healthcheck" element={<Healthcheck />} />
          <Route path="support" element={<Support />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AnimatedRoutes />
    </ErrorBoundary>
  );
}
