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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success:
      "bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20",
    error: "bg-rose-950/90 border-rose-500/30 text-rose-300 shadow-rose-500/20",
    info: "bg-slate-900/90 border-white/10 text-slate-300 shadow-black/50",
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 ease-out ${styles[type]}`}
    >
      {type === "success" && (
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check size={14} className="text-emerald-400" />
        </div>
      )}
      {type === "error" && (
        <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
          <X size={14} className="text-rose-400" />
        </div>
      )}
      {message}
    </div>
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
          className="bg-slate-800/20 border border-white/5 rounded-2xl p-5 animate-pulse shadow-inner"
        >
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800/50 shrink-0 border border-white/5" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="flex gap-2">
                <div className="h-3.5 bg-slate-800/50 rounded-md w-28" />
                <div className="h-3.5 bg-slate-800/40 rounded-md w-16" />
              </div>
              <div className="h-3 bg-slate-800/40 rounded-md w-full" />
              <div className="h-3 bg-slate-800/40 rounded-md w-3/4" />
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
    <div className="group bg-[#0f1117] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50 relative animate-in slide-in-from-top-8 fade-in duration-500 ease-out fill-mode-both">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-indigo-500/10 group-hover:via-indigo-500/30 to-transparent transition-colors duration-500" />

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
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
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                {owner.fullName || owner.username || "Unknown"}
              </span>
              {owner.username && (
                <span className="text-xs font-medium text-slate-500">
                  @{owner.username}
                </span>
              )}
              <span className="text-[10px] text-slate-700">·</span>
              <span className="text-xs font-medium text-slate-500">
                {timeAgo(tweet.createdAt)}
              </span>
            </div>

            {/* Menu */}
            {isOwner && (
              <div ref={menuRef} className="relative shrink-0">
                <button
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    setConfirmDel(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-200 hover:bg-white/10 transition-all duration-200 active:scale-90 outline-none focus-visible:ring-2 ring-indigo-500/50"
                >
                  <MoreHorizontal size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 w-36 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content / Edit mode */}
          {editing ? (
            <div className="mt-3 space-y-3 animate-in fade-in duration-300">
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
                className="w-full bg-black/20 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none resize-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(tweet.content);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  <Check size={14} /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                {tweet.content}
              </p>

              {/* -- INTERACTION BAR -- */}
              <div className="mt-4 flex items-center gap-6">
                {/* Reply */}
                <button
                  onClick={() => console.log("Open comment modal")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors duration-200 group active:scale-95 outline-none"
                >
                  <div className="p-1.5 rounded-full transition-colors group-hover:bg-indigo-500/10">
                    <MessageCircle
                      size={17}
                      className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
                    />
                  </div>
                  <span className="font-semibold tabular-nums">
                    {tweet.commentsCount > 0 ? tweet.commentsCount : ""}
                  </span>
                </button>

                {/* Retweet */}
                <button
                  onClick={() => console.log("Trigger retweet")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors duration-200 group active:scale-95 outline-none"
                >
                  <div className="p-1.5 rounded-full transition-colors group-hover:bg-emerald-500/10">
                    <Repeat2
                      size={18}
                      className="transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110"
                    />
                  </div>
                  <span className="font-semibold tabular-nums">
                    {tweet.retweetsCount > 0 ? tweet.retweetsCount : ""}
                  </span>
                </button>

                {/* Like */}
                <button
                  onClick={handleToggleLike}
                  disabled={!currentUserId || liking}
                  className={`flex items-center gap-1.5 text-xs transition-colors duration-200 group active:scale-90 outline-none ${
                    isLiked
                      ? "text-rose-500"
                      : "text-slate-500 hover:text-rose-400"
                  } ${!currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`p-1.5 rounded-full transition-colors ${isLiked ? "bg-rose-500/10" : "group-hover:bg-rose-500/10"}`}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) ${isLiked ? "scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]" : "scale-100 group-hover:scale-110"}`}
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${isLiked ? "text-rose-500" : ""}`}
                  >
                    {likesCount > 0 ? likesCount : ""}
                  </span>
                </button>
              </div>
            </>
          )}

          {confirmDel && !menuOpen && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-in slide-in-from-top-2 fade-in duration-200">
              <p className="text-xs font-medium text-rose-400 flex-1">
                Permanently delete this post?
              </p>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors active:scale-95 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-rose-500/20"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="min-h-full bg-[#0a0a0f] relative overflow-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Page header ── */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <MessageSquare size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Community
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Your posts and updates
            </p>
          </div>
        </div>

        {/* ── Compose box ── */}
        {isAuthenticated ? (
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 focus-within:border-indigo-500/40 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.1)] focus-within:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <form onSubmit={handlePost} className="p-5 sm:p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
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
                    className="w-full bg-transparent text-[15px] text-slate-200 placeholder-slate-500 outline-none resize-none leading-relaxed focus:ring-0 mt-1"
                  />

                  {content.length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 animate-in fade-in duration-300">
                      <span
                        className={`text-xs font-semibold tabular-nums transition-colors ${content.length > 480 ? "text-rose-400" : "text-slate-600"}`}
                      >
                        {content.length}{" "}
                        <span className="opacity-50">/ 500</span>
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setContent("");
                            if (textareaRef.current)
                              textareaRef.current.style.height = "auto";
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all active:scale-95"
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          disabled={posting || !content.trim()}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95"
                        >
                          <Send
                            size={14}
                            strokeWidth={2.5}
                            className={posting ? "animate-pulse" : ""}
                          />
                          {posting ? "Posting…" : "Post"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-6 text-center animate-in fade-in duration-700">
            <p className="text-sm font-medium text-slate-400">
              Sign in to post to your community
            </p>
          </div>
        )}

        {/* ── Tweets feed ── */}
        {loading ? (
          <TweetSkeleton />
        ) : tweets.length === 0 ? (
          <div className="py-20 text-center space-y-4 animate-in zoom-in-95 fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner">
              <MessageSquare
                size={28}
                className="text-slate-600"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">No posts yet</p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Share your first update with the community above.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                currentUserId={currentUser?._id}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
