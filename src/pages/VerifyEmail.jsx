import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MailCheck, MailX, Loader2, ChevronRight } from "lucide-react";

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

const STATUS = {
  VERIFYING: "verifying",
  SUCCESS: "success",
  ERROR: "error",
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(STATUS.VERIFYING);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) return setStatus("error");

    axios
      .get(`/api/v2/users/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        if (window.opener && !window.opener.closed) {
          window.opener.location.href = "/login";
          setTimeout(() => window.close(), 500);
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  // Countdown redirect after success
  useEffect(() => {
    if (status !== STATUS.SUCCESS) return;
    if (countdown === 0) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden ">
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
          {/* Top shimmer line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-36 bg-indigo-500/8 blur-[60px] pointer-events-none" />

          <div className="px-8 pt-10 pb-8 relative z-10 text-center">
            {/* Icon */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <AnimatePresence mode="wait">
                {status === STATUS.VERIFYING && (
                  <motion.div
                    key="verifying"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/10"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Loader2 size={26} className="text-white" />
                    </motion.div>
                  </motion.div>
                )}

                {status === STATUS.SUCCESS && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/10"
                  >
                    <MailCheck size={26} className="text-white" />
                  </motion.div>
                )}

                {status === STATUS.ERROR && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25 border border-white/10"
                  >
                    <MailX size={26} className="text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Text content */}
            <AnimatePresence mode="wait">
              {status === STATUS.VERIFYING && (
                <motion.div
                  key="verifying-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Verifying your email
                  </h1>
                  <p className="text-sm font-medium text-slate-400 mt-2">
                    Please wait a moment...
                  </p>
                </motion.div>
              )}

              {status === STATUS.SUCCESS && (
                <motion.div
                  key="success-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Email Verified!
                  </h1>
                  <p className="text-sm font-medium text-slate-400 mt-2">
                    Your account is ready. Redirecting to login in{" "}
                    <span className="text-emerald-400 font-bold">
                      {countdown}s
                    </span>
                  </p>

                  {/* Progress bar */}
                  <div className="mt-5 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-6"
                  >
                    <Link
                      to="/login"
                      className="block w-full py-3.5 px-4 rounded-2xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/40"
                    >
                      Go to Login now
                    </Link>
                  </motion.div>
                </motion.div>
              )}

              {status === STATUS.ERROR && (
                <motion.div
                  key="error-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Verification Failed
                  </h1>
                  <p className="text-sm font-medium text-slate-400 mt-2">
                    This link is invalid or has expired. Please register again
                    to get a new link.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-6"
                  >
                    <Link
                      to="/register"
                      className="block w-full py-3.5 px-4 rounded-2xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-rose-600 to-pink-600 shadow-lg shadow-rose-500/20 transition-all duration-300 hover:shadow-rose-500/40"
                    >
                      Back to Register
                    </Link>
                  </motion.div>

                  <p className="mt-4 text-sm text-slate-500">
                    Already verified?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Status footer */}
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
