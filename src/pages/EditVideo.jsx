import { useState, useRef, useCallback, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  ImagePlus,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Film,
  Save,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Thumbnail dropzone ───────────────────────────────────────────────────────
// Plain div + CSS transitions — no framer whileHover listener (avoids style recalc on mousemove)
const ThumbnailDropZone = memo(function ThumbnailDropZone({
  file,
  onChange,
  error,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const borderColor = error
    ? "rgba(244,63,94,0.5)"
    : dragging
      ? "rgba(99,102,241,0.8)"
      : file
        ? "rgba(16,185,129,0.5)"
        : "rgba(255,255,255,0.1)";

  const bgColor = error
    ? "rgba(244,63,94,0.04)"
    : dragging
      ? "rgba(99,102,241,0.08)"
      : file
        ? "rgba(16,185,129,0.04)"
        : "rgba(255,255,255,0.02)";

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onChange(f);
    },
    [onChange],
  );

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.files?.[0] ?? null);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange],
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative w-full border-2 border-dashed rounded-2xl p-6 cursor-pointer overflow-hidden group"
        style={{
          borderColor,
          backgroundColor: bgColor,
          transition: "border-color 180ms ease, background-color 180ms ease",
          contain: "layout style",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        <div className="relative flex flex-col items-center gap-3 text-center z-10">
          {file ? (
            <>
              <CheckCircle2 size={28} className="text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-emerald-500/70 mt-0.5">
                  {formatBytes(file.size)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${dragging ? "animate-bounce" : ""}`}
              >
                <ImagePlus
                  size={22}
                  className={dragging ? "text-indigo-400" : "text-slate-400"}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drop new thumbnail here
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  JPG, PNG, WebP — 1280×720 recommended
                </p>
              </div>
            </>
          )}
        </div>

        {file && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-slate-300
                       hover:text-rose-400 hover:bg-rose-500/20 transition-colors z-20"
          >
            <X size={14} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />
      </div>

      {/* CSS height transition — no framer layout animation */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-200"
        style={{ maxHeight: error ? "40px" : "0px", opacity: error ? 1 : 0 }}
      >
        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
          <AlertTriangle size={13} /> {error}
        </p>
      </div>
    </div>
  );
});

// ─── Animation variants — tween not spring to avoid long RAF loop ─────────────
const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  // Fetch states
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentThumb, setCurrentThumb] = useState(""); // existing cloudinary URL
  const [newThumb, setNewThumb] = useState(null); // File | null
  const [thumbPreview, setThumbPreview] = useState(null); // object URL

  // Submit states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Fetch existing video data on mount
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`/api/v2/videos/${videoId}`);
        const v = res.data?.data;
        if (!cancelled) {
          setTitle(v.title ?? "");
          setDescription(v.description ?? "");
          setCurrentThumb(v.thumbnail ?? "");
        }
      } catch (err) {
        if (!cancelled)
          setFetchError(err.response?.data?.message || "Failed to load video.");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // Revoke object URL on unmount / thumb change
  const handleNewThumb = useCallback((file) => {
    setNewThumb(file);
    setThumbPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    setServerError("");

    // Use FormData only if a new thumbnail was picked; otherwise JSON is fine
    // but the backend uses upload.single("thumbnail") so always send FormData
    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    if (newThumb) form.append("thumbnail", newThumb);

    try {
      await axios.patch(`/api/v2/videos/${videoId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => navigate(`/watch/${videoId}`), 2000);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Update failed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading video…</p>
        </div>
      </div>
    );
  }

  // ── Fetch error ─────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div
          className="text-center space-y-4 p-8 rounded-[2rem] border border-rose-500/10 max-w-sm w-full"
          style={{ background: "rgba(244,63,94,0.04)" }}
        >
          <AlertTriangle size={32} className="text-rose-400 mx-auto" />
          <p className="text-sm font-medium text-slate-300">{fetchError}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center space-y-5 p-12 rounded-[3rem] border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 mx-auto"
          >
            <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1">
              Changes Saved!
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Redirecting to your video…
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050508] p-4 sm:p-8 relative overflow-hidden text-slate-200">
      {/* Static SVG ambient glow — zero repaint cost */}
      <svg
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
        width="700"
        height="350"
        viewBox="0 0 700 350"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="editGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.09)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="350" cy="175" rx="350" ry="175" fill="url(#editGlow)" />
      </svg>

      <motion.div
        initial="hidden"
        animate="show"
        variants={formVariants}
        className="max-w-2xl mx-auto relative z-10"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-white/10 text-slate-400
                       hover:text-white hover:border-white/20 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 pr-6"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600
                            flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <Film size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">
                Edit Video
              </h1>
              <p className="text-xs text-indigo-200/60 font-medium">
                Update your video details
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form card — solid bg, no backdrop-blur (avoids compositing repaint) */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7 p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl"
          style={{ background: "rgba(10,10,18,0.97)" }}
          noValidate
        >
          {/* Current thumbnail preview */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 ml-0.5">
              <ImagePlus size={15} className="text-purple-400" />
              Thumbnail
            </label>

            {/* Show new preview if picked, otherwise show existing */}
            <AnimatePresence mode="wait" initial={false}>
              {thumbPreview || currentThumb ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="relative w-full rounded-2xl overflow-hidden border-2 border-purple-500/25 bg-black group mb-3"
                  style={{ aspectRatio: "16/9" }}
                >
                  <img
                    src={thumbPreview ?? currentThumb}
                    alt="Thumbnail"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay badge */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10
                                  text-xs font-bold text-slate-300 flex items-center gap-1.5
                                  translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                  transition-[transform,opacity] duration-300"
                  >
                    {thumbPreview ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-400" />{" "}
                        New thumbnail selected
                      </>
                    ) : (
                      <>
                        <Film size={13} className="text-indigo-400" /> Current
                        thumbnail
                      </>
                    )}
                  </div>
                  {/* Replace button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNewThumb(null);
                      if (!thumbPreview) setCurrentThumb("");
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 border border-white/15
                               text-xs font-bold text-slate-300 hover:text-white hover:bg-black/80
                               transition-colors flex items-center gap-1.5"
                  >
                    <Pencil size={11} /> Replace
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Drop zone — only shown when no preview */}
            {!thumbPreview && !currentThumb && (
              <ThumbnailDropZone
                file={newThumb}
                onChange={handleNewThumb}
                error={errors.thumbnail}
              />
            )}

            {/* When we have a current thumb but user wants to replace, show dropzone below */}
            {(thumbPreview || currentThumb) && (
              <div className="mt-3">
                <ThumbnailDropZone
                  file={newThumb}
                  onChange={handleNewThumb}
                  error={errors.thumbnail}
                />
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="edit-title"
              className="block text-sm font-bold text-slate-300 mb-2 ml-0.5
                              transition-colors group-focus-within:text-indigo-400"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Give your video a compelling title…"
              className={`w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500
                          bg-black/40 border-2 outline-none shadow-inner
                          transition-[border-color] duration-150
                          ${
                            errors.title
                              ? "border-rose-500/60 focus:border-rose-500"
                              : "border-white/10 focus:border-indigo-500"
                          }`}
            />
            <div className="flex items-center justify-between mt-1.5 ml-0.5 min-h-[1.1rem]">
              {errors.title && (
                <p className="text-xs font-medium text-rose-400">
                  {errors.title}
                </p>
              )}
              <span
                className={`text-xs tabular-nums ml-auto ${title.length > 90 ? "text-amber-400" : "text-slate-600"}`}
              >
                {title.length}/100
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="edit-desc"
              className="block text-sm font-bold text-slate-300 mb-2 ml-0.5
                              transition-colors group-focus-within:text-purple-400"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Describe your video — add chapters, links, or context…"
              className={`w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500
                          bg-black/40 border-2 outline-none resize-none shadow-inner
                          transition-[border-color] duration-150
                          ${
                            errors.description
                              ? "border-rose-500/60 focus:border-rose-500"
                              : "border-white/10 focus:border-purple-500"
                          }`}
            />
            <div className="flex items-center justify-between mt-1.5 ml-0.5 min-h-[1.1rem]">
              {errors.description && (
                <p className="text-xs font-medium text-rose-400">
                  {errors.description}
                </p>
              )}
              <span className="text-xs text-slate-600 tabular-nums ml-auto">
                {description.length}/2000
              </span>
            </div>
          </motion.div>

          {/* Server error — CSS max-height, no framer layout */}
          <div
            className="overflow-hidden transition-[max-height,opacity] duration-200"
            style={{
              maxHeight: serverError ? "80px" : "0px",
              opacity: serverError ? 1 : 0,
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-rose-500/10
                            border-l-4 border-rose-500 text-rose-400 text-sm font-bold"
            >
              <AlertTriangle size={16} className="shrink-0" />
              {serverError}
            </div>
          </div>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 pt-1"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-400
                         border border-white/10 hover:text-white hover:border-white/20
                         transition-[border-color,color] duration-150"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl text-sm font-black text-white
                         bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
                         hover:brightness-110 hover:shadow-[0_12px_32px_rgba(99,102,241,0.4)]
                         active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-[filter,box-shadow,transform] duration-200
                         flex items-center justify-center gap-2"
            >
              <AnimatePresence mode="wait" initial={false}>
                {saving ? (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={16} className="animate-spin" /> Saving…
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
