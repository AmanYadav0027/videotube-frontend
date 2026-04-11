import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, User, Menu, X } from "lucide-react";
import {
  Link,
  useNavigate,
  useLocation,
  useMatch,
  useSearchParams,
} from "react-router-dom";

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .navbar-root { font-family: 'DM Sans', sans-serif; }

  .navbar-header {
    position: relative; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; gap: 16px;
    background: #0a0a0f;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    z-index: 100; overflow: hidden;
  }
  .navbar-header::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.06) 40%, rgba(16,185,129,0.05) 100%);
    background-size: 300% 300%;
    animation: auroraShift 8s ease infinite; pointer-events: none;
  }
  .navbar-header::after {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 60%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(236,72,153,0.6), transparent);
    animation: shimmerLine 4s ease-in-out infinite;
  }
  @keyframes auroraShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes shimmerLine { 0%{left:-60%} 100%{left:140%} }

  .navbar-logo {
    font-family:'Syne',sans-serif; font-size:1.25rem; font-weight:700;
    letter-spacing:-0.02em; color:#fff; text-decoration:none;
    display:flex; align-items:center; gap:8px;
    flex-shrink:0; position:relative; z-index:1; transition:opacity 0.2s;
  }
  .navbar-logo:hover{opacity:0.8}
  .navbar-logo-dot {
    width:8px;height:8px;border-radius:50%;
    background:linear-gradient(135deg,#6366f1,#ec4899);
    box-shadow:0 0 10px rgba(99,102,241,0.7);
    animation:pulseDot 2.4s ease-in-out infinite;flex-shrink:0;
  }
  @keyframes pulseDot{0%,100%{transform:scale(1);box-shadow:0 0 10px rgba(99,102,241,0.7)}50%{transform:scale(1.3);box-shadow:0 0 18px rgba(236,72,153,0.9)}}

  .navbar-search{flex:1;position:relative;z-index:1;max-width:400px;margin:0 auto;}
  .navbar-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:rgba(255,255,255,0.3);pointer-events:none;transition:color 0.2s}
  .navbar-search:focus-within svg{color:rgba(99,102,241,0.8)}
  .navbar-search input{
    width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.08);border-radius:10px;
    padding:8px 14px 8px 36px;font-size:0.8125rem;font-family:'DM Sans',sans-serif;
    color:rgba(255,255,255,0.85);outline:none;
    transition:background 0.2s,border-color 0.2s,box-shadow 0.2s;
  }
  .navbar-search input::placeholder{color:rgba(255,255,255,0.25)}
  .navbar-search input:focus{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.45);box-shadow:0 0 0 3px rgba(99,102,241,0.12)}

  .navbar-links{display:flex;align-items:center;gap:4px;position:relative;z-index:1;flex-shrink:0}

  .navbar-link{
    position:relative;padding:6px 12px;font-size:0.8125rem;font-weight:500;
    color:rgba(255,255,255,0.5);text-decoration:none;border-radius:8px;overflow:hidden;transition:color 0.2s;
  }
  .navbar-link::before{content:'';position:absolute;inset:0;border-radius:8px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.1));opacity:0;transition:opacity 0.2s}
  .navbar-link::after{content:'';position:absolute;bottom:4px;left:12px;right:12px;height:1.5px;background:linear-gradient(90deg,#6366f1,#ec4899);transform:scaleX(0);transform-origin:left;border-radius:2px;transition:transform 0.25s cubic-bezier(0.4,0,0.2,1)}
  .navbar-link:hover{color:rgba(255,255,255,0.95)}
  .navbar-link:hover::before{opacity:1}
  .navbar-link:hover::after{transform:scaleX(1)}
  .navbar-link.active{color:rgba(255,255,255,0.95)}
  .navbar-link.active::before{opacity:1}
  .navbar-link.active::after{transform:scaleX(1)}

  .navbar-avatar-pill{
    display:flex;align-items:center;gap:8px;padding:4px 4px 4px 10px;
    border-radius:999px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);
    text-decoration:none;margin-left:4px;flex-shrink:0;transition:border-color 0.2s,background 0.2s;
  }
  .navbar-avatar-pill:hover{border-color:rgba(99,102,241,0.4);background:rgba(99,102,241,0.08)}
  .navbar-avatar-img{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .navbar-avatar-img img{width:100%;height:100%;object-fit:cover}
  .navbar-avatar-img svg{width:14px;height:14px;color:#fff}
  .navbar-avatar-name{font-size:0.75rem;font-weight:500;color:rgba(255,255,255,0.7);max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .navbar-signin-btn{
    display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;
    font-size:0.8125rem;font-weight:600;color:#fff;text-decoration:none;
    background:linear-gradient(135deg,#6366f1,#7c3aed);
    box-shadow:0 0 0 0 rgba(99,102,241,0.4);transition:opacity 0.2s,box-shadow 0.2s;
    margin-left:4px;flex-shrink:0;
  }
  .navbar-signin-btn:hover{opacity:0.88;box-shadow:0 0 14px rgba(99,102,241,0.4)}

  .navbar-hamburger-btn{
    display:none;align-items:center;justify-content:center;width:38px;height:38px;
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
    border-radius:9px;color:rgba(255,255,255,0.7);cursor:pointer;
    position:relative;z-index:1;flex-shrink:0;transition:background 0.2s,border-color 0.2s,color 0.2s;
  }
  .navbar-hamburger-btn:hover{background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.35);color:#fff}
  .navbar-hamburger-btn svg{width:18px;height:18px}

  .navbar-drawer{background:#0d0d14;border-bottom:1px solid rgba(255,255,255,0.07);overflow:hidden;max-height:0;opacity:0;transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.28s ease}
  .navbar-drawer.is-open{max-height:460px;opacity:1}
  
  .navbar-drawer-inner{padding:14px 20px 22px;display:flex;flex-direction:column;gap:4px}
  .navbar-drawer-search{position:relative;margin-bottom:10px}
  .navbar-drawer-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:rgba(255,255,255,0.3);pointer-events:none;transition:color 0.2s}
  .navbar-drawer-search:focus-within svg{color:rgba(99,102,241,0.8)}
  .navbar-drawer-search input{width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px 10px 36px;font-size:0.875rem;font-family:'DM Sans',sans-serif;color:rgba(255,255,255,0.85);outline:none;transition:background 0.2s,border-color 0.2s,box-shadow 0.2s}
  .navbar-drawer-search input::placeholder{color:rgba(255,255,255,0.25)}
  .navbar-drawer-search input:focus{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.45);box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
  .navbar-drawer-divider{height:1px;background:rgba(255,255,255,0.06);border:none;margin:6px 0}
  .navbar-drawer-link{display:flex;align-items:center;gap:10px;padding:11px 14px;font-size:0.9375rem;font-weight:500;color:rgba(255,255,255,0.55);text-decoration:none;border-radius:10px;border:1px solid transparent;transition:background 0.18s,color 0.18s,border-color 0.18s}
  .navbar-drawer-link:hover{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.2);color:#fff}
  .navbar-drawer-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);opacity:0.5;flex-shrink:0;transition:opacity 0.18s}
  .navbar-drawer-link:hover .navbar-drawer-dot{opacity:1}
  .navbar-drawer-profile{display:flex;align-items:center;gap:12px;margin-top:6px;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);text-decoration:none;transition:background 0.18s,border-color 0.18s}
  .navbar-drawer-profile:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2)}
  .navbar-drawer-profile-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .navbar-drawer-profile-avatar img{width:100%;height:100%;object-fit:cover}
  .navbar-drawer-profile-avatar svg{width:15px;height:15px;color:#fff}
  .navbar-drawer-profile-info{display:flex;flex-direction:column;min-width:0}
  .navbar-drawer-profile-name{font-size:0.875rem;font-weight:500;color:rgba(255,255,255,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .navbar-drawer-profile-sub{font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:1px}
  .navbar-drawer-signin{display:flex;align-items:center;justify-content:center;margin-top:8px;padding:13px 14px;border-radius:10px;font-size:0.9375rem;font-weight:600;color:#fff;text-decoration:none;background:linear-gradient(135deg,#6366f1,#7c3aed);transition:opacity 0.2s}
  .navbar-drawer-signin:hover{opacity:0.85}

  @media(max-width:860px){.navbar-search{max-width:260px}}
  @media(max-width:600px){.navbar-search{display:none}.navbar-links{display:none}.navbar-hamburger-btn{display:flex}}
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
    <div className="navbar-root relative z-50">
      <style>{navStyles}</style>

      <header className="navbar-header">
        {/* Logo — SUGGESTION: updated to VideoTube */}
        <Link
          to="/"
          className="navbar-logo active:scale-95 transition-transform duration-200"
        >
          <span className="navbar-logo-dot" />
          VideoTube
        </Link>

        {/* Search */}
        <form
          className="navbar-search transition-transform duration-300 focus-within:scale-[1.02]"
          onSubmit={handleSearch}
        >
          <Search />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search videos..."
          />
        </form>

        {/* Desktop nav */}
        <nav className="navbar-links">
          <Link
            to="/"
            className={`navbar-link active:scale-95 transition-all ${atHome ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`navbar-link active:scale-95 transition-all ${atAbout ? "active" : ""}`}
          >
            About
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="navbar-avatar-pill active:scale-95 transition-all"
              aria-label="Your profile"
            >
              <span className="navbar-avatar-name">
                {user?.fullName || user?.username}
              </span>
              <span className="navbar-avatar-img ring-2 ring-transparent group-hover:ring-indigo-500/50">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.fullName} />
                ) : (
                  <User />
                )}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="navbar-signin-btn active:scale-95 transition-all"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="navbar-hamburger-btn active:scale-90 transition-all outline-none"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${isMobileOpen ? "is-open" : ""}`}>
        <div className="navbar-drawer-inner">
          <form
            className="navbar-drawer-search focus-within:scale-[1.02] transition-transform duration-300"
            onSubmit={handleSearch}
          >
            <Search />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search videos..."
            />
          </form>

          <hr className="navbar-drawer-divider" />
          <Link to="/" className="navbar-drawer-link active:scale-95">
            <span className="navbar-drawer-dot" />
            Home
          </Link>
          <Link to="/about" className="navbar-drawer-link active:scale-95">
            <span className="navbar-drawer-dot" />
            About
          </Link>
          <hr className="navbar-drawer-divider" />

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="navbar-drawer-profile active:scale-95"
            >
              <span className="navbar-drawer-profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.fullName} />
                ) : (
                  <User />
                )}
              </span>
              <span className="navbar-drawer-profile-info">
                <span className="navbar-drawer-profile-name">
                  {user?.fullName || user?.username}
                </span>
                <span className="navbar-drawer-profile-sub">
                  View profile & sign out
                </span>
              </span>
            </Link>
          ) : (
            <Link to="/login" className="navbar-drawer-signin active:scale-95">
              Sign in to your account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
