import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  ThumbsUp,
  UserPlus,
  MessageSquare,
  Play,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { timeAgo } from "../utils/Video.utils";

const TYPE_CONFIG = {
  like: {
    icon: ThumbsUp,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: (n) =>
      `liked your video${n.video?.title ? ` "${n.video.title}"` : ""}`,
  },
  subscribe: {
    icon: UserPlus,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
    label: () => "subscribed to your channel",
  },
  comment: {
    icon: MessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: (n) =>
      `commented on your video${n.video?.title ? ` "${n.video.title}"` : ""}`,
  },
  upload: {
    icon: Play,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    dot: "bg-violet-500",
    label: (n) =>
      `uploaded a new video${n.video?.title ? `: "${n.video.title}"` : ""}`,
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, x: 20, transition: { duration: 0.2 } },
};

function AvatarFallback({ username, avatar }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }
  const colors = [
    "from-indigo-500 to-violet-500",
    "from-rose-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-blue-500",
  ];
  const color = colors[(username?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {username?.slice(0, 2).toUpperCase() ?? "?"}
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async (f = filter) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v2/notifications?filter=${f}`);
      setNotifications(res.data?.data?.notifications ?? []);
      setUnreadCount(res.data?.data?.unreadCount ?? 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Notifications — VideoTube";
    fetchNotifications(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await axios.patch("/api/v2/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`/api/v2/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const handleDismiss = async (id) => {
    const wasUnread = notifications.find((n) => n._id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n._id !== id)); // optimistic
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.delete(`/api/v2/notifications/${id}`);
    } catch {
      fetchNotifications(filter); // revert on failure
    }
  };

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-4 group">
            <div className="relative w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-amber-500/10">
              <Bell size={20} className="text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-500/40">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Notifications
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.07] transition-all active:scale-95 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#0f1117] border border-white/[0.07] rounded-xl p-1 w-fit">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                filter === f
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {filter === f && (
                <motion.div
                  layoutId="notif-filter-bg"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-[#0f1117] border border-white/[0.07]"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[35vh]"
          >
            <div className="text-center space-y-4 p-10 rounded-2xl bg-[#0f1117] border border-white/[0.07] max-w-xs w-full">
              <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto">
                <BellOff
                  size={26}
                  className="text-slate-600"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "Activity on your channel will appear here."}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.like;
                const Icon = cfg.icon;
                const linkTo = n.video?._id
                  ? `/watch/${n.video._id}`
                  : `/channel/${n.actor?.username}`;

                return (
                  <motion.div
                    key={n._id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    onClick={() => !n.read && handleMarkRead(n._id)}
                    className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      n.read
                        ? "bg-[#0f1117] border-white/[0.06] hover:border-white/10"
                        : "bg-[#0f1117] border-indigo-500/20 hover:border-indigo-500/30"
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span
                        className={`absolute top-4 right-10 w-2 h-2 rounded-full ${cfg.dot} shadow-[0_0_6px_rgba(99,102,241,0.8)]`}
                      />
                    )}

                    {/* Type icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon size={14} className={cfg.color} />
                    </div>

                    {/* Actor avatar */}
                    <AvatarFallback
                      username={n.actor?.username}
                      avatar={n.actor?.avatar}
                    />

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 leading-snug">
                        <Link
                          to={`/channel/${n.actor?.username}`}
                          className="font-bold text-slate-100 hover:text-indigo-300 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {n.actor?.username}
                        </Link>{" "}
                        {cfg.label(n)}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(n._id);
                      }}
                      className="shrink-0 p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 active:scale-90"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
