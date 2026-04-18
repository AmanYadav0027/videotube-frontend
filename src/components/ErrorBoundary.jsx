import { Component } from "react";
import { motion, AnimatePresence } from "framer-motion";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
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
        <div
          className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden theme-rose"
          style={{ background: "#050508" }}
        >
          {/* Ambient orbs */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full "
              style={{
                background:
                  "radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.2, 0.08] }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full "
              style={{
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)",
                filter: "blur(100px)",
              }}
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative w-full max-w-md z-10"
          >
            {/* Card */}
            <div
              className="relative rounded-[2rem] overflow-hidden border border-white/[0.06]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(15,10,20,0.9) 0%, rgba(10,8,18,0.95) 100%)",
                backdropFilter: "blur(40px)",
                boxShadow:
                  "0 25px 60px -15px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
              {/* Glow behind icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-28 blur-[50px] bg-rose-500/10 pointer-events-none" />

              <div className="px-8 pt-10 pb-10 relative z-10 text-center flex flex-col items-center gap-6">
                {/* Icon */}
                <motion.div
                  variants={itemVariants}
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(244,63,94,0)",
                      "0 0 30px rgba(244,63,94,0.25)",
                      "0 0 0px rgba(244,63,94,0)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border border-rose-500/20"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(244,63,94,0.05) 100%)",
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-rose-400"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(244,63,94,0.5))",
                    }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </motion.div>

                {/* Text */}
                <motion.div variants={itemVariants} className=" space-y-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    System Exception
                  </h1>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    An unexpected error interrupted the application. Try
                    refreshing the page.
                  </p>
                </motion.div>

                {/* Error block */}
                {this.state.error?.message && (
                  <motion.div variants={itemVariants} className=" w-full">
                    <div
                      className="rounded-2xl p-4 text-left overflow-x-auto border border-rose-500/[0.12]"
                      style={{
                        background: "rgba(244,63,94,0.04)",
                        boxShadow: "inset 0 1px 0 rgba(244,63,94,0.08)",
                      }}
                    >
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
                  className="flex flex-col sm:flex-row items-center gap-3 w-full"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 12px 30px -5px rgba(99,102,241,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.href = "/";
                    }}
                    className="relative w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                      boxShadow: "0 8px 20px -5px rgba(99,102,241,0.4)",
                    }}
                  >
                    {/* Shimmer */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                    />
                    <span className="relative z-10">Return Home</span>
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255,255,255,0.06)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring}
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/[0.07] transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    Refresh Session
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Footer badge */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center justify-center gap-3 opacity-50"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
              </span>
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                State Recovery
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.05]">
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
