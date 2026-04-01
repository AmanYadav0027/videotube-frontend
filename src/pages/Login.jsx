import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { login as authLogin } from "../store/authSlice";
import { AtSign, Lock, ChevronRight } from "lucide-react";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (data) => {
    setError("");
    setLoading(true);

    const isEmail = data.emailOrUsername.includes("@");
    const loginData = {
      [isEmail ? "email" : "username"]: data.emailOrUsername,
      password: data.password,
    };

    try {
      const response = await axios.post("/api/v2/users/login", loginData);
      if (response.status === 200) {
        const userData = response.data.data.user;
        dispatch(authLogin(userData));
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size[48px_48px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ── card ── */}
        <div className="bg-[#0f1117] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* top accent line */}
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
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sign in to continue to your workspace
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
              onSubmit={handleSubmit(loginUser)}
              className="space-y-5"
              noValidate
            >
              {/* Email or Username */}
              <div>
                <label
                  htmlFor="emailOrUsername"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Email or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                    <AtSign size={14} />
                  </span>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="jane@example.com or janedoe"
                    {...register("emailOrUsername", {
                      required: "Email or username is required",
                    })}
                    className={inputCls(errors.emailOrUsername)}
                  />
                </div>
                {errors.emailOrUsername && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {errors.emailOrUsername.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {/* wire up to your forgot-password route when ready */}
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400/70 hover:text-indigo-300 transition-colors duration-150"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={inputCls(errors.password)}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    {errors.password.message}
                  </p>
                )}
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
                {/* shimmer sweep */}
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
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* ── footer link ── */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
              >
                Register here
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

// ─── helper ───────────────────────────────────────────────────────────────────

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
