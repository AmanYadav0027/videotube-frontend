import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ImagePlus,
  X,
  CheckCircle2,
  AlertTriangle,
  Film,
  FileVideo,
  Loader2,
} from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

// ─── Dropzone ────────────────────────────────────────────────────────────────

const DropZone = memo(function DropZone({
  file,
  accept,
  label,
  hint,
  icon: Icon,
  onChange,
  error,
}) {
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState("idle"); // "idle" | "drag" | "success" | "error"
  const inputRef = useRef(null);

  useEffect(() => {
    if (error) setState("error");
    else if (dragging) setState("drag");
    else if (file) setState("success");
    else setState("idle");
  }, [error, dragging, file]);

  const stateStyles = {
    idle: { border: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.02)" },
    drag: { border: "rgba(99,102,241,0.8)", bg: "rgba(99,102,241,0.15)" },
    success: { border: "rgba(16,185,129,0.5)", bg: "rgba(16,185,129,0.05)" },
    error: { border: "rgba(244,63,94,0.5)", bg: "rgba(244,63,94,0.05)" },
  };
  const s = stateStyles[state];

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onChange(dropped);
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
        className="relative w-full border-2 border-dashed rounded-3xl p-8 cursor-pointer overflow-hidden group"
        style={{
          borderColor: s.border,
          backgroundColor: s.bg,
          transition: "border-color 200ms ease, background-color 200ms ease",
          contain: "layout style",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        <div className="relative flex flex-col items-center gap-4 text-center z-10">
          <AnimatePresence mode="wait" initial={false}>
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle2 size={36} className="text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-emerald-500/70 mt-1 font-medium tracking-wide">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10
                                flex items-center justify-center shadow-inner
                                ${dragging ? "animate-bounce" : ""}`}
                >
                  <Icon
                    size={28}
                    className={dragging ? "text-indigo-400" : "text-slate-400"}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{hint}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-slate-300
                       hover:text-rose-400 hover:bg-rose-500/20 transition-colors z-20"
          >
            <X size={16} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleChange}
        />
      </div>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-200"
        style={{ maxHeight: error ? "40px" : "0px", opacity: error ? 1 : 0 }}
      >
        <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
          <AlertTriangle size={14} />
          {error}
        </p>
      </div>
    </div>
  );
});

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = memo(function ProgressBar({ progress }) {
  return (
    <div
      className="space-y-3 p-4 rounded-2xl border"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-indigo-300 flex items-center gap-2 font-medium">
          <Loader2 size={14} className="animate-spin" />
          Processing & Uploading
        </span>
        <span className="font-bold tabular-nums text-sm text-indigo-400">
          {progress}%
        </span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        />
      </div>
    </div>
  );
});

// ─── Animation variants ───────────────────────────────────────────────────────

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.055 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function UploadVideo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleThumbnail = useCallback((file) => {
    setThumbnail(file);
    setThumbPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  // Revoke object URL on unmount
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
    if (!videoFile) e.videoFile = "Video file is required";
    if (!thumbnail) e.thumbnail = "Thumbnail is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || uploading) return;
    setUploading(true);
    setServerError("");
    setProgress(0);

    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("videoFile", videoFile);
    form.append("thumbnail", thumbnail);

    const onProgress = throttle((ev) => {
      setProgress(Math.round((ev.loaded * 100) / ev.total));
    }, 100);

    try {
      const res = await axios.post("/api/v2/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress,
      });
      setSuccess(true);
      const newVideoId = res.data?.data?._id;
      setTimeout(
        () => navigate(newVideoId ? `/watch/${newVideoId}` : "/dashboard"),
        2500,
      );
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-6 p-12 rounded-[3rem] border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 mx-auto"
          >
            <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
              Upload Complete!
            </h2>
            <p className="text-slate-400 font-medium">
              Preparing your masterpiece for the world...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050508] p-4 sm:p-8 relative overflow-hidden text-slate-200">
      <svg
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
        width="800"
        height="400"
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ambientGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.10)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="400" cy="200" rx="400" ry="200" fill="url(#ambientGlow)" />
      </svg>

      <motion.div
        initial="hidden"
        animate="show"
        variants={formVariants}
        className="max-w-3xl mx-auto relative z-10"
      >
        {/* Header badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-10 p-4 rounded-3xl border border-white/10 w-max pr-8 shadow-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600
                          flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Film size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Upload Studio
            </h1>
            <p className="text-sm text-indigo-200/70 font-medium">
              Share your vision with the world
            </p>
          </div>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-6 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
          style={{ background: "rgba(10,10,18,0.97)" }}
          noValidate
        >
          {/* Video drop */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 ml-1">
              <FileVideo size={16} className="text-indigo-400" />
              Source Video <span className="text-rose-500">*</span>
            </label>
            <DropZone
              file={videoFile}
              accept="video/*"
              label="Drag & drop your video file here"
              hint="MP4, WebM, MOV — up to 500MB"
              icon={FileVideo}
              onChange={setVideoFile}
              error={errors.videoFile}
            />
          </motion.div>

          {/* Thumbnail */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 ml-1">
              <ImagePlus size={16} className="text-purple-400" />
              Cover Thumbnail <span className="text-rose-500">*</span>
            </label>
            <AnimatePresence mode="wait" initial={false}>
              {thumbPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="relative w-full rounded-3xl overflow-hidden border-2 border-purple-500/30 bg-black group"
                  style={{ aspectRatio: "16/9" }}
                >
                  <img
                    src={thumbPreview}
                    alt="Thumbnail preview"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleThumbnail(null)}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white
                               hover:bg-rose-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div
                    className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/50 border border-white/10
                                  text-emerald-400 text-sm font-bold flex items-center gap-2
                                  translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                  transition-[transform,opacity] duration-300"
                  >
                    <CheckCircle2 size={16} /> Cover Applied
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <DropZone
                    file={thumbnail}
                    accept="image/*"
                    label="Upload a catchy thumbnail"
                    hint="JPG, PNG, WebP — 1280×720 recommended"
                    icon={ImagePlus}
                    onChange={handleThumbnail}
                    error={errors.thumbnail}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Text fields */}
          <motion.div variants={itemVariants} className="grid gap-6">
            {/* Title */}
            <div className="relative group">
              <label
                htmlFor="title"
                className="block text-sm font-bold text-slate-300 mb-2 ml-1
                                transition-colors group-focus-within:text-indigo-400"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Give your masterpiece a name..."
                className={`w-full px-5 py-4 rounded-2xl text-base text-white placeholder-slate-500
                            bg-black/40 border-2 outline-none shadow-inner
                            transition-[border-color] duration-150
                            ${errors.title ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-indigo-500"}`}
              />
              <div className="flex items-center justify-between mt-2 ml-1 min-h-[1.25rem]">
                {errors.title && (
                  <p className="text-xs font-medium text-rose-400">
                    {errors.title}
                  </p>
                )}
                <span
                  className={`text-xs font-medium tabular-nums ml-auto
                                  ${title.length > 90 ? "text-amber-400" : "text-slate-500"}`}
                >
                  {title.length}/100
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="relative group">
              <label
                htmlFor="description"
                className="block text-sm font-bold text-slate-300 mb-2 ml-1
                                transition-colors group-focus-within:text-purple-400"
              >
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="What's this video about? Add links, chapters, and details here..."
                className={`w-full px-5 py-4 rounded-2xl text-base text-white placeholder-slate-500
                            bg-black/40 border-2 outline-none resize-none shadow-inner
                            transition-[border-color] duration-150
                            ${errors.description ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-purple-500"}`}
              />
              <div className="flex items-center justify-end mt-2 ml-1 min-h-[1.25rem]">
                {errors.description && (
                  <p className="text-xs font-medium text-rose-400 mr-auto">
                    {errors.description}
                  </p>
                )}
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {description.length}/2000
                </span>
              </div>
            </div>
          </motion.div>

          <div
            className="overflow-hidden transition-[max-height,opacity] duration-200"
            style={{
              maxHeight: serverError ? "80px" : "0px",
              opacity: serverError ? 1 : 0,
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-rose-500/10
                            border-l-4 border-rose-500 text-rose-400 text-sm font-bold"
            >
              <AlertTriangle size={18} className="shrink-0" />
              {serverError}
            </div>
          </div>

          {uploading && <ProgressBar progress={progress} />}

          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="relative w-full py-4 rounded-2xl text-base font-black text-white
             bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
             focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50
             disabled:opacity-70 disabled:cursor-not-allowed
             shadow-[0_8px_24px_rgba(99,102,241,0.3)]
             hover:shadow-[0_16px_40px_rgba(99,102,241,0.45)]
             hover:brightness-110 active:scale-[0.99]
             transition-[box-shadow,filter,transform] duration-200"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 tracking-wide">
                  <Upload size={20} />
                  Publish Video
                </span>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
