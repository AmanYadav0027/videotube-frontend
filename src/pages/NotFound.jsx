import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Page Not Found";
  }, []);

  return (
    <div className="min-h-full bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="text-center space-y-5 max-w-sm">
        <p className="text-7xl font-bold text-white/6 select-none">404</p>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-slate-100">Page not found</h1>
          <p className="text-sm text-slate-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            Go home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 border border-white/8 hover:border-white/[0.14] hover:text-slate-200 transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
