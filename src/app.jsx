import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AppLayout from "./components/AppLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const Watch = lazy(() => import("./pages/Watch.jsx"));
const Channel = lazy(() => import("./pages/Channel.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const UploadVideo = lazy(() => import("./pages/UploadVideo.jsx"));
const EditVideo = lazy(() => import("./pages/EditVideo.jsx"));
const Tweets = lazy(() => import("./pages/Tweets.jsx"));
const Subscriptions = lazy(() => import("./pages/Subscriptions.jsx"));
const Playlists = lazy(() => import("./pages/Playlists.jsx"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail.jsx"));
const LikedVideos = lazy(() => import("./pages/LikedVideos.jsx"));
const History = lazy(() => import("./pages/History.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const Support = lazy(() => import("./pages/Support.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Healthcheck = lazy(() => import("./pages/Healthcheck.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const VerifyEmail = lazy(() => import("./pages/verifyEmail.jsx"));
const VerifyEmailSent = lazy(() => import("./pages/VerifyEmailSent.jsx"));

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#050508" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <span className="text-xs font-medium text-slate-600 tracking-widest uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
            path="edit/:videoId"
            element={
              <ProtectedRoute>
                <EditVideo />
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
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="verify-email-sent" element={<VerifyEmailSent />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AnimatedRoutes />
    </ErrorBoundary>
  );
}
