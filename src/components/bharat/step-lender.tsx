"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CircleX,
  Gauge,
  HeartHandshake,
  IndianRupee,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
  DECISION_LABEL,
  type Applicant,
  type Decision,
  type ScoreResult,
} from "@/lib/scoring";

import { cn, inr } from "@/lib/utils";
import { BAND_BADGE } from "./step-score";

/* ========================================================= */
/* TYPES                                                       */
/* ========================================================= */

type View = "applicant" | "lender";

type BackendAssessment = {
  id: number;
  applicantId: number;
  creditScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation:
    | "APPROVE"
    | "APPROVE_WITH_CONDITIONS"
    | "REJECT_WITH_ROADMAP"
    | string;
  limitInr: number;
  tenureMonths: number;
  confidence: number;
  factorsJson?: string;
  modelVersion: string;
  generatedAt: string;
};

interface Props {
  applicant: Applicant;
  result: ScoreResult;
  backendAssessment: BackendAssessment | null;
  view: View;
  onView: (v: View) => void;
  onBack: () => void;
  onNext: () => void;
}

/* ========================================================= */
/* DECISION STYLES                                             */
/* ========================================================= */

const DECISION_STYLE: Record<Decision, string> = {
  APPROVE:
    "bg-emerald-100 text-emerald-700 ring-emerald-200",

  APPROVE_WITH_CONDITIONS:
    "bg-teal-100 text-teal-700 ring-teal-200",

  MANUAL_REVIEW:
    "bg-amber-100 text-amber-800 ring-amber-200",

  DECLINE:
    "bg-rose-100 text-rose-700 ring-rose-200",
};

const DECISION_ICON: Record<Decision, typeof ShieldCheck> = {
  APPROVE: CheckCircle2,
  APPROVE_WITH_CONDITIONS: ShieldCheck,
  MANUAL_REVIEW: Gauge,
  DECLINE: CircleX,
};

const APPLICANT_HEADLINE: Record<Decision, string> = {
  APPROVE:
    "You're eligible — your record speaks for itself.",

  APPROVE_WITH_CONDITIONS:
    "You're eligible for a starter loan.",

  MANUAL_REVIEW:
    "You're visible now — a lender can start small with you.",

  DECLINE:
    "You're on the map. A few steps unlock approval.",
};

/* ========================================================= */
/* ANIMATION                                                   */
/* ========================================================= */

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/* ========================================================= */
/* HELPERS                                                     */
/* ========================================================= */

function mapBackendDecision(
  recommendation: string,
): Decision {
  switch (recommendation) {
    case "APPROVE":
      return "APPROVE";

    case "APPROVE_WITH_CONDITIONS":
      return "APPROVE_WITH_CONDITIONS";

    case "REJECT_WITH_ROADMAP":
      return "DECLINE";

    default:
      return "MANUAL_REVIEW";
  }
}

function backendDecisionLabel(
  recommendation: string,
): string {
  switch (recommendation) {
    case "APPROVE":
      return "Approved";

    case "APPROVE_WITH_CONDITIONS":
      return "Approve with Conditions";

    case "REJECT_WITH_ROADMAP":
      return "Reject with Roadmap";

    default:
      return recommendation || "Pending";
  }
}

function riskLabel(
  riskLevel: BackendAssessment["riskLevel"],
) {
  switch (riskLevel) {
    case "LOW":
      return "Low Risk";

    case "MEDIUM":
      return "Medium Risk";

    case "HIGH":
      return "High Risk";

    default:
      return riskLevel;
  }
}

/* ========================================================= */
/* MAIN COMPONENT                                              */
/* ========================================================= */

