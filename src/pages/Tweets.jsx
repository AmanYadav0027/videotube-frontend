import { useEffect, useState, useRef, useCallback, memo } from "react";
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
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
const Toast = memo(function Toast({ message, type = "info", onClose }) {
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
});

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
// Lazy avatar
// ─────────────────────────────────────────────────────────────────────────────
function LazyAvatar({ src, alt, fallback, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold select-none">
            {fallback}
          </span>
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {!src && (
        <span className="text-white text-xs font-bold select-none">
          {fallback}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TweetCard
// ─────────────────────────────────────────────────────────────────────────────
const TweetCard = memo(function TweetCard({
  tweet,
  currentUser,
  onDelete,
  onUpdate,
  onRetweet,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(tweet.isLiked));
  const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
  const [liking, setLiking] = useState(false);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [showRetweetBox, setShowRetweetBox] = useState(false);
  const [retweetContent, setRetweetContent] = useState("");
  const [retweeting, setRetweeting] = useState(false);

  const [retweetCount, setRetweetCount] = useState(tweet.retweetsCount ?? 0);
  //  track whether current user has retweeted — drives icon colour immediately
  const [hasRetweeted, setHasRetweeted] = useState(false);

  const menuRef = useRef(null);
  const editRef = useRef(null);
  const commentInputRef = useRef(null);

  const owner = tweet.owner ?? {};
  const initial = owner.username?.[0]?.toUpperCase() ?? "?";

  const currentUserId = currentUser?._id;
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

  // Load comments when expanded
  useEffect(() => {
    if (!showComments) return;
    const load = async () => {
      setCommentsLoading(true);
      try {
        const res = await axios.get(`/api/v2/comments/t/${tweet._id}`);
        setComments(res.data?.data?.docs ?? []);
      } catch {
        /* silent */
      } finally {
        setCommentsLoading(false);
      }
    };
    load();
  }, [showComments, tweet._id]);

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
      /* silent */
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
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    setLiking(true);
    try {
      await axios.post(`/api/v2/likes/toggle/t/${tweet._id}`);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setLiking(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || postingComment) return;
    setPostingComment(true);

    //  always build owner from currentUser — guaranteed to have username+avatar.
    // The POST /comments endpoint returns an unpopulated doc where owner is just
    // an ObjectId string, so real.owner?.username is always undefined. If we let
    // real.owner overwrite the optimistic owner the @username disappears until
    // the user refreshes. We only fall back to real.owner when it is a full object.
    const optimisticOwner = {
      _id: currentUserId,
      username: currentUser?.username,
      avatar: currentUser?.avatar,
    };

    const optimistic = {
      _id: `temp_${Date.now()}`,
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
      owner: optimisticOwner,
    };
    setComments((prev) => [optimistic, ...prev]);
    setCommentInput("");
    try {
      const res = await axios.post(`/api/v2/comments/t/${tweet._id}`, {
        content: optimistic.content,
      });
      const real = res.data?.data ?? {};
      setComments((prev) =>
        prev.map((c) =>
          c._id === optimistic._id
            ? // Keep optimisticOwner unless the API returned a fully populated owner object
              {
                ...real,
                owner: real.owner?.username ? real.owner : optimisticOwner,
              }
            : c,
        ),
      );
    } catch {
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      setCommentInput(optimistic.content);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const prev = [...comments];
    setComments((c) => c.filter((x) => x._id !== commentId));
    try {
      await axios.delete(`/api/v2/comments/c/${commentId}`);
    } catch {
      setComments(prev);
    }
  };

  // use the real toggleRetweet endpoint that exists on the backend
  // (POST /api/v2/tweets/toggle-retweet/:tweetId per tweet.routes.js).
  // The previous attempt called /tweets/:id/retweet which doesn't exist —
  // every call silently 404'd so retweetCount and icon state never updated
  // without a hard refresh. Now we optimistically flip state and close the
  // box immediately, then sync from the API response if available.
  const handleRetweet = async (e) => {
    e.preventDefault();
    if (!retweetContent.trim() || retweeting) return;
    setRetweeting(true);

    // Optimistic update — flip immediately so UI responds without waiting
    const wasRetweeted = hasRetweeted;
    setHasRetweeted(true);
    setRetweetCount((c) => c + 1);

    try {
      const res = await axios.post(
        `/api/v2/tweets/toggle-retweet/${tweet._id}`,
        { content: retweetContent.trim() },
      );
      const data = res.data?.data;
      // Sync server truth if returned
      if (typeof data?.retweeted === "boolean") {
        setHasRetweeted(data.retweeted);
        if (!data.retweeted) setRetweetCount((c) => Math.max(0, c - 1));
      }
      if (data?.tweet) {
        onRetweet?.(data.tweet);
      }
      setRetweetContent("");
      setShowRetweetBox(false);
    } catch {
      // Revert optimistic update on failure
      setHasRetweeted(wasRetweeted);
      setRetweetCount((c) => Math.max(0, c - 1));
    } finally {
      setRetweeting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      className="group relative rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Top hover line */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
        }}
      />

      <div className="p-5">
        <div className="flex gap-4">
          <LazyAvatar
            src={owner.avatar}
            alt={owner.username}
            fallback={initial}
            className="shrink-0 w-10 h-10 rounded-full shadow-lg"
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
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

              {isOwner && (
                <div ref={menuRef} className="relative shrink-0">
                  <button
                    onClick={() => {
                      setMenuOpen((v) => !v);
                      setConfirmDel(false);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 hover:bg-white/[0.08] transition-all outline-none"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  <AnimatePresence initial={false}>
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

            {/* Content / Edit */}
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
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditContent(tweet.content);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || !editContent.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                      boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                    }}
                  >
                    <Check size={14} /> {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-3">
                  {tweet.content}
                </p>

                {/* Action bar */}
                <div className="flex items-center gap-5">
                  {/* Comment */}
                  <button
                    onClick={() => setShowComments((v) => !v)}
                    className={`flex items-center gap-1.5 text-xs transition-colors duration-200 group/btn ${showComments ? "text-indigo-400" : "text-slate-600 hover:text-indigo-400"}`}
                  >
                    <div className="p-1.5 rounded-full group-hover/btn:bg-indigo-500/10 transition-colors">
                      <MessageCircle size={16} />
                    </div>
                    <span className="font-semibold tabular-nums">
                      {comments.length > 0 ? comments.length : ""}
                    </span>
                  </button>

                  {/* Retweet —  colour driven by hasRetweeted for instant feedback */}
                  <button
                    onClick={() =>
                      currentUserId && setShowRetweetBox((v) => !v)
                    }
                    className={`flex items-center gap-1.5 text-xs transition-colors duration-200 group/btn ${hasRetweeted || showRetweetBox ? "text-emerald-400" : "text-slate-600 hover:text-emerald-400"}`}
                  >
                    <div className="p-1.5 rounded-full group-hover/btn:bg-emerald-500/10 transition-colors">
                      <Repeat2 size={17} />
                    </div>
                    <span className="font-semibold tabular-nums">
                      {retweetCount > 0 ? retweetCount : ""}
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
                        className={`transition-all duration-300 ${isLiked ? "scale-110" : "scale-100 group-hover/btn:scale-110"}`}
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

            {/* Confirm delete */}
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
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 active:scale-95"
                  style={{
                    background: "#e11d48",
                    boxShadow: "0 4px 12px rgba(225,29,72,0.3)",
                  }}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Retweet box ── */}
      <AnimatePresence>
        {showRetweetBox && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <form onSubmit={handleRetweet} className="p-4 space-y-3">
              {/* Original tweet preview */}
              <div
                className="text-xs text-slate-500 px-3 py-2 rounded-xl border border-white/[0.06] line-clamp-2"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                ↩ <span className="text-slate-400">@{owner.username}:</span>{" "}
                {tweet.content.slice(0, 100)}
                {tweet.content.length > 100 ? "…" : ""}
              </div>
              <textarea
                value={retweetContent}
                onChange={(e) => setRetweetContent(e.target.value)}
                placeholder="Add your thoughts..."
                rows={2}
                maxLength={400}
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none border"
                style={{
                  background: "rgba(16,185,129,0.04)",
                  borderColor: "rgba(16,185,129,0.2)",
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRetweetBox(false);
                    setRetweetContent("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={retweeting || !retweetContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  }}
                >
                  {retweeting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Repeat2 size={13} />
                  )}
                  {retweeting ? "Posting…" : "Retweet"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Comments section ── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-4 space-y-3">
              {currentUserId && (
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    ref={commentInputRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a reply..."
                    maxLength={500}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(99,102,241,0.4)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !commentInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    }}
                  >
                    {postingComment ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                  </button>
                </form>
              )}

              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-slate-600" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-3">
                  No replies yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((c) => {
                    const canDelete =
                      currentUserId &&
                      (c.owner?._id === currentUserId || isOwner);
                    return (
                      <div key={c._id} className="flex gap-3 group/comment">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white shadow-sm">
                          {c.owner?.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div
                          className="flex-1 flex justify-between items-start px-3 py-2 rounded-xl text-xs text-slate-300 border border-white/[0.05]"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          <div className="pr-2 break-words">
                            <span className="font-bold text-slate-400 mr-2">
                              @{c.owner?.username}
                            </span>
                            {c.content}
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="opacity-0 group-hover/comment:opacity-100 p-1 shrink-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all duration-200"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

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
  const showToastRef = useRef(null);
  showToastRef.current = (message, type = "info") =>
    setToast({ message, type });
  const showToast = useCallback(
    (message, type) => showToastRef.current(message, type),
    [],
  );

  useEffect(() => {
    document.title = "Community — VideoTube";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchTweets = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/v2/tweets/feed");
        const data = res.data?.data ?? [];
        if (!cancelled) setTweets(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) showToast("Failed to load posts.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTweets();
    return () => {
      cancelled = true;
    };
  }, []); // fetch once on mount — feed is public

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;

    const optimistic = {
      _id: `temp_${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isLiked: false,
      likesCount: 0,
      retweetsCount: 0,
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
      // Server fields win, but keep optimistic owner if API returns partial
      setTweets((prev) =>
        prev.map((t) =>
          t._id === optimistic._id
            ? { ...real, owner: real.owner ?? optimistic.owner }
            : t,
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

  const handleRetweet = useCallback((newTweet) => {
    if (!newTweet) return;
    setTweets((prev) => [newTweet, ...prev]);
  }, []);

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
      <AnimatePresence initial={false}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-0 right-1/3 w-[500px] h-[400px] opacity-[0.06]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(139,92,246,0.8) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] opacity-[0.05]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.8) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
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
              Posts and updates
            </p>
          </div>
        </motion.div>

        {/* Compose box */}
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
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
              }}
            />
            <form onSubmit={handlePost} className="p-5 sm:p-6">
              <div className="flex gap-4">
                <LazyAvatar
                  src={currentUser?.avatar}
                  alt={currentUser?.username}
                  fallback={<User size={18} className="text-white" />}
                  className="shrink-0 w-10 h-10 rounded-full shadow-md"
                />
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
                  <AnimatePresence initial={false}>
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
                          <button
                            type="button"
                            onClick={() => {
                              setContent("");
                              if (textareaRef.current)
                                textareaRef.current.style.height = "auto";
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                          >
                            Clear
                          </button>
                          <button
                            type="submit"
                            disabled={posting || !content.trim()}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
                          </button>
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
              Sign in to post to the community
            </p>
          </motion.div>
        )}

        {/* Feed */}
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
          <div className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onRetweet={handleRetweet}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
