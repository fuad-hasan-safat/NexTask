import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../api/authApi";
import { useAuthStore } from "../../store/auth.store";

const BoltIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: "", password: "" });

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      navigate("/app", { replace: true });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email: form.email, password: form.password });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-50 antialiased selection:bg-indigo-500/30">
      {/* glow backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <BoltIcon className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl font-semibold tracking-tight">NexTask</span>
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1.5 text-center text-sm text-slate-400">
            Sign in to your NexTask workspace
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {(error as any)?.response?.data?.message ?? "Login failed"}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
