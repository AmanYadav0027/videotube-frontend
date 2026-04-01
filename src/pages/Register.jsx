import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  AtSign,
  Lock,
  ImagePlus,
  Layers,
  ChevronRight,
  Upload,
} from "lucide-react";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarName, setAvatarName] = useState("");
  const [coverName, setCoverName] = useState("");

  const create_user = async (data) => {
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar[0]);
    if (data.coverImage && data.coverImage[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    try {
      const response = await axios.post("/api/v2/users/register", formData);
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ── background aurora ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-linear(rgba(255,255,255,0.015)_1px,transparent_1px),linear-linear(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size[48px_48px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ── card ── */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* card top accent line */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="px-8 pt-8 pb-10">
            {/* ── header ── */}
            <div className="flex flex-col items-center mb-8">
              <span className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                <ChevronRight
                  size={16}
                  strokeWidth={3}
                  className="text-white -mr-0.5"
                />
              </span>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Join us — it only takes a minute
              </p>
            </div>

            {/* ── error banner ── */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* ── form ── */}
            <form
              onSubmit={handleSubmit(create_user)}
              className="space-y-5"
              noValidate
            >
              {/* Full Name */}
              <Field
                id="fullName"
                label="Full Name"
                icon={<User size={14} />}
                error={errors.fullName?.message}
              >
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                  className={inputCls(errors.fullName)}
                />
              </Field>

              {/* Email */}
              <Field
                id="email"
                label="Email"
                icon={<Mail size={14} />}
                error={errors.email?.message}
              >
                <input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  {...register("email", { required: "Email is required" })}
                  className={inputCls(errors.email)}
                />
              </Field>

              {/* Username */}
              <Field
                id="username"
                label="Username"
                icon={<AtSign size={14} />}
                error={errors.username?.message}
              >
                <input
                  id="username"
                  type="text"
                  placeholder="janedoe"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className={inputCls(errors.username)}
                />
              </Field>

              {/* Password */}
              <Field
                id="password"
                label="Password"
                icon={<Lock size={14} />}
                error={errors.password?.message}
              >
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className={inputCls(errors.password)}
                />
              </Field>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                  Uploads
                </span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              {/* Avatar */}
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Avatar <span className="text-rose-500">*</span>
                </label>
                <label
                  htmlFor="avatar"
                  className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-xl cursor-pointer
                    border transition-all duration-200
                    ${
                      errors.avatar
                        ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
                        : "bg-white/3 border-white/8 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                    }
                  `}
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <ImagePlus size={13} className="text-indigo-400" />
                  </span>
                  <span className="text-sm text-slate-500 truncate flex-1">
                    {avatarName || "Click to upload avatar"}
                  </span>
                  <span className="shrink-0">
                    <Upload size={13} className="text-slate-600" />
                  </span>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("avatar", { required: "Avatar is required" })}
                    onChange={(e) =>
                      setAvatarName(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
                {errors.avatar && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {errors.avatar.message}
                  </p>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label
                  htmlFor="coverImage"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Cover Image{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <label
                  htmlFor="coverImage"
                  className="
                    flex items-center gap-3 w-full px-4 py-3 rounded-xl cursor-pointer
                    border border-white/8 bg-white/3
                    hover:border-indigo-500/40 hover:bg-indigo-500/5
                    transition-all duration-200
                  "
                >
                  <span className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Layers size={13} className="text-violet-400" />
                  </span>
                  <span className="text-sm text-slate-500 truncate flex-1">
                    {coverName || "Click to upload cover image"}
                  </span>
                  <span className="shrink-0">
                    <Upload size={13} className="text-slate-600" />
                  </span>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    {...register("coverImage")}
                    onChange={(e) =>
                      setCoverName(e.target.files?.[0]?.name || "")
                    }
                  />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  relative w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white
                  bg-linear-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  shadow-lg shadow-indigo-500/20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 active:scale-[0.99]
                  overflow-hidden group
                "
              >
                {/* shimmer on hover */}
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white/70"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Registering…
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* ── footer link ── */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* system status strip — matches sidebar footer */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-slate-600">System Online</span>
          <span className="text-[11px] text-slate-700 font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function inputCls(err) {
  return [
    "block w-full pl-9 pr-4 py-2.5 rounded-xl text-sm",
    "bg-white/3 border text-slate-100 placeholder-slate-600",
    "focus:outline-none focus:ring-0 transition-all duration-200",
    err
      ? "border-rose-500/40 focus:border-rose-500/60 focus:bg-rose-500/5"
      : "border-white/8 focus:border-indigo-500/50 focus:bg-indigo-500/5",
  ].join(" ");
}

function Field({ id, label, icon, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-400 mb-1.5"
      >
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
