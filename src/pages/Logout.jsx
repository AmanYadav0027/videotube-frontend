import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { logout as authLogout } from "../store/authSlice";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";

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
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: smoothSpring,
  },
};

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/v2/users/logout");
      dispatch(authLogout());
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden theme-rose">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.2, 0.08] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-sm z-10"
      >
        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-rose-500/8 blur-[50px] pointer-events-none" />

          <div className="px-8 pt-10 pb-8 relative z-10">
            {/* Icon */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center mb-8"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(244,63,94,0)",
                    "0 0 28px rgba(244,63,94,0.28)",
                    "0 0 0px rgba(244,63,94,0)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-rose-500/15 to-rose-600/5 border border-rose-500/20 flex items-center justify-center mb-5 shadow-lg"
              >
                <LogOut
                  size={26}
                  strokeWidth={1.75}
                  className="text-rose-400 -ml-0.5"
                />
              </motion.div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Sign out?
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-2 text-center leading-relaxed max-w-[220px]">
                You'll need to sign in again to access your workspace.
              </p>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold shadow-inner">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <motion.div
              variants={itemVariants}
              className=" flex flex-col gap-3"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 28px -6px rgba(244,63,94,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                disabled={loading}
                className="relative w-full py-3.5 px-4 rounded-xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Signing out…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogOut size={15} strokeWidth={2.5} className="-ml-0.5" />
                    Yes, sign me out
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                Cancel
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          variants={itemVariants}
          className="mt-7 flex items-center justify-center gap-3 opacity-50"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
            System Online
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            v2.0.0
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
