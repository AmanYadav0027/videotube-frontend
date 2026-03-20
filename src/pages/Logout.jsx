import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logout as authLogout } from "../store/authSlice";
import { LogOut, ChevronRight, AlertTriangle } from "lucide-react";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/v2/users/logout");
      dispatch(authLogout());
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ── background aurora ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size[48px_48px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* ── card ── */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* top accent line — rose tint to signal a destructive action */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-rose-500/40 to-transparent" />

          <div className="px-8 pt-8 pb-10">
            {/* ── header ── */}
            <div className="flex flex-col items-center mb-7">
              {/* icon badge */}
              <span className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                <LogOut
                  size={20}
                  strokeWidth={1.75}
                  className="text-rose-400"
                />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Sign out?
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 text-center leading-relaxed">
                You'll need to sign in again to access your workspace.
              </p>
            </div>

            {/* ── error banner ── */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── actions ── */}
            <div className="flex flex-col gap-3 mt-2">
              {/* Confirm logout — destructive */}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="
                  relative w-full py-2.5 px-4 rounded-xl text-sm font-semibold
                  text-white bg-rose-600 hover:bg-rose-500
                  shadow-lg shadow-rose-500/20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 active:scale-[0.99]
                  overflow-hidden group
                "
              >
                {/* shimmer */}
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white/70"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Signing out…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogOut size={15} strokeWidth={2} />
                    Yes, sign me out
                  </span>
                )}
              </button>

              {/* Cancel — ghost */}
              <button
                onClick={handleCancel}
                disabled={loading}
                className="
                  w-full py-2.5 px-4 rounded-xl text-sm font-medium
                  text-slate-400 hover:text-slate-100
                  bg-white/3 hover:bg-white/[0.07]
                  border border-white/[0.07] hover:border-white/12
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 active:scale-[0.99]
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* system status strip — matches sidebar footer */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-600">System Online</span>
          <span className="text-[11px] text-slate-700 font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
