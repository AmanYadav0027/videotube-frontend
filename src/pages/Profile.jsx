import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { logout as authLogout, updateUser } from "../store/authSlice";
import {
  LogOut,
  Mail,
  User,
  Shield,
  Camera,
  Lock,
  AlertTriangle,
  X,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable helpers
// ─────────────────────────────────────────────────────────────────────────────

function inputCls(err) {
  return [
    "block w-full pl-9 pr-4 py-2.5 rounded-xl text-sm",
    "bg-white/[0.03] border text-slate-100 placeholder-slate-600",
    "focus:outline-none transition-all duration-200",
    err
      ? "border-rose-500/40 focus:border-rose-500/60 focus:bg-rose-500/5"
      : "border-white/[0.08] focus:border-indigo-500/50 focus:bg-indigo-500/5",
  ].join(" ");
}

function Field({ id, label, icon: Icon, error, children, required }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-400 mb-1.5"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
          <Icon size={14} />
        </span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ success, message }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs border ${
        success
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
      }`}
    >
      {success ? (
        <Check size={13} className="flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative py-2.5 px-6 rounded-xl text-sm font-semibold text-white
        bg-gradient-to-r from-indigo-600 to-violet-600
        hover:from-indigo-500 hover:to-violet-500
        shadow-lg shadow-indigo-500/20
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 active:scale-[0.98] overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

function LogoutModal({ onConfirm, onCancel, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-[#0f1117] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        <div className="px-6 py-6">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors"
          >
            <X size={15} />
          </button>
          <div className="flex flex-col items-center text-center mb-6">
            <span className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
              <LogOut size={20} strokeWidth={1.75} className="text-rose-400" />
            </span>
            <h3 className="text-base font-semibold text-slate-100">
              Sign out?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              You'll need to sign in again to access your workspace.
            </p>
          </div>
          {error && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 relative py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all duration-200 disabled:opacity-50 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={13} className="animate-spin" />
                  Signing out…
                </span>
              ) : (
                "Yes, sign out"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ FIXED: was state.auth.user — correct key is state.auth.userData
  const user = useSelector((state) => state.auth.userData);

  // ── logout ──
  const [showLogout, setShowLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");
    setLogoutLoading(true);
    try {
      await axios.post("/api/v2/users/logout");
      dispatch(authLogout());
      navigate("/login");
    } catch (err) {
      setLogoutError(
        err.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  // ── account details ──
  const {
    register: regDetails,
    handleSubmit: submitDetails,
    formState: { errors: detailErrors },
  } = useForm({
    defaultValues: { fullName: user?.fullName || "", email: user?.email || "" },
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState({
    success: false,
    message: "",
  });

  const saveDetails = async (data) => {
    setDetailsStatus({ success: false, message: "" });
    setDetailsLoading(true);
    try {
      const res = await axios.patch("/api/v2/users/update-account", data);
      dispatch(updateUser(res.data.data));
      setDetailsStatus({
        success: true,
        message: "Account details updated successfully.",
      });
    } catch (err) {
      setDetailsStatus({
        success: false,
        message: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // ── change password ──
  const {
    register: regPass,
    handleSubmit: submitPass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm();
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState({ success: false, message: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const changePassword = async (data) => {
    setPassStatus({ success: false, message: "" });
    setPassLoading(true);
    try {
      await axios.post("/api/v2/users/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setPassStatus({
        success: true,
        message: "Password changed successfully.",
      });
      resetPass();
    } catch (err) {
      setPassStatus({
        success: false,
        message: err.response?.data?.message || "Password change failed.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  // ── avatar upload ──
  const avatarRef = useRef();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState({
    success: false,
    message: "",
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarStatus({ success: false, message: "" });
    setAvatarLoading(true);
    const form = new FormData();
    form.append("avatar", file);
    try {
      const res = await axios.patch("/api/v2/users/avatar", form);
      dispatch(updateUser(res.data.data));
      setAvatarStatus({ success: true, message: "Avatar updated." });
    } catch (err) {
      setAvatarStatus({
        success: false,
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // ── cover upload ──
  const coverRef = useRef();
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverStatus, setCoverStatus] = useState({
    success: false,
    message: "",
  });

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverStatus({ success: false, message: "" });
    setCoverLoading(true);
    const form = new FormData();
    form.append("coverImage", file);
    try {
      const res = await axios.patch("/api/v2/users/cover-image", form);
      dispatch(updateUser(res.data.data));
      setCoverStatus({ success: true, message: "Cover image updated." });
    } catch (err) {
      setCoverStatus({
        success: false,
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setCoverLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  // Generate initials for avatar fallback
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-full bg-[#0a0a0f] relative">
      {/* background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ══════════════════════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════════════════════ */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* ── Cover ── */}
          <div
            className="relative h-32 sm:h-40 group cursor-pointer"
            onClick={() => !coverLoading && coverRef.current?.click()}
          >
            {/* Cover image or beautiful fallback */}
            {user?.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback: animated gradient mesh — looks great with no image
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 via-violet-900/30 to-[#0f1117] relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-violet-500/15 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
              </div>
            )}

            {/* hover overlay with upload hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {coverLoading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <>
                  <Camera size={16} className="text-white" />
                  <span className="text-white text-xs font-medium">
                    {user?.coverImage ? "Change cover" : "Add cover image"}
                  </span>
                </>
              )}
            </div>

            {/* bottom fade into card */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f1117] to-transparent pointer-events-none" />

            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleCoverChange}
            />
          </div>

          {/* ── Avatar + Identity ── */}
          <div className="px-5 sm:px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0 group w-fit">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-[3px] border-[#0f1117] overflow-hidden shadow-xl shadow-black/50 cursor-pointer"
                  onClick={() => !avatarLoading && avatarRef.current?.click()}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Initials fallback — much better than a plain icon
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl tracking-tight select-none">
                        {initials}
                      </span>
                    </div>
                  )}

                  {/* hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {avatarLoading ? (
                      <Loader2 size={14} className="animate-spin text-white" />
                    ) : (
                      <Camera size={14} className="text-white" />
                    )}
                  </div>
                </div>

                {/* online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f1117]" />
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-100 tracking-tight leading-tight truncate">
                      {user?.fullName || "Your Name"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      @{user?.username || "username"}
                    </p>
                  </div>
                </div>

                {/* chips row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-500 max-w-[200px] truncate">
                    <Mail size={10} className="flex-shrink-0" />
                    {user?.email || "email@example.com"}
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-[11px] text-indigo-400">
                    <Shield size={10} /> Verified
                  </span>
                </div>

                {/* upload status */}
                {(avatarStatus.message || coverStatus.message) && (
                  <div className="mt-3 space-y-1.5">
                    {avatarStatus.message && (
                      <StatusBadge
                        success={avatarStatus.success}
                        message={avatarStatus.message}
                      />
                    )}
                    {coverStatus.message && (
                      <StatusBadge
                        success={coverStatus.success}
                        message={coverStatus.message}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* upload hints */}
            <p className="mt-3 text-[11px] text-slate-700">
              Hover over your avatar or cover to upload a new image.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ACCOUNT DETAILS
        ══════════════════════════════════════════════════════ */}
        <SectionCard
          title="Account Details"
          description="Update your display name and email address."
        >
          <form
            onSubmit={submitDetails(saveDetails)}
            className="space-y-4"
            noValidate
          >
            <Field
              id="fullName"
              label="Full Name"
              icon={User}
              error={detailErrors.fullName?.message}
              required
            >
              <input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                {...regDetails("fullName", {
                  required: "Full name is required",
                })}
                className={inputCls(detailErrors.fullName)}
              />
            </Field>

            <Field
              id="email"
              label="Email Address"
              icon={Mail}
              error={detailErrors.email?.message}
              required
            >
              <input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...regDetails("email", { required: "Email is required" })}
                className={inputCls(detailErrors.email)}
              />
            </Field>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
              <StatusBadge
                success={detailsStatus.success}
                message={detailsStatus.message}
              />
              <SubmitButton
                loading={detailsLoading}
                label="Save changes"
                loadingLabel="Saving…"
              />
            </div>
          </form>
        </SectionCard>

        {/* ══════════════════════════════════════════════════════
            CHANGE PASSWORD
        ══════════════════════════════════════════════════════ */}
        <SectionCard
          title="Change Password"
          description="Use a strong password you don't use elsewhere."
        >
          <form
            onSubmit={submitPass(changePassword)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  id="oldPassword"
                  type={showOld ? "text" : "password"}
                  placeholder="••••••••"
                  {...regPass("oldPassword", {
                    required: "Current password is required",
                  })}
                  className={inputCls(passErrors.oldPassword) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowOld((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passErrors.oldPassword && (
                <p className="mt-1.5 text-xs text-rose-400">
                  {passErrors.oldPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...regPass("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Must be at least 8 characters",
                    },
                  })}
                  className={inputCls(passErrors.newPassword) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passErrors.newPassword && (
                <p className="mt-1.5 text-xs text-rose-400">
                  {passErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
              <StatusBadge
                success={passStatus.success}
                message={passStatus.message}
              />
              <SubmitButton
                loading={passLoading}
                label="Update password"
                loadingLabel="Updating…"
              />
            </div>
          </form>
        </SectionCard>

        {/* ══════════════════════════════════════════════════════
            DANGER ZONE
        ══════════════════════════════════════════════════════ */}
        <div className="bg-[#0f1117] border border-rose-500/15 rounded-2xl overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Sign out</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                You'll be redirected to the login page.
              </p>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/[0.14] hover:border-rose-500/35 transition-all duration-200"
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>

        {/* system status */}
        <div className="flex items-center justify-center gap-2 pb-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-600">System Online</span>
          <span className="text-[11px] text-slate-700 font-mono">v1.0.0</span>
        </div>
      </div>

      {/* logout modal */}
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => {
            setShowLogout(false);
            setLogoutError("");
          }}
          loading={logoutLoading}
          error={logoutError}
        />
      )}
    </div>
  );
}
