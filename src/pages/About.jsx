import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Users, Zap, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Play,
    label: "Stream Videos",
    desc: "Watch and share videos with the world in stunning quality.",
  },
  {
    icon: Heart,
    label: "Like & Engage",
    desc: "Like videos, comment, and subscribe to your favorite channels.",
  },
  {
    icon: Users,
    label: "Community Posts",
    desc: "Share text updates and connect with your followers.",
  },
  {
    icon: Zap,
    label: "Creator Dashboard",
    desc: "Track your stats, views, and subscriber growth in real time.",
  },
];

const TECH_STACK = [
  {
    name: "React",
    url: "https://react.dev/",
    role: "Frontend Interface",
    desc: "The visual building blocks of the application. It creates the smooth, instant-loading interface you are interacting with right now.",
  },
  {
    name: "Redux Toolkit",
    url: "https://redux-toolkit.js.org/",
    role: "State Management",
    desc: "The short-term memory of the app. It remembers if you are logged in and what videos you've liked as you navigate between pages.",
  },
  {
    name: "Tailwind CSS",
    url: "https://tailwindcss.com/",
    role: "Design System",
    desc: "The styling engine responsible for the dark theme, glowing hover effects, and making the app look great on mobile phones.",
  },
  {
    name: "Node.js & Express",
    url: "https://expressjs.com/",
    role: "Backend Server",
    desc: "The invisible engine running on the server. It receives your clicks, talks to the database, and securely handles passwords.",
  },
  {
    name: "MongoDB",
    url: "https://www.mongodb.com/",
    role: "Database",
    desc: "The massive digital filing cabinet. It permanently saves all user accounts, comments, video titles, and watch history.",
  },
  {
    name: "Cloudinary",
    url: "https://cloudinary.com/",
    role: "Media Storage",
    desc: "A specialized, high-speed vault that stores actual video files and streams them to your screen without buffering.",
  },
  {
    name: "React Router",
    url: "https://reactrouter.com/",
    role: "Navigation",
    desc: "The traffic cop of the frontend. It allows instant switching between pages without the browser ever having to reload.",
  },
  {
    name: "JWT",
    url: "https://jwt.io/",
    role: "Security",
    desc: "The digital VIP pass. When you log in, this securely encrypts your identity so you can like videos and comment without re-entering your password.",
  },
  {
    name: "Mongoose",
    url: "https://mongoosejs.com/",
    role: "Data Modeling",
    desc: "The translator between Node.js and MongoDB. It ensures every user account has exactly the required fields like email and password.",
  },
  {
    name: "Axios",
    url: "https://axios-http.com/",
    role: "API Client",
    desc: "The messenger. It carries data from your browser all the way to the backend server and back.",
  },
];

const spring = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
};

export default function About() {
  const [selectedTech, setSelectedTech] = useState(null);

  useEffect(() => {
    document.title = "About — MyApp";
  }, []);

  return (
    <div className="min-h-full bg-[#0a0a0f] relative">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* FIX: bg-indigo-600/8 → bg-indigo-600/10 (standard Tailwind opacity) */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-12"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          {/* FIX: bg-linear-to-br → bg-gradient-to-br */}
          <motion.div
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/25 cursor-default"
          >
            <Play size={22} className="text-white ml-0.5" fill="white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            MyApp
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
            A full-stack video sharing platform built with React, Node.js,
            MongoDB, and Cloudinary. Share videos, connect with creators, and
            build your community.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={spring}
              // FIX: border-white/7 → border-white/[0.07], border-white/15 → border-white/[0.15]
              className="group bg-[#0f1117] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.15] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-default"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Icon
                  size={15}
                  className="text-indigo-400"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                {label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          variants={itemVariants}
          // FIX: border-white/[0.07]
          className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-colors duration-300"
        >
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            How It Works Under The Hood
          </h2>

          {/* Tech buttons */}
          <div className="flex flex-wrap gap-2 mb-1">
            {TECH_STACK.map((tech) => {
              const isActive = selectedTech?.name === tech.name;
              return (
                <motion.button
                  key={tech.name}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedTech(isActive ? null : tech)}
                  // FIX: bg-white/4 → bg-white/[0.04], border-white/[0.07]
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 outline-none cursor-pointer
                    ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.07] hover:bg-white/10 hover:text-slate-200"
                    }`}
                >
                  {tech.name}
                </motion.button>
              );
            })}
          </div>

          {/* Tech info panel */}
          <div
            className={`grid transition-all duration-350 ease-in-out ${
              selectedTech
                ? "grid-rows-[1fr] opacity-100 mt-5"
                : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
          >
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedTech && (
                  <motion.div
                    key={selectedTech.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="p-4 rounded-xl bg-slate-900/50 border border-indigo-500/15 flex flex-col gap-2.5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-sm font-bold text-slate-200">
                        {selectedTech.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {selectedTech.role}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-400 leading-relaxed relative z-10">
                      {selectedTech.desc}
                    </p>
                    <a
                      href={selectedTech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-1 w-fit group/link relative z-10 transition-colors"
                    >
                      Read official docs
                      <ChevronRight
                        size={12}
                        className="group-hover/link:translate-x-0.5 transition-transform"
                      />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <p className="text-sm text-slate-500">Ready to get started?</p>
          <div className="flex items-center justify-center gap-3">
            {/* FIX: bg-linear-to-r → bg-gradient-to-r */}
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all duration-200"
            >
              Create account
            </Link>
            {/* FIX: border-white/8 → border-white/[0.08] */}
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.14] hover:text-slate-200 hover:bg-white/5 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Browse videos
            </Link>
          </div>
        </motion.div>

        {/* System status */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-600">System Online</span>
          <span className="text-[11px] text-slate-700 font-mono">v1.0.0</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
