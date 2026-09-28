"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Building2,
  CircleHelp,
  Info,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/utils/auth";
import UserBadge from "@/components/auth/UserBadge";
import { apiFetch } from "@/utils/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";

import {
  DEFAULT_APPLICANT,
  DEFAULT_SIGNALS,
  PERSONAS,
  type Persona,
} from "@/lib/data";

import {
  FACTOR_META,
  MODEL_VERSION,
  WEIGHTS,
  makeRequestId,
  scoreApplicant,
  type Applicant,
  type FactorKey,
  type Signals,
} from "@/lib/scoring";

import { StepAltData } from "./step-altdata";
import { StepApplicant } from "./step-applicant";
import { StepLender } from "./step-lender";
import { StepOutputs } from "./step-outputs";
import { StepScore } from "./step-score";
import { Stepper } from "./stepper";

/* ========================================================= */
/* LOGO                                                       */
/* ========================================================= */

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <Image
          src="/bharatscore.jpeg"
          alt="BharatScore AI"
          width={56}
          height={56}
          priority
          className="h-14 w-14 rounded-tr-xl rounded-bl-xl object-contain"
        />
      </div>

      <div className="leading-none">
        <div className="flex items-center gap-1 text-[18px] font-extrabold tracking-[-0.04em] text-slate-950">
          BharatScore
          <span className="text-indigo-600">AI</span>
        </div>

        <div className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
          Credit Intelligence Platform
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* HEADER STATUS                                              */
/* ========================================================= */

function HeaderStatus() {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
          System Online
        </span>
      </div>

      <div className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-2">
        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />

        <span className="text-[10px] font-bold tracking-wide text-indigo-700">
          MODEL {MODEL_VERSION}
        </span>
      </div>
    </div>
  );
}

/* ========================================================= */
/* HOW IT WORKS                                               */
/* ========================================================= */

