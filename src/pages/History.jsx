import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import VideoCard from "../components/VideoCard";
import { History as HistoryIcon } from "lucide-react";

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
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Watch History — MyApp";
    const fetch = async () => {
      try {
        // getWatchHistory → GET /api/v2/users/history
        const res = await axios.get("/api/v2/users/history");
        const data = res.data?.data ?? [];
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load watch history.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <HistoryIcon size={16} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              Watch History
            </h1>
            <p className="text-xs text-slate-600">
              {!loading &&
                `${videos.length} video${videos.length !== 1 ? "s" : ""} watched`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-2">
              <HistoryIcon size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                No watch history yet
              </p>
              <p className="text-xs text-slate-700">
                Videos you watch will appear here.
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

        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, i) => (
              <VideoCard key={video._id ?? i} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
