import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
} from "lucide-react";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }) {
  const accents = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/15",
      text: "text-indigo-400",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/15",
      text: "text-violet-400",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/15",
      text: "text-emerald-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/15",
      text: "text-amber-400",
    },
  };
  const a = accents[accent] ?? accents.indigo;

  return (
    <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1.5 tabular-nums">
            {value?.toLocaleString() ?? "—"}
          </p>
        </div>
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${a.bg} ${a.border}`}
        >
          <Icon size={17} className={a.text} strokeWidth={1.75} />
        </span>
      </div>
    </div>
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
            className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 h-24"
          />
        ))}
      </div>
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.05]"
          >
            <div className="w-32 h-[72px] rounded-lg bg-white/[0.05] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/[0.05] rounded w-3/4" />
              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // confirm delete
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, []);

  // Toggle publish status
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
      // silently revert
    } finally {
      setTogglingId(null);
    }
  };

  // Delete video
  const handleDelete = async (videoId) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v2/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setDeleteId(null);
    } catch {
      // show nothing — user can retry
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">
                Creator Dashboard
              </h1>
              <p className="text-xs text-slate-600">Your channel at a glance</p>
            </div>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-95"
          >
            <Upload size={14} /> Upload Video
          </Link>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="text-center space-y-2">
              <AlertTriangle size={24} className="text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>

            {/* ── Videos table ── */}
            <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

              {/* Table header */}
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">
                  Your Videos
                </h2>
                <span className="text-xs text-slate-600">
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                </span>
              </div>

              {videos.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Video size={28} className="text-slate-700 mx-auto" />
                  <p className="text-sm text-slate-500">
                    No videos uploaded yet.
                  </p>
                  <Link
                    to="/upload"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Upload your first video →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Thumbnail */}
                      <Link
                        to={`/watch/${video._id}`}
                        className="flex-shrink-0 relative w-32 rounded-lg overflow-hidden bg-[#1a1a24]"
                        style={{ aspectRatio: "16/9" }}
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={16} className="text-slate-700" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-semibold text-white bg-black/75 tabular-nums">
                          {formatDuration(video.duration)}
                        </span>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link to={`/watch/${video._id}`}>
                          <h3 className="text-sm font-medium text-slate-200 line-clamp-2 hover:text-white transition-colors leading-snug">
                            {video.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span>{formatViews(video.views)}</span>
                          <span>·</span>
                          <span>{timeAgo(video.createdAt)}</span>
                        </div>
                        {/* publish status badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            video.isPublished
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-slate-700/30 border-white/[0.07] text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${video.isPublished ? "bg-emerald-400" : "bg-slate-600"}`}
                          />
                          {video.isPublished ? "Published" : "Private"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {/* Toggle publish */}
                        <button
                          onClick={() =>
                            handleTogglePublish(video._id, video.isPublished)
                          }
                          disabled={togglingId === video._id}
                          title={video.isPublished ? "Make private" : "Publish"}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all disabled:opacity-40"
                        >
                          {video.isPublished ? (
                            <ToggleRight
                              size={16}
                              className="text-emerald-400"
                            />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/edit/${video._id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                          title="Edit video"
                        >
                          <Pencil size={14} />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteId(video._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete video"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Trash2
                    size={20}
                    className="text-rose-400"
                    strokeWidth={1.75}
                  />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Delete video?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This will permanently delete the video and its files from
                    Cloudinary.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
