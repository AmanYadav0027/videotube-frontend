import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "../components/VideoCard";
import { Heart, PlaySquare, AlertCircle } from "lucide-react";

const smoothSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const subtleSpring = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: smoothSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(5px)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="w-full rounded-xl border border-white/[0.04] skeleton-shimmer"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="flex gap-3 px-1">
        <div className="w-9 h-9 rounded-full shrink-0 border border-white/[0.04] skeleton-shimmer" />
        <div className="flex-1 flex flex-col gap-2.5 pt-1">
          <div
            className="h-3 rounded-lg skeleton-shimmer"
            style={{ width: "85%" }}
          />
          <div
            className="h-3 rounded-lg skeleton-shimmer"
            style={{ width: "55%" }}
          />
          <div
            className="h-2.5 rounded-lg skeleton-shimmer"
            style={{ width: "40%" }}
          />
        </div>
      </div>
    </div>
  );
}

function PremiumVideoWrapper({ children }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={subtleSpring}
      className="group relative rounded-2xl bg-transparent z-10 hover:z-20"
    >
      <div className="absolute -inset-3 rounded-[2rem] bg-white/[0.02] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out -z-10 pointer-events-none border border-white/[0.05]" />
      <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500/0 via-violet-500/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:from-indigo-500/10 group-hover:via-violet-500/5 transition-all duration-500 blur-xl pointer-events-none -z-20" />
      {children}
    </motion.div>
  );
}

export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Liked Videos — VideoTube";

    const loadLikedVideos = async () => {
      try {
        const res = await axios.get("/api/v2/likes/videos");
        const raw = res.data?.data ?? [];
        //  unwrap liked-video objects — API may return { video: {...} } or plain video
        const data = raw.map((item) => item.video ?? item).filter(Boolean);
        setVideos(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load liked videos.");
      } finally {
        setLoading(false);
      }
    };

    loadLikedVideos();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-8 relative overflow-hidden ">
      {/* Ambient glows */}
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="lv-orb1" cx="90%" cy="0%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="lv-orb2" cx="10%" cy="100%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#lv-orb1)" />
        <rect width="100%" height="100%" fill="url(#lv-orb2)" />
      </svg>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...smoothSpring, delay: 0.05 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-6 border-b border-white/[0.06] pb-8"
        >
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={smoothSpring}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px] shadow-xl shadow-indigo-500/20 relative z-10"
              >
                <div className="w-full h-full bg-[#0A0A0A] rounded-[15px] flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,0.3)_360deg)] opacity-50"
                  />
                  <Heart
                    size={22}
                    className="text-indigo-400 fill-indigo-400/20 relative z-10"
                  />
                </div>
              </motion.div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-1">
                Liked Videos
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-bold text-indigo-400/80 flex items-center gap-2"
              >
                {!loading && (
                  <>
                    <motion.span
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    />
                    {videos.length} Video{videos.length !== 1 ? "s" : ""}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                transition: { duration: 0.2 },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={smoothSpring}
              className="flex items-center justify-center min-h-[40vh]"
            >
              <div className="bg-[#141416] border border-rose-500/10 p-8 rounded-[2rem] flex flex-col items-center gap-4 text-center max-w-md shadow-2xl">
                <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                  <AlertCircle size={26} className="text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Unable to load favorites
                </h3>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {!loading && !error && videos.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={smoothSpring}
              className="flex items-center justify-center min-h-[50vh] w-full"
            >
              <div className="flex flex-col items-center justify-center max-w-md w-full relative text-center">
                <div className="absolute inset-0 bg-indigo-500/8 blur-[100px] rounded-full pointer-events-none" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative w-24 h-24 bg-gradient-to-br from-[#141416] to-[#0A0A0A] border border-white/[0.08] rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500"
                >
                  <Heart
                    size={36}
                    className="text-slate-500 fill-slate-500/20"
                  />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight relative z-10">
                  No liked videos yet
                </h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium relative z-10 max-w-[280px]">
                  Hit the like button on videos you love to curate your personal
                  collection.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={subtleSpring}
                  className="relative z-10 w-full sm:w-auto"
                >
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-white to-slate-200 text-black font-bold text-sm hover:from-slate-200 hover:to-white transition-all w-full shadow-[0_0_40px_rgba(255,255,255,0.12)] group"
                  >
                    <PlaySquare
                      size={18}
                      className="fill-black/10 group-hover:scale-110 transition-transform"
                    />
                    Discover Videos
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {!loading && !error && videos.length > 0 && (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10"
            >
              {videos.map((video) => (
                <PremiumVideoWrapper key={video._id}>
                  <VideoCard video={video} />
                </PremiumVideoWrapper>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
