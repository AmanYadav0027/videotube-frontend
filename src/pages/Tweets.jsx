import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { timeAgo } from "../utils/Video.utils";
import {
  Send,
  Edit3,
  Trash2,
  X,
  Check,
  MessageSquare,
  User,
  MoreHorizontal,
  MessageCircle,
  Repeat2,
  Feather,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: {
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(52,211,153,0.3)",
      color: "#6ee7b7",
    },
    error: {
      bg: "rgba(244,63,94,0.12)",
      border: "rgba(251,113,133,0.3)",
      color: "#fda4af",
    },
    info: {
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(165,180,252,0.3)",
      color: "#c7d2fe",
    },
  };
  const s = styles[type] ?? styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={spring}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold backdrop-blur-2xl shadow-2xl"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      {type === "success" && <Check size={15} strokeWidth={3} />}
      {type === "error" && <X size={15} strokeWidth={3} />}
      {message}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function TweetSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 animate-pulse border border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <div className="flex gap-4">
            <div
              className="w-10 h-10 rounded-full shrink-0 border border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
            <div className="flex-1 space-y-3 pt-1">
              <div className="flex gap-2">
                <div
                  className="h-3.5 rounded-md w-28"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
                <div
                  className="h-3.5 rounded-md w-16"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
              <div
                className="h-3 rounded-md w-full"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
              <div
                className="h-3 rounded-md w-3/4"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tweet card
