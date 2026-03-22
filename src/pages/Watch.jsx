import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { formatViews, formatDuration, timeAgo } from "../utils/video.utils";
import {
  ThumbsUp,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
  Check,
  X,
  Share2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-950 border-emerald-500/30 text-emerald-300",
    error: "bg-rose-950   border-rose-500/30   text-rose-300",
    info: "bg-slate-900  border-white/10       text-slate-300",
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${styles[type]}`}
    >
      {type === "success" && <Check size={14} />}
      {type === "error" && <X size={14} />}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────

function PlayerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div
        className="w-full rounded-2xl bg-white/[0.05]"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="space-y-2.5">
        <div className="h-5 bg-white/[0.05] rounded-lg w-3/4" />
        <div className="h-4 bg-white/[0.04] rounded-lg w-1/2" />
      </div>
      <div className="flex items-center gap-3 py-4 border-y border-white/[0.05]">
        <div className="w-10 h-10 rounded-full bg-white/[0.05]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-white/[0.05] rounded w-32" />
          <div className="h-3   bg-white/[0.04] rounded w-20" />
        </div>
        <div className="h-8 w-28 bg-white/[0.05] rounded-xl" />
      </div>
    </div>
  );
}

function SuggestedSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2.5">
          <div
            className="w-40 flex-shrink-0 rounded-lg bg-white/[0.05]"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-3 bg-white/[0.05] rounded w-full" />
            <div className="h-3 bg-white/[0.05] rounded w-3/4" />
            <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested card
// ─────────────────────────────────────────────────────────────────────────────

function SuggestedCard({ video }) {
  if (!video) return null;
  const { _id, thumbnail, title, duration, views, createdAt, owner } = video;
  return (
    <Link
      to={`/watch/${_id}`}
      className="flex gap-2.5 group rounded-xl p-1.5 -mx-1.5 hover:bg-white/[0.04] transition-colors duration-150"
    >
      <div
        className="relative flex-shrink-0 w-40 rounded-lg overflow-hidden bg-[#1a1a24]"
        style={{ aspectRatio: "16/9" }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 to-[#1a1a24]" />
        )}
        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-semibold text-white bg-black/75 tabular-nums">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
        <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500">{owner?.username}</p>
        <p className="text-[11px] text-slate-600">
          {formatViews(views)} · {timeAgo(createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────

const lsGet = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Watch() {
  const { videoId } = useParams();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const currentUser = useSelector((s) => s.auth.userData);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const [descExpanded, setDescExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const videoRef = useRef(null);
  const showToast = useCallback(
    (message, type = "info") => setToast({ message, type }),
    [],
  );

  // ── Fetch video + check liked status ──────────────────────────────────────
  useEffect(() => {
    if (!videoId) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      setVideo(null);
      setDescExpanded(false);
      setLiked(false);
      setSubscribed(false);

      try {
        // 1. fetch video — backend now returns owner._id, createdAt, likesCount
        const res = await axios.get(`/api/v2/videos/${videoId}`);
        const data = Array.isArray(res.data?.data)
          ? res.data.data[0]
          : res.data?.data;

        if (!data) throw new Error("Video not found");

        setVideo(data);
        setLikesCount(data.likesCount ?? 0);
        setSubscribersCount(data.owner?.subscribersCount ?? 0);

        // 2. restore sub state from localStorage
        if (isAuthenticated && currentUser?._id && data.owner?._id) {
          const subKey = `subbed_${currentUser._id}_${data.owner._id}`;
          setSubscribed(lsGet(subKey, false));
        }

        // 3. check like status using getLikedVideos endpoint
        //    getLikedVideos → returns array of { video: { _id, ... } }
        //    we check if current videoId is in that list
        if (isAuthenticated) {
          try {
            const likeRes = await axios.get("/api/v2/likes/videos");
            const likedList = likeRes.data?.data ?? [];
            const isLiked = likedList.some(
              (item) => item?.video?._id?.toString() === videoId,
            );
            setLiked(isLiked);
            // also persist it
            if (currentUser?._id) {
              lsSet(`liked_${currentUser._id}_${videoId}`, isLiked);
            }
          } catch {
            // liked videos fetch failed — fall back to localStorage
            if (currentUser?._id) {
              setLiked(lsGet(`liked_${currentUser._id}_${videoId}`, false));
            }
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Video not found.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [videoId, isAuthenticated, currentUser?._id]);

  // Increment view count once per page load
  useEffect(() => {
    if (!videoId) return;
    axios.post(`/api/v2/videos/${videoId}/view`).catch(() => {});
  }, [videoId]);

  // ── Fetch suggested ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoId) return;
    const fetchSuggested = async () => {
      setSuggestedLoading(true);
      try {
        const res = await axios.get("/api/v2/videos", {
          params: { page: 1, limit: 10, sortBy: "views", sortType: "desc" },
        });
        const docs = res.data?.data?.docs ?? [];
        setSuggested(docs.filter((v) => v._id !== videoId));
      } catch {
        setSuggested([]);
      } finally {
        setSuggestedLoading(false);
      }
    };
    fetchSuggested();
  }, [videoId]);

  // ── Toggle like ────────────────────────────────────────────────────────────
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      showToast("Sign in to like videos", "info");
      return;
    }
    if (likeLoading) return;

    const prevLiked = liked;
    const prevCount = likesCount;
    const newLiked = !liked;

    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
    setLikeLoading(true);

    try {
      const res = await axios.post(`/api/v2/likes/toggle/v/${videoId}`);

      // backend returns { videoLiked: false } or { VideoLiked: true } (capital V bug in backend)
      const data = res.data?.data ?? {};
      const isNowLiked = data.VideoLiked ?? data.videoLiked ?? newLiked;

      setLiked(isNowLiked);
      if (isNowLiked !== newLiked) {
        setLikesCount((c) => (isNowLiked ? c + 1 : Math.max(0, c - 1)));
      }

      if (currentUser?._id) {
        lsSet(`liked_${currentUser._id}_${videoId}`, isNowLiked);
      }

      showToast(
        isNowLiked ? "Added to liked videos" : "Removed from liked videos",
        "success",
      );
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(
        err.response?.data?.message || "Failed to update like.",
        "error",
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Toggle subscribe ───────────────────────────────────────────────────────
  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      showToast("Sign in to subscribe", "info");
      return;
    }
    if (subLoading || !video?.owner?._id) return;

    const prevSub = subscribed;
    const prevCount = subscribersCount;
    const newSub = !subscribed;

    setSubscribed(newSub);
    setSubscribersCount((c) => (newSub ? c + 1 : Math.max(0, c - 1)));
    setSubLoading(true);

    try {
      // POST /api/v2/subscriptions/c/:channelId → toggleSubscription
      const res = await axios.post(
        `/api/v2/subscriptions/c/${video.owner._id}`,
      );
      const isNowSubbed = res.data?.data?.subscribed ?? newSub;

      setSubscribed(isNowSubbed);
      if (isNowSubbed !== newSub) {
        setSubscribersCount((c) => (isNowSubbed ? c + 1 : Math.max(0, c - 1)));
      }

      if (currentUser?._id) {
        lsSet(`subbed_${currentUser._id}_${video.owner._id}`, isNowSubbed);
      }

      showToast(
        isNowSubbed
          ? `Subscribed to ${video.owner.username}`
          : `Unsubscribed from ${video.owner.username}`,
        "success",
      );
    } catch (err) {
      setSubscribed(prevSub);
      setSubscribersCount(prevCount);
      showToast(
        err.response?.data?.message || "Failed to update subscription.",
        "error",
      );
    } finally {
      setSubLoading(false);
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Could not copy link", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm">{error}</p>
          <Link
            to="/"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const ownerInitial = video?.owner?.username?.[0]?.toUpperCase() || "?";
  const descLines = video?.description?.split("\n") ?? [];
  const isLongDesc = (video?.description?.length ?? 0) > 200;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {loading ? (
              <PlayerSkeleton />
            ) : (
              video && (
                <>
                  {/* Player */}
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <video
                      ref={videoRef}
                      key={video.videoFile}
                      src={video.videoFile}
                      poster={video.thumbnail}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title + meta */}
                  <div className="space-y-1.5 pt-1">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
                      {video.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Eye size={12} />
                        {formatViews(video.views)}
                      </span>
                      <span className="opacity-30">·</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : ""}
                      </span>
                      {video.createdAt && (
                        <>
                          <span className="opacity-30">·</span>
                          <span className="text-slate-600">
                            {timeAgo(video.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Like button — shows count like YouTube */}
                    <button
                      onClick={handleToggleLike}
                      disabled={likeLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-60 active:scale-95 ${
                        liked
                          ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                          : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.14]"
                      }`}
                    >
                      <ThumbsUp
                        size={15}
                        strokeWidth={2}
                        className={liked ? "fill-indigo-400/40" : ""}
                      />
                      {/* Show count if > 0, else show "Like"/"Liked" */}
                      {likesCount > 0
                        ? likesCount.toLocaleString()
                        : liked
                          ? "Liked"
                          : "Like"}
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.14] transition-all duration-200 active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={14} strokeWidth={1.75} />
                          Share
                        </>
                      )}
                    </button>
                  </div>

                  {/* Channel block */}
                  <div className="flex items-center gap-3 py-4 border-y border-white/[0.06]">
                    <Link
                      to={`/channel/${video.owner?.username}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-indigo-500/40 transition-all duration-200 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        {video.owner?.avatar ? (
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold select-none">
                            {ownerInitial}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/channel/${video.owner?.username}`}>
                        <p className="text-sm font-semibold text-slate-100 hover:text-white transition-colors truncate">
                          {video.owner?.fullName ||
                            video.owner?.username ||
                            "Unknown"}
                        </p>
                      </Link>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                        {video.owner?.username && `@${video.owner.username}`}
                        {subscribersCount > 0 && (
                          <span>
                            · {subscribersCount.toLocaleString()} subscriber
                            {subscribersCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleSubscribe}
                      disabled={subLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 active:scale-95 ${
                        subscribed
                          ? "bg-white/[0.07] border border-white/[0.12] text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                          : "bg-white text-[#0a0a0f] hover:bg-slate-100"
                      }`}
                    >
                      {subscribed ? (
                        <>
                          <BellOff size={14} strokeWidth={2} />
                          Unsubscribe
                        </>
                      ) : (
                        <>
                          <Bell size={14} strokeWidth={2} />
                          Subscribe
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div
                      className={`text-sm text-slate-400 leading-relaxed space-y-1 overflow-hidden transition-all duration-300 ${
                        descExpanded || !isLongDesc
                          ? "max-h-[2000px]"
                          : "max-h-20"
                      }`}
                    >
                      {descLines.length > 0 ? (
                        descLines.map((line, i) => (
                          <p key={i}>{line || <br />}</p>
                        ))
                      ) : (
                        <p className="text-slate-600 italic text-xs">
                          No description.
                        </p>
                      )}
                    </div>
                    {isLongDesc && (
                      <button
                        onClick={() => setDescExpanded((v) => !v)}
                        className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {descExpanded ? (
                          <>
                            <ChevronUp size={13} />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="xl:w-[360px] flex-shrink-0 space-y-3">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Up Next
            </h2>
            {suggestedLoading ? (
              <SuggestedSkeleton />
            ) : suggested.length > 0 ? (
              <div className="space-y-1">
                {suggested.map((v) => (
                  <SuggestedCard key={v._id} video={v} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 py-4">
                No suggestions available.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
