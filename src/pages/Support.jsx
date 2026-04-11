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

const ACCENT_COLORS = {
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    line: "via-indigo-500/30",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    line: "via-violet-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    line: "via-emerald-500/30",
  },
};

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a, accent }) {
  const [open, setOpen] = useState(false);
  const c = ACCENT_COLORS[accent];
  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        open
          ? `${c.bg} ${c.border}`
          : "bg-[#0a0a0f] border-white/[0.06] hover:border-white/10"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
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
      </button>
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
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await axios.post("/api/v2/support/contact", { subject, message });
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
      transition={spring}
      className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-60" />
      <div className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-violet-500/10 border-violet-500/20">
          <MessageSquarePlus size={15} className="text-violet-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-200">Send a Message</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            className="w-full bg-[#0a0a0f] border border-white/[0.08] focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:shadow-lg focus:shadow-violet-500/10"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or feedback..."
            rows={5}
            className="w-full bg-[#0a0a0f] border border-white/[0.08] focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all focus:shadow-lg focus:shadow-violet-500/10 resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={sending || !subject.trim() || !message.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </button>
        {sent && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-emerald-400 font-medium flex items-center gap-1.5"
          >
            <CheckCircle size={12} /> Message received — we'll get back to you
            soon.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Support() {
  useEffect(() => {
    document.title = "Support — VideoTube";
  }, []);

  const quickLinks = [
    {
      label: "GitHub Repo",
      icon: Github,
      href: "https://github.com",
      external: true,
    },
    { label: "Documentation", icon: BookOpen, href: "#", external: false },
    {
      label: "Email Support",
      icon: Mail,
      href: "mailto:support@videotube.dev",
      external: true,
    },
  ];

  return (
    <div className="min-h-full bg-[#0a0a0f] p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-sky-500/10">
            <HelpCircle size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Help & Support
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Find answers or get in touch
            </p>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {quickLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#0f1117] border border-white/[0.07] hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 shadow-lg text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center group-hover:border-indigo-500/20 group-hover:bg-indigo-500/10 transition-all duration-300">
                <l.icon
                  size={16}
                  className="text-slate-400 group-hover:text-indigo-400 transition-colors"
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-0.5">
                {l.label}
                {l.external && (
                  <ExternalLink size={10} className="opacity-50" />
                )}
              </span>
            </a>
          ))}
        </motion.div>

        {/* FAQs */}
        {FAQS.map((section, si) => {
          const c = ACCENT_COLORS[section.accent];
          return (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 + si * 0.07 }}
              className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-lg"
            >
              <div
                className={`h-[2px] w-full bg-gradient-to-r from-transparent ${c.line} to-transparent opacity-60`}
              />
              <div className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3 bg-white/[0.02]">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.bg} ${c.border}`}
                >
                  <section.icon size={15} className={c.text} />
                </div>
                <h2 className="text-sm font-bold text-slate-200">
                  {section.category}
                </h2>
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
