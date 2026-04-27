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
    <div
      className="flex items-center justify-center h-screen w-full relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full "
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/15 blur-[100px] rounded-full "
        />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Orbital spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-[2px] border-indigo-500 border-r-[2px] border-transparent"
            style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-b-[2px] border-violet-500 border-l-[2px] border-transparent"
            style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.6))" }}
          />
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-3 h-3 rounded-full bg-indigo-400"
            style={{ boxShadow: "0 0 20px rgba(99,102,241,1)" }}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs font-black tracking-[0.3em] text-indigo-300 uppercase"
            style={{ textShadow: "0 0 20px rgba(165,180,252,0.5)" }}
          >
            Authenticating
          </motion.span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                style={{ boxShadow: "0 0 8px rgba(165,180,252,0.8)" }}
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

  const shouldAnimate = !hasAnimated.current;
  if (shouldAnimate) hasAnimated.current = true;

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.99 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-screen w-full overflow-hidden relative "
      style={{ background: "#050508" }}
    >
      {/* Global ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-30%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-30 "
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 "
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <Outlet />
          </main>
        </div>
      </div>
    </motion.div>
  );
}
