import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "../components/VideoCard";
import {
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Flame,
  X,
  SearchX,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="w-full rounded-2xl border border-white/[0.04] skeleton-shimmer"
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
    if (opt.label !== activeSort.label) setActiveSort(opt);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#050508" }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/3 w-[600px] h-[500px] opacity-[0.08] "
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-[0.05] "
          style={{
            background:
              "radial-gradient(ellipse, rgba(236,72,153,1) 0%, transparent 65%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* ── Sort toolbar ── */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 py-3 border-b border-white/[0.05]"
        style={{
          background: "rgba(5,5,8,0.9)",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <AnimatePresence mode="wait">
            {searchQuery ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={spring}
                className="flex items-center gap-2"
              >
                <Sparkles size={13} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-slate-400">
                  {loading ? (
                    "Searching…"
                  ) : (
                    <>
                      <span className="text-indigo-300 font-black">
                        {totalVideos.toLocaleString()}
                      </span>{" "}
                      result{totalVideos !== 1 ? "s" : ""} for
                    </>
                  )}{" "}
                  <span className="text-white font-bold">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={clearSearch}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 border border-white/[0.07] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
                >
                  <X size={11} strokeWidth={3} /> Clear
                </motion.button>
              </motion.div>
            ) : (
              <motion.p
                key="count"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-600 font-semibold tabular-nums"
              >
                {!loading &&
                  `${totalVideos.toLocaleString()} video${totalVideos !== 1 ? "s" : ""}`}
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className="flex items-center gap-0.5 p-1 rounded-xl border border-white/[0.07] shrink-0"
            style={{
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(10px)",
            }}
          >
            <SlidersHorizontal
              size={12}
              className="text-slate-600 ml-1.5 mr-1 shrink-0"
            />
            {SORT_OPTIONS.map((opt) => {
              const isActive = activeSort.label === opt.label;
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.label}
                  onClick={() => handleSortChange(opt)}
                  whileHover={!isActive ? { scale: 1.04 } : {}}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold select-none outline-none transition-colors duration-150 ${isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="home-sort-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                      }}
                      transition={spring}
                    />
                  )}
                  <Icon
                    size={12}
                    className="relative z-10 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="relative z-10">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Error */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[40vh]"
            >
              <div className="text-center space-y-4 max-w-sm">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20"
                  style={{
                    background: "rgba(244,63,94,0.08)",
                    boxShadow: "0 0 30px rgba(244,63,94,0.12)",
                  }}
                >
                  <AlertCircle size={24} className="text-rose-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">
                    Something went wrong
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {error}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    fetchVideos({
                      pageNum: 1,
                      sort: activeSort,
                      query: searchQuery,
                    })
                  }
                  className="text-xs font-bold px-5 py-2.5 rounded-xl text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-all"
                  style={{ background: "rgba(99,102,241,0.06)" }}
                >
                  Try again
                </motion.button>
              </div>
            </motion.div>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[40vh]"
            >
              <div className="text-center space-y-3 max-w-sm">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-white/[0.07]"
                  style={{ background: "rgba(255,255,255,0.025)" }}
                >
                  {searchQuery ? (
                    <SearchX
                      size={24}
                      className="text-slate-600"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <Clock
                      size={24}
                      className="text-indigo-500/40"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No videos yet"}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {searchQuery
                      ? "Try checking your spelling or using more general terms."
                      : "When creators upload videos, they will appear right here."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && videos.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {videos.map((video, i) => (
                    <VideoCard key={video._id} video={video} index={i} />
                  ))}
                  {loadingMore &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={`more-${i}`} />
                    ))}
                </div>
              </motion.div>

              <div ref={sentinelRef} className="h-8 mt-4" />

              {!hasNextPage && videos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-10 gap-4"
                >
                  <div
                    className="h-px flex-1 max-w-[80px]"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(255,255,255,0.08))",
                    }}
                  />
                  <p className="text-xs text-slate-700 font-bold uppercase tracking-[0.2em]">
                    End of results
                  </p>
                  <div
                    className="h-px flex-1 max-w-[80px]"
                    style={{
                      background:
                        "linear-gradient(to left, transparent, rgba(255,255,255,0.08))",
                    }}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