export function StepLender({
  applicant,
  result,
  backendAssessment,
  view,
  onView,
  onBack,
  onNext,
}: Props) {
  /*
   * Backend assessment is the source of truth.
   * Frontend result is only used as fallback.
   */

  const hasBackendAssessment =
    Boolean(backendAssessment);

  const decision: Decision =
    hasBackendAssessment
      ? mapBackendDecision(
          backendAssessment!.recommendation,
        )
      : result.recommendation.decision;

  const DecisionIcon =
    DECISION_ICON[decision];

  const first =
    applicant.name.split(" ")[0] ||
    "Applicant";

  /* ======================================================= */
  /* BACKEND VALUES                                           */
  /* ======================================================= */

  const score =
    backendAssessment?.creditScore ??
    result.score;

  const confidence =
    backendAssessment
      ? Math.round(
          backendAssessment.confidence <= 1
            ? backendAssessment.confidence * 100
            : backendAssessment.confidence,
        )
      : result.confidence;

  const riskLevel =
    backendAssessment?.riskLevel ??
    null;

  const recommendation =
    backendAssessment
      ? backendDecisionLabel(
          backendAssessment.recommendation,
        )
      : DECISION_LABEL[decision];

  const loanLimit =
    backendAssessment?.limitInr ??
    result.recommendation.limitMax;

  const tenureMonths =
    backendAssessment?.tenureMonths ??
    result.recommendation.tenureMonths;

  const scoreBand =
    backendAssessment
      ? backendAssessment.riskLevel === "LOW"
        ? "Excellent"
        : backendAssessment.riskLevel === "MEDIUM"
          ? "Good"
          : "Needs Improvement"
      : result.band;

  /* ======================================================= */
  /* DISPLAY VALUES                                           */
  /* ======================================================= */

  const limitText =
    loanLimit > 0
      ? inr(loanLimit)
      : "No credit limit";

  const tenureText =
    tenureMonths > 0
      ? `${tenureMonths} months`
      : "No tenure";

  const scorePercent = Math.max(
    0,
    Math.min(
      100,
      ((score - 300) / 600) * 100,
    ),
  );

  /*
   * These factor cards remain based on the existing
   * frontend factor presentation.
   *
   * The actual lending decision itself comes from
   * backendAssessment.
   */
  const topFactors = [
    ...result.factors,
  ]
    .sort(
      (a, b) =>
        b.points - a.points,
    )
    .slice(0, 3);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* ===================================================== */}
      {/* HEADER                                                  */}
      {/* ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="space-y-4"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Briefcase className="h-4 w-4" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Credit Decision
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Step 4 of 5
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              One applicant.{" "}
              <span className="text-indigo-600">
                Two ways to see credit.
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Compare what traditional credit infrastructure sees with what
              BharatScore AI can surface from consented alternative signals.
            </p>
          </div>

          {/* Audience switch */}
          <div
            role="radiogroup"
            aria-label="Audience view"
            className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
          >
            {(
              [
                {
                  id: "applicant",
                  label: "Applicant",
                  icon: UserRound,
                },
                {
                  id: "lender",
                  label: "Lender",
                  icon: Briefcase,
                },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={
                  view === option.id
                }
                onClick={() =>
                  onView(option.id)
                }
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  view === option.id
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {view === option.id && (
                  <motion.span
                    layoutId="view-pill"
                    className="absolute inset-0 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20"
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  />
                )}

                <option.icon
                  className="relative z-10 h-4 w-4"
                  aria-hidden="true"
                />

                <span className="relative z-10">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applicant identity */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRound className="h-4 w-4" />
          </div>

          <div className="mr-auto">
            <p className="text-sm font-bold text-slate-900">
              {applicant.name ||
                "Applicant"}
            </p>

            <p className="text-xs text-slate-500">
              {applicant.occupation ||
                "Applicant"}{" "}
              ·{" "}
              {applicant.city ||
                "India"}
            </p>
          </div>

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            Consent-based assessment
          </div>

          <Badge variant="slate">
            BharatScore AI
          </Badge>
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* MAIN COMPARISON                                        */}
      {/* ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"
      >
        {/* =================================================== */}
        {/* TRADITIONAL BUREAU                                   */}
        {/* =================================================== */}

        <motion.div whileHover={{ y: -3 }}>
          <Card className="relative h-full overflow-hidden border-slate-200 bg-white shadow-sm">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/70 via-transparent to-slate-50"
              aria-hidden="true"
            />

            <CardContent className="relative flex h-full flex-col p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Traditional Credit
                  </p>

                  <h2 className="mt-1 text-lg font-black text-slate-800">
                    Bureau view
                  </h2>
                </div>

                <Badge variant="slate">
                  CIBIL / Bureau
                </Badge>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2,
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-full bg-slate-200/60 blur-2xl" />

                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-inner">
                    <CircleX
                      className="h-14 w-14"
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>

                <h3 className="mt-6 text-xl font-black text-slate-700">
                  No credit history found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Score{" "}
                  <span className="font-mono font-bold text-slate-700">
                    NH / -1
                  </span>{" "}
                  · Thin file
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
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
                      y: -8,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="mt-6 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-500">
                      {view ===
                      "lender"
                        ? "No loans, no credit card and no bureau record. A conventional policy may classify this applicant as a thin file."
                        : `"Sorry, we can't find you in the system." — ${first} may be turned away despite having years of real financial activity.`}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 1.4,
                  rotate: -18,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: -6,
                }}
                transition={{
                  delay: 0.4,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="mx-auto rounded-2xl border-2 border-rose-300 bg-rose-50 px-7 py-3 text-center shadow-sm"
              >
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-400">
                  Conventional outcome
                </div>

                <div className="mt-0.5 text-2xl font-black tracking-[0.18em] text-rose-600">
                  REJECT
                </div>
              </motion.div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <CircleX className="h-3.5 w-3.5" />
                Limited visibility
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* =================================================== */}
        {/* BHARATSCORE                                           */}
        {/* =================================================== */}

        <motion.div whileHover={{ y: -3 }}>
          <Card className="relative h-full overflow-hidden border-0 bg-[#17143D] text-white shadow-2xl shadow-indigo-900/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div
              className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
              aria-hidden="true"
            />

            <CardContent className="relative p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                      <Sparkles className="h-4 w-4 text-teal-300" />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-200">
                        BharatScore AI
                      </p>

                      <p className="text-sm font-bold text-white">
                        Alternative credit intelligence
                      </p>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    BAND_BADGE[
                      scoreBand as keyof typeof BAND_BADGE
                    ] ??
                    "slate"
                  }
                >
                  {scoreBand}
                </Badge>
              </div>

              {/* Score */}
              <div className="mt-7 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex items-end gap-3">
                    <motion.span
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: 0.15,
                      }}
                      className="tabular text-7xl font-black leading-none tracking-tight sm:text-8xl"
                    >
                      {score}
                    </motion.span>

                    <span className="mb-2 text-sm font-medium text-indigo-300">
                      / 900
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={view}
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
                        y: -8,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="mt-3 max-w-xl text-sm leading-6 text-indigo-100"
                    >
                      {view ===
                      "lender"
                        ? "A consented alternative-data score built from real financial behaviour."
                        : APPLICANT_HEADLINE[
                            decision
                          ]}
                    </motion.p>
                  </AnimatePresence>

                  {/* Decision */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.94,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.35,
                      duration: 0.3,
                    }}
                    className={cn(
                      "mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black shadow-lg ring-1",
                      DECISION_STYLE[
                        decision
                      ],
                    )}
                  >
                    <DecisionIcon className="h-4 w-4" />

                    {view === "lender"
                      ? recommendation
                      : recommendation}
                  </motion.div>

                  {/* Risk */}
                  {riskLevel && (
                    <div className="mt-3 text-xs font-semibold text-indigo-200">
                      Backend risk level:{" "}
                      <span className="font-black text-white">
                        {riskLabel(
                          riskLevel,
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gauge */}
                <div className="hidden md:block">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{
                        background: `conic-gradient(
                          #2DD4BF ${scorePercent}%,
                          rgba(255,255,255,0.08) 0
                        )`,
                        WebkitMask:
                          "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",
                        mask:
                          "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",
                      }}
                    />

                    <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#17143D]">
                      <TrendingUp className="mb-1 h-4 w-4 text-teal-300" />

                      <span className="text-xs font-bold text-white">
                        {Math.round(
                          scorePercent,
                        )}
                        %
                      </span>

                      <span className="text-[9px] uppercase tracking-wider text-indigo-300">
                        score range
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* CREDIT OFFER                                      */}
              {/* ================================================= */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <motion.div
                  whileHover={{
                    y: -2,
                  }}
                  className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/15">
                      <IndianRupee className="h-3.5 w-3.5 text-teal-300" />
                    </div>

                    {view ===
                    "lender"
                      ? "Suggested credit limit"
                      : "You can borrow"}
                  </div>

                  <p className="tabular mt-3 text-2xl font-black text-white">
                    {limitText}
                  </p>

                  {loanLimit > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-300">
                      <ShieldCheck className="h-3 w-3" />
                      Backend assessment limit
                    </div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{
                    y: -2,
                  }}
                  className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-400/15">
                      <CalendarClock className="h-3.5 w-3.5 text-indigo-200" />
                    </div>

                    Recommended tenure
                  </div>

                  <p className="tabular mt-3 text-2xl font-black text-white">
                    {tenureText}
                  </p>

                  <p className="mt-1 text-[11px] text-indigo-300">
                    Based on current assessment
                  </p>
                </motion.div>
              </div>

              {/* ================================================= */}
              {/* CONFIDENCE                                        */}
              {/* ================================================= */}

              {view ===
              "lender" ? (
                <div className="mt-5 rounded-2xl bg-black/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                      <Gauge className="h-4 w-4 text-teal-300" />

                      Model confidence
                    </div>

                    <span className="tabular text-lg font-black text-white">
                      {confidence}%
                    </span>
                  </div>

                  <Progress
                    value={confidence}
                    aria-label="Model confidence"
                    className="mt-3 h-2 bg-white/10"
                    indicatorClassName="bg-gradient-to-r from-teal-400 to-emerald-300"
                  />

                  <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-300">
                    <span>
                      Requested{" "}
                      {inr(
                        applicant.loanAmount,
                      )}
                    </span>

                    <span>
                      {applicant.purpose
                        ? applicant.purpose.toLowerCase()
                        : "credit"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />

                  <p className="text-sm leading-6 text-indigo-50">
                    {result
                      .recommendation
                      .tips.length
                      ? `Next step: ${result.recommendation.tips[0]}`
                      : `Every on-time repayment can strengthen ${first}'s formal credit journey.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ===================================================== */}
      {/* LENDER INTELLIGENCE                                   */}
      {/* ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Applicant profile */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Applicant profile
                </p>

                <p className="font-bold text-slate-900">
                  {applicant.name ||
                    "Applicant"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-xs text-slate-500">
                  Occupation
                </span>

                <span className="text-xs font-bold text-slate-800">
                  {applicant.occupation ||
                    "—"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-xs text-slate-500">
                  Location
                </span>

                <span className="text-xs font-bold text-slate-800">
                  {applicant.city ||
                    "—"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-xs text-slate-500">
                  Loan purpose
                </span>

                <span className="max-w-[150px] truncate text-xs font-bold text-slate-800">
                  {applicant.purpose ||
                    "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top signals */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Zap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Signal intelligence
                </p>

                <p className="font-bold text-slate-900">
                  Top contributing factors
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {topFactors.map(
                (factor, index) => {
                  const percentage =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        factor.value *
                          100,
                      ),
                    );

                  return (
                    <div
                      key={
                        factor.key
                      }
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[9px] font-black text-slate-500">
                            {index + 1}
                          </span>

                          <span className="truncate text-xs font-semibold text-slate-700">
                            {factor.label}
                          </span>
                        </div>

                        <span className="tabular text-xs font-black text-slate-900">
                          {Math.round(
                            percentage,
                          )}
                          %
                        </span>
                      </div>

                      <Progress
                        value={
                          percentage
                        }
                        className="h-1.5 bg-slate-100"
                        indicatorClassName="bg-gradient-to-r from-indigo-500 to-teal-400"
                      />
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>

        {/* Decision framework */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Decision framework
                </p>

                <p className="font-bold text-slate-900">
                  Recommended action
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-5 rounded-2xl p-4 ring-1",
                DECISION_STYLE[
                  decision
                ],
              )}
            >
              <div className="flex items-center gap-2">
                <DecisionIcon className="h-5 w-5" />

                <span className="text-sm font-black">
                  {recommendation}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 opacity-80">
                {backendAssessment
                  ? `Backend risk level: ${riskLabel(
                      backendAssessment.riskLevel,
                    )}.`
                  : result
                      .recommendation
                      .label}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />

              Final lending decision remains with the institution.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===================================================== */}
      {/* TRUST FOOTER                                          */}
      {/* ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-teal-50 p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">
              Consent-based credit intelligence
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              BharatScore AI uses alternative signals to improve visibility
              for applicants with limited traditional credit history.
              The score supports lender decisioning; it does not replace
              institutional credit policy.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Users className="h-4 w-4 text-teal-600" />
            Fairer visibility
          </div>
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* NAVIGATION                                             */}
      {/* ===================================================== */}

      <motion.div
        variants={fadeUp}
        className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to score
        </Button>

        <Button
          size="lg"
          onClick={onNext}
          className="group bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
        >
          API & Credit Passport

          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </motion.div>
  );
}