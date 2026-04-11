import { Component } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// --- Advanced Animation Config ---
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
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: smoothSpring,
  },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden selection:bg-rose-500/30 selection:text-rose-200">
          {/* Ambient Background Glows */}
          <div className="fixed inset-0 z-0 pointer-events-none flex justify-center opacity-40 mix-blend-screen">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, -90, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative w-full max-w-lg z-10"
          >
            <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative">
              {/* Animated Top Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

              {/* Top subtle glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-rose-500/10 blur-[50px] pointer-events-none" />

              <div className="px-8 pt-10 pb-10 relative z-10 text-center flex flex-col items-center">
                {/* Icon */}
                <motion.div
                  variants={itemVariants}
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(244,63,94,0)",
                      "0 0 30px rgba(244,63,94,0.3)",
                      "0 0 0px rgba(244,63,94,0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/20 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </motion.div>

                {/* Text */}
                <motion.div variants={itemVariants} className="space-y-2 mb-8">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    System Exception
                  </h1>
                  <p className="text-sm font-medium text-slate-400">
                    An unexpected error interrupted the application. Try
                    refreshing the page.
                  </p>
                </motion.div>

                {/* Error Message Block */}
                {this.state.error?.message && (
                  <motion.div variants={itemVariants} className="w-full mb-8">
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-left overflow-x-auto shadow-inner">
                      <p className="text-xs text-rose-300/80 font-mono leading-relaxed">
                        <span className="text-rose-500 font-bold mr-2">
                          ERR:
                        </span>
                        {this.state.error.message}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px -5px rgba(99,102,241,0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.href = "/";
                    }}
                    className="relative w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black tracking-wide text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[center_right_1rem] shadow-lg shadow-indigo-500/20 focus:outline-none transition-all duration-500 overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                    Return Home
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/10 focus:outline-none transition-all duration-300 shadow-sm"
                  >
                    Refresh Session
                  </motion.button>
                </motion.div>
              </div>
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center justify-center gap-3 opacity-60"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                State Recovery
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                v2.0.0
              </span>
            </motion.div>
          </motion.div>
        </div>
      );
    }
    return this.props.children;
  }
}
