import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Users, Loader2, AlertCircle } from "lucide-react";

// --- Animation Config ---
const smoothSpring = {
  type: "spring",
  stiffness: 350,
  damping: 25,
  mass: 0.8,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98, filter: "blur(4px)" },
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
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// --- Components ---

function ChannelSkeleton() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 p-4 sm:p-5 bg-white/[0.02] border border-white/[0.04] rounded-[1.25rem] relative overflow-hidden"
    >
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent w-full z-10"
      />
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#141416] shrink-0 border border-white/[0.05]" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-[#141416] rounded-md w-32 sm:w-48" />
        <div className="h-3 bg-[#141416] rounded-md w-20" />
      </div>
      <div className="h-10 w-28 bg-[#141416] rounded-xl hidden sm:block" />
    </motion.div>
  );
}

function ChannelCard({ channel, currentUserId, onToggle }) {
  const [subLoading, setSubLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(true);

  const initial = channel.username?.[0]?.toUpperCase() || "?";

  const handleToggle = async () => {
    if (subLoading) return;
    setSubLoading(true);
    try {
      const res = await axios.post(`/api/v2/subscriptions/c/${channel._id}`);
      const isNowSubbed = res.data?.data?.subscribed ?? false;
      setSubscribed(isNowSubbed);
      if (!isNowSubbed) {
        setTimeout(() => onToggle(channel._id), 300); // Wait for exit animation
      }
    } catch (err) {
      console.warn(err.response?.data?.message);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <motion.div
      layout
      layoutId={channel._id}
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="group relative"
    >
      {/* Background Hover Glow */}
      <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 bg-indigo-500/10 rounded-3xl pointer-events-none" />

      <div className="relative flex items-center gap-4 p-4 sm:p-5 bg-[#0f1117] border border-white/[0.06] rounded-[1.25rem] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 z-10 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10">
        {/* Animated Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Avatar */}
        <Link to={`/channel/${channel.username}`} className="shrink-0 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={smoothSpring}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center ring-2 ring-transparent group-hover:ring-indigo-500/40 shadow-lg transition-all duration-300 z-10 relative"
          >
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.username}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <span className="text-white text-xl font-bold select-none drop-shadow-md">
                {initial}
              </span>
            )}
          </motion.div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Link to={`/channel/${channel.username}`}>
            <p className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate tracking-tight">
              {channel.fullName || channel.username}
            </p>
          </Link>
          <p className="text-sm font-medium text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
            <span className="text-slate-600">@</span>
            {channel.username}
          </p>
        </div>

        {/* Action Button */}
        {channel._id !== currentUserId && (
          <div className="shrink-0 pl-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              disabled={subLoading}
              className={`relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-60 shadow-lg ${
                subscribed
                  ? "bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 hover:shadow-rose-500/20"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 border border-transparent text-white hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25"
              }`}
            >
              {subLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : subscribed ? (
                "Subscribed"
              ) : (
                "Subscribe"
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Subscriptions() {
  const currentUser = useSelector((s) => s.auth.userData);

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Subscriptions — VideoTube";
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const res = await axios.get(
          `/api/v2/subscriptions/u/${currentUser._id}`,
        );
        const data = res.data?.data ?? [];
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load subscriptions.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [currentUser?._id]);

  const handleToggle = (channelId) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
  };

  return (
    <div className="min-h-screen bg-[#050508] p-4 sm:p-8 relative overflow-hidden ">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center opacity-30 ">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...smoothSpring, delay: 0.1 }}
          className="flex items-center gap-5 mb-10 pb-8 border-b border-white/[0.06]"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center relative shadow-xl shadow-black/50">
              <Rss size={26} className="text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Subscriptions
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1"
            >
              {!loading && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  Following {channels.length} Creator
                  {channels.length !== 1 ? "s" : ""}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Content Area */}
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
              className="space-y-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ChannelSkeleton key={i} />
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
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-2 border border-rose-500/20">
                  <AlertCircle size={28} className="text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Unable to load subscriptions
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {!loading && !error && channels.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={smoothSpring}
              className="flex items-center justify-center min-h-[50vh] w-full"
            >
              <div className="flex flex-col items-center justify-center max-w-md w-full relative text-center">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative w-24 h-24 bg-[#141416] border border-white/[0.08] rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Users size={36} className="text-slate-400" />
                </div>

                <h2 className="text-2xl font-black text-white mb-3 tracking-tight relative z-10">
                  No Subscriptions Yet
                </h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium relative z-10 max-w-[280px]">
                  Subscribe to your favorite creators to build your personalized
                  feed.
                </p>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={smoothSpring}
                  className="relative z-10 w-full sm:w-auto"
                >
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors w-full shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  >
                    Discover Channels
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {!loading && !error && channels.length > 0 && (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel._id}
                    channel={channel}
                    currentUserId={currentUser?._id}
                    onToggle={handleToggle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
