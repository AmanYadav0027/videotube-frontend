import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { updateUser } from "../store/authSlice";
import {
  Settings,
  User,
  Lock,
  Image,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Camera,
  Pencil,
} from "lucide-react";

const spring = { type: "spring", stiffness: 380, damping: 28 };

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl border backdrop-blur-md ${
            type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-rose-500/20"
          }`}
        >
          {type === "success" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertTriangle size={15} />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, accent = "indigo", children }) {
  const colors = {
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
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      line: "via-amber-500/30",
    },
    rose: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-400",
      line: "via-rose-500/30",
    },
  };
  const c = colors[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden shadow-lg"
    >
      <div
        className={`h-[2px] w-full bg-gradient-to-r from-transparent ${c.line} to-transparent opacity-60`}
      />
      <div className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3 bg-white/[0.02]">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.bg} ${c.border}`}
        >
          <Icon size={15} className={c.text} />
        </div>
        <h2 className="text-sm font-bold text-slate-200 tracking-tight">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  rightEl,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-[#0a0a0f] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:shadow-lg focus:shadow-indigo-500/10 pr-10"
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const dispatch = useDispatch();
  const userData = useSelector((s) => s.auth.userData);

  const [toast, setToast] = useState({ message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  // ── Account details ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(userData?.fullName ?? "");
  const [email, setEmail] = useState(userData?.email ?? "");
  const [savingAccount, setSavingAccount] = useState(false);

  <Field
    label="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="your_username"
  />;

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim())
      return showToast("Name and email are required.", "error");
    setSavingAccount(true);
    try {
      const res = await axios.patch("/api/v2/users/update-account", {
        fullName,
        email,
        username,
      });
      dispatch(updateUser(res.data?.data));
      showToast("Account details updated.");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setSavingAccount(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword)
      return showToast("All password fields are required.", "error");
    if (newPassword.length < 8)
      return showToast("New password must be at least 8 characters.", "error");
    if (newPassword !== confirmPassword)
      return showToast("New passwords don't match.", "error");
    setSavingPassword(true);
    try {
      await axios.post("/api/v2/users/change-password", {
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Password change failed.",
        "error",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const res = await axios.patch("/api/v2/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(updateUser(res.data?.data));
      setAvatarFile(null);
      setAvatarPreview(null);
      showToast("Avatar updated.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Avatar upload failed.",
        "error",
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  // ── Cover image upload ────────────────────────────────────────────────────
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [savingCover, setSavingCover] = useState(false);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSaveCover = async () => {
    if (!coverFile) return;
    setSavingCover(true);
    const formData = new FormData();
    formData.append("coverImage", coverFile);
    try {
      const res = await axios.patch("/api/v2/users/cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(updateUser(res.data?.data));
      setCoverFile(null);
      setCoverPreview(null);
      showToast("Cover image updated.");
    } catch (err) {
      showToast(err.response?.data?.message || "Cover upload failed.", "error");
    } finally {
      setSavingCover(false);
    }
  };

  useEffect(() => {
    document.title = "Settings — VideoTube";
  }, []);

  const SaveButton = ({
    loading,
    label = "Save Changes",
    onClick,
    disabled,
  }) => (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CheckCircle size={14} />
      )}
      {label}
    </button>
  );

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
          <div className="w-11 h-11 rounded-xl bg-slate-500/15 border border-slate-500/20 flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
            <Settings size={20} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage your account
            </p>
          </div>
        </motion.div>

        {/* Account Details */}
        <Section title="Account Details" icon={User} accent="indigo">
          <div className="space-y-4">
            <Field
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Field
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@email.com"
            />
            <div className="pt-2">
              <SaveButton
                loading={savingAccount}
                label="Save Details"
                onClick={handleSaveAccount}
              />
            </div>
          </div>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" icon={Lock} accent="violet">
          <div className="space-y-4">
            <Field
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              type={showOld ? "text" : "password"}
              placeholder="••••••••"
              rightEl={
                <button
                  onClick={() => setShowOld((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            <Field
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type={showNew ? "text" : "password"}
              placeholder="Min. 8 characters"
              rightEl={
                <button
                  onClick={() => setShowNew((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            <Field
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Repeat new password"
            />
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Passwords don't match
                </p>
              )}
            <div className="pt-2">
              <SaveButton
                loading={savingPassword}
                label="Change Password"
                onClick={handleChangePassword}
              />
            </div>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Profile Picture" icon={Camera} accent="amber">
          <div className="flex items-center gap-5">
            <div className="relative group/avatar shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                {avatarPreview || userData?.avatar ? (
                  <img
                    src={avatarPreview ?? userData.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
                    {userData?.fullName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <Pencil size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload a new profile picture. Recommended: square, at least
                200×200px.
              </p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-all cursor-pointer active:scale-95">
                  <Camera size={13} /> Choose file
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatarFile && (
                  <SaveButton
                    loading={savingAvatar}
                    label="Upload"
                    onClick={handleSaveAvatar}
                  />
                )}
              </div>
              {avatarFile && (
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {avatarFile.name}
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* Cover Image */}
        <Section title="Cover Image" icon={Image} accent="rose">
          <div className="space-y-4">
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0a0a0f] group/cover">
              {coverPreview || userData?.coverImage ? (
                <img
                  src={coverPreview ?? userData.coverImage}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Image size={32} strokeWidth={1.2} />
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold text-white">
                <Camera size={18} /> Change cover
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-all cursor-pointer active:scale-95">
                <Camera size={13} /> Choose file
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
              {coverFile && (
                <SaveButton
                  loading={savingCover}
                  label="Upload"
                  onClick={handleSaveCover}
                />
              )}
            </div>
            {coverFile && (
              <p className="text-[11px] text-slate-500 truncate">
                {coverFile.name}
              </p>
            )}
          </div>
        </Section>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
