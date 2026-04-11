import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  AtSign,
  Lock,
  ImagePlus,
  Layers,
  ChevronRight,
  Upload,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// --- Animation Config ---
const smoothSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...smoothSpring,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: smoothSpring },
};

// --- Helpers ---
function inputCls(err) {
  return [
    "block w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm font-medium",
    "bg-black/20 border text-slate-100 placeholder-slate-500",
    "focus:outline-none transition-all duration-300 shadow-inner",
    err
      ? "border-rose-500/50 focus:border-rose-500 focus:bg-rose-500/10 focus:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
      : "border-white/10 focus:border-indigo-500 focus:bg-indigo-500/10 hover:border-white/20 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
  ].join(" ");
}

function Field({ id, label, icon: Icon, error, children, required = true }) {
  return (
    <motion.div variants={itemVariants} className="group relative">
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-400 mb-1.5 transition-colors duration-300 group-focus-within:text-indigo-400 ml-1"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <motion.span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors duration-300"
          animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Icon size={16} />
        </motion.span>
        {children}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mt-2 text-xs font-medium text-rose-400 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Main ---
export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarName, setAvatarName] = useState("");
  const [coverName, setCoverName] = useState("");

  const create_user = async (data) => {
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar[0]);
    if (data.coverImage && data.coverImage[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    try {
      const response = await axios.post("/api/v2/users/register", formData);
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center opacity-40 mix-blend-screen">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/[0.05] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative">
          {/* Animated Top Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Top subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />

          <div className="px-8 pt-10 pb-8 relative z-10">
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center mb-8 text-center"
            >
              <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-5 border border-white/10"
              >
                <ChevronRight
                  size={24}
                  strokeWidth={3}
                  className="text-white ml-0.5"
                />
              </motion.div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Create Account
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Join us — it only takes a minute
              </p>
            </motion.div>

            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold shadow-inner">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form
              onSubmit={handleSubmit(create_user)}
              className="space-y-5"
              noValidate
            >
              <Field
                id="fullName"
                label="Full Name"
                icon={User}
                error={errors.fullName?.message}
              >
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                  className={inputCls(errors.fullName)}
                />
              </Field>

              <Field
                id="email"
                label="Email"
                icon={Mail}
                error={errors.email?.message}
              >
                <input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  {...register("email", { required: "Email is required" })}
                  className={inputCls(errors.email)}
                />
              </Field>

              <Field
                id="username"
                label="Username"
                icon={AtSign}
                error={errors.username?.message}
              >
                <input
                  id="username"
                  type="text"
                  placeholder="janedoe"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className={inputCls(errors.username)}
                />
              </Field>

              <Field
                id="password"
                label="Password"
                icon={Lock}
                error={errors.password?.message}
              >
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className={inputCls(errors.password)}
                />
              </Field>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Profile Images
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </motion.div>

              {/* Avatar Upload */}
              <motion.div variants={itemVariants} className="group relative">
                <label
                  htmlFor="avatar"
                  className="block text-xs font-bold text-slate-400 mb-1.5 transition-colors duration-300 group-focus-within:text-indigo-400 ml-1"
                >
                  Avatar <span className="text-rose-500">*</span>
                </label>
                <label
                  htmlFor="avatar"
                  className={`
                    flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl cursor-pointer
                    border transition-all duration-300 shadow-inner
                    ${
                      errors.avatar
                        ? "bg-rose-500/10 border-rose-500/50 hover:border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                        : "bg-black/20 border-white/10 hover:border-indigo-500 hover:bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                    }
                  `}
                >
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg">
                    <ImagePlus size={16} className="text-indigo-400" />
                  </span>
                  <span className="text-sm font-medium text-slate-400 truncate flex-1 transition-colors group-hover:text-slate-300">
                    {avatarName || "Select avatar image"}
                  </span>
                  <span className="shrink-0 bg-white/5 p-1.5 rounded-lg border border-white/10 group-hover:bg-indigo-500/20 transition-colors">
                    <Upload
                      size={14}
                      className="text-slate-400 group-hover:text-indigo-400"
                    />
                  </span>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("avatar", { required: "Avatar is required" })}
                    onChange={(e) =>
                      setAvatarName(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
                <AnimatePresence>
                  {errors.avatar && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="mt-2 text-xs font-medium text-rose-400 ml-1"
                    >
                      {errors.avatar.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Cover Image Upload */}
              <motion.div variants={itemVariants} className="group relative">
                <label
                  htmlFor="coverImage"
                  className="block text-xs font-bold text-slate-400 mb-1.5 transition-colors duration-300 group-focus-within:text-purple-400 ml-1"
                >
                  Cover Image{" "}
                  <span className="text-slate-600 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <label
                  htmlFor="coverImage"
                  className="
                    flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl cursor-pointer
                    border border-white/10 bg-black/20 shadow-inner
                    hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]
                    transition-all duration-300
                  "
                >
                  <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
                    <Layers size={16} className="text-purple-400" />
                  </span>
                  <span className="text-sm font-medium text-slate-400 truncate flex-1 transition-colors group-hover:text-slate-300">
                    {coverName || "Select cover image"}
                  </span>
                  <span className="shrink-0 bg-white/5 p-1.5 rounded-lg border border-white/10 group-hover:bg-purple-500/20 transition-colors">
                    <Upload
                      size={14}
                      className="text-slate-400 group-hover:text-purple-400"
                    />
                  </span>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("coverImage")}
                    onChange={(e) =>
                      setCoverName(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(99,102,241,0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 px-4 rounded-2xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[center_right_1rem] shadow-lg shadow-indigo-500/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-500 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        >
                          <Loader2 size={18} />
                        </motion.div>
                        Creating Account...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="block"
                      >
                        Create Account
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-sm font-medium text-slate-500"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3 opacity-60"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            Secure Connection
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            v2.0.0
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
