import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  MessageSquarePlus,
  Github,
  Mail,
  BookOpen,
  Zap,
  Shield,
  Video,
  CheckCircle,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const spring = { type: "spring", stiffness: 380, damping: 28 };

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: "Uploads",
    icon: Video,
    accent: "indigo",
    items: [
      {
        q: "What video formats are supported?",
        a: "VideoTube supports all major formats — MP4, WebM, MOV, AVI, MKV, and more. MP4 with H.264 encoding gives the best results for streaming quality.",
      },
      {
        q: "Is there a file size limit for uploads?",
        a: "Currently the limit is 500 MB per video. This covers most high-quality videos up to around 30–40 minutes at 1080p.",
      },
      {
        q: "Why is AI processing taking long?",
        a: "AI transcription and summarization runs in the background via AssemblyAI and Gemini. Depending on video length it may take 1–5 minutes. The Watch page auto-refreshes when processing completes.",
      },
    ],
  },
  {
    category: "AI Features",
    icon: Zap,
    accent: "violet",
    items: [
      {
        q: "How does the AI summary work?",
        a: "After upload, your video is transcribed by AssemblyAI. Gemini then generates a structured summary and chapter markers from the transcript. These appear in the AI Insights panel on the Watch page.",
      },
      {
        q: "What is the RAG chatbot?",
        a: "The video chat uses Retrieval-Augmented Generation — your question is matched against transcript chunks via vector search, and Gemini answers using only that context. It stays grounded in the actual video content.",
      },
      {
        q: "Why was my comment removed?",
        a: "Comments and tweets are automatically moderated by Gemini. If a comment is incorrectly flagged, your channel owner can restore it from the Dashboard → Flagged Content tab.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    icon: Shield,
    accent: "emerald",
    items: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Change Password. Enter your current password and a new password (minimum 8 characters).",
      },
      {
        q: "Can I make my videos private?",
        a: "Yes — use the toggle in your Dashboard or the publish button in the video editor. Private videos are hidden from search and the home feed.",
      },
      {
        q: "How is my data stored?",
        a: "Videos and images are stored on Cloudinary. Account data lives in MongoDB Atlas. Transcripts are chunked and stored as vector embeddings for the RAG chatbot.",
      },
    ],
  },
];

const ACCENT = {
  indigo: {
    text: "text-indigo-400",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    line: "rgba(99,102,241,0.5)",
  },
  violet: {
    text: "text-violet-400",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    line: "rgba(139,92,246,0.5)",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    line: "rgba(16,185,129,0.5)",
  },
};

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a, accent }) {
  const [open, setOpen] = useState(false);
  const c = ACCENT[accent];

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden border transition-all duration-300"
      style={{
        background: open ? c.bg : "rgba(255,255,255,0.02)",
        borderColor: open ? c.border : "rgba(255,255,255,0.06)",
      }}
    >
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
      >
        <span
          className={`text-sm font-semibold transition-colors duration-200 ${open ? c.text : "text-slate-300"}`}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
          className="shrink-0"
        >
          <ChevronDown size={15} className={open ? c.text : "text-slate-600"} />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await axios.post("/api/v2/support/contact", { email, subject, message });
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch {
      // silent — form stays open so user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.3 }}
      className="rounded-[1.75rem] overflow-hidden border border-white/[0.06]"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 16px 50px rgba(0,0,0,0.4)",
      }}
    >
      {/* Violet top line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)",
        }}
      />

      <div
        className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3"
        style={{ background: "rgba(255,255,255,0.01)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-violet-500/20"
          style={{ background: "rgba(139,92,246,0.1)" }}
        >
          <MessageSquarePlus size={15} className="text-violet-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-200">Send us a Message</h2>
        <span
          className="ml-auto text-[10px] font-black text-violet-400 uppercase tracking-widest px-2 py-0.5 rounded-lg border border-violet-500/20"
          style={{ background: "rgba(139,92,246,0.08)" }}
        >
          Support
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="How can we reach you?"
            className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all border"
            style={{
              background: "rgba(5,5,8,0.9)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(139,92,246,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all border"
            style={{
              background: "rgba(5,5,8,0.9)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(139,92,246,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or feedback in detail…"
            rows={5}
            className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all border resize-none leading-relaxed"
            style={{
              background: "rgba(5,5,8,0.9)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(139,92,246,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <AnimatePresence>
            {sent && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-400 font-medium flex items-center gap-1.5"
              >
                <CheckCircle size={12} /> Message received — we'll get back to
                you soon.
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: "0 10px 24px rgba(139,92,246,0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={sending || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ml-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              boxShadow: "0 6px 18px rgba(124,58,237,0.35)",
            }}
          >
            {sending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sending…
              </>
            ) : sent ? (
              <>
                <CheckCircle size={14} /> Sent!
              </>
            ) : (
              <>
                <Mail size={14} /> Send Message
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Support() {
  useEffect(() => {
    document.title = "Support — VideoTube";
  }, []);

  return (
    <div
      className="min-h-screen p-4 sm:p-6 overflow-x-hidden"
      style={{ background: "#050508" }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/3 w-[500px] h-[400px] opacity-[0.06] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-[0.05] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse, rgba(139,92,246,1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-5 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
          className="flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-sky-500/20"
            style={{
              background: "rgba(14,165,233,0.08)",
              boxShadow: "0 0 20px rgba(14,165,233,0.15)",
            }}
          >
            <HelpCircle size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Help & Support
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Find answers or get in touch
            </p>
          </div>
        </motion.div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="relative rounded-2xl p-6 overflow-hidden border border-white/[0.06]"
          style={{
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top left, rgba(99,102,241,0.12) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 flex items-center gap-3">
            <Sparkles size={18} className="text-indigo-400 shrink-0" />
            <p className="text-sm text-slate-300">
              <span className="font-bold text-white">Quick tip:</span> Most
              answers are in the FAQ below. If you still need help, send us a
              message and we'll respond within 24 hours.
            </p>
          </div>
        </motion.div>

        {/* FAQs */}
        {FAQS.map((section, si) => {
          const c = ACCENT[section.accent];
          return (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.12 + si * 0.07 }}
              className="rounded-[1.75rem] overflow-hidden border border-white/[0.06]"
              style={{
                background: "rgba(10,10,15,0.85)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.line}, transparent)`,
                  opacity: 0.7,
                }}
              />
              <div
                className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <section.icon size={15} className={c.text} />
                </div>
                <h2 className="text-sm font-bold text-slate-200">
                  {section.category}
                </h2>
                <span className="ml-auto text-xs text-slate-600 font-medium">
                  {section.items.length} questions
                </span>
              </div>
              <div className="p-4 space-y-2">
                {section.items.map((item) => (
                  <FaqItem
                    key={item.q}
                    q={item.q}
                    a={item.a}
                    accent={section.accent}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Contact form */}
        <ContactForm />
      </div>
    </div>
  );
}
