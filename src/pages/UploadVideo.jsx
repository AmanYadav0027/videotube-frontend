import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({ file, accept, label, hint, icon: Icon, onChange, error }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onChange(dropped);
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
        className={`relative w-full border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
          error
            ? "border-rose-500/40 bg-rose-500/5"
            : dragging
              ? "border-indigo-500/70 bg-indigo-500/10"
              : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-white/[0.1] bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/5"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {file ? (
            <>
              <CheckCircle2 size={28} className="text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-300 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatBytes(file.size)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                <Icon size={22} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">{label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{hint}</p>
              </div>
            </>
          )}
        </div>

        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-3 right-3 p-1 rounded-lg bg-white/[0.06] text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" />
          Uploading…
        </span>
        <span className="text-indigo-400 font-semibold tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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

  // generate thumbnail preview
  const handleThumbnail = (file) => {
    setThumbnail(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
    } else {
      setThumbPreview(null);
    }
  };

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

    try {
      const res = await axios.post("/api/v2/videos", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });

      setSuccess(true);
      const newVideoId = res.data?.data?._id;
      setTimeout(
        () => navigate(newVideoId ? `/watch/${newVideoId}` : "/dashboard"),
        1500,
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

  // ─────────────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-full bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Upload successful!
          </h2>
          <p className="text-sm text-slate-500">Redirecting to your video…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Film size={16} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Upload Video</h1>
            <p className="text-xs text-slate-600">
              Share your content with the world
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Video file */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Video File <span className="text-rose-500">*</span>
            </label>
            <DropZone
              file={videoFile}
              accept="video/*"
              label="Drop your video here or click to browse"
              hint="MP4, WebM, MOV — max 500MB"
              icon={FileVideo}
              onChange={setVideoFile}
              error={errors.videoFile}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Thumbnail <span className="text-rose-500">*</span>
            </label>
            {thumbPreview ? (
              <div
                className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-black"
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  src={thumbPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleThumbnail(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Thumbnail set
                </span>
              </div>
            ) : (
              <DropZone
                file={thumbnail}
                accept="image/*"
                label="Drop thumbnail image or click to browse"
                hint="JPG, PNG, WebP — recommended 1280×720"
                icon={ImagePlus}
                onChange={handleThumbnail}
                error={errors.thumbnail}
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Give your video a great title"
              className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-600 bg-white/[0.03] border outline-none transition-all duration-200 ${
                errors.title
                  ? "border-rose-500/40 focus:border-rose-500/60"
                  : "border-white/[0.08] focus:border-indigo-500/50 focus:bg-indigo-500/5"
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-xs text-rose-400">{errors.title}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-slate-700 tabular-nums">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Tell viewers about your video…"
              className={`w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-600 bg-white/[0.03] border outline-none transition-all duration-200 resize-none ${
                errors.description
                  ? "border-rose-500/40 focus:border-rose-500/60"
                  : "border-white/[0.08] focus:border-indigo-500/50 focus:bg-indigo-500/5"
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-xs text-rose-400">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-slate-700 tabular-nums">
                {description.length}/2000
              </span>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              {serverError}
            </div>
          )}

          {/* Progress */}
          {uploading && <ProgressBar progress={progress} />}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="relative w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Uploading {progress}%…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload size={15} />
                Publish Video
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