// ─────────────────────────────────────────────────────────────────────────────
function TweetCard({ tweet, currentUserId, onDelete, onUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);
  const [liking, setLiking] = useState(false);

  const menuRef = useRef(null);
  const editRef = useRef(null);
  const owner = tweet.owner ?? {};
  const initial = owner.username?.[0]?.toUpperCase() || "?";
  const isOwner = currentUserId && owner._id?.toString() === currentUserId;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length,
      );
    }
  }, [editing]);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === tweet.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(`/api/v2/tweets/${tweet._id}`, {
        content: editContent.trim(),
      });
      onUpdate(tweet._id, res.data?.data?.content ?? editContent.trim());
      setEditing(false);
    } catch {
      // keep editing open on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) {
      setConfirmDel(true);
      setMenuOpen(false);
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`/api/v2/tweets/${tweet._id}`);
      onDelete(tweet._id);
    } catch {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUserId || liking) return;
    const previousIsLiked = isLiked;
    setIsLiked(!previousIsLiked);
    setLikesCount((prev) => (previousIsLiked ? prev - 1 : prev + 1));
    setLiking(true);
    try {
      await axios.post(`/api/v2/likes/toggle/t/${tweet._id}`);
    } catch {
      setIsLiked(previousIsLiked);
      setLikesCount((prev) => (!previousIsLiked ? prev - 1 : prev + 1));
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      whileHover={{ y: -2 }}
      className="group relative rounded-2xl p-5 border transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Hover top shimmer line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
        }}
      />

      <div className="flex gap-4">
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={spring}
          className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
        >
          {owner.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-bold select-none">
              {initial}
            </span>
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                {owner.fullName || owner.username || "Unknown"}
              </span>
              {owner.username && (
                <span className="text-xs font-medium text-slate-600">
                  @{owner.username}
                </span>
              )}
              <span className="text-[10px] text-slate-700">·</span>
              <span className="text-xs font-medium text-slate-600">
                {timeAgo(tweet.createdAt)}
              </span>
            </div>

            {/* Menu */}
            {isOwner && (
              <div ref={menuRef} className="relative shrink-0">
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    setConfirmDel(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 transition-all outline-none"
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <MoreHorizontal size={16} />
                </motion.button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 z-20 w-36 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                      style={{
                        background: "rgba(15,15,22,0.97)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Content / Edit mode */}
          {editing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 space-y-3"
            >
              <textarea
                ref={editRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                    handleSaveEdit();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditContent(tweet.content);
                  }
                }}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 outline-none resize-none transition-all border"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  borderColor: "rgba(99,102,241,0.3)",
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setEditing(false);
                    setEditContent(tweet.content);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                  }}
                >
                  <Check size={14} /> {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-3">
                {tweet.content}
              </p>

              {/* -- INTERACTION BAR -- */}
              <div className="flex items-center gap-5">
                {/* Reply */}
                <button
                  onClick={() => console.log("Open comment modal")}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-400 transition-colors duration-200 group/btn"
                >
                  <div className="p-1.5 rounded-full group-hover/btn:bg-indigo-500/10 transition-colors">
                    <MessageCircle
                      size={16}
                      className="group-hover/btn:-rotate-12 group-hover/btn:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="font-semibold tabular-nums">
                    {tweet.commentsCount > 0 ? tweet.commentsCount : ""}
                  </span>
                </button>

                {/* Retweet */}
                <button
                  onClick={() => console.log("Trigger retweet")}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-400 transition-colors duration-200 group/btn"
                >
                  <div className="p-1.5 rounded-full group-hover/btn:bg-emerald-500/10 transition-colors">
                    <Repeat2
                      size={17}
                      className="group-hover/btn:rotate-180 group-hover/btn:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="font-semibold tabular-nums">
                    {tweet.retweetsCount > 0 ? tweet.retweetsCount : ""}
                  </span>
                </button>

                {/* Like */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleToggleLike}
                  disabled={!currentUserId || liking}
                  className={`flex items-center gap-1.5 text-xs transition-colors duration-200 group/btn ${isLiked ? "text-rose-500" : "text-slate-600 hover:text-rose-400"} ${!currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`p-1.5 rounded-full transition-colors ${isLiked ? "bg-rose-500/12" : "group-hover/btn:bg-rose-500/10"}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-300 ${isLiked ? "scale-110 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" : "scale-100 group-hover/btn:scale-110"}`}
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${isLiked ? "text-rose-500" : ""}`}
                  >
                    {likesCount > 0 ? likesCount : ""}
                  </span>
                </motion.button>
              </div>
            </>
          )}

          {confirmDel && !menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-500/20"
              style={{ background: "rgba(244,63,94,0.07)" }}
            >
              <p className="text-xs font-medium text-rose-400 flex-1">
                Permanently delete this post?
              </p>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{
                  background: "#e11d48",
                  boxShadow: "0 4px 12px rgba(225,29,72,0.3)",
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Tweets page
// ─────────────────────────────────────────────────────────────────────────────
export default function Tweets() {
  const currentUser = useSelector((s) => s.auth.userData);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState(null);

  const textareaRef = useRef(null);
  const showToast = useCallback(
    (message, type = "info") => setToast({ message, type }),
    [],
  );

  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }
    const fetchTweets = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v2/tweets/user/${currentUser._id}`);
        const data = res.data?.data ?? [];
        setTweets(Array.isArray(data) ? data : []);
      } catch {
        showToast("Failed to load posts.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTweets();
  }, [currentUser?._id, showToast]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;

    const optimistic = {
      _id: `temp_${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      owner: {
        _id: currentUser?._id,
        username: currentUser?.username,
        fullName: currentUser?.fullName,
        avatar: currentUser?.avatar,
      },
    };

    setTweets((prev) => [optimistic, ...prev]);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setPosting(true);

    try {
      const res = await axios.post("/api/v2/tweets", {
        content: optimistic.content,
      });
      const real = res.data?.data;
      setTweets((prev) =>
        prev.map((t) =>
          t._id === optimistic._id ? { ...real, owner: optimistic.owner } : t,
        ),
      );
      showToast("Posted successfully!", "success");
    } catch (err) {
      setTweets((prev) => prev.filter((t) => t._id !== optimistic._id));
      setContent(optimistic.content);
      showToast(err.response?.data?.message || "Failed to post.", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = useCallback(
    (tweetId) => {
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      showToast("Post deleted.", "success");
    },
    [showToast],
  );

  const handleUpdate = useCallback(
    (tweetId, newContent) => {
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId ? { ...t, content: newContent } : t,
        ),
      );
      showToast("Post updated.", "success");
    },
    [showToast],
  );

  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-0 right-1/3 w-[500px] h-[400px] opacity-[0.06] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse, rgba(139,92,246,1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] opacity-[0.05] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
          className="flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-indigo-500/20"
            style={{
              background: "rgba(99,102,241,0.1)",
              boxShadow: "0 0 20px rgba(99,102,241,0.2)",
            }}
          >
            <Feather size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Community
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Your posts and updates
            </p>
          </div>
        </motion.div>

        {/* ── Compose box ── */}
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="rounded-2xl overflow-hidden border transition-all duration-500 focus-within:-translate-y-0.5"
            style={{
              background: "rgba(10,10,15,0.9)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            {/* Top shimmer */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
              }}
            />
            <form onSubmit={handlePost} className="p-5 sm:p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div
                  className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                  }}
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                        handlePost(e);
                    }}
                    placeholder="Share something with your community…"
                    rows={2}
                    maxLength={500}
                    className="w-full bg-transparent text-[15px] text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed mt-1"
                  />

                  <AnimatePresence>
                    {content.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between pt-3 border-t border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold tabular-nums transition-colors ${content.length > 480 ? "text-rose-400" : "text-slate-600"}`}
                          >
                            {content.length}{" "}
                            <span className="opacity-50">/ 500</span>
                          </span>
                          {/* Progress ring */}
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            className="-rotate-90"
                          >
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              fill="none"
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="2"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              fill="none"
                              stroke={
                                content.length > 480 ? "#f43f5e" : "#6366f1"
                              }
                              strokeWidth="2"
                              strokeDasharray={`${(content.length / 500) * 50.27} 50.27`}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => {
                              setContent("");
                              if (textareaRef.current)
                                textareaRef.current.style.height = "auto";
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                          >
                            Clear
                          </motion.button>
                          <motion.button
                            whileHover={{
                              scale: 1.04,
                              boxShadow: "0 8px 20px rgba(99,102,241,0.4)",
                            }}
                            whileTap={{ scale: 0.96 }}
                            type="submit"
                            disabled={posting || !content.trim()}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #7c3aed)",
                              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                            }}
                          >
                            <Send
                              size={13}
                              strokeWidth={2.5}
                              className={posting ? "animate-pulse" : ""}
                            />
                            {posting ? "Posting…" : "Post"}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-6 text-center border border-white/[0.06]"
            style={{
              background: "rgba(10,10,15,0.85)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-sm font-medium text-slate-400">
              Sign in to post to your community
            </p>
          </motion.div>
        )}

        {/* ── Tweets feed ── */}
        {loading ? (
          <TweetSkeleton />
        ) : tweets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <MessageSquare
                size={28}
                className="text-slate-600"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">No posts yet</p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                Share your first update with the community above.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
          >
            <AnimatePresence mode="popLayout">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  currentUserId={currentUser?._id}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
