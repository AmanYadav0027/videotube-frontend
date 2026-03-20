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
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "liked", label: "Liked Videos", icon: Heart },
  { id: "subscriptions", label: "Subscriptions", icon: Rss },
  { id: "history", label: "History", icon: History },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "healthcheck", label: "Healthcheck", icon: Activity },
];

const SECONDARY_NAV = [
  { id: "notifications", label: "Notifications", icon: Bell, badge: true },
  { id: "support", label: "Support", icon: HelpCircle, badge: false },
  { id: "settings", label: "Settings", icon: Settings, badge: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        {/* active left bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-400" />
        )}

        {/* icon */}
        <span
          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-indigo-400" : ""}`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>

        {/* label */}
        {!collapsed && <span className="truncate">{item.label}</span>}

        {/* notification badge */}
        {item.badge && (
          <span
            aria-label="Unread notifications"
            className={`
              shrink-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0f1117]
              ${collapsed ? "absolute top-1.5 right-1.5" : "ml-auto"}
            `}
          />
        )}

        {/* tooltip when collapsed */}
        {collapsed && (
          <span
            role="tooltip"
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
            {item.badge && <span className="ml-1.5 text-rose-400">●</span>}
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
  const [activeId, setActiveId] = useState("home");

  return (
    <aside
      aria-label="Main navigation"
      data-collapsed={collapsed}
      className={`
        relative flex flex-col h-screen bg-[#0f1117] border-r border-white/6
        transition-[width] duration-300 ease-in-out overflow-hidden shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* ── subtle gradient wash ── */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-indigo-950/20 via-transparent to-transparent" />

      {/* ════════════════════════════════════════
          TOP — Header
      ════════════════════════════════════════ */}
      {/* ════════════════════════════════════════
          TOP — Header
      ════════════════════════════════════════ */}
      <header
        className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-4 border-b border-white/6 shrink-0`}
      >
        {/* Group Logo and Title together - Hide completely when collapsed */}
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            {/* Logo mark */}
            <span className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ChevronRight
                size={14}
                strokeWidth={3}
                className="text-white -mr-0.5"
              />
            </span>

            {/* Project name */}
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-sm font-semibold text-slate-100 truncate leading-tight tracking-tight">
                MyProject
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-tight">
                Workspace
              </span>
            </div>
          </div>
        )}

        {/* Toggle button - Stays visible and centers when collapsed */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={`
            shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            text-slate-400 hover:text-slate-100 hover:bg-white/10
            transition-all duration-200 outline-none
            focus-visible:ring-2 focus-visible:ring-indigo-400/60
          `}
        >
          <Menu size={18} strokeWidth={2} />
        </button>
      </header>

      {/* ════════════════════════════════════════
          MIDDLE — Primary Nav (scrollable)
      ════════════════════════════════════════ */}
      <nav
        aria-label="Primary navigation"
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2
                   scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
                   hover:scrollbar-thumb-white/20"
      >
        <SectionLabel label="Main" collapsed={collapsed} />
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeId === item.id}
              onClick={setActiveId}
            />
          ))}
        </ul>
      </nav>

      {/* ════════════════════════════════════════
          BOTTOM — Secondary Nav (fixed)
      ════════════════════════════════════════ */}
      <nav
        aria-label="Secondary navigation"
        className="relative z-10 px-2 pb-2 border-t border-white/6 shrink-0"
      >
        <SectionLabel label="Account" collapsed={collapsed} />
        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeId === item.id}
              onClick={setActiveId}
            />
          ))}
        </ul>
      </nav>

      {/* ════════════════════════════════════════
          FOOTER — System Status
      ════════════════════════════════════════ */}
      <footer
        className="relative z-10 px-3 py-3 border-t border-white/6 shrink-0"
        aria-label="System status"
      >
        {collapsed ? (
          /* collapsed: just the pulsing dot, centred */
          <div className="flex justify-center" title="System Online — v1.0.0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            {/* pulsing dot */}
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
