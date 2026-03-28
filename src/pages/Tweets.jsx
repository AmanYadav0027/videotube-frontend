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
    success: "bg-emerald-950 border-emerald-500/30 text-emerald-300",
    error: "bg-rose-950   border-rose-500/30   text-rose-300",
    info: "bg-slate-900  border-white/10       text-slate-300",
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${styles[type]}`}
    >
      {type === "success" && <Check size={14} />}
      {type === "error" && <X size={14} />}
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-5 animate-pulse"
        >
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.05] flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="flex gap-2">
                <div className="h-3 bg-white/[0.05] rounded w-24" />
                <div className="h-3 bg-white/[0.04] rounded w-16" />
              </div>
              <div className="h-3 bg-white/[0.04] rounded w-full" />
              <div className="h-3 bg-white/[0.04] rounded w-3/4" />
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
  const menuRef = useRef(null);
  const editRef = useRef(null);

  const owner = tweet.owner ?? {};
  const initial = owner.username?.[0]?.toUpperCase() || "?";
  const isOwner = currentUserId && owner._id?.toString() === currentUserId;

  // close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // auto-focus edit textarea
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

  return (
    <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200 relative">
      {/* top accent */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
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
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-semibold text-slate-200 truncate">
                {owner.fullName || owner.username || "Unknown"}
              </span>
              {owner.username && (
                <span className="text-xs text-slate-600">
                  @{owner.username}
                </span>
              )}
              <span className="text-[10px] text-slate-700">·</span>
              <span className="text-xs text-slate-600">
                {timeAgo(tweet.createdAt)}
              </span>
            </div>

            {/* Menu — only for owner */}
            {isOwner && (
              <div ref={menuRef} className="relative flex-shrink-0">
                <button
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    setConfirmDel(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all duration-150"
                >
                  <MoreHorizontal size={15} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 w-36 bg-[#1a1a24] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content / Edit mode */}
          {editing ? (
            <div className="mt-2 space-y-2">
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
                className="w-full bg-white/[0.04] border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none resize-none focus:border-indigo-500/60 transition-colors"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(tweet.content);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  <Check size={11} /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
              {tweet.content}
            </p>
          )}

          {/* Delete confirm */}
          {confirmDel && !menuOpen && (
            <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/8 border border-rose-500/20">
              <p className="text-xs text-rose-400 flex-1">Delete this post?</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Cancel
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

  // Fetch current user's tweets — GET /api/v2/tweets/user/:userId
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

  // Create tweet — POST /api/v2/tweets
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
      showToast("Posted!", "success");
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#0a0a0f] relative">
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <MessageSquare size={15} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">
              Community
            </h1>
            <p className="text-xs text-slate-600">Your posts and updates</p>
          </div>
        </div>

        {/* ── Compose box ── */}
        {isAuthenticated ? (
          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <form onSubmit={handlePost} className="p-5">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={15} className="text-white" />
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
                    className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed"
                  />

                  {/* footer row — only when content exists */}
                  {content.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span
                        className={`text-xs tabular-nums ${content.length > 450 ? "text-rose-400" : "text-slate-600"}`}
                      >
                        {content.length}/500
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setContent("");
                            if (textareaRef.current)
                              textareaRef.current.style.height = "auto";
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          disabled={posting || !content.trim()}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20"
                        >
                          <Send size={11} strokeWidth={2.5} />
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
          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 text-center space-y-2">
            <p className="text-sm text-slate-400">
              Sign in to post to your community
            </p>
          </div>
        )}

        {/* ── Tweets feed ── */}
        {loading ? (
          <TweetSkeleton />
        ) : tweets.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare size={28} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No posts yet</p>
            <p className="text-xs text-slate-700">
              Share something with your community above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
