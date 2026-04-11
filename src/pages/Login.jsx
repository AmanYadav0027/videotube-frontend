import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { login as authLogin } from "../store/authSlice";
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const smoothSpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: smoothSpring,
  },
};

function inputCls(err) {
  return [
    "block w-full pl-10 pr-10 py-3.5 rounded-2xl text-sm font-medium",
    "bg-black/25 border text-slate-100 placeholder-slate-500",
    "focus:outline-none transition-all duration-300 shadow-inner",
    err
      ? "border-rose-500/50 focus:border-rose-500 focus:bg-rose-500/8 focus:shadow-[0_0_18px_rgba(244,63,94,0.12)]"
      : "border-white/10 focus:border-indigo-500 focus:bg-indigo-500/8 hover:border-white/18 focus:shadow-[0_0_18px_rgba(99,102,241,0.12)]",
  ].join(" ");
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (data) => {
    setError("");
    setLoading(true);

    const isEmail = data.emailOrUsername.includes("@");
    const loginData = {
      [isEmail ? "email" : "username"]: data.emailOrUsername,
      password: data.password,
    };

    try {
      const response = await axios.post("/api/v2/users/login", loginData);
      if (response.status === 200) {
        const userData = response.data.data.user;
        dispatch(authLogin(userData));
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.06, 0.18, 0.06] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md z-10"
      >
        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-36 bg-indigo-500/8 blur-[60px] pointer-events-none" />

          <div className="px-8 pt-10 pb-8 relative z-10">
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center mb-8 text-center"
            >
              <motion.div
                whileHover={{ rotate: 90, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-5 border border-white/10"
              >
                <ChevronRight
                  size={22}
                  strokeWidth={3}
                  className="text-white ml-0.5"
                />
              </motion.div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-2">
                Sign in to continue to your workspace
              </p>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold shadow-inner">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form
              onSubmit={handleSubmit(loginUser)}
              className="space-y-5"
              noValidate
            >
              {/* Email / Username */}
              <motion.div variants={itemVariants} className="group relative">
                <label
                  htmlFor="emailOrUsername"
                  className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-400"
                >
                  Email or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <motion.span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors duration-300"
                    animate={
                      errors.emailOrUsername ? { x: [0, -4, 4, -4, 4, 0] } : {}
                    }
                    transition={{ duration: 0.35 }}
                  >
                    <AtSign size={15} />
                  </motion.span>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="jane@example.com or janedoe"
                    {...register("emailOrUsername", {
                      required: "Email or username is required",
                    })}
                    className={inputCls(errors.emailOrUsername)}
                  />
                </div>
                <AnimatePresence>
                  {errors.emailOrUsername && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 text-xs font-medium text-rose-400 ml-1"
                    >
                      {errors.emailOrUsername.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="group relative">
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-400 transition-colors group-focus-within:text-indigo-400"
                  >
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-indigo-400/80 hover:text-indigo-300 transition-colors mr-1"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <motion.span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors duration-300"
                    animate={errors.password ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.35 }}
                  >
                    <Lock size={15} />
                  </motion.span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={inputCls(errors.password)}
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 text-xs font-medium text-rose-400 ml-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-1">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 12px 28px -6px rgba(99,102,241,0.45)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 px-4 rounded-2xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-500 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.9,
                            ease: "linear",
                          }}
                        >
                          <Loader2 size={15} />
                        </motion.div>
                        Authenticating…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="block"
                      >
                        Sign In
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-7 text-center text-sm font-medium text-slate-500"
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create one now
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          variants={itemVariants}
          className="mt-7 flex items-center justify-center gap-3 opacity-50"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
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
