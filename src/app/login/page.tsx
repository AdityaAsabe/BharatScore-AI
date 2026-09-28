import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <Image
                  src="/bharatscore.jpeg"
                  alt="BharatScore AI"
                  width={56}
                  height={56}
                  priority
                  className="h-14 w-14 object-contain rounded-tr-xl rounded-bl-xl"
                />
              </div>

          <div>
            <p className="text-xl font-bold tracking-tight">
              Bharat<span className="text-cyan-400">Score</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Financial Intelligence
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-medium text-emerald-300">
            SYSTEM SECURE
          </span>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-16 px-6 pb-12 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">

        {/* LEFT SIDE */}
        <div className="hidden lg:block">

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2">
            <span className="text-sm text-blue-300">
              ✦ AI-POWERED FINANCIAL ASSESSMENT
            </span>
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
            Your financial
            <br />
            identity,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              understood.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
            BharatScore transforms financial signals into an intelligent,
            explainable score designed to help understand your financial
            profile beyond traditional credit data.
          </p>

          {/* Score card */}
          <div className="mt-10 flex max-w-xl items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/5">

              <div className="absolute inset-2 rounded-full border border-blue-400/20" />

              <div className="absolute inset-4 rounded-full border-2 border-blue-400/20 border-t-blue-400 border-r-cyan-300 rotate-45" />

              <div className="text-center">
                <p className="text-3xl font-bold">742</p>
                <p className="text-xs text-slate-500">/ 900</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-400">
                BharatScore
              </p>

              <p className="mt-1 text-xl font-semibold">
                Financial Health Score
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                  AI analyzed
                </span>

                <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-xs text-blue-300">
                  Explainable
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>✓ Alternative data</span>
            <span>✓ Explainable insights</span>
            <span>✓ Secure assessment</span>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="mx-auto w-full max-w-md">

          <div className="mb-6 lg:hidden">
            <p className="text-sm font-medium text-blue-400">
              AI-POWERED FINANCIAL ASSESSMENT
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Welcome to BharatScore
            </h1>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">

            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-cyan-400">
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                Sign in
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Continue to your BharatScore financial workspace.
              </p>
            </div>

            <LoginForm />

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Secure access
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-slate-400">
              New to BharatScore?{" "}
              <Link
                href="/register"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>🔒</span>
            <span>Your authentication is protected with secure access controls.</span>
          </div>
        </div>
      </section>
    </main>
  );
}