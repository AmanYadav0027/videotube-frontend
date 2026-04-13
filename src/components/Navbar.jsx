import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  useNavigate,
  useLocation,
  useMatch,
  useSearchParams,
} from "react-router-dom";

const spring = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

// Injected global styles — fonts + shimmer animation only
const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
  .nav-font { font-family: 'DM Sans', sans-serif; }
  .nav-logo-font { font-family: 'Syne', sans-serif; }
  @keyframes shimmerLine {
    0%  { left: -60%; opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100%{ left: 140%; opacity: 0; }
  }
  @keyframes pulseDot {
    0%,100% { transform:scale(1);   box-shadow:0 0 8px  rgba(99,102,241,0.7); }
    50%      { transform:scale(1.4); box-shadow:0 0 18px rgba(236,72,153,0.9); }
  }
  .nav-shimmer::after {
    content:''; position:absolute; top:0; left:-60%;
    width:50%; height:1px;
    background:linear-gradient(90deg,transparent,rgba(99,102,241,0.9),rgba(236,72,153,0.7),transparent);
    animation: shimmerLine 4s ease-in-out infinite;
  }
  .nav-logo-dot {
    width:7px;height:7px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#6366f1,#ec4899);
    animation:pulseDot 2.4s ease-in-out infinite;
  }
  @media(max-width:860px){.nav-search-hide{max-width:220px}}
  @media(max-width:600px){.nav-search-hide{display:none}.nav-links-hide{display:none}.nav-burger{display:flex!important}}
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

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

  const atHome = useMatch("/");
  const atAbout = useMatch("/about");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
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
          backdropFilter: "blur(20px)",
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
          <span className="nav-logo-dot" />
          VideoTube
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="nav-search-hide relative z-10 flex-1 max-w-md mx-auto"
        >
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-colors duration-200"
            style={{ zIndex: 1 }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search videos..."
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:bg-indigo-500/[0.07] focus:border-indigo-500/40 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
          />
        </form>

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
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(99,102,241,0.12)" }}
          whileTap={{ scale: 0.93 }}
          transition={spring}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="nav-burger hidden relative z-10 w-9 h-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-colors duration-150 outline-none"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isMobileOpen ? "x" : "menu"}
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              {isMobileOpen ? <X size={17} /> : <Menu size={17} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
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
              backdropFilter: "blur(20px)",
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
