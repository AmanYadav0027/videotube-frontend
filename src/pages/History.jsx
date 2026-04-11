import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";
import {
  History,
  Play,
  Film,
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

function HistorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.07]"
        >
          <div className="w-36 sm:w-44 h-24 bg-slate-800/50 rounded-xl shrink-0 border border-white/5" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-slate-800/50 rounded-md w-3/4" />
            <div className="h-3 bg-slate-800/40 rounded-md w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Watch History — VideoTube";
    const load = async () => {
      try {
        const res = await axios.get("/api/v2/users/history");
        const data = res.data?.data;
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load watch history.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-violet-500/10">
            <History size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Watch History
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Videos you've watched
            </p>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-3 p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 max-w-sm w-full">
              <AlertTriangle size={28} className="text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-slate-300">{error}</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[40vh]"
          >
            <div className="text-center space-y-4 p-10 rounded-2xl bg-[#0f1117] border border-white/[0.07] max-w-sm w-full shadow-xl">
              <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto">
                <Clock size={32} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-200">
                  No history yet
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Videos you watch will appear here.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-95"
              >
                Explore Videos →
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-slate-500 px-1">
              {videos.length} video{videos.length !== 1 ? "s" : ""}
            </p>
            <AnimatePresence>
              {videos.map((video, i) => (
                <motion.div
                  key={video._id}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 bg-violet-500/10 rounded-3xl pointer-events-none" />
                  <Link
                    to={`/watch/${video._id}`}
                    className="relative flex items-center gap-4 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.07] hover:bg-white/[0.04] hover:border-violet-500/30 transition-all duration-300 z-10 overflow-hidden shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <span className="shrink-0 w-6 text-sm font-bold text-slate-600 group-hover:text-violet-400 transition-colors text-right pr-1">
                      {i + 1}
                    </span>

                    <div
                      className="relative shrink-0 w-36 sm:w-44 rounded-xl overflow-hidden bg-[#1a1a24] shadow-md border border-transparent group-hover:border-white/10 transition-all duration-300"
                      style={{ aspectRatio: "16/9" }}
                    >
                      {video.thumbnail ? (
                        <>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={20} className="text-slate-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-violet-500/90 backdrop-blur-md flex items-center justify-center pl-0.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                          <Play size={16} fill="white" className="text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-black/80 backdrop-blur-sm tabular-nums border border-white/10 group-hover:opacity-0 transition-opacity">
                        {formatDuration(video.duration)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <p className="text-sm sm:text-base font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors pr-4">
                        {video.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-medium text-slate-500">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 group-hover:border-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
                          {video.owner?.username}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {formatViews(video.views)} views
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          {timeAgo(video.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
