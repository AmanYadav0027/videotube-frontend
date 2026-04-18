import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";
import {
  Bell,
  BellOff,
  Users,
  Video,
  Play,
  AlertCircle,
  Loader2,
} from "lucide-react";

const smoothSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: smoothSpring,
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChannelSkeleton() {
  return (
    <div className="animate-pulse space-y-0 relative z-10">
      <div className="h-40 sm:h-52 bg-[#141416] rounded-t-2xl relative overflow-hidden border border-b-0 border-white/[0.03]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="bg-[#0A0A0A] border border-t-0 border-white/[0.05] rounded-b-2xl px-5 sm:px-6 pb-6 pt-0 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#141416] border-4 border-[#0A0A0A] shrink-0 relative overflow-hidden" />
          <div className="flex-1 space-y-3 pb-1 w-full">
            <div className="h-5 bg-[#141416] rounded-md w-40" />
            <div className="flex gap-2">
              <div className="h-3 bg-[#141416] rounded-md w-20" />
              <div className="h-3 bg-[#141416] rounded-md w-24" />
            </div>
          </div>
          <div className="h-10 w-28 bg-[#141416] rounded-xl shrink-0 sm:mb-1" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div
              className="w-full rounded-xl bg-[#141416] border border-white/[0.03] relative overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="space-y-2 px-0.5">
              <div className="h-3 bg-[#141416] rounded-md w-full" />
              <div className="h-3 bg-[#141416] rounded-md w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────

function ChannelVideoCard({ video }) {
  const { _id, thumbnail, title, duration, views, createdAt } = video;
  return (
    <motion.div variants={itemVariants}>
      <Link to={`/watch/${_id}`} className="group flex flex-col gap-3 relative">
        <div
          className="relative w-full rounded-xl overflow-hidden bg-[#0A0A0A] shadow-md border border-white/[0.04] group-hover:border-indigo-500/30 group-hover:shadow-indigo-500/10 transition-all duration-500"
          style={{ aspectRatio: "16/9" }}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950/40 to-[#0A0A0A]" />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold tabular-nums border border-white/10 group-hover:opacity-0 transition-opacity duration-300">
            {formatDuration(duration)}
          </span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-12 h-12 rounded-full bg-indigo-500/90 backdrop-blur-md flex items-center justify-center pl-1 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Play size={18} className="fill-white text-white" />
            </span>
          </span>
        </div>

        <div className="space-y-1 px-0.5 relative z-10">
          <h3
            className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors duration-300"
            title={title}
          >
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            {formatViews(views)} views
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            {timeAgo(createdAt)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Channel() {
  const { username } = useParams();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const currentUser = useSelector((s) => s.auth.userData);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    const loadChannel = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, videosRes] = await Promise.all([
          axios.get(`/api/v2/users/c/${username}`),
          axios.get("/api/v2/videos", {
            params: {
              page: 1,
              limit: 20,
              sortBy: "createdAt",
              sortType: "desc",
            },
          }),
        ]);

        const profile = profileRes.data?.data;
        setChannel(profile);
        setSubCount(profile?.subscribersCount ?? 0);
        setSubscribed(profile?.isSubscribed ?? false);

        const allDocs = videosRes.data?.data?.docs ?? [];
        setVideos(
          allDocs.filter(
            (v) =>
              v.owner?.username === username || v.owner?._id === profile?._id,
          ),
        );
      } catch (err) {
        setError(err.response?.data?.message || "Channel not found.");
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [username]);

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated || subLoading || !channel?._id) return;

    const prevSubscribed = subscribed;
    const prevCount = subCount;

    // Optimistic update
    setSubscribed(!prevSubscribed);
    setSubCount((c) => (prevSubscribed ? Math.max(0, c - 1) : c + 1));
    setSubLoading(true);

    try {
      const res = await axios.post(`/api/v2/subscriptions/c/${channel._id}`);
      const isNowSubbed = res.data?.data?.subscribed ?? !prevSubscribed;

      // FIX: only correct if API result differs from our optimistic update
      if (isNowSubbed !== !prevSubscribed) {
        setSubscribed(isNowSubbed);
        setSubCount(isNowSubbed ? prevCount + 1 : Math.max(0, prevCount - 1));
      }
    } catch {
      // Revert on failure
      setSubscribed(prevSubscribed);
      setSubCount(prevCount);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 relative">
        <div className="max-w-5xl mx-auto">
          <ChannelSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        {/* FIX: wrapped siblings in a proper container div */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={smoothSpring}
          className="text-center space-y-5 max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="text-slate-200 font-bold tracking-tight text-lg">
            {error}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors border border-white/10"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const initial = channel?.username?.[0]?.toUpperCase() || "?";
  const isOwnChannel = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative ">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <div className="absolute top-[-20%] w-[800px] h-[600px] bg-indigo-500/8 blur-[130px] rounded-full  opacity-50" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 relative z-10">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothSpring}
          className="relative h-40 sm:h-52 rounded-t-2xl overflow-hidden bg-gradient-to-br from-indigo-900/30 via-[#0A0A0A] to-purple-900/20 group"
        >
          {channel?.coverImage ? (
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-violet-500/15 rounded-full blur-[60px]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent opacity-90" />
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.1 }}
          className="bg-[#0A0A0A] border border-t-0 border-white/[0.05] rounded-b-2xl px-5 sm:px-6 pb-6 relative z-20 shadow-2xl shadow-black/80"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative z-30">
            {/* Avatar */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-[#0A0A0A] overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-black/50 group/avatar">
              {channel?.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.username}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                />
              ) : (
                <span className="text-white text-3xl sm:text-4xl font-black select-none drop-shadow-md">
                  {initial}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate drop-shadow-sm">
                {channel?.fullName || channel?.username}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-medium text-slate-400">
                <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  @{channel?.username}
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <Users size={12} className="text-slate-400" />
                  {subCount.toLocaleString()} subscribers
                </span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <Video size={12} className="text-slate-400" />
                  {videos.length} videos
                </span>
              </div>
            </div>

            {/* Subscribe / Edit */}
            <div className="shrink-0 pb-1">
              {isOwnChannel ? (
                <Link
                  to="/profile"
                  className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-200 hover:bg-white/[0.04] transition-all duration-300 active:scale-95"
                >
                  Manage Profile
                </Link>
              ) : isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleToggleSubscribe}
                  disabled={subLoading}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-60 shadow-lg min-w-[120px] ${
                    subscribed
                      ? "bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                      : "bg-gradient-to-r from-white to-slate-200 text-black hover:from-indigo-50 hover:to-white shadow-white/10"
                  }`}
                >
                  {subLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : subscribed ? (
                    <>
                      <BellOff size={15} />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <Bell size={15} className="fill-black/20" />
                      Subscribe
                    </>
                  )}
                </motion.button>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Videos grid */}
        <div className="mt-8 relative z-20">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...smoothSpring, delay: 0.2 }}
            className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 tracking-wide uppercase"
          >
            <Video size={16} className="text-indigo-400" /> Uploaded Videos
          </motion.h2>

          {videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.25 }}
              className="py-16 text-center bg-white/[0.02] border border-white/[0.04] rounded-2xl"
            >
              <div className="w-16 h-16 bg-[#141416] border border-white/[0.05] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                <Video size={24} className="text-slate-600" />
              </div>
              <p className="text-base font-bold text-slate-300">
                No videos yet
              </p>
              <p className="text-sm font-medium text-slate-500 mt-1">
                This channel hasn't uploaded any content.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {videos.map((v) => (
                  <ChannelVideoCard key={v._id} video={v} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
