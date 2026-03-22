import { Link } from "react-router-dom";
import { formatDuration, formatViews, timeAgo } from "../utils/Video.utils";

/**
 * VideoCard
 * @param {{ video: {
 *   _id: string,
 *   thumbnail: string,
 *   title: string,
 *   duration: number,
 *   views: number,
 *   createdAt: string,
 *   owner: { username: string, avatar: string }
 * }}} props
 */
export default function VideoCard({ video }) {
  if (!video) return null;

  const { _id, thumbnail, title, duration, views, createdAt, owner } = video;
  const ownerInitial = owner?.username?.[0]?.toUpperCase() || "?";

  return (
    <article className="group flex flex-col gap-3 w-full">
      {/* ── Thumbnail ── */}
      <Link
        to={`/watch/${_id}`}
        className="block relative w-full rounded-xl overflow-hidden bg-[#1a1a24]"
        style={{ aspectRatio: "16 / 9" }}
        aria-label={`Watch ${title}`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/60 to-[#1a1a24]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              className="text-slate-700"
            >
              <polygon points="5,3 19,12 5,21" fill="currentColor" />
            </svg>
          </div>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

        {/* duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold tabular-nums tracking-wide border border-white/10 select-none">
          {formatDuration(duration)}
        </span>

        {/* play hint on hover */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </span>
        </span>
      </Link>

      {/* ── Details row ── */}
      <div className="flex items-start gap-3 px-0.5">
        {/* Owner avatar — links to channel */}
        <Link
          to={`/channel/${owner?.username}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Visit ${owner?.username}'s channel`}
          className="flex-shrink-0 mt-0.5"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-indigo-500/50 transition-all duration-200 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
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
              className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150"
              title={title}
            >
              {title || "Untitled Video"}
            </h3>
          </Link>

          <p className="text-[11px] text-slate-500 leading-tight truncate">
            <Link
              to={`/channel/${owner?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-slate-300 transition-colors duration-150"
            >
              {owner?.username || "Unknown"}
            </Link>
            <span className="mx-1 opacity-40">•</span>
            {formatViews(views)}
            <span className="mx-1 opacity-40">•</span>
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
