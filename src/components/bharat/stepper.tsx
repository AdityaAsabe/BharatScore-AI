"use client";

import { motion } from "framer-motion";

export const STEPS = [
  {
    id: 1,
    label: "Applicant",
    short: "Profile",
  },
  {
    id: 2,
    label: "Alt-Data",
    short: "Signals",
  },
  {
    id: 3,
    label: "BharatScore",
    short: "Score",
  },
  {
    id: 4,
    label: "Lender View",
    short: "Decision",
  },
  {
    id: 5,
    label: "Outputs",
    short: "Results",
  },
] as const;

interface StepperProps {
  current: number;
  maxReached: number;
  onChange: (step: number) => void;
}

export function Stepper({
  current,
  maxReached,
  onChange,
}: StepperProps) {
  const safeCurrent = Math.min(
    Math.max(current, 1),
    STEPS.length,
  );

  const progress =
    ((safeCurrent - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav
      aria-label="BharatScore workflow"
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]">

        {/* Soft background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-50/40 via-white to-teal-50/40" />

        <div className="relative px-3 py-4 sm:px-8 sm:py-5">

          {/* Workflow line */}
          <div
            className="pointer-events-none absolute left-[10%] right-[10%] top-[35px] h-[2px] overflow-hidden rounded-full bg-slate-200 sm:left-[10%] sm:right-[10%]"
            aria-hidden="true"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
              initial={false}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-5">
            {STEPS.map((step) => {
              const isCurrent = safeCurrent === step.id;
              const isCompleted = step.id < safeCurrent;
              const isReached = step.id <= maxReached;

              const canNavigate =
                isReached || step.id === maxReached + 1;

              return (
                <div
                  key={step.id}
                  className="flex min-w-0 flex-col items-center"
                >
                  <motion.button
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => {
                      if (canNavigate) {
                        onChange(step.id);
                      }
                    }}
                    whileHover={
                      canNavigate
                        ? { scale: 1.04 }
                        : undefined
                    }
                    whileTap={
                      canNavigate
                        ? { scale: 0.96 }
                        : undefined
                    }
                    className={[
                      "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                      isCurrent
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_0_0_5px_rgba(79,70,229,0.10),0_8px_18px_rgba(79,70,229,0.20)]"
                        : isCompleted
                          ? "border-indigo-500 bg-indigo-500 text-white shadow-sm"
                          : isReached
                            ? "border-slate-300 bg-white text-slate-500"
                            : "border-slate-200 bg-slate-50 text-slate-300",
                      canNavigate
                        ? "cursor-pointer"
                        : "cursor-not-allowed",
                    ].join(" ")}
                    aria-current={
                      isCurrent ? "step" : undefined
                    }
                  >
                    {/* Active pulse */}
                    {isCurrent && (
                      <motion.span
                        className="absolute inset-[-5px] rounded-full border border-indigo-400/40"
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: [0, 0.8, 0],
                          scale: [0.9, 1.12, 1.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    )}

                    {/* Completed state */}
                    {isCompleted ? (
                      <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        initial={{
                          scale: 0,
                          rotate: -30,
                        }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{
                          duration: 0.35,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      >
                        <path
                          d="M5 12.5L9.5 17L19 7.5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </motion.button>

                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <motion.div
                      animate={{
                        color: isCurrent
                          ? "#4338CA"
                          : isCompleted
                            ? "#475569"
                            : "#94A3B8",
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="truncate text-[10px] font-bold sm:text-xs"
                    >
                      {step.label}
                    </motion.div>

                    <div
                      className={[
                        "mt-0.5 hidden text-[9px] font-medium sm:block",
                        isCurrent
                          ? "text-indigo-500"
                          : isCompleted
                            ? "text-slate-400"
                            : "text-slate-300",
                      ].join(" ")}
                    >
                      {isCurrent
                        ? "Current"
                        : isCompleted
                          ? "Completed"
                          : step.short}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Small progress indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={false}
                animate={{
                  width: `${Math.max(
                    20,
                    (safeCurrent / STEPS.length) * 100,
                  )}%`,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Step {String(safeCurrent).padStart(2, "0")} of 05
            </span>

            <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-teal-500"
                initial={false}
                animate={{
                  width: `${(safeCurrent / STEPS.length) * 100}%`,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}