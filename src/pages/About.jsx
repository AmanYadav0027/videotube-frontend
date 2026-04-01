import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Heart, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Play,
    label: "Stream Videos",
    desc: "Watch and share videos with the world.",
  },
  {
    icon: Heart,
    label: "Like & Engage",
    desc: "Like videos, comment, and subscribe to channels.",
  },
  {
    icon: Users,
    label: "Community Posts",
    desc: "Share text updates with your followers.",
  },
  {
    icon: Zap,
    label: "Creator Dashboard",
    desc: "Track your stats, views, and subscribers.",
  },
];

export default function About() {
  useEffect(() => {
    document.title = "About — MyApp";
  }, []);

  return (
    <div className="min-h-full bg-[#0a0a0f] relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/25">
            <Play size={22} className="text-white ml-0.5" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            MyApp
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
            A full-stack video sharing platform built with React, Node.js,
            MongoDB, and Cloudinary. Share videos, connect with creators, and
            build your community.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-[#0f1117] border border-white/7 rounded-2xl p-5 hover:border-white/12 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-3">
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
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "React",
              "Redux Toolkit",
              "React Router",
              "Tailwind CSS",
              "Node.js",
              "Express",
              "MongoDB",
              "Mongoose",
              "Cloudinary",
              "JWT",
              "Axios",
            ].map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-white/4 border border-white/[0.07] text-xs text-slate-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">Ready to get started?</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              Create account
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/8 hover:border-white/[0.14] hover:text-slate-200 transition-all"
            >
              Browse videos
            </Link>
          </div>
        </div>

        {/* system status */}
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-600">System Online</span>
          <span className="text-[11px] text-slate-700 font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
