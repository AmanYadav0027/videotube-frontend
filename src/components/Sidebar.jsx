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
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { markAsRead } from "../store/notificationSlice";

// ─── Route map ───────────────────────────────────────────────────────────────
// id → actual URL path
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

// Protected routes — redirect to /login if not authenticated
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
          focus-visible:ring-2 focus-visible:ring-indigo-400/60
          ${
            active
              ? "bg-indigo-500/15 text-indigo-300 shadow-inner shadow-indigo-500/10"
              : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
          }
          ${collapsed ? "justify-center px-2" : ""}
        `}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-400" />
        )}

        <span
          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-indigo-400" : ""}`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>

        {!collapsed && <span className="truncate">{item.label}</span>}

        {item.badge && (
          <span
            aria-label="Unread"
            className={`shrink-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0f1117]
              ${collapsed ? "absolute top-1.5 right-1.5" : "ml-auto"}`}
          />
        )}

        {collapsed && (
          <span
            className="
            pointer-events-none absolute left-full ml-3 px-2.5 py-1.5
            bg-slate-800 text-slate-100 text-xs rounded-lg whitespace-nowrap
            opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-150 shadow-xl z-50
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
  if (collapsed) return <hr className="border-white/8 my-1 mx-2" />;
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase text-slate-600 select-none">
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

  // Derive active id from current URL — survives refresh
  const activeId =
    Object.entries(ROUTE_MAP).find(([, path]) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path),
    )?.[0] ?? "home";

  const handleNavClick = (id) => {
    if (unreadStatus[id]) dispatch(markAsRead(id));

    // redirect to login if protected and not authenticated
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
        relative flex flex-col h-screen bg-[#0f1117] border-r border-white/6
        transition-[width] duration-300 ease-in-out overflow-hidden shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-indigo-950/20 via-transparent to-transparent" />

      {/* Header */}
      <header
        className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-4 border-b border-white/6 shrink-0`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ChevronRight
                size={14}
                strokeWidth={3}
                className="text-white -mr-0.5"
              />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-100 truncate leading-tight tracking-tight">
                MyProject
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-tight">
                Workspace
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          <Menu size={18} strokeWidth={2} />
        </button>
      </header>

      {/* Primary nav */}
      <nav
        aria-label="Primary navigation"
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
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
        className="relative z-10 px-2 pb-2 border-t border-white/6 shrink-0"
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
      <footer
        className="relative z-10 px-3 py-3 border-t border-white/6 shrink-0"
        aria-label="System status"
      >
        {collapsed ? (
          <div className="flex justify-center" title="System Online — v1.0.0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-400/90 font-medium truncate">
              System Online
            </span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono shrink-0">
              v1.0.0
            </span>
          </div>
        )}
      </footer>
    </aside>
  );
}
