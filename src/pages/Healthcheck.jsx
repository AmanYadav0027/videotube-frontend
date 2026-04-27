import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Database,
} from "lucide-react";

const spring = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

export default function Healthcheck() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);

  useEffect(() => {
    document.title = "Healthcheck — VideoTube";
  }, []);

  const check = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.get("/api/v2/healthchecks");
      setStatus("ok");
      setMessage(res.data?.message || "API is healthy");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "API is unreachable");
    } finally {
      setLoading(false);
      setCheckedAt(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    check();
  }, []);

  const checks = [
    { label: "API Server", ok: status === "ok", icon: Server },
    { label: "Auth Service", ok: status === "ok", icon: ShieldCheck },
    { label: "Database", ok: status === "ok", icon: Database },
  ];

  const theme = loading
    ? {
        glow: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        line: "from-indigo-500 via-purple-500 to-indigo-500",
      }
    : status === "ok"
      ? {
          glow: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          line: "from-emerald-400 via-teal-400 to-emerald-400",
        }
      : {
          glow: "bg-rose-500/10",
          border: "border-rose-500/20",
          text: "text-rose-400",
          line: "from-rose-500 via-red-500 to-rose-500",
        };

  return (
    <div className="min-h-full p-4 sm:p-6 relative overflow-hidden bg-[#0a0a0f]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex justify-center items-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className={`w-[600px] h-[600px] rounded-full blur-[130px] transition-colors duration-1000 ${theme.glow}`}
        />
      </div>

      <div className="max-w-xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-600 ease-out">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0f1117] border border-white/10 flex items-center justify-center shadow-2xl shadow-black/50 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Activity
              size={20}
              className="text-slate-300 group-hover:text-indigo-400 transition-colors relative z-10"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              System Healthcheck
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Real-time infrastructure monitoring
            </p>
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...spring, delay: 0.1 }}
          className={`bg-[#0f1117]/90 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 relative ${theme.border}`}
        >
          {/* Animated top line */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r opacity-80 transition-all duration-700 ${theme.line} ${loading ? "animate-pulse" : ""}`}
          />

          <div className="p-8">
            {/* Status header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <span className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <span className="absolute inset-2 rounded-full bg-indigo-500/15 animate-pulse" />
                      </motion.div>
                    ) : status === "ok" ? (
                      <motion.div
                        key="ok"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={spring}
                      >
                        <span className="absolute inset-0 rounded-full bg-emerald-500/15 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="relative bg-emerald-500/10 p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <CheckCircle2
                            size={28}
                            className="text-emerald-400"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={spring}
                      >
                        <span className="absolute inset-0 rounded-full bg-rose-500/15 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        <div className="relative bg-rose-500/10 p-2 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                          <XCircle size={28} className="text-rose-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <motion.h2
                    key={status ?? "loading"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className={`text-lg font-bold tracking-tight transition-colors duration-500 ${
                      loading
                        ? "text-slate-300"
                        : status === "ok"
                          ? "text-emerald-400"
                          : "text-rose-400"
                    }`}
                  >
                    {loading
                      ? "Running diagnostics…"
                      : status === "ok"
                        ? "All systems operational"
                        : "Service disruption detected"}
                  </motion.h2>
                  {checkedAt && (
                    <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      Last updated at {checkedAt}
                    </p>
                  )}
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={check}
                disabled={loading}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 active:scale-90 disabled:opacity-40 group"
                title="Refresh Status"
              >
                <RefreshCw
                  size={18}
                  strokeWidth={2.5}
                  className={`transition-transform duration-700 ${
                    loading ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                />
              </button>
            </div>

            {/* Service checks */}
            <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="space-y-2">
                {checks.map((c, idx) => {
                  const Icon = c.icon;
                  return (
                    <motion.div
                      key={c.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: idx * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-slate-300 group-hover:scale-110 transition-all duration-300">
                          <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                          {c.label}
                        </span>
                      </div>

                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span
                            key="checking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
                          >
                            <span className="flex gap-0.5">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"
                                  style={{ animationDelay: `${i * 75}ms` }}
                                />
                              ))}
                            </span>
                            Checking
                          </motion.span>
                        ) : c.ok ? (
                          <motion.span
                            key="online"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={spring}
                            className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                            Online
                          </motion.span>
                        ) : (
                          <motion.span
                            key="offline"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={spring}
                            className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Offline
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Terminal message */}
            <AnimatePresence>
              {message && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="flex items-start gap-3 relative z-10">
                      <span className={`text-lg font-mono ${theme.text}`}>
                        &gt;
                      </span>
                      <p className="text-sm text-slate-400 font-mono leading-relaxed tracking-wide flex-1 pt-0.5">
                        {message}
                        <span className="inline-block w-2 h-4 ml-1 bg-slate-500 animate-pulse align-middle" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
