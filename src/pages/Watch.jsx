import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";
import {
  ThumbsUp,
  Eye,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Bell,
  BellOff,
  Check,
  X,
  Share2,
  Trash2,
  User,
  Sparkles,
  BookOpen,
  ListVideo,
  Loader2,
  Clock,
  AlertCircle,
  Bot,
  Bookmark,
  Plus,
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
    error: "bg-rose-950 border-rose-500/30 text-rose-300",
    info: "bg-slate-900 border-white/10 text-slate-300",
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

// ─────────────────────────────────────────────────────────────────────────────
// Save to Playlist Modal
// ─────────────────────────────────────────────────────────────────────────────
function SaveToPlaylistModal({ videoId, currentUserId, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // playlistId being toggled
  const [saved, setSaved] = useState({}); // { playlistId: boolean }
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/v2/playlists/user/${currentUserId}`);
        const data = res.data?.data ?? [];
        setPlaylists(data);
        // Check which playlists already contain this video
        const savedMap = {};
        data.forEach((p) => {
          const ids = (p.videos || []).map((v) =>
            (typeof v === "object" ? v._id : v)?.toString(),
          );
          savedMap[p._id] = ids.includes(videoId?.toString());
        });
        setSaved(savedMap);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUserId, videoId]);

  const handleToggle = async (playlistId) => {
    if (saving) return;
    setSaving(playlistId);
    const isCurrentlySaved = saved[playlistId];
    try {
      if (isCurrentlySaved) {
        await axios.patch(`/api/v2/playlists/remove/${videoId}/${playlistId}`);
      } else {
        await axios.patch(`/api/v2/playlists/add/${videoId}/${playlistId}`);
      }
      setSaved((prev) => ({ ...prev, [playlistId]: !isCurrentlySaved }));
    } catch {
      /* silent */
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;
    setCreateLoading(true);
    try {
      const res = await axios.post("/api/v2/playlists", {
        name: newName.trim(),
        description: newDesc.trim(),
      });
      const created = res.data?.data;
      setPlaylists((prev) => [created, ...prev]);
      setSaved((prev) => ({ ...prev, [created._id]: false }));
      setNewName("");
      setNewDesc("");
      setCreating(false);
    } catch {
      /* silent */
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h2 className="text-sm font-bold text-slate-100">Save to playlist</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Playlist list */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="text-slate-600 animate-spin" />
            </div>
          ) : playlists.length === 0 && !creating ? (
            <p className="text-xs text-slate-600 text-center py-8">
              No playlists yet. Create one below.
            </p>
          ) : (
            <div className="p-2 space-y-0.5">
              {playlists.map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleToggle(p._id)}
                  disabled={saving === p._id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150 group"
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${saved[p._id] ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-white/40"}`}
                  >
                    {saved[p._id] && (
                      <Check size={10} strokeWidth={3} className="text-white" />
                    )}
                    {saving === p._id && (
                      <Loader2 size={10} className="text-white animate-spin" />
                    )}
                  </div>
                  <span className="text-sm text-slate-300 text-left truncate">
                    {p.name}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-600 shrink-0">
                    {p.videos?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create new */}
        <div className="border-t border-white/6 p-4">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <Plus size={14} strokeWidth={2} />
              New playlist
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 border border-white/8 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !newName.trim() || !newDesc.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                >
                  {createLoading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeletons
// ─────────────────────────────────────────────────────────────────────────────
function PlayerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div
        className="w-full rounded-2xl bg-white/5"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="space-y-2.5">
        <div className="h-5 bg-white/5 rounded-lg w-3/4" />
        <div className="h-4 bg-white/4 rounded-lg w-1/2" />
      </div>
      <div className="flex items-center gap-3 py-4 border-y border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/5" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded w-32" />
          <div className="h-3 bg-white/4 rounded w-20" />
        </div>
        <div className="h-8 w-28 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
function SuggestedSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2.5">
          <div
            className="w-40 shrink-0 rounded-lg bg-white/5"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-3/4" />
            <div className="h-2.5 bg-white/4 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
function CommentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/5 rounded w-28" />
            <div className="h-3 bg-white/4 rounded w-full" />
            <div className="h-3 bg-white/4 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Insights Panel
// ─────────────────────────────────────────────────────────────────────────────
function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function AiInsights({ video, videoRef }) {
  const [activeTab, setActiveTab] = useState("summary");
  const { aiStatus, aiSummary, aiChapters } = video;

  const handleChapterClick = (timeStr) => {
    const seconds = timeToSeconds(timeStr);
    if (videoRef?.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (aiStatus === "PROCESSING" || aiStatus === "PENDING") {
    return (
      <div className="relative overflow-hidden bg-white/2 border border-white/6 rounded-2xl p-5">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Loader2 size={15} className="text-indigo-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              AI is analyzing this video
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Summary and chapters will appear shortly…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (aiStatus === "FAILED") {
    return (
      <div className="flex items-center gap-3 bg-white/2 border border-white/6 rounded-2xl p-5">
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <AlertCircle size={15} className="text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-300">
            AI analysis unavailable
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Could not generate insights for this video.
          </p>
        </div>
      </div>
    );
  }

  if (
    aiStatus !== "COMPLETED" ||
    (!aiSummary && (!aiChapters || aiChapters.length === 0))
  )
    return null;

  return (
    <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
          <Sparkles size={13} className="text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-slate-200">
          AI Insights
        </span>
        <span className="ml-auto text-[10px] font-medium text-indigo-400/70 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full">
          Powered by Gemini
        </span>
      </div>

      {aiSummary && aiChapters?.length > 0 && (
        <div className="flex border-b border-white/5 px-5">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 mr-5 transition-all duration-150 ${activeTab === "summary" ? "border-indigo-500 text-indigo-300" : "border-transparent text-slate-500 hover:text-slate-400"}`}
          >
            <BookOpen size={12} />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className={`flex items-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-all duration-150 ${activeTab === "chapters" ? "border-indigo-500 text-indigo-300" : "border-transparent text-slate-500 hover:text-slate-400"}`}
          >
            <ListVideo size={12} />
            Chapters
            <span className="ml-1 text-[10px] bg-white/8 text-slate-500 px-1.5 py-0.5 rounded-full">
              {aiChapters.length}
            </span>
          </button>
        </div>
      )}

      <div className="px-5 py-4">
        {(activeTab === "summary" || !aiChapters?.length) && aiSummary && (
          <p className="text-sm text-slate-400 leading-relaxed">{aiSummary}</p>
        )}
        {(activeTab === "chapters" || !aiSummary) && aiChapters?.length > 0 && (
          <div className="space-y-1">
            {aiChapters.map((chapter, i) => (
              <button
                key={i}
                onClick={() => handleChapterClick(chapter.time)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 active:bg-white/8 transition-all duration-150 group"
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs font-medium text-slate-300 group-hover:text-slate-100 transition-colors truncate">
                  {chapter.title}
                </span>
                <span className="shrink-0 flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-400/80 bg-indigo-500/8 border border-indigo-500/15 px-2 py-0.5 rounded-lg group-hover:bg-indigo-500/15 group-hover:text-indigo-300 transition-all">
                  <Clock size={10} strokeWidth={2} />
                  {chapter.time}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG Chat Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${isUser ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-white/5 border border-white/10"}`}
      >
        {isUser ? (
          <User size={13} className="text-indigo-300" />
        ) : (
          <Bot size={13} className="text-slate-400" />
        )}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-indigo-600/25 border border-indigo-500/25 text-slate-200 rounded-tr-sm" : "bg-white/4 border border-white/8 text-slate-300 rounded-tl-sm"}`}
      >
        {text}
      </div>
    </div>
  );
}

function AiChatPanel({ videoId, aiStatus, isAuthenticated }) {
  const [messages, setMessages] = useState([]); // { role: "user"|"model", text: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setError("");

    // Optimistically add user message
    const userMsg = { role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Convert messages to Gemini history format (exclude the last user msg — it's the current question)
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await axios.post(`/api/v2/chat/${videoId}`, {
        message: question,
        history,
      });
      const answer = res.data?.data?.answer ?? "No answer returned.";
      setMessages((prev) => [...prev, { role: "model", text: answer }]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to get an answer. Try again.",
      );
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Don't render if AI isn't ready
  if (aiStatus !== "COMPLETED") return null;

  return (
    <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <Bot size={13} className="text-emerald-400" />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-200">
            Ask this video
          </span>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Ask anything about the content
          </p>
        </div>
        <span className="ml-auto text-[10px] font-medium text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">
          RAG · Gemini
        </span>
      </div>

      {/* Message list */}
      <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
        {messages.length === 0 && (
          <div className="py-6 text-center">
            <Bot size={22} className="text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">
              Ask anything about this video.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[
                "What is this video about?",
                "Key takeaways?",
                "Summarize in one sentence",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/14 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} text={msg.text} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
              <Bot size={13} className="text-slate-400" />
            </div>
            <div className="bg-white/4 border border-white/8 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5">
            <X size={11} />
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-2 border-t border-white/5">
        {!isAuthenticated ? (
          <p className="text-xs text-slate-600 text-center py-2">
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>{" "}
            to chat with this video
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question…"
              maxLength={500}
              disabled={loading}
              className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment Row
// ─────────────────────────────────────────────────────────────────────────────
function CommentRow({ comment, currentUserId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const owner = comment.owner ?? {};
  const initial = owner.username?.[0]?.toUpperCase() || "?";
  const isOwner = currentUserId && owner._id?.toString() === currentUserId;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`/api/v2/comments/c/${comment._id}`);
      onDelete(comment._id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex gap-3 group">
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center mt-0.5">
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-300">
            @{owner.username || "unknown"}
          </span>
          <span className="text-[10px] text-slate-600">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed wrap-break-word">
          {comment.content}
        </p>
      </div>
      {isOwner && (
        <div className="shrink-0 flex items-start pt-0.5">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <span className="text-slate-700">·</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all duration-150 p-1 rounded-lg hover:bg-rose-500/10"
            >
              <Trash2 size={13} strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comments Section
// ─────────────────────────────────────────────────────────────────────────────
function CommentsSection({ videoId, isAuthenticated, currentUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await axios.get(`/api/v2/comments/${videoId}`, {
          params: { page: pageNum, limit: 10 },
        });
        const data = res.data?.data;
        const docs = data?.docs ?? [];
        setComments((prev) => (append ? [...prev, ...docs] : docs));
        setHasNextPage(data?.hasNextPage ?? false);
        setTotalComments(data?.totalDocs ?? 0);
        setPage(pageNum);
      } catch {
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [videoId],
  );

  useEffect(() => {
    if (videoId) fetchComments(1, false);
  }, [videoId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    const optimistic = {
      _id: `temp_${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      owner: {
        _id: currentUser?._id,
        username: currentUser?.username,
        avatar: currentUser?.avatar,
      },
    };
    setComments((prev) => [optimistic, ...prev]);
    setTotalComments((c) => c + 1);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const res = await axios.post(`/api/v2/comments/${videoId}`, {
        content: optimistic.content,
      });
      const real = res.data?.data;
      setComments((prev) =>
        prev.map((c) =>
          c._id === optimistic._id ? { ...real, owner: optimistic.owner } : c,
        ),
      );
    } catch (err) {
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      setTotalComments((c) => Math.max(0, c - 1));
      setContent(optimistic.content);
      setError(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback((commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotalComments((c) => Math.max(0, c - 1));
  }, []);

  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-300">
          {totalComments > 0
            ? `${totalComments.toLocaleString()} Comment${totalComments !== 1 ? "s" : ""}`
            : "Comments"}
        </h3>
      </div>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center mt-1">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={14} className="text-white" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                  handleSubmit(e);
              }}
              placeholder="Add a comment…"
              rows={1}
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200 resize-none overflow-hidden"
            />
            {content.trim() && (
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-600">Ctrl+Enter to post</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContent("");
                      if (textareaRef.current)
                        textareaRef.current.style.height = "auto";
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send size={12} strokeWidth={2} />
                    {submitting ? "Posting…" : "Comment"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/2 border border-white/6">
          <MessageSquare size={14} className="text-slate-600" />
          <p className="text-sm text-slate-500">
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5">
          <X size={12} /> {error}
        </p>
      )}
      {loading ? (
        <CommentSkeleton />
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare size={24} className="text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No comments yet.</p>
          <p className="text-xs text-slate-700 mt-0.5">
            Be the first to comment.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentRow
              key={comment._id}
              comment={comment}
              currentUserId={currentUser?._id}
              onDelete={handleDelete}
            />
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchComments(page + 1, true)}
              disabled={loadingMore}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 border border-white/6 hover:border-white/12 bg-white/2 hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more comments"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested Card
// ─────────────────────────────────────────────────────────────────────────────
function SuggestedCard({ video }) {
  if (!video) return null;
  const { _id, thumbnail, title, duration, views, createdAt, owner } = video;
  return (
    <Link
      to={`/watch/${_id}`}
      className="flex gap-2.5 group rounded-xl p-1.5 -mx-1.5 hover:bg-white/4 transition-colors duration-150"
    >
      <div
        className="relative shrink-0 w-40 rounded-lg overflow-hidden bg-[#1a1a24]"
        style={{ aspectRatio: "16/9" }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-950/60 to-[#1a1a24]" />
        )}
        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-semibold text-white bg-black/75 tabular-nums">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
        <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500">{owner?.username}</p>
        <p className="text-[11px] text-slate-600">
          {formatViews(views)} · {timeAgo(createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────
const lsGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("lsSet error:", e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Watch Component
// ─────────────────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5000; // re-fetch video every 5s while AI is processing

export default function Watch() {
  const { videoId } = useParams();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const currentUser = useSelector((s) => s.auth.userData);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [descExpanded, setDescExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const videoRef = useRef(null);
  const pollRef = useRef(null); // holds the setInterval id
  const showToast = useCallback(
    (message, type = "info") => setToast({ message, type }),
    [],
  );

  // ── Fetch video ────────────────────────────────────────────────────────────
  const fetchVideo = useCallback(
    async ({ isInitial = false } = {}) => {
      if (isInitial) {
        setLoading(true);
        setError(null);
        setVideo(null);
        setDescExpanded(false);
        setLiked(false);
        setSubscribed(false);
      }
      try {
        const res = await axios.get(`/api/v2/videos/${videoId}`);
        const data = Array.isArray(res.data?.data)
          ? res.data.data[0]
          : res.data?.data;
        if (!data) throw new Error("Video not found");

        const owner = Array.isArray(data.owner) ? data.owner[0] : data.owner;
        const normalizedVideo = { ...data, owner };

        setVideo(normalizedVideo);

        if (isInitial) {
          setLikesCount(data.likesCount ?? 0);
          setSubscribersCount(owner?.subscribersCount ?? 0);
          if (isAuthenticated && currentUser?._id && owner?._id)
            setSubscribed(
              lsGet(`subbed_${currentUser._id}_${owner._id}`, false),
            );
          if (isAuthenticated) {
            try {
              const likeRes = await axios.get("/api/v2/likes/videos");
              const likedList = likeRes.data?.data ?? [];
              const isLiked = likedList.some(
                (item) => item?.video?._id?.toString() === videoId,
              );
              setLiked(isLiked);
              if (currentUser?._id)
                lsSet(`liked_${currentUser._id}_${videoId}`, isLiked);
            } catch {
              if (currentUser?._id)
                setLiked(lsGet(`liked_${currentUser._id}_${videoId}`, false));
            }
          }
        }

        // Stop polling once AI reaches a terminal state
        return normalizedVideo.aiStatus;
      } catch (err) {
        if (isInitial)
          setError(
            err.response?.data?.message || err.message || "Video not found.",
          );
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [videoId, isAuthenticated, currentUser?._id],
  );

  // ── Initial fetch + start polling if AI is still processing ───────────────
  useEffect(() => {
    if (!videoId) return;

    const init = async () => {
      const aiStatus = await fetchVideo({ isInitial: true });

      // Start polling only if AI is not yet done
      if (aiStatus === "PROCESSING" || aiStatus === "PENDING") {
        pollRef.current = setInterval(async () => {
          const status = await fetchVideo({ isInitial: false });
          // Stop polling when AI reaches a terminal state
          if (status === "COMPLETED" || status === "FAILED") {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, POLL_INTERVAL_MS);
      }
    };

    init();

    return () => {
      // Always clean up the interval when videoId changes or component unmounts
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [videoId, fetchVideo]);

  useEffect(() => {
    if (!videoId) return;
    axios.post(`/api/v2/videos/${videoId}/view`).catch(() => {});
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    const fetchSuggested = async () => {
      setSuggestedLoading(true);
      try {
        const res = await axios.get("/api/v2/videos", {
          params: { page: 1, limit: 10, sortBy: "views", sortType: "desc" },
        });
        setSuggested(
          (res.data?.data?.docs ?? []).filter((v) => v._id !== videoId),
        );
      } catch {
        setSuggested([]);
      } finally {
        setSuggestedLoading(false);
      }
    };
    fetchSuggested();
  }, [videoId]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      showToast("Sign in to like videos", "info");
      return;
    }
    if (likeLoading) return;
    const prevLiked = liked;
    const prevCount = likesCount;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
    setLikeLoading(true);
    try {
      const res = await axios.post(`/api/v2/likes/toggle/v/${videoId}`);
      const data = res.data?.data ?? {};
      const isNowLiked = data.VideoLiked ?? data.videoLiked ?? newLiked;
      setLiked(isNowLiked);
      if (isNowLiked !== newLiked)
        setLikesCount((c) => (isNowLiked ? c + 1 : Math.max(0, c - 1)));
      if (currentUser?._id)
        lsSet(`liked_${currentUser._id}_${videoId}`, isNowLiked);
      showToast(
        isNowLiked ? "Added to liked videos" : "Removed from liked videos",
        "success",
      );
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(
        err.response?.data?.message || "Failed to update like.",
        "error",
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      showToast("Sign in to subscribe", "info");
      return;
    }
    if (subLoading || !video?.owner?._id) return;
    const prevSub = subscribed;
    const prevCount = subscribersCount;
    const newSub = !subscribed;
    setSubscribed(newSub);
    setSubscribersCount((c) => (newSub ? c + 1 : Math.max(0, c - 1)));
    setSubLoading(true);
    try {
      const res = await axios.post(
        `/api/v2/subscriptions/c/${video.owner._id}`,
      );
      const isNowSubbed = res.data?.data?.subscribed ?? newSub;
      setSubscribed(isNowSubbed);
      if (isNowSubbed !== newSub)
        setSubscribersCount((c) => (isNowSubbed ? c + 1 : Math.max(0, c - 1)));
      if (currentUser?._id)
        lsSet(`subbed_${currentUser._id}_${video.owner._id}`, isNowSubbed);
      showToast(
        isNowSubbed
          ? `Subscribed to ${video.owner.username}`
          : `Unsubscribed from ${video.owner.username}`,
        "success",
      );
    } catch (err) {
      setSubscribed(prevSub);
      setSubscribersCount(prevCount);
      showToast(
        err.response?.data?.message || "Failed to update subscription.",
        "error",
      );
    } finally {
      setSubLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Could not copy link", "error");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm">{error}</p>
          <Link
            to="/"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const ownerInitial = video?.owner?.username?.[0]?.toUpperCase() || "?";
  const descLines = video?.description?.split("\n") ?? [];
  const isLongDesc = (video?.description?.length ?? 0) > 200;

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showSaveModal && isAuthenticated && (
        <SaveToPlaylistModal
          videoId={videoId}
          currentUserId={currentUser?._id}
          onClose={() => setShowSaveModal(false)}
        />
      )}
      <div className="max-w-350 mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {loading ? (
              <PlayerSkeleton />
            ) : (
              video && (
                <>
                  {/* Player */}
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <video
                      ref={videoRef}
                      key={video.videoFile}
                      src={video.videoFile}
                      poster={video.thumbnail}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title + meta */}
                  <div className="space-y-1.5 pt-1">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                      {video.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Eye size={12} /> {formatViews(video.views)}
                      </span>
                      <span className="opacity-30">·</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : ""}
                      </span>
                      {video.createdAt && (
                        <>
                          <span className="opacity-30">·</span>
                          <span className="text-slate-600">
                            {timeAgo(video.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleToggleLike}
                      disabled={likeLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-60 active:scale-95 ${liked ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300" : "bg-white/4 border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/[0.14]"}`}
                    >
                      <ThumbsUp
                        size={15}
                        strokeWidth={2}
                        className={liked ? "fill-indigo-400/40" : ""}
                      />
                      {likesCount > 0
                        ? likesCount.toLocaleString()
                        : liked
                          ? "Liked"
                          : "Like"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/4 border border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/[0.14] transition-all duration-200 active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} strokeWidth={1.75} />
                          Share
                        </>
                      )}
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/4 border border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/[0.14] transition-all duration-200 active:scale-95"
                      >
                        <Bookmark size={14} strokeWidth={1.75} />
                        Save
                      </button>
                    )}
                  </div>

                  {/* Channel block */}
                  <div className="flex items-center gap-3 py-4 border-y border-white/6">
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="shrink-0"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-indigo-500/40 transition-all duration-200 bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        {video.owner?.avatar ? (
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold select-none">
                            {ownerInitial}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/channel/${video.owner?.username}`}>
                        <p className="text-sm font-semibold text-slate-100 hover:text-white transition-colors truncate">
                          {video.owner?.fullName ||
                            video.owner?.username ||
                            "Unknown"}
                        </p>
                      </Link>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                        {video.owner?.username && `@${video.owner.username}`}
                        {subscribersCount > 0 && (
                          <span>
                            · {subscribersCount.toLocaleString()} subscriber
                            {subscribersCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleSubscribe}
                      disabled={subLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 active:scale-95 ${subscribed ? "bg-white/[0.07] border border-white/12 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400" : "bg-white text-[#0a0a0f] hover:bg-slate-100"}`}
                    >
                      {subscribed ? (
                        <>
                          <BellOff size={14} strokeWidth={2} />
                          Unsubscribe
                        </>
                      ) : (
                        <>
                          <Bell size={14} strokeWidth={2} />
                          Subscribe
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                    <div
                      className={`text-sm text-slate-400 leading-relaxed space-y-1 overflow-hidden transition-all duration-300 ${descExpanded || !isLongDesc ? "max-h-500" : "max-h-20"}`}
                    >
                      {descLines.length > 0 ? (
                        descLines.map((line, i) => (
                          <p key={i}>{line || <br />}</p>
                        ))
                      ) : (
                        <p className="text-slate-600 italic text-xs">
                          No description.
                        </p>
                      )}
                    </div>
                    {isLongDesc && (
                      <button
                        onClick={() => setDescExpanded((v) => !v)}
                        className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {descExpanded ? (
                          <>
                            <ChevronUp size={13} />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* ── AI Insights ── */}
                  <AiInsights video={video} videoRef={videoRef} />

                  {/* ── AI Chat ── */}
                  <AiChatPanel
                    videoId={videoId}
                    aiStatus={video.aiStatus}
                    isAuthenticated={isAuthenticated}
                  />

                  {/* ── Comments ── */}
                  <div className="bg-white/2 border border-white/6 rounded-2xl p-5">
                    <CommentsSection
                      videoId={videoId}
                      isAuthenticated={isAuthenticated}
                      currentUser={currentUser}
                    />
                  </div>
                </>
              )
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="xl:w-90 shrink-0 space-y-3">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Up Next
            </h2>
            {suggestedLoading ? (
              <SuggestedSkeleton />
            ) : suggested.length > 0 ? (
              <div className="space-y-1">
                {suggested.map((v) => (
                  <SuggestedCard key={v._id} video={v} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 py-4">
                No suggestions available.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
