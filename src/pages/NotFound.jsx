import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const floatVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 350, damping: 28, mass: 0.8 },
  },
};

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Page Not Found";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 overflow-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Layered ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="text-center space-y-8 max-w-md relative z-10"
      >
        {/* Floating 404 */}
        <motion.div variants={itemVariants} className="relative select-none">
          <motion.p
            variants={floatVariants}
            animate="animate"
            className="text-[130px] sm:text-[160px] font-black leading-none tracking-tighter"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.12) 50%, rgba(255,255,255,0.06) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(99,102,241,0.15))",
            }}
          >
            404
          </motion.p>

          {/* Glowing underline accent */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
        </motion.div>

        {/* Text content */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Lost in space 🚀
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page you're looking for doesn't exist or has drifted into the
            void.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 flex-wrap pt-2"
        >
          <Link to="/">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 12px 30px -8px rgba(99,102,241,0.55)",
              }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              Go Home
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => window.history.back()}
            className="px-7 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.04] backdrop-blur-md transition-all duration-300"
          >
            Go Back
          </motion.button>
        </motion.div>

        {/* Decorative bottom hint */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 pt-2 opacity-40"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
          </span>
          <span className="text-[11px] font-medium text-slate-500 tracking-widest uppercase">
            Error 404
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
