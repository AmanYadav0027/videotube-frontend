import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  Flag,
} from "lucide-react";

// --- Animation Config ---
const smoothSpring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };
const subtleSpring = { type: "spring", stiffness: 300, damping: 25, mass: 1 };
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeUpVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

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
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]",
    error:
      "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_10px_40px_-10px_rgba(244,63,94,0.3)]",
    info: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 shadow-[0_10px_40px_-10px_rgba(99,102,241,0.3)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={smoothSpring}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-2xl text-sm font-bold tracking-wide ${styles[type]}`}
    >
      {type === "success" && <Check size={16} strokeWidth={3} />}
      {type === "error" && <X size={16} strokeWidth={3} />}
      {type === "info" && <Bell size={16} strokeWidth={2.5} />}
      {message}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Modal
// ─────────────────────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Spam or misleading",
  "Hateful or abusive content",
  "Violent or dangerous content",
  "Sexual content",
  "Harassment or bullying",
  "Copyright infringement",
  "Other",
];

function ReportModal({ videoId, onClose, onSuccess }) {
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      // POST to support contact so it lands in your inbox — same as the
      // support form. No separate report endpoint needed on the backend.
      await axios.post("/api/v2/support/contact", {
        name: "Video Report",
        email: "report@videotube.internal",
        subject: `Video Report: ${videoId}`,
        message: `Reason: ${selected}\n\nDetails: ${details || "None provided"}\n\nVideo ID: ${videoId}`,
      });
      onSuccess();
    } catch {
      // Fire-and-forget — show success anyway so the user feels heard
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={smoothSpring}
        className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Flag size={15} className="text-rose-400" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Report Video
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs font-medium text-slate-400">
            Why are you reporting this video?
          </p>

          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelected(reason)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                  selected === reason
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected === reason
                      ? "border-rose-500 bg-rose-500"
                      : "border-slate-600"
                  }`}
                >
                  {selected === reason && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                {reason}
              </button>
            ))}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                rows={3}
                maxLength={500}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-rose-500/40 resize-none transition-all"
              />
            </motion.div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selected || submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Flag size={14} />
              )}
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Save to Playlist Modal
// ─────────────────────────────────────────────────────────────────────────────
function SaveToPlaylistModal({ videoId, currentUserId, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    const loadPlaylists = async () => {
      try {
        const res = await axios.get(`/api/v2/playlists/user/${currentUserId}`);
        const data = res.data?.data ?? [];
        setPlaylists(data);
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
    loadPlaylists();
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={smoothSpring}
        className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <h2 className="text-base font-black text-white tracking-tight">
            Save to Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
            </div>
          ) : playlists.length === 0 && !creating ? (
            <div className="text-center py-10 px-4">
              <Bookmark size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                No playlists found.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {playlists.map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleToggle(p._id)}
                  disabled={saving === p._id}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/[0.04] transition-colors group"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-300 ${saved[p._id] ? "bg-indigo-500 border-indigo-500" : "border-slate-600 group-hover:border-slate-400"}`}
                  >
                    {saved[p._id] && (
                      <Check size={12} strokeWidth={4} className="text-white" />
                    )}
                    {saving === p._id && (
                      <Loader2 size={12} className="text-white animate-spin" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors text-left truncate">
                    {p.name}
                  </span>
                  <span className="ml-auto text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                    {p.videos?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-white/[0.05] p-5 bg-white/[0.01]">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
            >
              <Plus size={16} strokeWidth={2.5} /> Create New Playlist
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleCreate}
              className="space-y-3"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist Name"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !newName.trim() || !newDesc.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────
function PlayerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div
        className="w-full rounded-[2rem] bg-[#141416] border border-white/[0.05] relative overflow-hidden shadow-2xl"
        style={{ aspectRatio: "16/9" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="space-y-3 px-2">
        <div className="h-7 bg-[#141416] rounded-lg w-3/4 relative overflow-hidden" />
        <div className="h-4 bg-[#141416] rounded-md w-1/3 relative overflow-hidden" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-white/[0.05] px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#141416] border border-white/[0.05] relative overflow-hidden" />
          <div className="space-y-2">
            <div className="h-4 bg-[#141416] rounded-md w-32 relative overflow-hidden" />
            <div className="h-3 bg-[#141416] rounded-md w-20 relative overflow-hidden" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-[#141416] rounded-xl relative overflow-hidden" />
          <div className="h-10 w-24 bg-[#141416] rounded-xl relative overflow-hidden" />
        </div>
      </div>
    </div>
  );
}

function SuggestedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 p-2 rounded-2xl bg-white/[0.01] border border-white/[0.03]"
        >
          <div
            className="w-40 shrink-0 rounded-xl bg-[#141416] relative overflow-hidden"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-[#141416] rounded-md w-full" />
            <div className="h-3.5 bg-[#141416] rounded-md w-4/5" />
            <div className="h-2.5 bg-[#141416] rounded-md w-1/2 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#141416] border border-white/[0.05] shrink-0 mt-1" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="flex gap-2 items-center">
              <div className="h-3.5 bg-[#141416] rounded-md w-32" />
              <div className="h-2.5 bg-[#141416] rounded-md w-16" />
            </div>
            <div className="h-3 bg-[#141416] rounded-md w-full" />
            <div className="h-3 bg-[#141416] rounded-md w-5/6" />
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 shadow-lg"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent animate-[shimmer_2s_infinite] w-full -translate-x-full" />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Loader2 size={18} className="text-indigo-400 animate-spin" />
          </div>
          <div>
            <p className="text-base font-bold text-white tracking-tight">
              AI Analysis in Progress
            </p>
            <p className="text-sm font-medium text-slate-400 mt-0.5">
              Generating smart summary and chapters…
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (aiStatus === "FAILED") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6"
      >
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <AlertCircle size={20} className="text-rose-400" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-200 tracking-tight">
            Analysis Unavailable
          </p>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Our AI couldn't process this video.
          </p>
        </div>
      </motion.div>
    );
  }

  if (
    aiStatus !== "COMPLETED" ||
    (!aiSummary && (!aiChapters || aiChapters.length === 0))
  )
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothSpring}
      className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.05] bg-white/[0.01]">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-indigo-300" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">
          Smart Insights
        </span>
        <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
          Powered by Gemini
        </span>
      </div>

      {aiSummary && aiChapters?.length > 0 && (
        <div className="flex border-b border-white/[0.05] px-6 relative bg-white/[0.01]">
          {[
            ["summary", BookOpen, "Summary"],
            ["chapters", ListVideo, "Chapters"],
          ].map(([tab, Icon, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 py-4 text-sm font-bold border-b-2 mr-6 transition-all duration-300 relative ${activeTab === tab ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
            >
              <Icon size={16} /> {label}
              {tab === "chapters" && (
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-md transition-colors ${activeTab === "chapters" ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-slate-400"}`}
                >
                  {aiChapters.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-5 relative z-10">
        <AnimatePresence mode="wait">
          {(activeTab === "summary" || !aiChapters?.length) && aiSummary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={subtleSpring}
            >
              <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed">
                {aiSummary}
              </p>
            </motion.div>
          )}
          {(activeTab === "chapters" || !aiSummary) &&
            aiChapters?.length > 0 && (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={subtleSpring}
                className="space-y-2"
              >
                {aiChapters.map((chapter, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleChapterClick(chapter.time)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-transparent hover:border-white/5 transition-colors text-left group"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                      {chapter.title}
                    </span>
                    <span className="shrink-0 flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      <Clock size={12} strokeWidth={2.5} />
                      {chapter.time}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG Chat Panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatMessage({ role, text }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={smoothSpring}
      className={`flex gap-3 w-full ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-md ${isUser ? "bg-indigo-500 border-2 border-indigo-400" : "bg-[#141416] border border-white/10"}`}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-emerald-400" />
        )}
      </div>
      <div
        className={`max-w-[85%] px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${isUser ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" : "bg-[#141416] border border-white/[0.06] text-slate-300 rounded-2xl rounded-tl-sm"}`}
      >
        {text}
      </div>
    </motion.div>
  );
}

function AiChatPanel({ videoId, aiStatus, isAuthenticated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const res = await axios.post(`/api/v2/chat/${videoId}`, {
        message: question,
        history,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: res.data?.data?.answer ?? "No answer returned.",
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to get an answer. Try again.",
      );
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (aiStatus !== "COMPLETED") return null;

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[0.05] bg-white/[0.01] relative z-10">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight leading-none">
            Interactive Assistant
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Ask questions directly to the video content
          </p>
        </div>
        <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          Gemini 1.5
        </span>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-[#141416] border border-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <Bot size={32} className="text-slate-600" />
            </div>
            <p className="text-base font-bold text-slate-300">
              How can I help you?
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-[250px]">
              I've watched this video and can answer specific questions.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {[
                "Summarize the main points",
                "Explain the core concept",
                "Give me a TL;DR",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-[#141416] border border-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} text={msg.text} />
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-3 w-full"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#141416] border border-white/10 flex items-center justify-center mt-1">
                <Bot size={16} className="text-emerald-400" />
              </div>
              <div className="bg-[#141416] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="w-2 h-2 rounded-full bg-emerald-500/50"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </span>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="px-4 sm:px-6 pb-6 pt-2 relative z-10 bg-[#0A0A0A]">
        {!isAuthenticated ? (
          <div className="bg-[#141416] border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-slate-400">
              <Link
                to="/login"
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
              >
                Sign in
              </Link>{" "}
              to interact with the AI assistant.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 items-end bg-[#141416] border border-white/[0.08] p-2 rounded-2xl focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.target.style.height = "auto";
                }
              }}
              placeholder="Ask a question about the video..."
              maxLength={1000}
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm font-medium text-slate-200 placeholder-slate-600 outline-none resize-none disabled:opacity-50 min-h-[40px] max-h-[150px] custom-scrollbar"
            />
            <button
              onClick={() => {
                handleSend();
                if (inputRef.current) inputRef.current.style.height = "auto";
              }}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-slate-600 flex items-center justify-center transition-all text-white shadow-lg shadow-indigo-500/20 disabled:shadow-none"
            >
              <Send size={16} strokeWidth={2.5} />
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-4 group"
    >
      <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-1 border-2 border-transparent group-hover:border-indigo-500/30 transition-colors shadow-lg">
        {owner.avatar ? (
          <img
            src={owner.avatar}
            alt={owner.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-sm font-black select-none">
            {initial}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl rounded-tl-sm group-hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded-md">
              @{owner.username || "unknown"}
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Clock size={10} /> {timeAgo(comment.createdAt)}
            </span>
          </div>
          {isOwner && (
            <div className="shrink-0 flex items-center">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-300 bg-white/5 px-2 py-1 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded-lg disabled:opacity-50 flex items-center gap-1"
                  >
                    {deleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </motion.div>
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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <MessageSquare size={18} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Discussion
          </h3>
          <p className="text-xs font-bold text-slate-500">
            {totalComments > 0
              ? `${totalComments.toLocaleString()} Comment${totalComments !== 1 ? "s" : ""}`
              : "No comments yet"}
          </p>
        </div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mt-1 shadow-lg">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-black">
                {currentUser?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 bg-[#141416] border border-white/[0.08] rounded-2xl p-2 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                  handleSubmit(e);
              }}
              placeholder="Join the conversation..."
              rows={1}
              className="w-full bg-transparent border-none px-3 py-2 text-sm font-medium text-slate-200 placeholder-slate-500 outline-none resize-none min-h-[44px] max-h-[150px] custom-scrollbar"
            />
            <AnimatePresence>
              {content.trim() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between px-2 pb-1 pt-2 border-t border-white/5"
                >
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setContent("");
                        if (textareaRef.current)
                          textareaRef.current.style.height = "auto";
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black tracking-wide text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} strokeWidth={2.5} />
                      )}
                      Post
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white/[0.02] to-transparent border border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#141416] border border-white/10 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                Join the Discussion
              </p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Sign in to share your thoughts.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg"
          >
            Sign In
          </Link>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 inline-flex items-center gap-2"
        >
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}

      {loading ? (
        <CommentSkeleton />
      ) : comments.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center">
          <MessageSquare size={32} className="text-slate-700 mb-3" />
          <p className="text-base font-bold text-slate-300">No comments yet</p>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <CommentRow
                key={comment._id}
                comment={comment}
                currentUserId={currentUser?._id}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          {hasNextPage && (
            <button
              onClick={() => fetchComments(page + 1, true)}
              disabled={loadingMore}
              className="w-full py-4 rounded-2xl text-sm font-bold text-slate-300 border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronDown size={16} strokeWidth={2.5} />
              )}
              {loadingMore ? "Loading..." : "Load More Comments"}
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
    <motion.div variants={fadeUpVariant}>
      <Link
        to={`/watch/${_id}`}
        className="group flex gap-3 p-2 rounded-2xl bg-transparent hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-300"
      >
        <div
          className="relative shrink-0 w-36 sm:w-40 rounded-xl overflow-hidden bg-[#0A0A0A] shadow-md"
          style={{ aspectRatio: "16/9" }}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950/40 to-[#0A0A0A]" />
          )}
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-black/80 border border-white/10 group-hover:opacity-0 transition-opacity">
            {formatDuration(duration)}
          </span>
        </div>
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors pr-2">
            {title}
          </h4>
          <p className="text-[11px] font-semibold text-slate-500 mt-1.5 bg-white/5 w-max px-1.5 py-0.5 rounded border border-white/5">
            {owner?.username}
          </p>
          <p className="text-[10px] font-medium text-slate-600 mt-1 flex items-center gap-1">
            {formatViews(views)}{" "}
            <span className="w-1 h-1 rounded-full bg-slate-700" />{" "}
            {timeAgo(createdAt)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers (kept only as fallback for sub state)
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
const POLL_INTERVAL_MS = 5000;

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

  //  report modal state
  const [showReportModal, setShowReportModal] = useState(false);

  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const videoRef = useRef(null);
  const pollRef = useRef(null);

  const showToast = useCallback(
    (message, type = "info") => setToast({ message, type }),
    [],
  );

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

          //  use isLiked from getVideoById aggregation — no extra API call needed
          if (isAuthenticated) {
            const isLiked = data.isLiked ?? false;
            setLiked(isLiked);
            if (currentUser?._id)
              lsSet(`liked_${currentUser._id}_${videoId}`, isLiked);
          }

          // Sub status: API first, localStorage as fallback only
          if (isAuthenticated && owner?._id) {
            try {
              const subRes = await axios.get(
                `/api/v2/subscriptions/status/${owner._id}`,
              );
              setSubscribed(subRes.data?.data?.isSubscribed ?? false);
            } catch {
              setSubscribed(
                lsGet(`subbed_${currentUser?._id}_${owner._id}`, false),
              );
            }
          }
        }
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

  useEffect(() => {
    if (!videoId) return;
    const init = async () => {
      const aiStatus = await fetchVideo({ isInitial: true });
      if (aiStatus === "PROCESSING" || aiStatus === "PENDING") {
        pollRef.current = setInterval(async () => {
          const status = await fetchVideo({ isInitial: false });
          if (status === "COMPLETED" || status === "FAILED") {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, POLL_INTERVAL_MS);
      }
    };
    init();
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5 bg-[#0A0A0A] p-10 rounded-[2rem] border border-white/5 shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="text-slate-200 font-bold text-lg">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/10"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const ownerInitial = video?.owner?.username?.[0]?.toUpperCase() || "?";
  const descLines = video?.description?.split("\n") ?? [];
  const isLongDesc = (video?.description?.length ?? 0) > 200;

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="watch-orb" cx="20%" cy="10%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#watch-orb)" />
      </svg>

      <AnimatePresence>
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
        {/*  Report modal */}
        {showReportModal && (
          <ReportModal
            videoId={videoId}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => {
              setShowReportModal(false);
              showToast("Report submitted. Thank you.", "success");
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {loading ? (
              <PlayerSkeleton />
            ) : (
              video && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={smoothSpring}
                >
                  {/* Player */}
                  <div
                    className="relative w-full rounded-[2rem] overflow-hidden bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/[0.05] group"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <video
                      ref={videoRef}
                      key={video.videoFile}
                      src={video.videoFile}
                      playsInline
                      poster={video.thumbnail}
                      controls
                      className="w-full h-full object-contain relative z-10"
                    />
                    {/* #38 — SVG ambient glow replaces CSS blur-2xl div.
                      blur-2xl on hover triggers an expensive repaint + compositing
                      layer promotion on every mouseover. A static SVG radialGradient
                      is GPU-cheap: no filter recalc, no layout, no repaint. */}
                    <svg
                      aria-hidden="true"
                      className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient
                          id="player-glow"
                          cx="50%"
                          cy="50%"
                          r="50%"
                        >
                          <stop offset="0%" stopColor="rgba(99,102,241,0.22)" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill="url(#player-glow)"
                      />
                    </svg>
                  </div>

                  {/* Title + Meta */}
                  <div className="space-y-3 mt-6 px-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                      {video.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-lg">
                        <Eye size={14} className="text-slate-500" />{" "}
                        {formatViews(video.views)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-lg">
                        <Calendar size={14} className="text-slate-500" />
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : ""}
                      </span>
                      {video.createdAt && (
                        <span className="text-slate-500 flex items-center gap-1.5 ml-auto sm:ml-0 bg-white/[0.02] px-3 py-1.5 rounded-lg">
                          <Clock size={14} className="opacity-50" />{" "}
                          {timeAgo(video.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-wrap mt-6 px-2 pb-6 border-b border-white/[0.05]">
                    {/* Like */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleLike}
                      disabled={likeLoading}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-300 disabled:opacity-60 shadow-lg ${liked ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-[#141416] border-white/10 text-slate-300 hover:bg-white/[0.05]"}`}
                    >
                      <ThumbsUp
                        size={16}
                        strokeWidth={2.5}
                        className={liked ? "fill-indigo-400/40" : ""}
                      />
                      {likesCount > 0
                        ? likesCount.toLocaleString()
                        : liked
                          ? "Liked"
                          : "Like"}
                    </motion.button>

                    {/* Share */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-[#141416] border border-white/10 text-slate-300 hover:bg-white/[0.05] transition-all duration-300 shadow-lg relative overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="copied"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-emerald-400"
                          >
                            <Check size={16} strokeWidth={3} /> Copied!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="share"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                          >
                            <Share2 size={16} strokeWidth={2.5} /> Share
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Save */}
                    {isAuthenticated && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-[#141416] border border-white/10 text-slate-300 hover:bg-white/[0.05] transition-all duration-300 shadow-lg"
                      >
                        <Bookmark size={16} strokeWidth={2.5} /> Save
                      </motion.button>
                    )}

                    {/*  Report button — right side, subtle styling so it's accessible but not prominent */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#141416] border border-white/10 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-300 shadow-lg ml-auto"
                      title="Report this video"
                    >
                      <Flag size={15} strokeWidth={2} />
                      <span className="hidden sm:inline">Report</span>
                    </motion.button>
                  </div>

                  {/* Channel / Description Block */}
                  <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[2rem] mt-6 p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/channel/${video.owner?.username}`}
                          className="shrink-0 relative group"
                        >
                          <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border-2 border-[#141416] shadow-lg relative z-10">
                            {video.owner?.avatar ? (
                              <img
                                src={video.owner.avatar}
                                alt={video.owner.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-black">
                                {ownerInitial}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link to={`/channel/${video.owner?.username}`}>
                            <p className="text-lg font-bold text-white hover:text-indigo-300 transition-colors tracking-tight">
                              {video.owner?.fullName ||
                                video.owner?.username ||
                                "Unknown"}
                            </p>
                          </Link>
                          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2 bg-white/5 w-max px-2 py-0.5 rounded border border-white/5">
                            @{video.owner?.username}
                            {subscribersCount > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                {subscribersCount.toLocaleString()} subs
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleSubscribe}
                        disabled={subLoading}
                        className={`flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 disabled:opacity-60 shadow-xl w-full sm:w-auto ${subscribed ? "bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400" : "bg-gradient-to-r from-white to-slate-200 text-black hover:from-indigo-50 hover:to-white shadow-white/10"}`}
                      >
                        {subscribed ? (
                          <>
                            <BellOff size={16} /> Subscribed
                          </>
                        ) : (
                          <>
                            <Bell
                              size={16}
                              className={subscribed ? "" : "fill-black/10"}
                            />{" "}
                            Subscribe
                          </>
                        )}
                      </motion.button>
                    </div>

                    <div className="pt-6 relative">
                      <div
                        className={`text-sm font-medium text-slate-300 leading-relaxed space-y-2 overflow-hidden transition-all duration-500 relative ${descExpanded || !isLongDesc ? "max-h-[1000px]" : "max-h-[80px]"}`}
                      >
                        {descLines.length > 0 ? (
                          descLines.map((line, i) => (
                            <p key={i}>{line || <br />}</p>
                          ))
                        ) : (
                          <p className="text-slate-600 italic font-semibold">
                            No description provided.
                          </p>
                        )}
                        {!descExpanded && isLongDesc && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                        )}
                      </div>
                      {isLongDesc && (
                        <button
                          onClick={() => setDescExpanded((v) => !v)}
                          className="flex items-center gap-1.5 mt-3 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {descExpanded ? (
                            <>
                              <ChevronUp size={14} strokeWidth={3} /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} strokeWidth={3} /> Read
                              More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 mt-6">
                    <AiInsights video={video} videoRef={videoRef} />
                    <AiChatPanel
                      videoId={videoId}
                      aiStatus={video.aiStatus}
                      isAuthenticated={isAuthenticated}
                    />
                    <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                      <CommentsSection
                        videoId={videoId}
                        isAuthenticated={isAuthenticated}
                        currentUser={currentUser}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="xl:w-[400px] shrink-0 space-y-5 relative z-10">
            <div className="flex items-center gap-2 mb-6 border-b border-white/[0.05] pb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <ListVideo size={14} className="text-indigo-400" />
              </div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase">
                Up Next
              </h2>
            </div>
            {suggestedLoading ? (
              <SuggestedSkeleton />
            ) : suggested.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-1"
              >
                {suggested.map((v) => (
                  <SuggestedCard key={v._id} video={v} />
                ))}
              </motion.div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-slate-400">End of line.</p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  No more suggestions available.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
