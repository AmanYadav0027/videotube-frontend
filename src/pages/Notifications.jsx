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

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

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
  if (avatar)
    return (
      <img
        src={avatar}
        alt={username}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
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
  // FIX: separate loading state for delete-read action
  const [deletingRead, setDeletingRead] = useState(false);

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

  // FIX: delete all read notifications at once
  const handleDeleteAllRead = async () => {
    if (deletingRead) return;
    const readOnes = notifications.filter((n) => n.read);
    if (readOnes.length === 0) return;
    setDeletingRead(true);
    try {
      await Promise.all(
        readOnes.map((n) => axios.delete(`/api/v2/notifications/${n._id}`)),
      );
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch {
      /* silent */
    } finally {
      setDeletingRead(false);
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

  const readCount = notifications.filter((n) => n.read).length;

  return (
    <div
      className="min-h-full p-4 sm:p-6 overflow-x-hidden"
      style={{ background: "#050508" }}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-4">
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-lg"
              style={{
                background: "rgba(245,158,11,0.1)",
                boxShadow: "0 0 20px rgba(245,158,11,0.15)",
              }}
            >
              <Bell size={20} className="text-amber-400" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg"
                  style={{ boxShadow: "0 0 8px rgba(244,63,94,0.7)" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Notifications
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* FIX: Delete all read button — only shows when there are read notifications */}
            {readCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDeleteAllRead}
                disabled={deletingRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 border border-white/[0.07] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {deletingRead ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                Delete read ({readCount})
              </motion.button>
            )}

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/[0.07] transition-all disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {markingAll ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCheck size={13} />
                )}
                Mark all read
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 rounded-xl p-1 w-fit border border-white/[0.07]"
          style={{
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(20px)",
          }}
        >
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${filter === f ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              {filter === f && (
                <motion.div
                  layoutId="notif-filter-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                  }}
                  transition={spring}
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
                className="h-20 rounded-2xl border border-white/[0.05]"
                style={{ background: "rgba(255,255,255,0.025)" }}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[35vh]"
          >
            <div
              className="text-center space-y-4 p-10 rounded-2xl max-w-xs w-full border border-white/[0.06]"
              style={{
                background: "rgba(10,10,15,0.85)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-white/[0.08]"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <BellOff
                  size={26}
                  className="text-slate-600"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-base font-bold text-white">
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

                return (
                  <motion.div
                    key={n._id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    onClick={() => !n.read && handleMarkRead(n._id)}
                    className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      n.read
                        ? "border-white/[0.06] hover:border-white/10"
                        : "border-indigo-500/20 hover:border-indigo-500/30"
                    }`}
                    style={{
                      background: "rgba(10,10,15,0.85)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span
                        className={`absolute top-4 right-10 w-2 h-2 rounded-full ${cfg.dot}`}
                        style={{ boxShadow: "0 0 6px rgba(99,102,241,0.8)" }}
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
                          className="font-bold text-white hover:text-indigo-300 transition-colors"
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
                      className="shrink-0 p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
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
