import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListVideo,
  Play,
  Trash2,
  ArrowLeft,
  Film,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

function VideoRow({ video, index, playlistId, onRemove, isOwner }) {
  const [removing, setRemoving] = useState(false);
  const v = video;

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      await axios.patch(`/api/v2/playlists/remove/${v._id}/${playlistId}`);
      onRemove(v._id);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="relative group"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 bg-indigo-500/10 rounded-3xl pointer-events-none" />

      <Link
        to={`/watch/${v._id}`}
        className="relative flex items-center gap-4 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.07] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 z-10 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5"
      >
        {/* Animated Top Line on Hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="shrink-0 w-6 text-sm font-bold text-slate-600 group-hover:text-indigo-400 transition-colors duration-300 text-right pr-1">
          {index + 1}
        </span>

        <div
          className="relative shrink-0 w-36 sm:w-44 rounded-xl overflow-hidden bg-[#1a1a24] shadow-md border border-transparent group-hover:border-white/10 transition-all duration-300"
          style={{ aspectRatio: "16/9" }}
        >
          {v.thumbnail ? (
            <>
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <Film size={20} className="text-slate-700" />
            </div>
          )}

          {/* Play Icon Reveal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-indigo-500/90 backdrop-blur-md flex items-center justify-center pl-0.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
              <Play size={16} fill="white" className="text-white" />
            </div>
          </div>

          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-black/80 backdrop-blur-sm tabular-nums border border-white/10 group-hover:opacity-0 transition-opacity duration-200">
            {formatDuration(v.duration)}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <p className="text-sm sm:text-base font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors duration-300 pr-4">
            {v.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-medium text-slate-500">
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 group-hover:border-indigo-500/20 group-hover:text-indigo-300 transition-colors duration-300">
              {v.owner?.username}
            </span>
            <span className="flex items-center gap-1.5">
              {formatViews(v.views)} views
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              {timeAgo(v.createdAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="shrink-0 flex items-center pr-2">
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-300 disabled:opacity-50 active:scale-90 shadow-lg"
            >
              {removing ? (
                <Loader2 size={16} className="animate-spin text-rose-400" />
              ) : (
                <Trash2 size={16} strokeWidth={2} />
              )}
            </button>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.userData);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/v2/playlists/${playlistId}`);
        setPlaylist(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || "Playlist not found.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [playlistId]);

  const handleRemove = (videoId) => {
    setPlaylist((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v._id !== videoId),
    }));
  };

  const isOwner = playlist?.owner?.toString() === currentUser?._id?.toString();
  const firstVideoId = playlist?.videos?.[0]?._id;

  if (loading)
    return (
      <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-5 bg-slate-800/40 rounded w-32 border border-white/5 mb-8" />

          <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex gap-5 items-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-white/5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-slate-800/50 rounded-md w-1/2 border border-white/5" />
                  <div className="h-4 bg-slate-800/40 rounded-md w-32 border border-white/5" />
                </div>
              </div>
              <div className="w-32 h-11 rounded-xl bg-slate-800/40 border border-white/5 shrink-0" />
            </div>
          </div>

          <div className="space-y-3 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.07]"
              >
                <div className="w-6 shrink-0 flex justify-end">
                  <div className="w-2 h-4 rounded bg-slate-800/40" />
                </div>
                <div className="w-36 sm:w-44 h-24 bg-slate-800/50 rounded-xl shrink-0 border border-white/5" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 bg-slate-800/50 rounded-md w-3/4 border border-white/5" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-slate-800/40 rounded-md w-16 border border-white/5" />
                    <div className="h-3 bg-slate-800/40 rounded-md w-24 border border-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden flex items-center justify-center">
        <div className="animate-in zoom-in-95 duration-300 text-center space-y-4 p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 max-w-sm w-full">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-rose-500/20">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <p className="text-sm font-bold text-slate-200">{error}</p>
          <button
            onClick={() => navigate("/playlists")}
            className="inline-flex items-center justify-center gap-2 w-full text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl transition-all active:scale-95 mt-2"
          >
            <ArrowLeft size={14} />
            Back to playlists
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <button
          onClick={() => navigate("/playlists")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors mb-6 w-max group"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Library
        </button>

        <div className="mb-8 bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 relative overflow-hidden group">
          {/* Animated Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative shadow-lg shadow-indigo-500/5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                  <ListVideo size={28} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight transition-colors group-hover:text-white">
                  {playlist?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold text-slate-400">
                    {playlist?.videos?.length ?? 0} Video
                    {playlist?.videos?.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    Created by
                    <span className="text-slate-300">
                      {playlist?.owner?.username || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {firstVideoId && (
              <div className="w-full sm:w-auto">
                <Link
                  to={`/watch/${firstVideoId}`}
                  className="group/btn relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95 w-full hover:shadow-indigo-500/40 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Play size={16} className="fill-current" />
                  Play All
                </Link>
              </div>
            )}
          </div>

          {playlist?.description && (
            <div className="mt-6 pt-6 border-t border-white/[0.05] relative z-10">
              <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-3xl">
                {playlist.description}
              </p>
            </div>
          )}
        </div>

        {playlist?.videos?.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-4 p-8 bg-[#0f1117] border border-white/[0.07] rounded-2xl max-w-md w-full shadow-xl">
              <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto shadow-inner">
                <Film size={32} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-200 tracking-tight">
                  Empty Playlist
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                  Start adding some awesome videos to watch them later.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95"
                >
                  Explore Videos →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {playlist?.videos?.map((video, i) => (
                <VideoRow
                  key={video._id}
                  video={video}
                  index={i}
                  playlistId={playlistId}
                  onRemove={handleRemove}
                  isOwner={isOwner}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