function HowItWorks() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-full px-3 text-slate-600 hover:bg-white hover:text-indigo-600"
        >
          <CircleHelp className="h-4 w-4" />

          <span className="hidden sm:inline">
            How it works
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogTitle>
          How BharatScore works
        </DialogTitle>

        <DialogDescription>
          A transparent, weighted model over
          consented alternative data. Model{" "}
          {MODEL_VERSION}.
        </DialogDescription>

        <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-teal-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Activity className="h-3.5 w-3.5" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Scoring engine
            </span>
          </div>

          <div className="rounded-xl bg-[#111827] p-4 font-mono text-xs leading-relaxed text-emerald-300 shadow-sm">
            score = round(300 + 600 × Σ
            weightᵢ × featureᵢ)

            <span className="mt-1 block text-slate-400">
              {"// features normalised to 0..1 · clamped 300..900"}
            </span>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {(Object.keys(WEIGHTS) as FactorKey[]).map(
            (key) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm font-semibold text-slate-800">
                  {FACTOR_META[key].label}
                </span>

                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                      style={{
                        width: `${
                          (WEIGHTS[key] / 0.3) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="w-10 text-right font-mono text-xs font-bold text-indigo-700">
                    {Math.round(
                      WEIGHTS[key] * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <ShieldCheck className="mb-2 h-4 w-4 text-teal-600" />

            <p className="text-xs font-bold text-slate-800">
              Consent-first
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Only applicant-approved data is used.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <Building2 className="mb-2 h-4 w-4 text-indigo-600" />

            <p className="text-xs font-bold text-slate-800">
              B2B infrastructure
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Built for lenders and NBFCs.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <Info className="mb-2 h-4 w-4 text-amber-500" />

            <p className="text-xs font-bold text-slate-800">
              Explainable
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Every score includes factor-level reasons.
            </p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

/* ========================================================= */
/* HEADLINES                                                  */
/* ========================================================= */

const HEADLINES: Record<
  number,
  {
    title: string;
    sub: string;
  }
> = {
  1: {
    title:
      "Every working Indian deserves to be seen.",
    sub:
      "Start with the person — not a paper trail.",
  },

  2: {
    title:
      "The signals were always there.",
    sub:
      "UPI rhythm, bills, recharges and mandi sales — turned into evidence.",
  },

  3: {
    title:
      "A score that was earned, not assumed.",
    sub:
      "Transparent factors, plain-language reasons.",
  },

  4: {
    title:
      "Same person. Two very different answers.",
    sub:
      "What changes when lenders can finally see.",
  },

  5: {
    title:
      "Built for lenders to plug in.",
    sub:
      "A clean API response and a passport the applicant keeps.",
  },
};

/* ========================================================= */
/* VALIDATION                                                 */
/* ========================================================= */

function isApplicantComplete(
  applicant: Applicant,
) {
  const name =
    typeof applicant.name === "string"
      ? applicant.name.trim()
      : "";

  const city =
    typeof applicant.city === "string"
      ? applicant.city.trim()
      : "";

  const occupation =
    applicant.occupation != null
      ? String(applicant.occupation).trim()
      : "";

  const loanAmount =
    Number(applicant.loanAmount);

  return (
    name.length > 0 &&
    city.length > 0 &&
    occupation.length > 0 &&
    Number.isFinite(loanAmount) &&
    loanAmount > 0
  );
}

function areSignalsComplete(
  signals: Signals,
) {
  const values = Object.values(signals);

  if (values.length === 0) {
    return false;
  }

  return values.every(
    (value) =>
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0,
  );
}

/* ========================================================= */
/* BACKEND ASSESSMENT                                         */
/* ========================================================= */

type BackendAssessment = {
  id: number;
  applicantId: number;
  creditScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  limitInr: number;
  tenureMonths: number;
  confidence: number;
  factorsJson?: string;
  modelVersion: string;
  generatedAt: string;
};

/* ========================================================= */
/* MAIN APP                                                   */
/* ========================================================= */

export function BharatScoreApp() {
  const [step, setStep] = useState(1);

  const [maxReached, setMaxReached] =
    useState(1);

  const [applicant, setApplicant] =
    useState<Applicant>(
      DEFAULT_APPLICANT,
    );

  const [signals, setSignals] =
    useState<Signals>(
      DEFAULT_SIGNALS,
    );

  const [personaId, setPersonaId] =
    useState<string | null>(null);

  const [lang, setLang] =
    useState<"en" | "hi" | "mr">("en");

  const [view, setView] =
    useState<"applicant" | "lender">(
      "lender",
    );

  const [issuedAt, setIssuedAt] =
    useState<string>("");

  /* ======================================================= */
  /* BACKEND ASSESSMENT STATE                                */
  /* ======================================================= */

  const [
    backendAssessment,
    setBackendAssessment,
  ] = useState<BackendAssessment | null>(
    null,
  );

  /* ======================================================= */
  /* LOCAL SCORE                                              */
  /* ======================================================= */

  const result = useMemo(
    () =>
      scoreApplicant(
        signals,
        applicant.loanAmount,
      ),
    [signals, applicant.loanAmount],
  );

  /* ======================================================= */
  /* REQUEST ID                                               */
  /* ======================================================= */

  const requestId = useMemo(
    () =>
      makeRequestId(
        `${applicant.name}|${applicant.city}|${Object.values(
          signals,
        ).join(",")}|${issuedAt}`,
      ),
    [
      applicant.name,
      applicant.city,
      signals,
      issuedAt,
    ],
  );

  /* ======================================================= */
  /* PHOTO                                                    */
  /* ======================================================= */

  const photo =
    PERSONAS.find(
      (p) => p.id === personaId,
    )?.photo ?? null;

  /* ======================================================= */
  /* NAVIGATION                                                */
  /* ======================================================= */

  const go = useCallback(
    (requestedStep: number) => {
      if (
        requestedStep < 1 ||
        requestedStep > 5
      ) {
        return;
      }

      if (
        requestedStep >
        maxReached + 1
      ) {
        return;
      }

      if (
        requestedStep === 2 &&
        !isApplicantComplete(applicant)
      ) {
        return;
      }

      if (
        requestedStep === 3 &&
        !areSignalsComplete(signals)
      ) {
        return;
      }

      if (
        requestedStep === 4 &&
        maxReached < 3
      ) {
        return;
      }

      if (
        requestedStep === 5 &&
        maxReached < 4
      ) {
        return;
      }

      setStep(requestedStep);

      setMaxReached((previous) =>
        Math.max(
          previous,
          requestedStep,
        ),
      );

      if (requestedStep >= 3) {
        setIssuedAt(
          (previous) =>
            previous ||
            new Date().toISOString(),
        );
      }

      if (
        typeof window !== "undefined"
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    [
      applicant,
      signals,
      maxReached,
    ],
  );

  /* ======================================================= */
  /* BACKEND SCORE CALCULATION                               */
  /* ======================================================= */

  const calculateBackendScore =
    async () => {
      const applicantId =
        localStorage.getItem(
          "applicantId",
        );

      if (!applicantId) {
        alert(
          "Applicant not found. Please start again.",
        );
        return;
      }

      try {
        const assessment =
          (await apiFetch(
            `/api/assessments/calculate/${applicantId}`,
            {
              method: "POST",
            },
          )) as BackendAssessment;

          console.log("BACKEND ASSESSMENT:", assessment);

        setBackendAssessment(
          assessment,
        );

        setIssuedAt(
          assessment.generatedAt ||
            new Date().toISOString(),
        );

        /*
         * Move to Step 3 only after
         * backend scoring succeeds.
         */
        go(3);
      } catch (error) {
        console.error(
          "Backend score calculation error:",
          error,
        );

        if (error instanceof Error) {
          try {
            const parsedError =
              JSON.parse(error.message);

            alert(
              parsedError.message ||
                parsedError.error ||
                "Failed to calculate BharatScore",
            );
          } catch {
            alert(
              error.message ||
                "Cannot connect to BharatScore server",
            );
          }
        } else {
          alert(
            "Cannot connect to BharatScore server",
          );
        }
      }
    };

  /* ======================================================= */
  /* PERSONA                                                  */
  /* ======================================================= */

  const loadPersona = (
    p: Persona,
  ) => {
    setApplicant(p.applicant);
    setSignals(p.signals);
    setPersonaId(p.id);

    /*
     * A persona changes the applicant data,
     * so any previous backend assessment
     * should not be reused.
     */
    setBackendAssessment(null);
  };

  /* ======================================================= */
  /* APPLICANT UPDATE                                         */
  /* ======================================================= */

  const updateApplicant = (
    a: Applicant,
  ) => {
    setApplicant(a);

    if (
      personaId &&
      a.name !== applicant.name
    ) {
      setPersonaId(null);
    }

    /*
     * Applicant data changed.
     * Previous backend assessment is no longer
     * guaranteed to represent the current applicant.
     */
    setBackendAssessment(null);
  };

  /* ======================================================= */
  /* SIGNAL UPDATE                                            */
  /* ======================================================= */

  const updateSignals = (
    s: Signals,
  ) => {
    setSignals(s);

    /*
     * Signals changed, so the previous backend
     * assessment should not be displayed as current.
     */
    setBackendAssessment(null);

    setIssuedAt((previous) =>
      previous
        ? new Date().toISOString()
        : previous,
    );
  };

  /* ======================================================= */
  /* RESTART                                                   */
  /* ======================================================= */

  const restart = () => {
    setApplicant(
      DEFAULT_APPLICANT,
    );

    setSignals(
      DEFAULT_SIGNALS,
    );

    setPersonaId(null);
    setIssuedAt("");
    setBackendAssessment(null);
    setMaxReached(1);
    setStep(1);

    if (
      typeof window !== "undefined"
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* ======================================================= */
  /* CURRENT HEADLINE                                         */
  /* ======================================================= */

  const h = HEADLINES[step];

  /* ======================================================= */
  /* UI                                                       */
  /* ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* ===================================================== */}
      {/* HEADER                                                */}
      {/* ===================================================== */}

      <header className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-teal-50/80">

        <div className="pointer-events-none absolute -left-28 -top-32 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="pointer-events-none absolute -right-28 -top-32 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl" />

        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-indigo-600 via-indigo-400 to-teal-500" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Main header */}
          <div className="flex min-h-[76px] items-center justify-between gap-5">

            <Logo />

            <div className="hidden flex-1 justify-center lg:flex">
              <div className="flex items-center gap-3 border-l border-slate-200 pl-8">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
                  <Activity className="h-4 w-4 text-teal-600" />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700">
                    Alternative Credit Intelligence
                  </div>

                  <div className="mt-0.5 text-[10px] text-slate-400">
                    Turning real-world signals into
                    lender-ready evidence
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
  <HeaderStatus />

  <HowItWorks />

  <UserBadge />

  <Button
    variant="outline"
    size="sm"
    onClick={logout}
    className="rounded-full border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
  >
    Logout
  </Button>
</div>
          </div>

          {/* Workflow */}
          <div className="border-t border-slate-200/60 py-3">
            <Stepper
              current={step}
              maxReached={maxReached}
              onChange={go}
            />
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* MAIN                                                   */}
      {/* ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">

        {/* Page context */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`headline-${step}`}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -5,
            }}
            transition={{
              duration: 0.2,
            }}
            className="mb-7"
          >
            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-teal-700">
                Step{" "}
                {String(step).padStart(2, "0")}{" "}
                of 05
              </span>

              <span className="hidden text-slate-300 sm:inline">
                /
              </span>

              <span className="hidden items-center gap-1 text-[10px] font-semibold text-slate-400 sm:flex">
                <LockKeyhole className="h-3 w-3" />
                Secure scoring workflow
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {h.title}
            </h1>

            <p className="mt-1 max-w-3xl text-sm text-slate-500 sm:text-base">
              {h.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            aria-live="polite"
          >

            {/* STEP 1 */}
            {step === 1 && (
              <StepApplicant
                applicant={applicant}
                onChange={updateApplicant}
                onNext={() => go(2)}
              />
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <StepAltData
                applicant={applicant}
                signals={signals}
                personaId={personaId}
                onSignals={updateSignals}
                onPersona={loadPersona}
                onBack={() => go(1)}
                onNext={calculateBackendScore}
              />
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <StepScore
                applicant={applicant}
                signals={signals}
                result={result}
                backendAssessment={
                  backendAssessment
                }
                lang={lang}
                onLang={setLang}
                onBack={() => go(2)}
                onNext={() => go(4)}
              />
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <StepLender
  applicant={applicant}
  result={result}
  backendAssessment={backendAssessment}
  view={view}
  onView={setView}
  onBack={() => go(3)}
  onNext={() => go(5)}
/>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <StepOutputs
                applicant={applicant}
                signals={signals}
                result={result}
                requestId={requestId}
                issuedAt={
                  issuedAt ||
                  new Date().toISOString()
                }
                photo={photo}
                onBack={() => go(4)}
                onRestart={restart}
              />
            )}

          </motion.section>
        </AnimatePresence>
      </main>

      {/* ===================================================== */}
      {/* FOOTER                                                 */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* Footer brand */}
            <div className="flex items-center gap-3">

              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-sm">
                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={2.5}
                />

                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <div>
                <div className="text-sm font-bold tracking-tight text-slate-900">
                  BharatScore AI
                </div>

                <div className="mt-0.5 text-[10px] text-slate-400">
                  Alternative Credit Intelligence
                </div>
              </div>
            </div>

            {/* Product status */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-slate-500">

              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                <span>
                  Scoring Engine Online
                </span>
              </div>

              <span className="hidden h-3 w-px bg-slate-200 sm:block" />

              <span>
                Model {MODEL_VERSION}
              </span>

              <span className="hidden h-3 w-px bg-slate-200 sm:block" />

              <span>
                Demo Environment
              </span>
            </div>

            {/* Security card */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-700">
                  Secure Scoring
                </div>

                <div className="text-[9px] text-slate-400">
                  Privacy-first processing
                </div>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-[9px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <span>
              © 2026 BharatScore AI · Credit intelligence infrastructure
            </span>

            <div className="flex items-center gap-3">
              <span>
                Not a lender
              </span>

              <span>•</span>

              <span>
                Indicative decisions only
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}