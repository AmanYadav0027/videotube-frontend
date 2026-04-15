import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifyEmailSent() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[110px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/[0.06] rounded-[2rem] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="px-8 pt-10 pb-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/10 mx-auto mb-6"
          >
            <Mail size={26} className="text-white" />
          </motion.div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Check your inbox
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed">
            We sent a verification link to your email. Click it to activate your
            account.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-500 leading-relaxed">
            Didn't receive it? Check your spam folder. The link expires in{" "}
            <span className="text-slate-300 font-semibold">24 hours</span>.
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
