import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Search, User, Menu, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Link,
  useNavigate,
  useLocation,
  useMatch,
  useSearchParams,
} from "react-router-dom";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
  .nav-font { font-family: 'DM Sans', sans-serif; }
  .nav-logo-font { font-family: 'Syne', sans-serif; }
  @keyframes shimmerLine {
    0%  { transform: translateX(-60%); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100%{ transform: translateX(140%); opacity: 0; }
  }
  @keyframes pulseDot {
    0%,100% { transform:scale(1);   box-shadow:0 0 8px  rgba(99,102,241,0.7); }
    50%      { transform:scale(1.4); box-shadow:0 0 18px rgba(236,72,153,0.9); }
  }
  .nav-shimmer::after {
  display: none;
}
  
  @media(max-width:860px){.nav-search-hide{max-width:220px}}
  /*
  @media(max-width:600px){.nav-search-hide{max-width:160px}.nav-links-hide{display:none}.nav-burger{display:flex!important}}
`;

export default function Navbar() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.userData);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  //  channel search state
  const [channels, setChannels] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setChannels([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/v2/users/search?q=${encodeURIComponent(searchInput.trim())}`,
        );
        const data = res.data?.data ?? [];
        setChannels(Array.isArray(data) ? data.slice(0, 5) : []);
        setShowDropdown(data.length > 0);
      } catch {
        setChannels([]);
        setShowDropdown(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const atHome = useMatch("/");
  const atAbout = useMatch("/about");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setShowDropdown(false);
    if (q) navigate(`/?q=${encodeURIComponent(q)}`);
    else navigate("/");
  };

  return (
    <div className="nav-font relative z-50">
      <style>{navStyles}</style>

      {/* ── Header bar ── */}
      <header
        className="nav-shimmer relative h-16 flex items-center justify-between px-6 gap-4 overflow-hidden border-b border-white/[0.05]"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,10,18,0.98) 0%, rgba(8,8,15,0.99) 100%)",
        }}
      >
        {/* Subtle aurora */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg,rgba(99,102,241,0.06) 0%,rgba(236,72,153,0.04) 50%,rgba(16,185,129,0.03) 100%)",
          }}
        />

        {/* Logo */}
        <Link
          to="/"
          className="nav-logo-font relative z-10 flex items-center gap-2 text-white font-extrabold text-lg tracking-tight shrink-0 hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-br from-indigo-500 to-pink-500" />
          </span>
          VideoTube
        </Link>

        {/* Search + channel dropdown */}
        <div
          ref={searchRef}
          className="nav-search-hide relative z-10 flex-1 max-w-md mx-auto"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-colors duration-200"
              style={{ zIndex: 1 }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => channels.length > 0 && setShowDropdown(true)}
              placeholder="Search videos or channels..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:bg-indigo-500/[0.07] focus:border-indigo-500/40 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
            />
          </form>

          {/*  Channel results dropdown */}
          <AnimatePresence>
            {showDropdown && channels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl z-50"
                style={{
                  background: "rgba(10,10,18,0.97)",
                }}
              >
                <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-white/[0.05]">
                  <Users size={10} className="inline mr-1" />
                  Channels
                </p>
                {channels.map((ch) => (
                  <Link
                    key={ch._id}
                    to={`/channel/${ch.username}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchInput("");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                      }}
                    >
                      {ch.avatar ? (
                        <img
                          src={ch.avatar}
                          alt={ch.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        ch.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {ch.fullName || ch.username}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        @{ch.username}
                      </p>
                    </div>
                  </Link>
                ))}
                {searchInput.trim() && (
                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors border-t border-white/[0.05] font-medium"
                  >
                    <Search size={13} /> Search videos for &ldquo;
                    {searchInput.trim()}&rdquo;
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop nav */}
        <nav className="nav-links-hide relative z-10 flex items-center gap-1 shrink-0">
          {[
            { to: "/", label: "Home", active: !!atHome },
            { to: "/about", label: "About", active: !!atAbout },
          ].map(({ to, label, active }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"}`}
            >
              {active && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.08]"
                  transition={spring}
                />
              )}
              <span className="relative z-10">{label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] hover:border-indigo-500/30 hover:bg-indigo-500/[0.07] transition-all duration-200 ml-1"
                aria-label="Your profile"
              >
                <span className="text-xs font-medium text-slate-300 max-w-[90px] truncate">
                  {user?.fullName || user?.username}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden border border-white/10 shadow-md shadow-indigo-500/20">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={13} className="text-white" />
                  )}
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all duration-200 ml-1"
              >
                Sign in
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="nav-burger hidden relative z-10 w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 outline-none"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
        >
          <div className="transition-transform duration-150">
            {isMobileOpen ? <X size={17} /> : <Menu size={17} />}
          </div>
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-b border-white/[0.06]"
            style={{
              background: "rgba(10,10,18,0.97)",
            }}
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/40 transition-all"
                />
              </form>

              <hr className="border-white/[0.06]" />

              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9375rem] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.07] transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 opacity-60" />
                  {label}
                </Link>
              ))}

              <hr className="border-white/[0.06]" />

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-indigo-500/[0.08] hover:border-indigo-500/20 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={15} className="text-white" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {user?.fullName || user?.username}
                    </span>
                    <span className="text-xs text-slate-500">
                      View profile & sign out
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90"
                >
                  Sign in to your account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
