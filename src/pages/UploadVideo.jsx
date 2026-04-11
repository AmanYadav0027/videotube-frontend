import { useState, useRef, useCallback } from "react";
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

const dropzoneVariants = {
  idle: {
    scale: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  hover: {
    scale: 1.02,
    borderColor: "rgba(99, 102, 241, 0.4)",
    backgroundColor: "rgba(99, 102, 241, 0.05)",
  },
  drag: {
    scale: 1.05,
    borderColor: "rgba(99, 102, 241, 0.8)",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
  },
  success: {
    scale: 1,
    borderColor: "rgba(16, 185, 129, 0.5)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  error: {
    scale: 1,
    borderColor: "rgba(244, 63, 94, 0.5)",
    backgroundColor: "rgba(244, 63, 94, 0.05)",
  },
};

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

  const currentState = error
    ? "error"
    : dragging
      ? "drag"
      : file
        ? "success"
        : "idle";

  return (
    <div>
      <motion.div
        variants={dropzoneVariants}
        initial="idle"
        animate={currentState}
        whileHover={currentState === "idle" ? "hover" : currentState}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative w-full border-2 border-dashed rounded-3xl p-8 cursor-pointer overflow-hidden group"
      >
        <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex flex-col items-center gap-4 text-center z-10">
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2
                    size={36}
                    className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  />
                </motion.div>
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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={dragging ? { y: [0, -8, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner"
                >
                  <Icon
                    size={28}
                    className={dragging ? "text-indigo-400" : "text-slate-400"}
                  />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{hint}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {file && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 backdrop-blur-md transition-colors z-20"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium"
          >
            <AlertTriangle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-indigo-300 flex items-center gap-2 font-medium">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 size={14} />
          </motion.div>
          Processing & Uploading
        </span>
        <motion.span
          key={progress}
          initial={{ scale: 1.5, color: "#fff" }}
          animate={{ scale: 1, color: "#818cf8" }}
          className="font-bold tabular-nums text-sm"
        >
          {progress}%
        </motion.span>
      </div>
      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

const formVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } },
};

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

  if (success) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="relative z-10 text-center space-y-6 bg-white/5 p-12 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2"
            >
              Upload Complete!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-400 font-medium"
            >
              Preparing your masterpiece for the world...
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -z-10"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] p-4 sm:p-8 relative overflow-hidden text-slate-200">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={formVariants}
        className="max-w-3xl mx-auto relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-10 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl w-max pr-8 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
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
          className="space-y-8 bg-white/5 p-6 sm:p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl"
          noValidate
        >
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

          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 ml-1">
              <ImagePlus size={16} className="text-purple-400" />
              Cover Thumbnail <span className="text-rose-500">*</span>
            </label>
            <AnimatePresence mode="wait">
              {thumbPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="relative w-full rounded-3xl overflow-hidden border-2 border-purple-500/30 bg-black shadow-2xl shadow-purple-500/20 group"
                  style={{ aspectRatio: "16/9" }}
                >
                  <img
                    src={thumbPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => handleThumbnail(null)}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-rose-500 shadow-xl transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                  <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-emerald-400 text-sm font-bold flex items-center gap-2 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <CheckCircle2 size={16} /> Cover Applied
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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

          <motion.div variants={itemVariants} className="grid gap-6">
            <div className="relative group">
              <label
                htmlFor="title"
                className="block text-sm font-bold text-slate-300 mb-2 ml-1 transition-colors group-focus-within:text-indigo-400"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Give your masterpiece a name..."
                  className={`w-full px-5 py-4 rounded-2xl text-base text-white placeholder-slate-500 bg-black/40 border-2 outline-none transition-all duration-300 shadow-inner ${
                    errors.title
                      ? "border-rose-500/50 focus:border-rose-500 focus:bg-rose-500/5"
                      : "border-white/10 focus:border-indigo-500 focus:bg-indigo-500/5 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  }`}
                />
              </div>
              <div className="flex justify-between mt-2 ml-1">
                <AnimatePresence>
                  {errors.title ? (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium text-rose-400"
                    >
                      {errors.title}
                    </motion.p>
                  ) : (
                    <span />
                  )}
                </AnimatePresence>
                <span
                  className={`text-xs font-medium tabular-nums transition-colors ${title.length > 90 ? "text-amber-400" : "text-slate-500"}`}
                >
                  {title.length}/100
                </span>
              </div>
            </div>

            <div className="relative group">
              <label
                htmlFor="description"
                className="block text-sm font-bold text-slate-300 mb-2 ml-1 transition-colors group-focus-within:text-purple-400"
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
                className={`w-full px-5 py-4 rounded-2xl text-base text-white placeholder-slate-500 bg-black/40 border-2 outline-none transition-all duration-300 resize-none shadow-inner ${
                  errors.description
                    ? "border-rose-500/50 focus:border-rose-500 focus:bg-rose-500/5"
                    : "border-white/10 focus:border-purple-500 focus:bg-purple-500/5 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                }`}
              />
              <div className="flex justify-between mt-2 ml-1">
                <AnimatePresence>
                  {errors.description ? (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium text-rose-400"
                    >
                      {errors.description}
                    </motion.p>
                  ) : (
                    <span />
                  )}
                </AnimatePresence>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {description.length}/2000
                </span>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-400 text-sm font-bold shadow-lg">
                  <AlertTriangle size={18} className="shrink-0" />
                  {serverError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {uploading && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ProgressBar progress={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="pt-4">
            <motion.button
              whileHover={
                !uploading
                  ? {
                      scale: 1.02,
                      boxShadow: "0 20px 40px -10px rgba(99,102,241,0.5)",
                    }
                  : {}
              }
              whileTap={!uploading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={uploading}
              className="relative w-full py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group shadow-xl shadow-indigo-500/20 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <AnimatePresence mode="wait">
                {uploading ? (
                  <motion.span
                    key="uploading"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Loader2 size={20} className="animate-spin" />
                    Publishing...
                  </motion.span>
                ) : (
                  <motion.span
                    key="publish"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="flex items-center justify-center gap-3 tracking-wide"
                  >
                    <Upload
                      size={20}
                      className="group-hover:-translate-y-1 transition-transform"
                    />
                    Publish Video
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
