import { useState } from "react";
import {
  Home,
  Heart,
  Rss,
  History,
  LayoutDashboard,
  Activity,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  Twitter,
  Upload,
  ListVideo,
  Play,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { markAsRead } from "../store/notificationSlice";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

const ROUTE_MAP = {
  home: "/",
  liked: "/liked",
  subscriptions: "/subscriptions",
  tweets: "/tweets",
  history: "/history",
  playlists: "/playlists",
  upload: "/upload",
  dashboard: "/dashboard",
  healthcheck: "/healthcheck",
  notifications: "/notifications",
  support: "/support",
  settings: "/settings",
  about: "/about",
};

const PROTECTED = new Set([
  "liked",
  "subscriptions",
  "tweets",
  "history",
  "playlists",
  "upload",
  "dashboard",
  "notifications",
  "settings",
]);

const PRIMARY_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "liked", label: "Liked Videos", icon: Heart },
  { id: "subscriptions", label: "Subscriptions", icon: Rss },
  { id: "tweets", label: "Tweets", icon: Twitter },
  { id: "history", label: "History", icon: History },
  { id: "playlists", label: "Playlists", icon: ListVideo },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "healthcheck", label: "Healthcheck", icon: Activity },
];

const SECONDARY_NAV = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, active, onClick }) {
  const Icon = item.icon;
  return (
    <li>
      <button
        onClick={() => onClick(item.id)}
        aria-current={active ? "page" : undefined}
        className={`
          group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-colors duration-150 outline-none
          hover:scale-[1.02] active:scale-[0.97] transition-transform
          focus-visible:ring-2 focus-visible:ring-indigo-400/60
          ${active ? "text-indigo-300 border border-indigo-500/25" : "text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/[0.06]"}
          ${collapsed ? "justify-center px-2" : ""}
        `}
        style={
          active
            ? {
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px -5px rgba(99,102,241,0.15)",
              }
            : {}
        }
      >
        {/* Active glow line */}
        {active && (
          <motion.span
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-400"
            style={{ boxShadow: "0 0 10px rgba(129,140,248,0.9)" }}
            transition={spring}
          />
        )}

        <span
          className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? "text-indigo-400" : ""}`}
        >
          <Icon size={18} strokeWidth={active ? 2 : 1.75} />
        </span>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {item.badge && (
          <span
            aria-label="Unread"
            className={`shrink-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0a0a0f] shadow-[0_0_8px_rgba(244,63,94,0.7)]
              ${collapsed ? "absolute top-1.5 right-1.5" : "ml-auto"}`}
          />
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <span
            className="
            pointer-events-none absolute left-full ml-3 px-2.5 py-1.5
          bg-slate-800 text-slate-100 text-xs     font-semibold
            rounded-xl whitespace-nowrap opacity-0 -translate-x-2 scale-95 origin-left
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
            transition-all duration-200 shadow-xl z-50 border border-white/10
            "
          >
            {item.label}
          </span>
        )}
      </button>
    </li>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) return <hr className="border-white/[0.06] my-2 mx-2" />;
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest uppercase text-slate-600 select-none">
      {label}
    </p>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const unreadStatus = useSelector((s) => s.notifications);

  const activeId =
    Object.entries(ROUTE_MAP).find(([, path]) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path),
    )?.[0] ?? "home";

  const handleNavClick = (id) => {
    if (unreadStatus[id]) dispatch(markAsRead(id));
    if (PROTECTED.has(id) && !isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(ROUTE_MAP[id] ?? "/");
    // ← no setCollapsed call here — sidebar state is preserved
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={spring}
      aria-label="Main navigation"
      className="relative flex flex-col h-screen border-r border-white/[0.05] shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a0a12 0%, #08080f 100%)",
        boxShadow: "4px 0 30px rgba(0,0,0,0.5)",
      }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="orb1" cx="20%" cy="0%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="orb2" cx="80%" cy="100%" r="50%">
            <stop offset="0%" stopColor="rgba(236,72,153,0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#orb1)" />
        <rect width="100%" height="100%" fill="url(#orb2)" />
      </svg>

      {/* Header */}
      <header
        className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-white/[0.05] shrink-0`}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Play size={13} fill="white" className="text-white ml-0.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate leading-tight tracking-tight">
                  VideoTube
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate leading-tight">
                  Workspace
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*  ONLY the hamburger button toggles collapsed — nothing else */}
        <motion.button
          onClick={() => setCollapsed((v) => !v)}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(99,102,241,0.12)" }}
          whileTap={{ scale: 0.92 }}
          transition={spring}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 border border-white/[0.06] transition-colors duration-150 outline-none"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={spring}
          >
            <Menu size={16} strokeWidth={2} />
          </motion.div>
        </motion.button>
      </header>

      {/* Primary nav */}
      <nav
        aria-label="Primary navigation"
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2
          [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <SectionLabel label="Main" collapsed={collapsed} />
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={{ ...item, badge: unreadStatus[item.id] || false }}
              collapsed={collapsed}
              active={activeId === item.id}
              onClick={handleNavClick}
            />
          ))}
        </ul>
      </nav>

      {/* Secondary nav */}
      <nav
        aria-label="Secondary navigation"
        className="relative z-10 px-3 pb-3 pt-1 border-t border-white/[0.05] shrink-0"
      >
        <SectionLabel label="Account" collapsed={collapsed} />
        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={{ ...item, badge: unreadStatus[item.id] || false }}
              collapsed={collapsed}
              active={activeId === item.id}
              onClick={handleNavClick}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-3.5 border-t border-white/[0.05] shrink-0">
        {collapsed ? (
          <div className="flex justify-center" title="System Online — v1.0.0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            </span>
            <span className="text-xs text-emerald-400/80 font-semibold tracking-wide truncate">
              System Online
            </span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono shrink-0 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.05]">
              v1.0.0
            </span>
          </div>
        )}
      </footer>
    </motion.aside>
  );
}
