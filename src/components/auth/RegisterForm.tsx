"use client";

import { useState } from "react";
import { apiFetch } from "@/utils/api";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      alert("Account created successfully!");

      window.location.href = "/login";
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);

          alert(
            parsedError.message ||
              parsedError.error ||
              "Registration failed"
          );
        } catch {
          alert(error.message || "Cannot connect to BharatScore server");
        }
      } else {
        alert("Cannot connect to BharatScore server");
      }
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;

  return (
    <form onSubmit={handleRegister} className="space-y-7">

      {/* STEP 01 */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400 ring-1 ring-blue-500/20">
            01
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Your identity
            </p>

            <p className="text-xs text-slate-500">
              Tell us who you are
            </p>
          </div>
        </div>

        <label
          htmlFor="name"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Full name
        </label>

        <div className="group relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-400">
            ◉
          </span>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-400/50 focus:bg-blue-500/[0.03] focus:ring-4 focus:ring-blue-500/5"
          />
        </div>

        <p className="mt-2 text-xs text-slate-600">
          This name will be associated with your BharatScore profile.
        </p>
      </div>

      {/* STEP 02 */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400 ring-1 ring-cyan-500/20">
            02
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Your contact
            </p>

            <p className="text-xs text-slate-500">
              Create your account identity
            </p>
          </div>
        </div>

        <label
          htmlFor="email"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Email address
        </label>

        <div className="group relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-cyan-400">
            @
          </span>

          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-400/50 focus:bg-cyan-500/[0.03] focus:ring-4 focus:ring-cyan-500/5"
          />
        </div>

        <p className="mt-2 text-xs text-slate-600">
          Used to securely access your BharatScore account.
        </p>
      </div>

      {/* STEP 03 */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/20">
            03
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Secure your account
            </p>

            <p className="text-xs text-slate-500">
              Create a strong password
            </p>
          </div>
        </div>

        <label
          htmlFor="password"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Password
        </label>

        <div className="group relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-indigo-400">
            ◆
          </span>

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-14 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-indigo-400/50 focus:bg-indigo-500/[0.03] focus:ring-4 focus:ring-indigo-500/5"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password strength */}
        {password.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 flex justify-between">
              <span className="text-xs text-slate-600">
                Password strength
              </span>

              <span className="text-xs text-slate-500">
                {passwordStrength === 1
                  ? "Weak"
                  : passwordStrength === 2
                  ? "Good"
                  : "Strong"}
              </span>
            </div>

            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    level <= passwordStrength
                      ? "bg-cyan-400"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-slate-600">
          Minimum 6 characters required.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "Creating your profile..." : "Create my BharatScore"}

            {!loading && (
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </span>
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-600">
          Your profile will be securely stored and protected.
        </p>
      </div>
    </form>
  );
}