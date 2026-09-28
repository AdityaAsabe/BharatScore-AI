"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Info,
  Languages,
  Lock,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BAND_HI,
  BAND_MR,
  FACTOR_META,
  MODEL_VERSION,
  WEIGHTS,
  explain,
  type Applicant,
  type Band,
  type FactorKey,
  type FactorResult,
  type ScoreResult,
  type Signals,
} from "@/lib/scoring";

import { apiFetch } from "@/utils/api";
import { cn } from "@/lib/utils";
import { FactorChart, factorColor } from "./factor-chart";

/* =========================================================
   TYPES
========================================================= */

interface BackendAssessment {
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
}

interface BackendExplanation {
  assessmentId: number;
  language: string;
  summary: string;
  factors: string[];
  recommendation: string;
}

interface Props {
  applicant: Applicant;
  signals: Signals;
  result: ScoreResult;
  backendAssessment: BackendAssessment | null;
  lang: "en" | "hi" | "mr";
  onLang: (l: "en" | "hi" | "mr") => void;
  onBack: () => void;
  onNext: () => void;
}

/* =========================================================
   BAND BADGE
========================================================= */

export const BAND_BADGE: Record<
  Band,
  "green" | "teal" | "amber" | "rose"
> = {
  Excellent: "green",
  Good: "teal",
  Fair: "amber",
  "Needs Improvement": "rose",
};

/* =========================================================
   LANGUAGE TOGGLE
========================================================= */

