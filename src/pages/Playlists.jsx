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
  Play,
  Layers,
} from "lucide-react";

function PlaylistSkeleton() {
  return (
    <div className="animate-pulse flex gap-5 p-4 bg-slate-800/20 border border-white/5 rounded-3xl shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      <div className="w-40 h-24 rounded-2xl bg-slate-800/50 shrink-0 border border-white/5" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-4 bg-slate-800/50 rounded-lg w-1/2" />
        <div className="h-3 bg-slate-800/40 rounded-md w-3/4 mt-2" />
        <div className="h-3 bg-slate-800/40 rounded-md w-1/4 mt-4" />
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-[0.95] fade-in duration-300 ease-out">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="p-7 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Layers size={18} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                New Playlist
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 transition-all active:scale-90 p-2 rounded-xl hover:bg-white/5"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-xs font-bold tracking-wide text-slate-400 uppercase transition-colors group-focus-within:text-indigo-400">
                Playlist Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Epic React Tutorials"
                maxLength={100}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:bg-black/40"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold tracking-wide text-slate-400 uppercase transition-colors group-focus-within:text-indigo-400">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this collection about?"
                maxLength={300}
                rows={3}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 hover:bg-black/40 resize-none leading-relaxed"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-in slide-in-from-top-2">
                <X
                  size={14}
                  className="text-rose-400 shrink-0"
                  strokeWidth={3}
                />
                <p className="text-xs font-semibold text-rose-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-100 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !description.trim()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={16} strokeWidth={3} /> Create
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PlaylistCard({ playlist, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      className="group relative flex flex-col sm:flex-row gap-5 p-4 sm:p-5 bg-[#0f1117] border border-white/5 rounded-3xl hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />

      <div className="relative shrink-0 w-full sm:w-44 h-28 rounded-2xl overflow-hidden bg-[#1a1a24] shadow-lg border border-white/5 group-hover:border-white/10 transition-all duration-300">
        {thumbnails.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black transition-transform duration-700 group-hover:scale-110">
            <Film size={24} className="text-slate-700" />
          </div>
        ) : thumbnails.length < 4 ? (
          <img
            src={thumbnails[0]}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[2px] transition-transform duration-700 ease-out group-hover:scale-110">
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

        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-indigo-500/90 flex items-center justify-center pl-1 scale-50 group-hover:scale-100 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_20px_rgba(99,102,241,0.6)]">
            <Play size={18} fill="white" className="text-white" />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 group-hover:opacity-0 transition-opacity duration-200">
          <span className="flex items-center gap-1.5">
            <ListVideo size={10} />
            {videoCount}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-300 transition-colors duration-200 truncate pr-16 sm:pr-24">
          {playlist.name}
        </h3>
        <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
          {playlist.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-slate-600 bg-white/5 px-2 py-1 rounded-md">
            <Globe size={12} />
            Public
          </span>

          {firstVideoId && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition-all active:scale-95"
            >
              <PlayCircle size={12} />
              Play All
            </button>
          )}
        </div>
      </div>

      <div
        className="absolute right-4 top-4 sm:top-1/2 sm:-translate-y-1/2 flex items-center shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="flex items-center gap-2 bg-rose-500/10 p-1.5 rounded-xl border border-rose-500/20 animate-in slide-in-from-right-4 fade-in duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-black/40 px-3 py-2 rounded-lg transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
            >
              {deleting ? "..." : "Delete"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="sm:opacity-0 sm:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-slate-500 hover:text-rose-400 transition-all duration-300 ease-out p-3 rounded-2xl hover:bg-rose-500/10 bg-[#0f1117] sm:bg-transparent border border-white/5 sm:border-transparent active:scale-90"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

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
    <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-[#0a0a0f] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center">
        <div className="w-[800px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -top-40 opacity-50" />
      </div>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#0f1117] p-5 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10 transition-transform duration-500 hover:rotate-6 hover:scale-110">
              <ListVideo size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Your Collections
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {!loading &&
                  `${playlists.length} organized playlist${playlists.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-500/25 group"
          >
            <Plus
              size={18}
              strokeWidth={3}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            Create Playlist
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PlaylistSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[40vh] animate-in zoom-in-95 duration-500">
            <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-3xl flex flex-col items-center">
              <X size={32} className="text-rose-400 mb-3" />
              <p className="text-sm font-bold text-rose-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && playlists.length === 0 && (
          <div className="flex items-center justify-center min-h-[50vh] animate-in zoom-in-95 fade-in duration-500">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <Layers
                  size={32}
                  strokeWidth={1.5}
                  className="text-slate-600 group-hover:text-indigo-400 transition-colors duration-500 relative z-10"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">
                  No playlists yet
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                  Group your favorite videos together to easily share and watch
                  them later.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm hover:bg-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 active:scale-95"
              >
                Create your first playlist <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {!loading && !error && playlists.length > 0 && (
          <div className="space-y-4">
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
