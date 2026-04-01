import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { login, setLoading } from "../store/authSlice";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AuthLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
        </span>
        <span className="text-xs text-slate-600">Loading…</span>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const dispatch = useDispatch();
  const isLoading = useSelector((s) => s.auth.isLoading);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/v2/users/current-user");
        dispatch(login(res.data.data));
      } catch {
        // no session — fine
      } finally {
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  // Show spinner while checking auth — no blank white flash
  if (isLoading) return <AuthLoader />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