export function LangToggle({
  lang,
  onLang,
}: {
  lang: "en" | "hi" | "mr";
  onLang: (l: "en" | "hi" | "mr") => void;
}) {
  return (
    <div
      role="group"
      aria-label="Explanation language"
      className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm"
    >
      <Languages
        className="mx-1.5 h-4 w-4 text-slate-400"
        aria-hidden="true"
      />

      {(["en", "hi", "mr"] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={lang === language}
          onClick={() => onLang(language)}
          className={cn(
            "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            lang === language
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
          )}
        >
          {language === "en" && "EN"}
          {language === "hi" && "हिंदी"}
          {language === "mr" && "मराठी"}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   ANIMATION HELPERS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function recommendationLabel(
  recommendation: string,
  lang: "en" | "hi" | "mr",
){
  if (lang === "hi") {
    switch (recommendation) {
      case "APPROVE":
        return "ऋण स्वीकृत";
      case "APPROVE_WITH_CONDITIONS":
        return "शर्तों के साथ स्वीकृत";
      case "REJECT_WITH_ROADMAP":
        return "अस्वीकृत — सुधार योजना";
      default:
        return recommendation;
    }
  }

  if (lang === "mr") {
    switch (recommendation) {
      case "APPROVE":
        return "कर्ज मंजूर";
      case "APPROVE_WITH_CONDITIONS":
        return "अटींसह मंजूर";
      case "REJECT_WITH_ROADMAP":
        return "नामंजूर — सुधार योजना";
      default:
        return recommendation;
    }
  }

  switch (recommendation) {
    case "APPROVE":
      return "Approved";

    case "APPROVE_WITH_CONDITIONS":
      return "Approve with Conditions";

    case "REJECT_WITH_ROADMAP":
      return "Reject with Roadmap";

    default:
      return recommendation;
  }
}

function parseBackendFactors(
  factorsJson?: string,
): FactorResult[] {
  if (!factorsJson) {
    return [];
  }

  try {
    const raw = JSON.parse(factorsJson) as Record<
      string,
      number
    >;

    const factorKeys = Object.keys(
      WEIGHTS,
    ) as FactorKey[];

    return factorKeys.map((key) => {
      const rawValue = Number(raw[key] ?? 0);

      const value = Math.max(
        0,
        Math.min(100, rawValue),
      ) / 100;

      return {
        key,
        label: FACTOR_META[key].label,
        labelHi: FACTOR_META[key].labelHi,
        labelMr: FACTOR_META[key].labelMr,
        weight: WEIGHTS[key],
        value,
        points: Math.round(
          600 * WEIGHTS[key] * value,
        ),
        maxPoints: Math.round(
          600 * WEIGHTS[key],
        ),
      };
    });
  } catch (error) {
    console.error(
      "Failed to parse backend factors:",
      error,
    );

    return [];
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function StepScore({
  applicant,
  signals,
  result,
  backendAssessment,
  lang,
  onLang,
  onBack,
  onNext,
}: Props) {
  const [backendExplanation, setBackendExplanation] =
    useState<BackendExplanation | null>(null);

  const [backendLoading, setBackendLoading] = useState(false);

  const [backendError, setBackendError] =
    useState<string | null>(null);

  /* =========================================================
     LOAD BACKEND EXPLANATION
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadExplanation = async () => {
      if (!backendAssessment?.id) {
        setBackendExplanation(null);
        setBackendError(null);
        return;
      }

      try {
        setBackendLoading(true);
        setBackendError(null);

        const explanation = await apiFetch(
          `/api/assessments/${backendAssessment.id}/explanation?lang=${lang}`,
        );

        if (!cancelled) {
          setBackendExplanation(
            explanation as BackendExplanation,
          );
        }
      } catch (error) {
        console.error(
          "Backend explanation error:",
          error,
        );

        if (!cancelled) {
          setBackendExplanation(null);

          if (error instanceof Error) {
            try {
              const parsedError = JSON.parse(
                error.message,
              );

              setBackendError(
                parsedError.message ||
                  parsedError.error ||
                  "Failed to load score explanation.",
              );
            } catch {
              setBackendError(
                error.message ||
                  "Failed to load score explanation.",
              );
            }
          } else {
            setBackendError(
              "Failed to load score explanation.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setBackendLoading(false);
        }
      }
    };

    loadExplanation();

    return () => {
      cancelled = true;
    };
  }, [backendAssessment?.id, lang]);

  /* =========================================================
     BACKEND -> FRONTEND RESULT
     
     Backend is the source of truth for:
     score
     risk
     confidence
  ========================================================= */

  const backendFactors =
  backendAssessment
    ? parseBackendFactors(
        backendAssessment.factorsJson,
      )
    : [];

const displayResult: ScoreResult =
  backendAssessment
    ? {
        ...result,

        score:
          backendAssessment.creditScore,

        band:
          backendAssessment.riskLevel === "LOW"
            ? "Excellent"
            : backendAssessment.riskLevel === "MEDIUM"
              ? "Good"
              : "Needs Improvement",

        confidence:
          backendAssessment.confidence,

        factors:
          backendFactors.length > 0
            ? backendFactors
            : result.factors,
      }
    : result;

  /* =========================================================
     EXPLANATION
  ========================================================= */

  const lines = backendExplanation
    ? [
        backendExplanation.summary,
        ...backendExplanation.factors,
        backendExplanation.recommendation,
      ]
    : explain(
        displayResult,
        signals,
        applicant.name,
        lang,
      );

  /* =========================================================
     TOP FACTORS
  ========================================================= */

  const top3 = [...displayResult.factors]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  /* =========================================================
     SCORE CALCULATIONS
  ========================================================= */

  const scorePercent = Math.max(
    0,
    Math.min(
      100,
      ((displayResult.score - 300) / 600) * 100,
    ),
  );

  const scoreGain = displayResult.score - 300;

  const bandLabel =
    lang === "mr"
      ? BAND_MR[displayResult.band]
      : lang === "hi"
        ? BAND_HI[displayResult.band]
        : displayResult.band;

  const strongestFactor = top3[0];

  const strongestFactorLabel = strongestFactor
    ? lang === "hi"
      ? strongestFactor.labelHi
      : lang === "mr"
        ? strongestFactor.labelMr
        : strongestFactor.label
    : "";

  /* =========================================================
     BACKEND DECISION VALUES
  ========================================================= */

  const recommendation = backendAssessment
    ? recommendationLabel(
        backendAssessment.recommendation,
        lang,
      )
    : displayResult.recommendation?.label ??
      "Decision pending";

  const loanLimit = backendAssessment
    ? formatCurrency(backendAssessment.limitInr)
    : "—";

  const tenure = backendAssessment
    ? backendAssessment.tenureMonths > 0
      ? `${backendAssessment.tenureMonths} ${
          lang === "hi"
            ? "महीने"
            : lang === "mr"
              ? "महिने"
              : backendAssessment.tenureMonths === 1
                ? "month"
                : "months"
        }`
      : lang === "hi"
        ? "लागू नहीं"
        : lang === "mr"
          ? "लागू नाही"
          : "Not applicable"
    : "—";

  return (
    <div className="space-y-6 pb-8">
      {/* =====================================================
          BACKEND STATUS
      ===================================================== */}

      {backendLoading && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
          Loading your BharatScore explanation from
          the backend...
        </div>
      )}

      {backendError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Backend explanation error:{" "}
          {backendError}
        </div>
      )}

      {/* =====================================================
          STEP HEADER
      ===================================================== */}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/60 via-white to-teal-50/50" />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700"
              >
                <Sparkles className="h-3 w-3" />
                BharatScore AI
              </motion.span>

              <span className="text-[11px] font-medium text-slate-400">
                Model{" "}
                {backendAssessment?.modelVersion ??
                  MODEL_VERSION}
              </span>
            </div>

            <motion.h2
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.05,
              }}
              className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
            >
              {lang === "mr"
                ? "तुमचा BharatScore"
                : lang === "hi"
                  ? "आपका BharatScore"
                  : "Your BharatScore"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.12,
              }}
              className="mt-1.5 max-w-2xl text-sm text-slate-500"
            >
              {lang === "mr"
                ? "पर्यायी आर्थिक डेटावर आधारित पारदर्शक क्रेडिट इंटेलिजन्स."
                : lang === "hi"
                  ? "वैकल्पिक वित्तीय डेटा पर आधारित पारदर्शी क्रेडिट इंटेलिजेंस."
                  : "Transparent credit intelligence powered by alternative financial signals."}
            </motion.p>
          </div>

          <LangToggle
            lang={lang}
            onLang={onLang}
          />
        </div>
      </motion.div>

      {/* =====================================================
          MAIN DASHBOARD GRID
      ===================================================== */}

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(370px,0.88fr)_minmax(0,1.12fr)]">
        {/* ===================================================
            PREMIUM SCORE CARD
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.08,
          }}
          className="h-full"
        >
          <Card className="relative h-full overflow-hidden border-0 bg-[#17143D] text-white shadow-[0_25px_70px_rgba(30,27,75,0.28)]">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.22, 0.3, 0.22],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"
            />

            <motion.div
              animate={{
                scale: [1.05, 1, 1.05],
                opacity: [0.12, 0.2, 0.12],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <CardContent className="relative p-6 sm:p-8">
              {/* ==========================================
                  SCORE HEADER
              ========================================== */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                      {lang === "mr"
                        ? "क्रेडिट इंटेलिजन्स"
                        : lang === "hi"
                          ? "क्रेडिट इंटेलिजेंस"
                          : "Credit Intelligence"}
                    </p>
                  </div>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    {lang === "mr"
                      ? "क्रेडिट तयारी प्रोफाइल"
                      : lang === "hi"
                        ? "क्रेडिट तैयारी प्रोफाइल"
                        : "Credit readiness profile"}
                  </h3>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-indigo-100 backdrop-blur">
                  300 — 900
                </div>
              </div>

              {/* ==========================================
                  SCORE CIRCLE
              ========================================== */}

              <div className="mt-9 flex flex-col items-center">
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.78,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.18,
                    ease: "easeOut",
                  }}
                  className="relative flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64"
                >
                  <motion.div
                    animate={{
                      opacity: [0.12, 0.25, 0.12],
                      scale: [0.98, 1.02, 0.98],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-teal-400/10 blur-2xl"
                  />

                  <div className="absolute inset-0 rounded-full border-[10px] border-white/[0.07]" />

                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.25,
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        #14B8A6 ${scorePercent}%,
                        rgba(255,255,255,0.08) 0
                      )`,
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 0)",
                      mask:
                        "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 0)",
                    }}
                  />

                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full border border-white/5 bg-[#111033] shadow-[inset_0_0_35px_rgba(0,0,0,0.3)]">
                    <motion.span
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: 0.35,
                      }}
                      className="text-5xl font-black tracking-tight text-white sm:text-6xl"
                    >
                      {displayResult.score}
                    </motion.span>

                    <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      BharatScore
                    </span>

                    <div className="mt-3 h-0.5 w-[42px] rounded-full bg-teal-400" />
                  </div>
                </motion.div>

                {/* RISK BAND */}

                <div className="mt-6">
                  <div className="flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-400/10 px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />

                    <span className="text-xs font-black text-teal-200">
                      {bandLabel}
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-sm text-center text-sm leading-6 text-slate-300">
                  {lang === "mr"
                    ? "पर्यायी आर्थिक संकेतांवर आधारित क्रेडिट प्रोफाइल."
                    : lang === "hi"
                      ? "वैकल्पिक वित्तीय संकेतों पर आधारित क्रेडिट प्रोफाइल."
                      : "Credit profile generated from alternative financial signals."}
                </p>
              </div>

              {/* ==========================================
                  SCORE SCALE
              ========================================== */}

              <div className="mt-9">
                <div className="mb-2 flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>300</span>
                  <span>450</span>
                  <span>600</span>
                  <span>750</span>
                  <span>900</span>
                </div>

                <div className="relative">
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${scorePercent}%`,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5,
                        ease: "easeOut",
                      }}
                      className="relative h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300"
                    />
                  </div>

                  <motion.div
                    initial={{
                      left: 0,
                      opacity: 0,
                    }}
                    animate={{
                      left: `${scorePercent}%`,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.8,
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-300 shadow-[0_0_14px_rgba(45,212,191,0.95)]"
                  />
                </div>

                {/* IMPORTANT: ranges now match backend */}

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="mt-5 grid grid-cols-3 gap-2 text-center"
                >
                  {[
                    {
                      label:
                        lang === "mr"
                          ? "सुधारणा आवश्यक"
                          : lang === "hi"
                            ? "सुधार आवश्यक"
                            : "Needs Improvement",
                      range: "<600",
                      className: "text-rose-300",
                    },
                    {
                      label:
                        lang === "mr"
                          ? "चांगले"
                          : lang === "hi"
                            ? "अच्छा"
                            : "Good",
                      range: "600–749",
                      className: "text-teal-300",
                    },
                    {
                      label:
                        lang === "mr"
                          ? "उत्कृष्ट"
                          : lang === "hi"
                            ? "उत्कृष्ट"
                            : "Excellent",
                      range: "750+",
                      className: "text-emerald-300",
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.range}
                      variants={fadeUp}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <p
                        className={cn(
                          "truncate text-[9px] font-bold",
                          item.className,
                        )}
                      >
                        {item.label}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-600">
                        {item.range}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* ==========================================
                  CONTRIBUTION + BAND
              ========================================== */}

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-teal-300" />

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {lang === "mr"
                        ? "योगदान"
                        : lang === "hi"
                          ? "योगदान"
                          : "Contribution"}
                    </span>
                  </div>

                  <p className="mt-2 text-lg font-black text-white">
                    +{scoreGain}
                  </p>

                  <p className="text-[9px] text-slate-500">
                    {lang === "mr"
                      ? "300 बेसवर"
                      : lang === "hi"
                        ? "300 बेस से"
                        : "above 300 base"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-300" />

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {lang === "mr"
                        ? "श्रेणी"
                        : lang === "hi"
                          ? "श्रेणी"
                          : "Risk"}
                    </span>
                  </div>

                  <p className="mt-2 truncate text-sm font-black text-white">
                    {backendAssessment?.riskLevel ??
                      bandLabel}
                  </p>

                  <p className="text-[9px] text-slate-500">
                    {lang === "mr"
                      ? "जोखीम पातळी"
                      : lang === "hi"
                        ? "जोखिम स्तर"
                        : "Risk level"}
                  </p>
                </div>
              </div>

              {/* ==========================================
                  BACKEND DECISION SUMMARY
                  
                  THIS IS THE IMPORTANT NEW SECTION
              ========================================== */}

              {backendAssessment && (
                <div className="mt-4 space-y-3">
                  {/* Recommendation */}

                  <div className="rounded-2xl border border-teal-300/15 bg-teal-400/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-teal-300" />

                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-teal-200">
                        {lang === "mr"
                          ? "कर्ज निर्णय"
                          : lang === "hi"
                            ? "ऋण निर्णय"
                            : "Lending decision"}
                      </p>
                    </div>

                    <p className="mt-2 text-lg font-black text-white">
                      {recommendation}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {backendAssessment.recommendation}
                    </p>
                  </div>

                  {/* Loan limit + tenure */}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
                      <div className="flex items-center gap-2">
                        <WalletCards className="h-4 w-4 text-teal-300" />

                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {lang === "mr"
                            ? "कर्ज मर्यादा"
                            : lang === "hi"
                              ? "ऋण सीमा"
                              : "Loan limit"}
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-black text-white">
                        {loanLimit}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        {lang === "mr"
                          ? "शिफारस केलेली मर्यादा"
                          : lang === "hi"
                            ? "अनुशंसित सीमा"
                            : "Recommended limit"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-indigo-300" />

                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {lang === "mr"
                            ? "कालावधी"
                            : lang === "hi"
                              ? "अवधि"
                              : "Tenure"}
                        </span>
                      </div>

                      <p className="mt-2 text-lg font-black text-white">
                        {tenure}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        {lang === "mr"
                          ? "शिफारस केलेला कालावधी"
                          : lang === "hi"
                            ? "अनुशंसित अवधि"
                            : "Recommended tenure"}
                      </p>
                    </div>
                  </div>

                  {/* Confidence */}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Confidence
                      </p>

                      <p className="mt-1 text-sm font-black text-white">
                        {Math.round(
  backendAssessment.confidence <= 1
    ? backendAssessment.confidence * 100
    : backendAssessment.confidence,
)}
%
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Risk level
                      </p>

                      <p className="mt-1 text-sm font-black text-white">
                        {backendAssessment.riskLevel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />

                {lang === "mr"
                  ? "संमती-आधारित पर्यायी डेटा"
                  : lang === "hi"
                    ? "सहमति-आधारित वैकल्पिक डेटा"
                    : "Consent-based alternative data"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===================================================
            FACTOR ANALYSIS
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.16,
          }}
          className="h-full"
        >
          <Card className="flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white pb-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-100/40 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <motion.div
                      whileHover={{
                        rotate: 5,
                        scale: 1.05,
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </motion.div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500">
                        {lang === "mr"
                          ? "सिग्नल विश्लेषण"
                          : lang === "hi"
                            ? "सिग्नल विश्लेषण"
                            : "Signal analysis"}
                      </p>

                      <CardTitle className="mt-0.5 text-base font-black text-slate-900">
                        {lang === "mr"
                          ? "या स्कोअरचे कारण"
                          : lang === "hi"
                            ? "इस स्कोर का कारण"
                            : "What earned this score"}
                      </CardTitle>
                    </div>
                  </div>

                  <CardDescription className="max-w-xl text-xs leading-5 text-slate-500">
                    {lang === "mr"
                      ? "प्रत्येक पर्यायी आर्थिक संकेताने स्कोअरमध्ये दिलेले योगदान."
                      : lang === "hi"
                        ? "हर वैकल्पिक वित्तीय संकेत ने स्कोर में कितना योगदान दिया."
                        : "See exactly how each alternative financial signal contributed to the score."}
                  </CardDescription>
                </div>

                <Badge
                  variant="slate"
                  className="shrink-0 border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"
                >
                  <TrendingUp className="mr-1 h-3.5 w-3.5" />
                  +{scoreGain} pts
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-5">
              {/* SCORE CONTRIBUTION */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: 0.35,
                }}
                className="relative mb-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-teal-50/50 p-4"
              >
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-600" />

                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-500">
                        {lang === "mr"
                          ? "स्कोअर योगदान"
                          : lang === "hi"
                            ? "स्कोर योगदान"
                            : "Score contribution"}
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      <span className="text-slate-500">
                        300
                      </span>

                      <span className="mx-2 text-slate-300">
                        +
                      </span>

                      <span className="font-black text-indigo-600">
                        {scoreGain}
                      </span>

                      <span className="ml-1.5 text-xs font-medium text-slate-500">
                        signal points
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tight text-indigo-700">
                      {displayResult.score}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      out of 900
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* FACTOR CHART */}

              <FactorChart
                factors={displayResult.factors}
                lang={lang}
              />

              {/* TOP FACTORS */}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {lang === "mr"
                        ? "मुख्य योगदान"
                        : lang === "hi"
                          ? "मुख्य योगदान"
                          : "Top contributors"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {lang === "mr"
                        ? "सर्वाधिक प्रभाव असलेले संकेत"
                        : lang === "hi"
                          ? "सबसे अधिक प्रभाव वाले संकेत"
                          : "Signals with the highest impact"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    View details
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {top3.map((factor, index) => {
                    const strength =
                      factor.value >= 0.7
                        ? lang === "mr"
                          ? "मजबूत"
                          : lang === "hi"
                            ? "मजबूत"
                            : "Strong"
                        : factor.value >= 0.45
                          ? lang === "mr"
                            ? "चांगले"
                            : lang === "hi"
                              ? "अच्छा"
                              : "Good"
                          : factor.value >= 0.25
                            ? lang === "mr"
                              ? "मध्यम"
                              : lang === "hi"
                                ? "मध्यम"
                                : "Moderate"
                            : lang === "mr"
                              ? "सुधारणा आवश्यक"
                              : lang === "hi"
                                ? "सुधार आवश्यक"
                                : "Needs improvement";

                    const label =
                      lang === "hi"
                        ? factor.labelHi
                        : lang === "mr"
                          ? factor.labelMr
                          : factor.label;

                    return (
                      <motion.div
                        key={factor.key}
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            0.65 + index * 0.1,
                          duration: 0.35,
                        }}
                        whileHover={{
                          y: -5,
                          scale: 1.015,
                        }}
                        className="group rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm"
                            style={{
                              backgroundColor:
                                factorColor(
                                  factor.value,
                                ),
                            }}
                          >
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-slate-900">
                              {label}
                            </p>

                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    factorColor(
                                      factor.value,
                                    ),
                                }}
                              />

                              <span
                                className="text-[10px] font-bold"
                                style={{
                                  color:
                                    factorColor(
                                      factor.value,
                                    ),
                                }}
                              >
                                {strength}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                · +{factor.points}
                              </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${Math.round(
                                    factor.value * 100,
                                  )}%`,
                                }}
                                transition={{
                                  delay:
                                    0.95 +
                                    index * 0.1,
                                  duration: 0.65,
                                  ease: "easeOut",
                                }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor:
                                    factorColor(
                                      factor.value,
                                    ),
                                }}
                              />
                            </div>

                            <p className="mt-2 text-[9px] font-medium text-slate-400">
                              {Math.round(
                                factor.value * 100,
                              )}
                              % signal strength
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* =====================================================
          EXPLANATION CARD
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.24,
        }}
      >
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-base font-black text-slate-900">
                    {lang === "en"
                      ? "Why this score?"
                      : lang === "hi"
                        ? "यह स्कोर क्यों?"
                        : "हा स्कोअर का?"}
                  </CardTitle>

                  <CardDescription className="mt-0.5 text-xs">
                    {lang === "en"
                      ? "A transparent explanation of the applicant's credit profile"
                      : lang === "hi"
                        ? "आवेदक की क्रेडिट प्रोफ़ाइल का पारदर्शी विवरण"
                        : "अर्जदाराच्या क्रेडिट प्रोफाइलचे पारदर्शक स्पष्टीकरण"}
                  </CardDescription>
                </div>
              </div>

              <LangToggle
                lang={lang}
                onLang={onLang}
              />
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${lang}-${displayResult.score}`}
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
              >
                <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/50 p-5">
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-600">
                        <Info className="h-4 w-4" />
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
                        {lang === "en"
                          ? "Score explanation"
                          : lang === "hi"
                            ? "स्कोर विवरण"
                            : "स्कोअर स्पष्टीकरण"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                      <div className="space-y-2">
                        <p className="text-lg font-bold leading-7 text-slate-900">
                          {lines[0]}
                        </p>

                        {lines
                          .slice(1)
                          .map((line, index) => (
                            <p
                              key={index}
                              className="text-sm leading-6 text-slate-600"
                            >
                              {line}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KEY INSIGHT */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: 0.1,
                  }}
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <BadgeCheck className="h-4 w-4 text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                        {lang === "en"
                          ? "Key insight"
                          : lang === "hi"
                            ? "मुख्य जानकारी"
                            : "मुख्य निरीक्षण"}
                      </p>

                      <Badge
                        variant="slate"
                        className="border-indigo-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-600"
                      >
                        {lang === "en"
                          ? "Decision signal"
                          : lang === "hi"
                            ? "निर्णय संकेत"
                            : "निर्णय संकेत"}
                      </Badge>
                    </div>

                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {strongestFactor
                        ? lang === "en"
                          ? `${strongestFactorLabel} is one of the strongest contributors to this score.`
                          : lang === "hi"
                            ? `${strongestFactorLabel} आपके स्कोर में सबसे मजबूत योगदानकर्ताओं में से एक है।`
                            : `${strongestFactorLabel} हा तुमच्या स्कोअरमधील प्रमुख योगदान देणाऱ्या घटकांपैकी एक आहे.`
                        : lang === "en"
                          ? "This score is calculated from the available alternative-data signals."
                          : lang === "hi"
                            ? "यह स्कोर उपलब्ध वैकल्पिक डेटा संकेतों के आधार पर तैयार किया गया है।"
                            : "हा स्कोअर उपलब्ध पर्यायी डेटा संकेतांच्या आधारे तयार करण्यात आला आहे."}
                    </p>
                  </div>
                </motion.div>

                {/* IMPROVEMENT TIPS */}

                {displayResult.recommendation.tips.length >
                  0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.18,
                    }}
                    className="mt-5 overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/50 p-5"
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
                        <TrendingUp className="h-5 w-5 text-teal-600" />
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {lang === "mr"
                            ? "तुमचा स्कोअर सुधारण्याचे मार्ग"
                            : lang === "hi"
                              ? "अपना स्कोर कैसे सुधारें"
                              : "Ways to grow your score"}
                        </h4>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {lang === "mr"
                            ? "या कृतींमुळे तुमची क्रेडिट प्रोफाइल अधिक मजबूत होऊ शकते."
                            : lang === "hi"
                              ? "इन आदतों से आपकी क्रेडिट प्रोफ़ाइल मजबूत हो सकती है."
                              : "These actions can help strengthen the applicant's financial profile."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(lang === "mr"
                        ? displayResult.recommendation
                            .tipsMr
                        : lang === "hi"
                          ? displayResult.recommendation
                              .tipsHi
                          : displayResult.recommendation
                              .tips
                      ).map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              0.2 + index * 0.08,
                            duration: 0.3,
                          }}
                          className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-black text-teal-700">
                            {index + 1}
                          </div>

                          <p className="pt-0.5 text-sm leading-relaxed text-slate-700">
                            {tip}
                          </p>

                          <CheckCircle2 className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* =====================================================
          FOOTER / TRUST + NAVIGATION
      ===================================================== */}

      <motion.div
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
          delay: 0.32,
        }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="justify-center text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Adjust data
          </Button>

          <motion.div
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Button
              size="lg"
              onClick={onNext}
              className="w-full justify-center bg-indigo-600 px-7 font-bold shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 sm:w-auto"
            >
              See lender decision
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Trust & transparency
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <motion.div
            whileHover={{
              backgroundColor:
                "rgba(248,250,252,0.8)",
            }}
            className="flex items-center gap-3 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <Lock className="h-4 w-4 text-teal-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                Consented data
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Applicant-authorized signals
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{
              backgroundColor:
                "rgba(248,250,252,0.8)",
            }}
            className="flex items-center gap-3 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <BadgeCheck className="h-4 w-4 text-indigo-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                Scoring model
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                BharatScore{" "}
                {backendAssessment?.modelVersion ??
                  MODEL_VERSION}
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{
              backgroundColor:
                "rgba(248,250,252,0.8)",
            }}
            className="flex items-center gap-3 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <WalletCards className="h-4 w-4 text-amber-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                No bureau history
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Alternative data based
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}