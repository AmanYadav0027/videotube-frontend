import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { login, setLoading } from "../store/authSlice";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AuthLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#050505] relative overflow-hidden">
      {/* Deep Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen"
        />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Orbital Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-[3px] border-indigo-500 border-r-[3px] border-transparent opacity-80 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-b-[3px] border-purple-500 border-l-[3px] border-transparent opacity-60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          />
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,1)]"
          />
        </div>

        {/* Label */}
        <div className="flex flex-col items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs font-black tracking-[0.3em] text-indigo-300 uppercase drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]"
          >
            Authenticating
          </motion.span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(165,180,252,0.8)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const dispatch = useDispatch();
  const isLoading = useSelector((s) => s.auth.isLoading);

  //  track whether this is the very first mount so the entrance animation
  // only runs once — not on every client-side navigation.
  const hasAnimated = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/v2/users/current-user");
        dispatch(login(res.data.data));
      } catch {
        // no session — fine
      } finally {
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (isLoading) return <AuthLoader />;

  // Animate only on the first render after auth check, never again
  const shouldAnimate = !hasAnimated.current;
  if (shouldAnimate) hasAnimated.current = true;

  return (
    <motion.div
      //animating on every navigation — now only animates on first mount
      initial={
        shouldAnimate ? { opacity: 0, scale: 0.98, filter: "blur(8px)" } : false
      }
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      }}
      className="flex h-screen w-full overflow-hidden bg-[#050505] relative selection:bg-indigo-500/30 selection:text-indigo-200"
    >
      {/* Global ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center opacity-20 mix-blend-screen">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Layout */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
          <Navbar />
          <main className="flex-1 overflow-y-auto relative z-0 scroll-smooth">
            <Outlet />
          </main>
        </div>
      </div>
    </motion.div>
  );
}
