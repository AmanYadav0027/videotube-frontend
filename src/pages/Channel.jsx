import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatViews, formatDuration, timeAgo } from "../utils/Video.utils";
import { Bell, BellOff, Users, Video, Eye } from "lucide-react";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChannelSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      <div className="h-40 sm:h-52 bg-white/5 rounded-b-none" />
      <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl rounded-t-none px-6 pb-6 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-white/8 border-4 border-[#0f1117]" />
          <div className="flex-1 space-y-2 pb-1">
            <div className="h-5 bg-white/6 rounded w-40" />
            <div className="h-3 bg-white/4 rounded w-24" />
          </div>
          <div className="h-9 w-28 bg-white/6 rounded-xl" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div
              className="w-full rounded-xl bg-white/5"
              style={{ aspectRatio: "16/9" }}
            />
            <div className="space-y-1.5 px-0.5">
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/4 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Video card (inline, no routing confusion) ────────────────────────────────

function ChannelVideoCard({ video }) {
  const { _id, thumbnail, title, duration, views, createdAt } = video;
  return (
    <Link to={`/watch/${_id}`} className="group flex flex-col gap-3">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-[#1a1a24]"
        style={{ aspectRatio: "16/9" }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-950/60 to-[#1a1a24]" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-semibold tabular-nums border border-white/10">
          {formatDuration(duration)}
        </span>
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </span>
        </span>
      </div>
      <div className="space-y-0.5 px-0.5">
        <h3
          className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors"
          title={title}
        >
          {title}
        </h3>
        <p className="text-[11px] text-slate-600">
          {formatViews(views)} · {timeAgo(createdAt)}
        </p>
      </div>
    </Link>
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
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // getUserChannelProfile → GET /api/v2/users/c/:username
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

        // filter videos belonging to this channel
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
    fetch();
  }, [username]);

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated || subLoading || !channel?._id) return;
    const prev = subscribed;
    const prevCnt = subCount;
    setSubscribed(!subscribed);
    setSubCount((c) => (subscribed ? Math.max(0, c - 1) : c + 1));
    setSubLoading(true);
    try {
      const res = await axios.post(`/api/v2/subscriptions/c/${channel._id}`);
      const isNowSubbed = res.data?.data?.subscribed ?? !prev;
      setSubscribed(isNowSubbed);
      setSubCount((c) => {
        if (isNowSubbed !== !prev)
          return isNowSubbed ? c + 1 : Math.max(0, c - 1);
        return c;
      });
    } catch {
      setSubscribed(prev);
      setSubCount(prevCnt);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-4 sm:p-6">
        <ChannelSkeleton />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-sm">{error}</p>
          <Link
            to="/"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Home
          </Link>
        </div>
      </div>
    );

  const initial = channel?.username?.[0]?.toUpperCase() || "?";
  const isOwnChannel = currentUser?.username === username;

  return (
    <div className="min-h-full bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        {/* ── Cover ── */}
        <div className="relative h-40 sm:h-52 rounded-b-none overflow-hidden bg-linear-to-br from-indigo-900/40 via-[#0f1117] to-violet-900/30">
          {channel?.coverImage ? (
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0f1117] to-transparent" />
        </div>

        {/* ── Profile card ── */}
        <div className="bg-[#0f1117] border border-t-0 border-white/[0.07] rounded-b-2xl px-5 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-[#0f1117] overflow-hidden bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-black/40">
              {channel?.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold select-none">
                  {initial}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight truncate">
                {channel?.fullName || channel?.username}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
                <span>@{channel?.username}</span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Users size={11} /> {subCount.toLocaleString()} subscriber
                  {subCount !== 1 ? "s" : ""}
                </span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Video size={11} /> {videos.length} video
                  {videos.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Subscribe / Edit */}
            {isOwnChannel ? (
              <Link
                to="/profile"
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/6 transition-all duration-200"
              >
                Edit profile
              </Link>
            ) : isAuthenticated ? (
              <button
                onClick={handleToggleSubscribe}
                disabled={subLoading}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 active:scale-95 ${
                  subscribed
                    ? "bg-white/[0.07] border border-white/12 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                    : "bg-white text-[#0a0a0f] hover:bg-slate-100"
                }`}
              >
                {subscribed ? (
                  <>
                    <BellOff size={14} />
                    Unsubscribe
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Subscribe
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Videos grid ── */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <Eye size={14} /> Videos
          </h2>
          {videos.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Video size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No videos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => (
                <ChannelVideoCard key={v._id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
