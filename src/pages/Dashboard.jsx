import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";
import {
  Users,
  Eye,
  ThumbsUp,
  Video,
  Upload,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Play,
  Loader2,
  ShieldAlert,
  RotateCcw,
  MessageSquare,
  FileText,
  CheckCircle,
} from "lucide-react";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
  const accents = {
    indigo: {
      glow: "rgba(99,102,241,0.18)",
      icon: "text-indigo-400",
      line: "rgba(99,102,241,0.6)",
      border: "rgba(99,102,241,0.15)",
    },
    violet: {
      glow: "rgba(139,92,246,0.18)",
      icon: "text-violet-400",
      line: "rgba(139,92,246,0.6)",
      border: "rgba(139,92,246,0.15)",
    },
    emerald: {
      glow: "rgba(16,185,129,0.18)",
      icon: "text-emerald-400",
      line: "rgba(16,185,129,0.6)",
      border: "rgba(16,185,129,0.15)",
    },
    amber: {
      glow: "rgba(245,158,11,0.18)",
      icon: "text-amber-400",
      line: "rgba(245,158,11,0.6)",
      border: "rgba(245,158,11,0.15)",
    },
  };
  const a = accents[accent] ?? accents.indigo;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={spring}
      className="group relative rounded-[1.75rem] p-5 overflow-hidden cursor-default"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${a.line}, transparent)`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-2">
            {label}
          </p>
          <p className="text-3xl font-black text-white tabular-nums tracking-tight">
            {value?.toLocaleString() ?? "—"}
          </p>
        </div>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={spring}
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: a.border,
            boxShadow: `0 0 20px ${a.glow}`,
          }}
        >
          <Icon size={20} className={a.icon} strokeWidth={2} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1.75rem] p-5 h-28"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </div>
      <div
        className="rounded-[2rem] overflow-hidden"
        style={{
          background: "rgba(10,10,15,0.85)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-5 border-b border-white/[0.04]"
          >
            <div
              className="w-32 h-20 rounded-2xl shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
            <div className="flex-1 space-y-3">
              <div
                className="h-3.5 rounded-lg w-3/4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
              <div
                className="h-3 rounded-lg w-1/3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flagged Content Tab ───────────────────────────────────────────────────────
// FIX: accepts setHasFlagged so parent Dashboard knows whether to show red dot
function FlaggedContent({ setHasFlagged }) {
  const [flagged, setFlagged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [restored, setRestored] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/v2/dashboards/flagged");
        const data = res.data?.data ?? { comments: [], tweets: [] };
        setFlagged(data);
        // FIX: compute total inside load() where data is available, then lift up
        const total = (data.comments?.length ?? 0) + (data.tweets?.length ?? 0);
        setHasFlagged(total > 0);
      } catch {
        setFlagged({ comments: [], tweets: [] });
        setHasFlagged(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setHasFlagged]);

  const handleRestore = async (type, id) => {
    if (restoringId) return;
    setRestoringId(id);
    try {
      await axios.post(`/api/v2/dashboards/flagged/restore/${type}/${id}`);
      setRestored((prev) => new Set([...prev, id]));
    } catch {
      // silent
    } finally {
      setRestoringId(null);
    }
  };

  if (loading)
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </div>
    );

  const comments = flagged?.comments ?? [];
  const tweets = flagged?.tweets ?? [];
  const total = comments.length + tweets.length;

  if (total === 0)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[30vh]"
      >
        <div
          className="text-center space-y-4 p-10 rounded-[2rem] max-w-sm w-full"
          style={{
            background: "rgba(10,10,15,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20"
            style={{
              background: "rgba(16,185,129,0.08)",
              boxShadow: "0 0 30px rgba(16,185,129,0.1)",
            }}
          >
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-bold text-white">All clear!</p>
            <p className="text-sm text-slate-500 mt-1">
              No flagged content right now.
            </p>
          </div>
        </div>
      </motion.div>
    );

  const FlaggedItem = ({ item, type }) => {
    const isRestored = restored.has(item._id);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300"
        style={{
          background: isRestored
            ? "rgba(16,185,129,0.05)"
            : "rgba(255,255,255,0.02)",
          borderColor: isRestored
            ? "rgba(16,185,129,0.2)"
            : "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            background:
              type === "comment"
                ? "rgba(245,158,11,0.1)"
                : "rgba(139,92,246,0.1)",
            borderColor:
              type === "comment"
                ? "rgba(245,158,11,0.2)"
                : "rgba(139,92,246,0.2)",
          }}
        >
          {type === "comment" ? (
            <MessageSquare size={15} className="text-amber-400" />
          ) : (
            <FileText size={15} className="text-violet-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${type === "comment" ? "text-amber-400 border-amber-500/20 bg-amber-500/10" : "text-violet-400 border-violet-500/20 bg-violet-500/10"}`}
            >
              {type}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              by{" "}
              <span className="text-slate-400">
                {item.owner?.username ?? "Unknown"}
              </span>{" "}
              · {timeAgo(item.createdAt)}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 font-medium">
            {item.content}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleRestore(type, item._id)}
          disabled={restoringId === item._id || isRestored}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50"
          style={{
            background: isRestored
              ? "rgba(16,185,129,0.1)"
              : "rgba(255,255,255,0.03)",
            borderColor: isRestored
              ? "rgba(16,185,129,0.2)"
              : "rgba(255,255,255,0.1)",
            color: isRestored ? "#34d399" : "#94a3b8",
          }}
        >
          {restoringId === item._id ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isRestored ? (
            <>
              <CheckCircle size={13} /> Restored
            </>
          ) : (
            <>
              <RotateCcw size={13} /> Restore
            </>
          )}
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-rose-400" />
        <span className="text-sm font-bold text-slate-300">
          {total} flagged item{total !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-slate-600">
          — review and restore if incorrectly flagged
        </span>
      </div>
      {comments.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-1">
            Comments ({comments.length})
          </p>
          <AnimatePresence>
            {comments.map((c) => (
              <FlaggedItem key={c._id} item={c} type="comment" />
            ))}
          </AnimatePresence>
        </div>
      )}
      {tweets.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-1">
            Tweets ({tweets.length})
          </p>
          <AnimatePresence>
            {tweets.map((t) => (
              <FlaggedItem key={t._id} item={t} type="tweet" />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "flagged"
  // FIX: hasFlagged lives here so it controls the tab dot correctly
  const [hasFlagged, setHasFlagged] = useState(false);

  useEffect(() => {
    document.title = "Dashboard — VideoTube";
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, videosRes] = await Promise.all([
          axios.get("/api/v2/dashboards/stats"),
          axios.get("/api/v2/dashboards/videos"),
        ]);
        setStats(statsRes.data?.data ?? {});
        const data = videosRes.data?.data;
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleTogglePublish = async (videoId, current) => {
    if (togglingId) return;
    setTogglingId(videoId);
    try {
      await axios.patch(`/api/v2/videos/toggle/publish/${videoId}`);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: !current } : v,
        ),
      );
    } catch {
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (videoId) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v2/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setDeleteId(null);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: "videos", label: "Your Videos", icon: Video },
    { id: "flagged", label: "Flagged Content", icon: ShieldAlert },
  ];

  return (
    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden"
      style={{ background: "#050508" }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-20 w-[500px] h-[500px] opacity-[0.06] "
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] opacity-[0.05] "
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-indigo-500/20"
              style={{
                background: "rgba(99,102,241,0.1)",
                boxShadow: "0 0 24px rgba(99,102,241,0.2)",
              }}
            >
              <TrendingUp size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Creator Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Your channel at a glance
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
          >
            <Link
              to="/upload"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              }}
            >
              <Upload size={16} /> Upload Video
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[30vh]"
          >
            <div
              className="text-center space-y-3 p-8 rounded-[2rem] border border-rose-500/10"
              style={{ background: "rgba(244,63,94,0.04)" }}
            >
              <AlertTriangle size={32} className="text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-slate-300">{error}</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats bento grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                label="Subscribers"
                value={stats?.totalSubscribers}
                icon={Users}
                accent="indigo"
              />
              <StatCard
                label="Total Views"
                value={stats?.totalViews}
                icon={Eye}
                accent="violet"
              />
              <StatCard
                label="Total Likes"
                value={stats?.totalLikes}
                icon={ThumbsUp}
                accent="emerald"
              />
              <StatCard
                label="Videos"
                value={stats?.totalVideos}
                icon={Video}
                accent="amber"
              />
            </motion.div>

            {/* Tab panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.18 }}
              className="rounded-[2rem] overflow-hidden"
              style={{
                background: "rgba(10,10,15,0.9)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
                }}
              />

              {/* Tab bar */}
              <div
                className="flex border-b border-white/[0.05] relative"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors duration-200 ${activeTab === tab.id ? "text-indigo-300" : "text-slate-600 hover:text-slate-400"}`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="dash-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-px"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(99,102,241,0.9), transparent)",
                        }}
                        transition={spring}
                      />
                    )}
                    <tab.icon size={15} />
                    {tab.label}
                    {/* FIX: only show red dot when there is actually flagged content */}
                    {tab.id === "flagged" && hasFlagged && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        style={{ boxShadow: "0 0 8px rgba(244,63,94,0.9)" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "videos" ? (
                    <motion.div
                      key="videos"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {videos.length === 0 ? (
                        <div className="py-16 text-center space-y-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-white/[0.07]"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                          >
                            <Video
                              size={28}
                              className="text-slate-600"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-300">
                              No videos uploaded yet.
                            </p>
                            <p className="text-xs text-slate-600 mt-1 mb-4">
                              Your next masterpiece is waiting.
                            </p>
                            <Link
                              to="/upload"
                              className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-xl text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-all"
                              style={{ background: "rgba(99,102,241,0.06)" }}
                            >
                              Upload your first video →
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.03] -m-5 sm:-m-6">
                          <AnimatePresence mode="popLayout">
                            {videos.map((video, idx) => (
                              <motion.div
                                key={video._id}
                                layout
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{
                                  opacity: 0,
                                  x: 12,
                                  transition: { duration: 0.2 },
                                }}
                                transition={{ ...spring, delay: idx * 0.04 }}
                                className="group flex items-start gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.02] transition-all duration-300 border-l-2 border-transparent hover:border-indigo-500/50 relative"
                              >
                                <Link
                                  to={`/watch/${video._id}`}
                                  className="shrink-0 relative w-36 rounded-xl overflow-hidden bg-[#141416] shadow-md border border-white/[0.04] group-hover:border-white/10 group-hover:-translate-y-0.5 transition-all duration-300"
                                  style={{ aspectRatio: "16/9" }}
                                >
                                  {video.thumbnail ? (
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Play
                                        size={18}
                                        className="text-slate-700"
                                      />
                                    </div>
                                  )}
                                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-black/80 tabular-nums border border-white/10">
                                    {formatDuration(video.duration)}
                                  </span>
                                </Link>
                                <div className="flex-1 min-w-0 space-y-1.5 py-1">
                                  <Link to={`/watch/${video._id}`}>
                                    <h3 className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-indigo-300 transition-colors leading-snug pr-28">
                                      {video.title}
                                    </h3>
                                  </Link>
                                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Eye size={12} />
                                      {formatViews(video.views)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span>{timeAgo(video.createdAt)}</span>
                                  </div>
                                  <div className="pt-1">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border uppercase ${video.isPublished ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-white/[0.07] text-slate-500"}`}
                                      style={
                                        !video.isPublished
                                          ? {
                                              background:
                                                "rgba(255,255,255,0.03)",
                                            }
                                          : {}
                                      }
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-emerald-400" : "bg-slate-600"}`}
                                        style={
                                          video.isPublished
                                            ? {
                                                boxShadow:
                                                  "0 0 6px rgba(52,211,153,0.9)",
                                              }
                                            : {}
                                        }
                                      />
                                      {video.isPublished
                                        ? "Published"
                                        : "Private"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 absolute right-5 sm:right-6 top-1/2 -translate-y-1/2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleTogglePublish(
                                        video._id,
                                        video.isPublished,
                                      )
                                    }
                                    disabled={togglingId === video._id}
                                    className={`p-2.5 rounded-xl transition-all disabled:opacity-40 border border-white/[0.06] shadow-lg ${video.isPublished ? "text-emerald-400 hover:text-amber-400 hover:border-amber-500/30" : "text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30"}`}
                                    style={{ background: "rgba(10,10,15,0.9)" }}
                                  >
                                    {togglingId === video._id ? (
                                      <Loader2
                                        size={18}
                                        className="animate-spin"
                                      />
                                    ) : video.isPublished ? (
                                      <ToggleRight size={18} />
                                    ) : (
                                      <ToggleLeft size={18} />
                                    )}
                                  </motion.button>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Link
                                      to={`/edit/${video._id}`}
                                      className="p-2.5 rounded-xl border border-white/[0.06] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-lg block"
                                      style={{
                                        background: "rgba(10,10,15,0.9)",
                                      }}
                                    >
                                      <Pencil size={16} />
                                    </Link>
                                  </motion.div>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setDeleteId(video._id)}
                                    className="p-2.5 rounded-xl border border-white/[0.06] text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-lg"
                                    style={{ background: "rgba(10,10,15,0.9)" }}
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flagged"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* FIX: pass setHasFlagged so FlaggedContent can update parent state */}
                      <FlaggedContent setHasFlagged={setHasFlagged} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              onClick={() => !deleting && setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={spring}
              className="relative w-full max-w-sm rounded-[2rem] overflow-hidden"
              style={{
                background: "rgba(8,8,12,0.97)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,63,94,0.7), transparent)",
                }}
              />
              <div className="p-8 space-y-5 relative z-10">
                <div className="flex flex-col items-center text-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-rose-500/20"
                    style={{
                      background: "rgba(244,63,94,0.08)",
                      boxShadow: "0 0 30px rgba(244,63,94,0.15)",
                    }}
                  >
                    <Trash2
                      size={24}
                      className="text-rose-400"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Delete this video?
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      This action cannot be undone. The video and all its data
                      will be permanently removed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeleteId(null)}
                    disabled={deleting}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white border border-white/[0.08] transition-all disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDelete(deleteId)}
                    disabled={deleting}
                    className="flex-1 py-3.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #e11d48, #be123c)",
                      boxShadow: "0 8px 20px rgba(244,63,94,0.25)",
                    }}
                  >
                    {deleting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      "Yes, delete"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
