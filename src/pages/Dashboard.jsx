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

const spring = { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
  const accents = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/15 group-hover:border-indigo-500/30",
      text: "text-indigo-400",
      shadow: "group-hover:shadow-indigo-500/20",
      line: "from-indigo-500/0 via-indigo-500/40 to-indigo-500/0",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/15 group-hover:border-violet-500/30",
      text: "text-violet-400",
      shadow: "group-hover:shadow-violet-500/20",
      line: "from-violet-500/0 via-violet-500/40 to-violet-500/0",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/15 group-hover:border-emerald-500/30",
      text: "text-emerald-400",
      shadow: "group-hover:shadow-emerald-500/20",
      line: "from-emerald-500/0 via-emerald-500/40 to-emerald-500/0",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/15 group-hover:border-amber-500/30",
      text: "text-amber-400",
      shadow: "group-hover:shadow-amber-500/20",
      line: "from-amber-500/0 via-amber-500/40 to-amber-500/0",
    },
  };
  const a = accents[accent] ?? accents.indigo;

  return (
    <motion.div
      variants={itemVariants}
      className={`group bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden hover:-translate-y-1 hover:shadow-xl cursor-default transition-all duration-300 ${a.shadow}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${a.line} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase group-hover:text-slate-400 transition-colors">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-100 mt-1.5 tabular-nums tracking-tight">
            {value?.toLocaleString() ?? "—"}
          </p>
        </div>
        <span
          className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${a.bg} ${a.border}`}
        >
          <Icon size={22} className={a.text} strokeWidth={1.75} />
        </span>
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
            className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 h-28 shadow-inner"
          />
        ))}
      </div>
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-white/5"
          >
            <div className="w-32 h-20 rounded-xl bg-slate-800/50 shrink-0 border border-white/5" />
            <div className="flex-1 space-y-3">
              <div className="h-3.5 bg-slate-800/50 rounded-md w-3/4" />
              <div className="h-3 bg-slate-800/40 rounded-md w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flagged Content Tab ───────────────────────────────────────────────────────
function FlaggedContent() {
  const [flagged, setFlagged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [restored, setRestored] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/v2/dashboards/flagged");
        setFlagged(res.data?.data ?? { comments: [], tweets: [] });
      } catch {
        setFlagged({ comments: [], tweets: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
            className="h-20 rounded-2xl bg-slate-800/40 border border-white/5"
          />
        ))}
      </div>
    );

  const comments = flagged?.comments ?? [];
  const tweets = flagged?.tweets ?? [];
  const total = comments.length + tweets.length;

  if (total === 0)
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-center space-y-4 p-10 rounded-2xl bg-[#0f1117] border border-white/[0.07] max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-200">All clear!</p>
            <p className="text-sm text-slate-500 mt-1">
              No flagged content right now.
            </p>
          </div>
        </div>
      </div>
    );

  const FlaggedItem = ({ item, type }) => {
    const isRestored = restored.has(item._id);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
          isRestored
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-[#0f1117] border-white/[0.07]"
        }`}
      >
        <div
          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
            type === "comment"
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-violet-500/10 border-violet-500/20"
          }`}
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
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                type === "comment"
                  ? "bg-amber-500/10 border-amber-500/15 text-amber-400"
                  : "bg-violet-500/10 border-violet-500/15 text-violet-400"
              }`}
            >
              {type}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              by{" "}
              <span className="text-slate-400">
                {item.owner?.username ?? "Unknown"}
              </span>
              {" · "}
              {timeAgo(item.createdAt)}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 font-medium">
            {item.content}
          </p>
        </div>

        <button
          onClick={() => handleRestore(type, item._id)}
          disabled={restoringId === item._id || isRestored}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 ${
            isRestored
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
          }`}
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
        </button>
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
        <span className="text-xs text-slate-500">
          — review and restore if incorrectly flagged
        </span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
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
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-indigo-500/10">
              <TrendingUp size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Creator Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Your channel at a glance
              </p>
            </div>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300"
          >
            <Upload size={16} /> Upload Video
          </Link>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[30vh]"
          >
            <div className="text-center space-y-3 p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <AlertTriangle size={32} className="text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-slate-300">{error}</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats grid */}
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

            {/* Tab switcher */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.2 }}
              className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

              {/* Tab bar */}
              <div className="flex border-b border-white/[0.05] bg-white/[0.02]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                      activeTab === tab.id
                        ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
                        : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.02]"
                    }`}
                  >
                    <tab.icon size={15} />
                    {tab.label}
                    {tab.id === "flagged" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "videos" ? (
                    <motion.div
                      key="videos"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {videos.length === 0 ? (
                        <div className="py-16 text-center space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                            <Video
                              size={28}
                              className="text-slate-600"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-300">
                              No videos uploaded yet.
                            </p>
                            <p className="text-xs text-slate-500 mt-1 mb-4">
                              Your next masterpiece is waiting.
                            </p>
                            <Link
                              to="/upload"
                              className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-95"
                            >
                              Upload your first video →
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.04] -m-4 sm:-m-6">
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
                                className="group flex items-start gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all duration-300 border-l-2 border-transparent hover:border-indigo-500 relative"
                              >
                                <Link
                                  to={`/watch/${video._id}`}
                                  className="shrink-0 relative w-36 rounded-xl overflow-hidden bg-[#1a1a24] shadow-md border border-transparent group-hover:border-white/10 group-hover:-translate-y-0.5 transition-all duration-300"
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
                                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Eye size={12} className="opacity-70" />
                                      {formatViews(video.views)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span>{timeAgo(video.createdAt)}</span>
                                  </div>
                                  <div className="pt-1">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border uppercase ${video.isPublished ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-white/[0.07] text-slate-500"}`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" : "bg-slate-600"}`}
                                      />
                                      {video.isPublished
                                        ? "Published"
                                        : "Private"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 absolute right-6 top-1/2 -translate-y-1/2">
                                  <button
                                    onClick={() =>
                                      handleTogglePublish(
                                        video._id,
                                        video.isPublished,
                                      )
                                    }
                                    disabled={togglingId === video._id}
                                    className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-lg disabled:opacity-40 bg-[#0f1117] border border-white/5 ${video.isPublished ? "text-emerald-400 hover:text-amber-400 hover:border-amber-500/30" : "text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"}`}
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
                                  </button>
                                  <Link
                                    to={`/edit/${video._id}`}
                                    className="p-2.5 rounded-xl bg-[#0f1117] border border-white/5 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-lg active:scale-90"
                                  >
                                    <Pencil size={16} />
                                  </Link>
                                  <button
                                    onClick={() => setDeleteId(video._id)}
                                    className="p-2.5 rounded-xl bg-[#0f1117] border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-lg active:scale-90"
                                  >
                                    <Trash2 size={16} />
                                  </button>
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <FlaggedContent />
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
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
              onClick={() => !deleting && setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />
              <div className="p-7 space-y-5 relative z-10">
                <div className="flex flex-col items-center text-center gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Trash2
                      size={24}
                      className="text-rose-400"
                      strokeWidth={2}
                    />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      Delete this video?
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      This action cannot be undone. The video and all its data
                      will be permanently removed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all disabled:opacity-50 shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      "Yes, delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
