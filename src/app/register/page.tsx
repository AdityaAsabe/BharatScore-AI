import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

      {/* Grid */}
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
            SECURE PLATFORM
          </span>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-16 px-6 pb-12 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">

        {/* LEFT SIDE */}
        <div className="hidden lg:block">

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
            <span className="text-sm text-cyan-300">
              ✦ BUILD YOUR FINANCIAL IDENTITY
            </span>
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
            Your financial
            <br />
            profile starts
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              here.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
            Create your BharatScore profile and unlock an intelligent way
            to understand your financial identity using meaningful financial
            signals.
          </p>

          {/* Profile visualization */}
          <div className="mt-10 max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="flex items-center gap-5">

              {/* Profile icon */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10">

                <div className="absolute inset-2 rounded-xl border border-cyan-400/10" />

                <span className="text-3xl text-cyan-300">
                  +
                </span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  New financial profile
                </p>

                <p className="mt-1 text-xl font-semibold">
                  BharatScore Profile
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Ready for intelligent assessment
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-7">

              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-500">
                  Profile readiness
                </span>

                <span className="text-cyan-400">
                  Getting started
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[18%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-3 gap-3">

              <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                <p className="text-xs text-slate-500">
                  Signals
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  Multiple
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                <p className="text-xs text-slate-500">
                  Analysis
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  AI
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                <p className="text-xs text-slate-500">
                  Insights
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  Explainable
                </p>
              </div>

            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>✓ Alternative financial signals</span>
            <span>✓ Explainable assessment</span>
            <span>✓ Secure profile</span>
          </div>
        </div>

        {/* REGISTER CARD */}
        <div className="mx-auto w-full max-w-md">

          {/* Mobile heading */}
          <div className="mb-6 lg:hidden">

            <p className="text-sm font-medium text-cyan-400">
              BUILD YOUR FINANCIAL IDENTITY
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Create your profile
            </h1>

          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">

            <div className="mb-8">

              <p className="mb-2 text-sm font-medium text-blue-400">
                GET STARTED
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                Create your profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Set up your BharatScore account to begin your financial
                assessment.
              </p>

            </div>

            <RegisterForm />

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Protected access
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Sign in
              </Link>
            </p>

          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>🔒</span>
            <span>
              Your account information is protected with secure access controls.
            </span>
          </div>

        </div>
      </section>
    </main>
  );
}