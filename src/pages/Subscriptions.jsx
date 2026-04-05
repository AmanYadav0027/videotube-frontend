import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Rss, Users } from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChannelSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 bg-[#0f1117] border border-white/6 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-white/6 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/6 rounded w-32" />
        <div className="h-3 bg-white/4 rounded w-20" />
      </div>
      <div className="h-8 w-24 bg-white/6 rounded-xl" />
    </div>
  );
}

// ─── Channel card ─────────────────────────────────────────────────────────────

function ChannelCard({ channel, currentUserId, onToggle }) {
  const [subLoading, setSubLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(true); // already subscribed since they're in this list

  const initial = channel.username?.[0]?.toUpperCase() || "?";

  const handleToggle = async () => {
    if (subLoading) return;
    setSubLoading(true);
    try {
      const res = await axios.post(`/api/v2/subscriptions/c/${channel._id}`);
      const isNowSubbed = res.data?.data?.subscribed ?? false;
      setSubscribed(isNowSubbed);
      if (!isNowSubbed) onToggle(channel._id); // remove from list after unsubscribe
    } catch (err) {
      // surface backend message (e.g. "You can't subscribe to your own channel.")
      console.warn(err.response?.data?.message);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-[#0f1117] border border-white/6 rounded-2xl hover:border-white/1 transition-colors group">
      {/* Avatar */}
      <Link to={`/channel/${channel.username}`} className="shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center ring-2 ring-transparent hover:ring-indigo-500/40 transition-all duration-200">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-lg font-bold select-none">
              {initial}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/channel/${channel.username}`}>
          <p className="text-sm font-semibold text-slate-200 hover:text-white transition-colors truncate">
            {channel.fullName || channel.username}
          </p>
        </Link>
        <p className="text-xs text-slate-600 mt-0.5">@{channel.username}</p>
      </div>

      {/* Unsubscribe button */}
      {channel._id !== currentUserId && (
        <button
          onClick={handleToggle}
          disabled={subLoading}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 active:scale-95 ${
            subscribed
              ? "bg-white/[0.07] border border-white/12 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
              : "bg-white text-[#0a0a0f] hover:bg-slate-100"
          }`}
        >
          {subLoading ? "…" : subscribed ? "Subscribed" : "Subscribe"}
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Subscriptions() {
  const currentUser = useSelector((s) => s.auth.userData);

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Subscriptions — MyApp";
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        // GET /api/v2/subscriptions/u/:subscriberId → getSubscribedChannels
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

  // Remove channel from list after unsubscribe
  const handleToggle = (channelId) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
  };

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Rss size={16} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              Subscriptions
            </h1>
            <p className="text-xs text-slate-600">
              {!loading &&
                `${channels.length} channel${channels.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ChannelSkeleton key={i} />
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
        {!loading && !error && channels.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-2">
              <Users size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                No subscriptions yet
              </p>
              <p className="text-xs text-slate-700">
                Subscribe to channels while watching to see them here.
              </p>
              <Link
                to="/"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors block mt-2"
              >
                Browse videos →
              </Link>
            </div>
          </div>
        )}

        {/* Channel list */}
        {!loading && !error && channels.length > 0 && (
          <div className="space-y-3">
            {channels.map((channel) => (
              <ChannelCard
                key={channel._id}
                channel={channel}
                currentUserId={currentUser?._id}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
