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
  ChevronRight,
  Twitter,
  Upload,
  Info,
  ListVideo,
  Play,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { markAsRead } from "../store/notificationSlice";

// ─── Route map ───────────────────────────────────────────────────────────────
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

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, active, onClick }) {
  const Icon = item.icon;
  return (
    <li>
      <button
        onClick={() => onClick(item.id)}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={`
          group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-[0.98]
          ${
            active
              ? "bg-indigo-500/15 text-indigo-300 shadow-inner shadow-indigo-500/10 border border-indigo-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
          }
          ${collapsed ? "justify-center px-2" : ""}
        `}
      >
        {/* Active indicator line */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
        )}

        <span
          className={`shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 ${active ? "text-indigo-400" : ""}`}
        >
          <Icon size={18} strokeWidth={active ? 2 : 1.75} />
        </span>

        {!collapsed && (
          <span
            className={`truncate transition-transform duration-300 ease-out ${!active && "group-hover:translate-x-1"}`}
          >
            {item.label}
          </span>
        )}

        {item.badge && (
          <span
            aria-label="Unread"
            className={`shrink-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0f1117] shadow-[0_0_8px_rgba(244,63,94,0.6)]
              ${collapsed ? "absolute top-1.5 right-1.5" : "ml-auto"}`}
          />
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <span
            className="
            pointer-events-none absolute left-full ml-3 px-2.5 py-1.5
            bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg whitespace-nowrap
            opacity-0 -translate-x-2 scale-95 origin-left
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
            transition-all duration-200 ease-out shadow-xl z-50 border border-white/10
            before:content-[''] before:absolute before:right-full before:top-1/2
            before:-translate-y-1/2 before:border-4 before:border-transparent
            before:border-r-slate-800
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
  if (collapsed)
    return (
      <hr className="border-white/[0.08] my-2 mx-2 transition-all duration-300" />
    );
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-500 select-none">
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
  };

  return (
    <aside
      aria-label="Main navigation"
      className={`
        relative flex flex-col h-screen bg-[#0a0a0f] border-r border-white/5
        transition-[width] duration-300 ease-in-out overflow-hidden shrink-0 shadow-2xl shadow-black/50
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />

      {/* Header */}
      <header
        className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-white/5 shrink-0`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* replaced ChevronRight logo with Play icon — more fitting for a video platform */}
            <span className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <Play
                size={14}
                strokeWidth={3}
                className="text-white ml-0.5"
                fill="white"
              />
            </span>
            <div className="flex flex-col min-w-0 cursor-pointer group">
              {/* updated name to VideoTube */}
              <span className="text-sm font-bold text-slate-100 truncate leading-tight tracking-tight transition-colors group-hover:text-white">
                VideoTube
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate leading-tight transition-colors group-hover:text-indigo-400">
                Workspace
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-90"
        >
          <Menu
            size={18}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </header>

      {/* Primary nav */}
      <nav
        aria-label="Primary navigation"
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <SectionLabel label="Main" collapsed={collapsed} />
        <ul className="space-y-1">
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
        className="relative z-10 px-3 pb-3 pt-1 border-t border-white/5 shrink-0 bg-[#0a0a0f]/80 backdrop-blur-sm"
      >
        <SectionLabel label="Account" collapsed={collapsed} />
        <ul className="space-y-1">
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
      <footer
        className="relative z-10 px-4 py-3.5 border-t border-white/5 shrink-0 bg-black/20"
        aria-label="System status"
      >
        {collapsed ? (
          <div className="flex justify-center" title="System Online — v1.0.0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="text-xs text-emerald-400/90 font-semibold tracking-wide truncate">
              System Online
            </span>
            <span className="ml-auto text-[10px] text-slate-500 font-mono shrink-0 font-medium bg-white/5 px-1.5 py-0.5 rounded-md">
              v1.0.0
            </span>
          </div>
        )}
      </footer>
    </aside>
  );
}
