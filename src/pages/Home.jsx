import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { Search, SlidersHorizontal, TrendingUp, Clock, X } from "lucide-react";

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div
        className="w-full rounded-xl bg-white/[0.05]"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="flex gap-3 px-0.5">
        <div className="w-8 h-8 rounded-full bg-white/[0.05] flex-shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3 rounded-md bg-white/[0.05] w-full" />
          <div className="h-3 rounded-md bg-white/[0.05] w-3/4" />
          <div className="h-2.5 rounded-md bg-white/[0.04] w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Latest", sortBy: "createdAt", sortType: "desc", icon: Clock },
  { label: "Trending", sortBy: "views", sortType: "desc", icon: TrendingUp },
  { label: "Oldest", sortBy: "createdAt", sortType: "asc", icon: Clock },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);

  // search & sort
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // committed on Enter / button
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

  // infinite scroll sentinel
  const sentinelRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchVideos = useCallback(
    async ({
      pageNum = 1,
      append = false,
      query = searchQuery,
      sortBy = activeSort.sortBy,
      sortType = activeSort.sortType,
    } = {}) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/v2/videos", {
          params: {
            page: pageNum,
            limit: 12,
            ...(query && { query }),
            ...(sortBy && { sortBy }),
            ...(sortType && { sortType }),
          },
        });

        // aggregatePaginate response shape: res.data.data.docs
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

  // initial + re-fetch when sort or search changes
  useEffect(() => {
    fetchVideos({ pageNum: 1, append: false });
  }, [searchQuery, activeSort]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Infinite scroll via IntersectionObserver ───────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleSortChange = (option) => {
    if (option.label === activeSort.label) return;
    setActiveSort(option);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full">
      {/* ── Toolbar: search + sort ── */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.05] px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 w-full max-w-md"
          >
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <SlidersHorizontal size={13} className="text-slate-600 mr-0.5" />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSortChange(opt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeSort.label === opt.label
                    ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                    : "bg-white/[0.03] border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]"
                }`}
              >
                <opt.icon size={11} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active search indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 mt-2">
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
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {/* ── Error state ── */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                <X size={20} className="text-rose-400" />
              </div>
              <p className="text-slate-400 text-sm">{error}</p>
              <button
                onClick={() => fetchVideos({ pageNum: 1, append: false })}
                className="text-xs px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Loading skeletons (initial) ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && videos.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
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

        {/* ── Video grid ── */}
        {!loading && !error && videos.length > 0 && (
          <>
            {/* video count */}
            {!searchQuery && (
              <p className="text-xs text-slate-600 mb-4">
                {totalVideos} video{totalVideos !== 1 ? "s" : ""}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}

              {/* inline skeletons when loading more */}
              {loadingMore &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
            </div>

            {/* infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-8 mt-4" />

            {/* end of feed message */}
            {!hasNextPage && videos.length > 0 && (
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
