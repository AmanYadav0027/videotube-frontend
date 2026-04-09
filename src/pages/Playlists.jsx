import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ListVideo,
  Plus,
  Trash2,
  Lock,
  Globe,
  ChevronRight,
  Film,
  X,
  Check,
  Pencil,
  PlayCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function PlaylistSkeleton() {
  return (
    <div className="animate-pulse flex gap-4 p-4 bg-[#0f1117] border border-white/6 rounded-2xl">
      <div className="w-36 h-20 rounded-xl bg-white/6 shrink-0" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="h-3.5 bg-white/6 rounded w-40" />
        <div className="h-3 bg-white/4 rounded w-24" />
        <div className="h-3 bg-white/4 rounded w-16" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Playlist Modal
// ─────────────────────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/v2/playlists", {
        name: name.trim(),
        description: description.trim(),
      });
      onCreate(res.data?.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100">New Playlist</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My playlist"
              maxLength={100}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              maxLength={300}
              rows={3}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5">
              <X size={11} />
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-300 border border-white/8 hover:border-white/14 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Playlist Card — YouTube-style with thumbnail mosaic + actions
// ─────────────────────────────────────────────────────────────────────────────
function PlaylistCard({ playlist, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Build a 2x2 mosaic from the first 4 video thumbnails
  const thumbnails = (playlist.videos || [])
    .slice(0, 4)
    .map((v) => (typeof v === "object" ? v.thumbnail : null))
    .filter(Boolean);

  const videoCount = playlist.videos?.length ?? 0;
  const firstVideoId = playlist.videos?.[0]?._id ?? playlist.videos?.[0];

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`/api/v2/playlists/${playlist._id}`);
      onDelete(playlist._id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (firstVideoId) navigate(`/watch/${firstVideoId}`);
  };

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist._id}`)}
      className="flex gap-4 p-4 bg-[#0f1117] border border-white/6 rounded-2xl hover:border-white/12 hover:bg-[#13141c] transition-all duration-200 cursor-pointer group"
    >
      {/* Thumbnail mosaic */}
      <div className="relative shrink-0 w-36 h-20 rounded-xl overflow-hidden bg-white/4">
        {thumbnails.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-950/60 to-[#1a1a24]">
            <Film size={20} className="text-slate-700" />
          </div>
        ) : thumbnails.length < 4 ? (
          <img
            src={thumbnails[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          // 2x2 grid mosaic
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-px">
            {thumbnails.map((t, i) => (
              <img
                key={i}
                src={t}
                alt=""
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        )}

        {/* Video count overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
            <PlayCircle size={16} />
            {videoCount > 0 ? `Play all` : "Empty"}
          </div>
        </div>

        {/* Count badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-[10px] font-semibold text-white">
          {videoCount} {videoCount === 1 ? "video" : "videos"}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
            {playlist.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {playlist.description || "No description"}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <Globe size={10} />
            Public
          </span>

          {/* Play first video */}
          {firstVideoId && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1 text-[11px] text-indigo-400/70 hover:text-indigo-300 transition-colors"
            >
              <PlayCircle size={11} />
              Play
            </button>
          )}
        </div>
      </div>

      {/* Delete */}
      <div
        className="shrink-0 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors disabled:opacity-50 px-2 py-1"
            >
              {deleting ? "…" : "Delete"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors px-2 py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all duration-150 p-2 rounded-xl hover:bg-rose-500/10"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function Playlists() {
  const currentUser = useSelector((s) => s.auth.userData);

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = "Playlists — MyApp";
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    const fetchPlaylists = async () => {
      try {
        const res = await axios.get(
          `/api/v2/playlists/user/${currentUser._id}`,
        );
        const data = res.data?.data ?? [];
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentUser?._id]);

  const handleCreate = (newPlaylist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const handleDelete = (playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
  };

  return (
    <div className="min-h-full p-4 sm:p-6">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <ListVideo size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">Playlists</h1>
              <p className="text-xs text-slate-600">
                {!loading &&
                  `${playlists.length} playlist${playlists.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200"
          >
            <Plus size={15} strokeWidth={2.5} />
            New playlist
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <PlaylistSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && playlists.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-2">
              <ListVideo size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                No playlists yet
              </p>
              <p className="text-xs text-slate-700">
                Create a playlist to organize your favorite videos.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors block mx-auto mt-2"
              >
                Create your first playlist →
              </button>
            </div>
          </div>
        )}

        {/* Playlist list */}
        {!loading && !error && playlists.length > 0 && (
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
