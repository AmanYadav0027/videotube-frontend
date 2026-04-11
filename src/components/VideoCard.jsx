import { Link } from "react-router-dom";
import { formatDuration, formatViews, timeAgo } from "../utils/Video.utils";

export default function VideoCard({ video }) {
  if (!video) return null;

  const { _id, thumbnail, title, duration, views, createdAt, owner } = video;
  const ownerInitial = owner?.username?.[0]?.toUpperCase() || "?";

  return (
    <article className="group flex flex-col gap-3 w-full cursor-pointer">
      {/* ── Thumbnail ── */}
      <Link
        to={`/watch/${_id}`}
        className="block relative w-full rounded-xl overflow-hidden bg-[#1a1a24] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-indigo-500/10 border border-transparent group-hover:border-white/5"
        style={{ aspectRatio: "16 / 9" }}
        aria-label={`Watch ${title}`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/60 to-[#1a1a24]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              className="text-slate-700 transition-transform duration-500 group-hover:scale-110"
            >
              <polygon points="5,3 19,12 5,21" fill="currentColor" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 pointer-events-none" />

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold tabular-nums tracking-wide border border-white/10 select-none transition-opacity duration-300 group-hover:opacity-0">
          {formatDuration(duration)}
        </span>

        {/* Play hint on hover */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-10">
          <span className="w-12 h-12 rounded-full bg-indigo-500/90 backdrop-blur-md shadow-2xl shadow-indigo-500/50 flex items-center justify-center pl-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </span>
        </span>
      </Link>

      {/* ── Details row ── */}
      <div className="flex items-start gap-3 px-0.5">
        {/* Owner avatar */}
        <Link
          to={`/channel/${owner?.username}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Visit ${owner?.username}'s channel`}
          className="shrink-0 mt-0.5 group/avatar"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-indigo-500/50 transition-all duration-300 group-hover/avatar:scale-110 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold select-none">
                {ownerInitial}
              </span>
            )}
          </div>
        </Link>

        {/* Text column */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <Link to={`/watch/${_id}`}>
            <h3
              className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors duration-200"
              title={title}
            >
              {title || "Untitled Video"}
            </h3>
          </Link>

          <div className="flex flex-col gap-0.5 mt-0.5">
            <Link
              to={`/channel/${owner?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors duration-150 font-medium truncate"
            >
              {owner?.username || "Unknown"}
            </Link>
            <p className="text-[11px] text-slate-500 leading-tight">
              {formatViews(views)}
              <span className="mx-1.5 opacity-40">·</span>
              {timeAgo(createdAt)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
