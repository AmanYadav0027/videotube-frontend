import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import {
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Flame,
  X,
  SearchX,
  AlertCircle,
} from "lucide-react";

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="w-full rounded-xl bg-slate-800/40 animate-pulse border border-white/5 shadow-inner"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="flex gap-3 px-1">
        <div className="w-9 h-9 rounded-full bg-slate-800/40 animate-pulse shrink-0 border border-white/5" />
        <div className="flex-1 flex flex-col gap-2.5 pt-1">
          <div className="h-3.5 rounded-md bg-slate-800/40 animate-pulse w-[90%]" />
          <div className="h-3 rounded-md bg-slate-800/40 animate-pulse w-[60%]" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: "Latest", sortBy: "createdAt", sortType: "desc", icon: Clock },
  { label: "Trending", sortBy: "views", sortType: "desc", icon: Flame },
  { label: "Oldest", sortBy: "createdAt", sortType: "asc", icon: TrendingUp },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

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

  // ── Refs so the sentinel observer never captures a stale closure ─────
  const activeSortRef = useRef(activeSort);
  const searchQueryRef = useRef(searchQuery);
  const pageRef = useRef(page);
  const hasNextRef = useRef(hasNextPage);
  const loadingMoreRef = useRef(loadingMore);
  const loadingRef = useRef(loading);

  useEffect(() => {
    activeSortRef.current = activeSort;
  }, [activeSort]);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    hasNextRef.current = hasNextPage;
  }, [hasNextPage]);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // ── Core fetch — stable reference, all dynamic values passed as args ─
  const fetchVideos = useCallback(
    async ({ pageNum = 1, append = false, sort, query } = {}) => {
      const resolvedSort = sort ?? activeSortRef.current;
      const resolvedQuery = query ?? searchQueryRef.current;

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/v2/videos", {
          params: {
            page: pageNum,
            limit: 12,
            sortBy: resolvedSort.sortBy,
            sortType: resolvedSort.sortType,
            ...(resolvedQuery && { query: resolvedQuery }),
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
    [],
  ); // stable — no deps, all values passed explicitly or read via refs

  // ── Reset + refetch on sort or search change ─────────────────────────
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasNextPage(false);
    fetchVideos({
      pageNum: 1,
      append: false,
      sort: activeSort,
      query: searchQuery,
    });
  }, [activeSort, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Infinite scroll — mounted once, reads state via refs ────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextRef.current &&
          !loadingMoreRef.current &&
          !loadingRef.current
        ) {
          fetchVideos({
            pageNum: pageRef.current + 1,
            append: true,
            sort: activeSortRef.current,
            query: searchQueryRef.current,
          });
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = searchQuery
      ? `"${searchQuery}" — VideoTube`
      : "Home — VideoTube";
  }, [searchQuery]);

  const clearSearch = () => navigate("/");

  const handleSortChange = (opt) => {
    if (opt.label === activeSort.label) return;
    setActiveSort(opt); // triggers the reset useEffect above
  };

  return (
    <div className="min-h-full">
      {/* Sort toolbar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 py-3 shadow-sm shadow-black/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Search status */}
          {searchQuery ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-xs text-slate-400">
                {loading ? (
                  "Searching…"
                ) : (
                  <>
                    <span className="text-indigo-400 font-semibold">
                      {totalVideos}
                    </span>{" "}
                    result{totalVideos !== 1 ? "s" : ""} for
                  </>
                )}{" "}
                <span className="text-slate-200 font-medium tracking-wide">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </p>
              <button
                onClick={clearSearch}
                className="text-[11px] font-medium px-2 py-1 rounded-md bg-white/5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-1 active:scale-95"
              >
                <X size={12} strokeWidth={2.5} /> Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              {!loading &&
                `${totalVideos} video${totalVideos !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={13} className="text-slate-500 mr-1" />
            {SORT_OPTIONS.map((opt) => {
              const isActive = activeSort.label === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSortChange(opt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 select-none outline-none border ${
                    isActive
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-sm shadow-indigo-500/10"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <opt.icon
                    size={12}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-indigo-400" : "text-slate-500"}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Error */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[40vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <AlertCircle size={24} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-slate-200 font-semibold mb-1">
                  Oops! Something went wrong
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {error}
                </p>
              </div>
              <button
                onClick={() =>
                  fetchVideos({
                    pageNum: 1,
                    sort: activeSort,
                    query: searchQuery,
                  })
                }
                className="text-xs font-semibold px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && videos.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center mx-auto shadow-xl">
                {searchQuery ? (
                  <SearchX
                    size={24}
                    className="text-slate-500"
                    strokeWidth={1.5}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-2xl">
                    <Clock
                      size={24}
                      className="text-indigo-400/50"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-slate-200 font-semibold mb-1">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "No videos yet"}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {searchQuery
                    ? "Try checking your spelling or using more general terms."
                    : "When creators upload videos, they will appear right here."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
              {loadingMore &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
            </div>

            <div ref={sentinelRef} className="h-8 mt-4" />

            {!hasNextPage && videos.length > 0 && (
              <div className="flex items-center justify-center py-6 animate-in fade-in duration-500">
                <div className="h-px w-12 bg-white/10 mr-4" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  End of results
                </p>
                <div className="h-px w-12 bg-white/10 ml-4" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
