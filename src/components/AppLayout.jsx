import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { login, setLoading } from "../store/authSlice";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    // On every page load/refresh, ask the backend if there's an active session.
    // → hits getCurrentUser controller (req.user set by your auth middleware)
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/v2/users/current-user");
        dispatch(login(res.data.data)); // populate Redux with user data
      } catch {
        // No active session — that's fine, just mark loading done
      } finally {
        dispatch(setLoading(false)); // ← unblocks GuestRoute & ProtectedRoute
      }
    };

    checkAuth();
  }, []); // runs once on mount

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
