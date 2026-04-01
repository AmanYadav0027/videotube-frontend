import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function Healthcheck() {
  const [status, setStatus] = useState(null); // "ok" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);

  useEffect(() => {
    document.title = "Healthcheck — MyApp";
  }, []);

  const check = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.get("/api/v2/healthcheck");
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
    { label: "API Server", ok: status === "ok" },
    { label: "Auth Service", ok: status === "ok" },
    { label: "Database", ok: status === "ok" },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Activity size={16} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              System Healthcheck
            </h1>
            <p className="text-xs text-slate-600">Monitor backend API status</p>
          </div>
        </div>

        {/* Status card */}
        <div
          className={`bg-[#0f1117] border rounded-2xl overflow-hidden transition-colors ${
            loading
              ? "border-white/[0.07]"
              : status === "ok"
                ? "border-emerald-500/20"
                : "border-rose-500/20"
          }`}
        >
          <div
            className={`h-px w-full bg-linear-to-r from-transparent to-transparent ${
              status === "ok"
                ? "via-emerald-500/40"
                : status === "error"
                  ? "via-rose-500/40"
                  : "via-indigo-500/20"
            }`}
          />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {loading ? (
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500" />
                  </span>
                ) : status === "ok" ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <XCircle size={20} className="text-rose-400" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      loading
                        ? "text-slate-400"
                        : status === "ok"
                          ? "text-emerald-300"
                          : "text-rose-300"
                    }`}
                  >
                    {loading
                      ? "Checking…"
                      : status === "ok"
                        ? "All systems operational"
                        : "Service disruption"}
                  </p>
                  {checkedAt && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Last checked at {checkedAt}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={check}
                disabled={loading}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-all disabled:opacity-40"
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Individual checks */}
            <div className="space-y-3">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-slate-400">{c.label}</span>
                  {loading ? (
                    <span className="text-xs text-slate-600 animate-pulse">
                      checking…
                    </span>
                  ) : c.ok ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                      Operational
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />{" "}
                      Down
                    </span>
                  )}
                </div>
              ))}
            </div>

            {message && !loading && (
              <p className="mt-4 text-xs text-slate-600 font-mono bg-white/3 border border-white/6 rounded-lg px-3 py-2">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
