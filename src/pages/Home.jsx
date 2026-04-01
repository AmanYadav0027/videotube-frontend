import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { SlidersHorizontal, TrendingUp, Clock, X } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div
        className="w-full rounded-xl bg-white/5"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="flex gap-3 px-0.5">
        <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3 rounded-md bg-white/5 w-full" />
          <div className="h-3 rounded-md bg-white/5 w-3/4" />
          <div className="h-2.5 rounded-md bg-white/4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: "Latest", sortBy: "createdAt", sortType: "desc", icon: Clock },
  { label: "Trending", sortBy: "views", sortType: "desc", icon: TrendingUp },
  { label: "Oldest", sortBy: "createdAt", sortType: "asc", icon: Clock },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read search query from URL ?q= — navbar is the single search source
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

  const sentinelRef = useRef(null);

  const fetchVideos = useCallback(
    async ({ pageNum = 1, append = false } = {}) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/v2/videos", {
          params: {
            page: pageNum,
            limit: 12,
            ...(searchQuery && { query: searchQuery }),
            ...(activeSort.sortBy && { sortBy: activeSort.sortBy }),
            ...(activeSort.sortType && { sortType: activeSort.sortType }),
          },
        });
        const paginated = res.data?.data;
        const incoming = Array.isArray(paginated?.docs) ? paginated.docs : [];
        setVideos((prev) => (append ? [...prev, ...incoming] : incoming));
        setHasNextPage(paginated?.hasNextPage ?? false);
        setTotalVideos(paginated?.totalDocs ?? 0);
        setPage(pageNum);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load videos.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, activeSort],
  );

  useEffect(() => {
    fetchVideos({ pageNum: 1, append: false });
  }, [fetchVideos]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !loadingMore &&
          !loading
        ) {
          fetchVideos({ pageNum: page + 1, append: true });
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, loading, page, fetchVideos]);

  // Page title
  useEffect(() => {
    document.title = searchQuery ? `"${searchQuery}" — MyApp` : "Home — MyApp";
  }, [searchQuery]);

  const clearSearch = () => navigate("/");

  return (
    <div className="min-h-full">
      {/* ── Sort toolbar only (search is in navbar) ── */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Search status */}
          {searchQuery ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">
                {loading
                  ? "Searching…"
                  : `${totalVideos} result${totalVideos !== 1 ? "s" : ""} for`}{" "}
                <span className="text-slate-300 font-medium">
                  "{searchQuery}"
                </span>
              </p>
              <button
                onClick={clearSearch}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <X size={11} /> Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              {!loading &&
                `${totalVideos} video${totalVideos !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={13} className="text-slate-600 mr-0.5" />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  if (opt.label !== activeSort.label) setActiveSort(opt);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeSort.label === opt.label
                    ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                    : "bg-white/3 border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/12"
                }`}
              >
                <opt.icon size={11} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Error */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                <X size={20} className="text-rose-400" />
              </div>
              <p className="text-slate-400 text-sm">{error}</p>
              <button
                onClick={() => fetchVideos({ pageNum: 1 })}
                className="text-xs px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && videos.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                {searchQuery
                  ? `No videos found for "${searchQuery}"`
                  : "No videos yet"}
              </p>
              <p className="text-slate-600 text-xs">
                {searchQuery
                  ? "Try a different search term."
                  : "Upload your first video to get started."}
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
              {loadingMore &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
            </div>
            <div ref={sentinelRef} className="h-8 mt-4" />
            {!hasNextPage && (
              <p className="text-center text-xs text-slate-700 mt-2 pb-4">
                You've reached the end
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
