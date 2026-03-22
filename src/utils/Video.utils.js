/**
 * formatDuration(seconds)
 * Converts raw seconds from Cloudinary into a readable MM:SS or H:MM:SS string.
 * e.g. 125 → "2:05"  |  3661 → "1:01:01"
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "0:00";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * formatViews(views)
 * Converts raw view counts into YouTube-style abbreviated strings.
 * e.g. 1500 → "1.5K views"  |  1200000 → "1.2M views"  |  999 → "999 views"
 */
export function formatViews(views) {
  if (!views && views !== 0) return "0 views";
  if (views >= 1_000_000)
    return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (views >= 1_000)
    return `${(views / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${views} ${views === 1 ? "view" : "views"}`;
}

/**
 * timeAgo(dateString)
 * Converts a MongoDB ISO date string into a relative human-readable string.
 * e.g. "2 days ago"  |  "1 month ago"  |  "just now"
 */
export function timeAgo(dateString) {
  if (!dateString) return "";
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < 2592000) {
    const d = Math.floor(diff / 86400);
    return `${d} ${d === 1 ? "day" : "days"} ago`;
  }
  if (diff < 31536000) {
    const mo = Math.floor(diff / 2592000);
    return `${mo} ${mo === 1 ? "month" : "months"} ago`;
  }
  const y = Math.floor(diff / 31536000);
  return `${y} ${y === 1 ? "year" : "years"} ago`;
}
