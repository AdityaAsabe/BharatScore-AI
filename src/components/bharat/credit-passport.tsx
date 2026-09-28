"use client";

import { forwardRef, useMemo } from "react";
import {
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";


import { OCCUPATION_LABEL } from "@/lib/data";
import {
  MODEL_VERSION,
  type Applicant,
  type ScoreResult,
} from "@/lib/scoring";
import { inr } from "@/lib/utils";
import { factorColor } from "./factor-chart";
import { BAND_COLOR, ScoreGauge } from "./score-gauge";

interface Props {
  applicant: Applicant;
  result: ScoreResult;
  requestId: string;
  issuedAt: string;
  photo?: string | null;
}

/* ========================================================= */
/* CREDENTIAL FINGERPRINT */
/* ========================================================= */

function CredentialFingerprint({
  seed,
  size = 82,
}: {
  seed: string;
  size?: number;
}) {
  const cells = useMemo(() => {
    let seedValue = 0;

    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i) * (i + 1);
    }

    return Array.from(
      { length: 13 * 13 },
      (_, index) => {
        const value =
          (seedValue * (index + 17) + index * 31) %
          100;

        return value > 52;
      },
    );
  }, [seed]);

  const n = 13;
  const cell = size / n;

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2"
      aria-label="Credential fingerprint"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <rect
          width={size}
          height={size}
          fill="white"
        />

        {cells.map((active, index) => {
          if (!active) return null;

          const x = index % n;
          const y = Math.floor(index / n);

          return (
            <rect
              key={index}
              x={x * cell + cell * 0.08}
              y={y * cell + cell * 0.08}
              width={cell * 0.84}
              height={cell * 0.84}
              rx={cell * 0.18}
              fill="#1E1B4B"
            />
          );
        })}

        <rect
          x={cell}
          y={cell}
          width={cell * 3}
          height={cell * 3}
          rx={cell * 0.35}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={cell * 0.45}
        />

        <rect
          x={size - cell * 4}
          y={size - cell * 4}
          width={cell * 3}
          height={cell * 3}
          rx={cell * 0.35}
          fill="none"
          stroke="#0D9488"
          strokeWidth={cell * 0.45}
        />
      </svg>
    </div>
  );
}

/* ========================================================= */
/* FACTOR ROW */
/* ========================================================= */

function FactorRow({
  factor,
  index,
  compact = false,
}: {
  factor: ScoreResult["factors"][number];
  index: number;
  compact?: boolean;
}) {
  const percentage = Math.round(factor.value * 100);

  return (
    <div
      className={
        compact
          ? "rounded-lg border border-slate-200 bg-white px-2.5 py-1"
          : "rounded-xl border border-slate-200 bg-white px-4 py-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`flex shrink-0 items-center justify-center rounded-md bg-slate-100 font-extrabold text-slate-500 ${
              compact
                ? "h-5 w-5 text-[7px]"
                : "h-6 w-6 text-[8px]"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span
            className={`truncate font-bold text-slate-700 ${
              compact
                ? "text-[7px]"
                : "text-[10px]"
            }`}
          >
            {factor.label}
          </span>
        </div>

        <span
          className={`shrink-0 font-extrabold ${
            compact
              ? "text-[8px]"
              : "text-[10px]"
          }`}
          style={{
            color: factorColor(factor.value),
          }}
        >
          +{factor.points}
        </span>
      </div>

      <div
        className={`overflow-hidden rounded-full bg-slate-100 ${
          compact
            ? "ml-6 mt-0.5 h-0.5"
            : "ml-8 mt-2 h-1.5"
        }`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: factorColor(factor.value),
          }}
        />
      </div>
    </div>
  );
}

/* ========================================================= */
/* CREDIT PASSPORT */
/* ========================================================= */

export const CreditPassport = forwardRef<
  HTMLDivElement,
  Props
>(function CreditPassport(
  {
    applicant,
    result,
    requestId,
    issuedAt,
    photo,
  },
  ref,
) {
  const factors = [...result.factors].sort(
    (a, b) => b.points - a.points,
  );

  const top3 = factors.slice(0, 3);

  const rec = result.recommendation;

  const initials = (
    applicant.name || "BS"
  )
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const date = new Date(issuedAt);

  const issuedDateStr =
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const validDate = new Date(
    date.getTime() + 90 * 86400000,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const decisionLabel =
    rec.label || "Decision available";

  const scorePercentage = Math.max(
    0,
    Math.min(
      100,
      ((result.score - 300) / 600) * 100,
    ),
  );

  return (
    <div
      id="credit-passport"
      ref={ref}
      className="mx-auto w-full max-w-[420px] space-y-6"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ================================================= */}
      {/* PAGE 1 — CREDIT CREDENTIAL */}
      {/* ================================================= */}

      <section
        id="credit-passport-page-1"
        className="relative flex aspect-[148/210] w-full flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500" />

        {/* HEADER */}
        <header className="px-5 pb-3 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
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
                <div className="text-[13px] font-extrabold tracking-tight text-slate-950">
                  BharatScore AI
                </div>

                <div className="mt-0.5 text-[7px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Digital Credit Credential
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />

              <span className="text-[6px] font-extrabold uppercase tracking-wider text-emerald-700">
                Verified
              </span>
            </div>
          </div>

          {/* APPLICANT */}
          <div className="mt-3.5 flex items-center gap-3">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-indigo-100"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-extrabold text-indigo-600 ring-1 ring-indigo-100">
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate text-[17px] font-extrabold tracking-tight text-slate-950">
                {applicant.name || "Applicant"}
              </div>

              <div className="mt-0.5 text-[8px] font-medium text-slate-500">
                {OCCUPATION_LABEL[applicant.occupation]}

                <span className="mx-1 text-slate-300">
                  •
                </span>

                {applicant.city}
              </div>

              <div className="mt-1 font-mono text-[6px] font-semibold text-slate-400">
                ID · {requestId}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-5 border-t border-slate-200" />

        {/* SCORE */}
        <section className="px-5 pt-3">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-white px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <ScoreGauge
                  score={result.score}
                  size={100}
                  stroke={8}
                  animated={false}
                  showTicks={false}
                  label="Score"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Risk band
                </div>

                <div
                  className="mt-0.5 text-[19px] font-extrabold tracking-tight"
                  style={{
                    color: BAND_COLOR[result.band],
                  }}
                >
                  {result.band}
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{
                      width: `${scorePercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-1 flex justify-between">
                  <span className="text-[6px] font-semibold text-slate-400">
                    Credit readiness
                  </span>

                  <span className="text-[6px] font-bold text-slate-400">
                    {result.score}/900
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DECISION */}
        <section className="px-5 pt-2.5">
          <div className="rounded-xl border border-indigo-100 bg-[#1E1B4B] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-indigo-200">
                  Credit Decision
                </div>

                <div className="mt-1 text-[15px] font-extrabold leading-tight text-white">
                  {decisionLabel}
                </div>
              </div>

              <div className="rounded-lg bg-white/10 px-2.5 py-1.5 text-right">
                <div className="text-[6px] font-bold uppercase tracking-wider text-indigo-200">
                  Model
                </div>

                <div className="mt-0.5 font-mono text-[7px] font-bold text-white">
                  {MODEL_VERSION}
                </div>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-white/10 pt-2.5">
              <div>
                <div className="text-[6px] font-bold uppercase tracking-wider text-indigo-200">
                  Indicative Limit
                </div>

                <div className="mt-0.5 text-[14px] font-extrabold text-white">
                  {rec.limitMax
                    ? inr(rec.limitMax)
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-[6px] font-bold uppercase tracking-wider text-indigo-200">
                  Tenure
                </div>

                <div className="mt-0.5 text-[14px] font-extrabold text-white">
                  {rec.tenureMonths
                    ? `${rec.tenureMonths} months`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SCORE SUMMARY */}
        <section className="px-5 pt-1.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[6px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Score Summary
              </div>

              <div className="mt-0.5 text-[9px] font-extrabold text-slate-700">
                Strongest contributing signals
              </div>
            </div>

            <div className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[5px] font-extrabold text-slate-400">
              TOP 3
            </div>
          </div>

          <div className="mt-1 grid gap-0.5">
            {top3.map((factor, index) => (
              <FactorRow
                key={factor.key}
                factor={factor}
                index={index}
                compact
              />
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[6px] font-extrabold uppercase tracking-[0.15em] text-indigo-600">
                Page 01 / 02
              </div>

              <div className="mt-0.5 text-[7px] font-semibold text-slate-500">
                Credit Credential
              </div>
            </div>

            <div className="text-right">
              <div className="text-[6px] font-bold text-slate-400">
                Issued
              </div>

              <div className="mt-0.5 text-[7px] font-extrabold text-slate-700">
                {issuedDateStr}
              </div>
            </div>
          </div>
        </footer>
      </section>

      {/* ================================================= */}
      {/* PAGE 2 — EVIDENCE & VERIFICATION */}
      {/* ================================================= */}

      <section
        id="credit-passport-page-2"
        className="relative flex aspect-[148/210] w-full flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-600 via-indigo-500 to-indigo-600" />

        {/* HEADER */}
        <header className="px-5 pb-2.5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-extrabold tracking-tight text-slate-950">
                BharatScore AI
              </div>

              <div className="mt-1 text-[7px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Score Evidence & Verification
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 px-2 py-1 text-[6px] font-extrabold text-slate-500">
              PAGE 02 / 02
            </div>
          </div>

          {/* APPLICANT SUMMARY */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[6px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Applicant
                </div>

                <div className="mt-0.5 truncate text-[11px] font-extrabold text-slate-800">
                  {applicant.name || "Applicant"}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[6px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  BharatScore
                </div>

                <div className="mt-0.5 text-[13px] font-extrabold text-indigo-600">
                  {result.score} / 900
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-5 border-t border-slate-200" />

        {/* ALL FACTORS */}
        <section className="px-5 pt-2.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-[7px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Score Evidence
              </div>

              <div className="mt-0.5 text-[11px] font-extrabold text-slate-700">
                All scoring factors
              </div>
            </div>

            <div className="rounded-lg bg-indigo-50 px-2 py-1 text-[6px] font-extrabold text-indigo-600">
              {factors.length} SIGNALS
            </div>
          </div>

          {/* 2 COLUMNS × 3 ROWS */}
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {factors.map((factor, index) => (
              <FactorRow
                key={factor.key}
                factor={factor}
                index={index}
                compact
              />
            ))}
          </div>
        </section>

        {/* DATA PROVENANCE */}
        <section className="px-5 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-[7px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
              Data Provenance
            </div>

            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <div className="flex items-start gap-1">
                <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />

                <span className="text-[6px] font-semibold leading-tight text-slate-500">
                  Consent-based
                  alternative data
                </span>
              </div>

              <div className="flex items-start gap-1">
                <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />

                <span className="text-[6px] font-semibold leading-tight text-slate-500">
                  No bureau history
                  required
                </span>
              </div>

              <div className="flex items-start gap-1">
                <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />

                <span className="text-[6px] font-semibold leading-tight text-slate-500">
                  Model {MODEL_VERSION}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CREDENTIAL VERIFICATION */}
        <section className="px-5 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            {/* CARD HEADER */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[7px] font-extrabold uppercase tracking-[0.17em] text-slate-400">
                  Credential Verification
                </div>

                <div className="mt-0.5 text-[9px] font-extrabold text-slate-800">
                  Verified Digital Credential
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />

                <span className="text-[5px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            {/* VERIFICATION CONTENT */}
            <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="text-[6px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                  Credential ID
                </div>

                <div className="mt-0.5 truncate font-mono text-[7px] font-bold text-slate-600">
                  {requestId}
                </div>

                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[5px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Issued
                    </div>

                    <div className="mt-0.5 text-[6px] font-bold text-slate-700">
                      {issuedDateStr}
                    </div>
                  </div>

                  <div>
                    <div className="text-[5px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      Valid Through
                    </div>

                    <div className="mt-0.5 text-[6px] font-bold text-slate-700">
                      {validDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL QR CODE */}
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white p-1">
                  <QRCodeSVG
                    value={`https://bharatscore.ai/verify/${requestId}`}
                    size={58}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>

                <span className="text-[5px] font-extrabold uppercase tracking-wider text-slate-500">
                  Scan to verify
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFICATION STRIP */}
        <div className="mx-5 mt-1.5 rounded-xl bg-[#1E1B4B] px-3 py-1.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[6px] font-extrabold uppercase tracking-[0.18em] text-teal-300">
                Active Credential
              </div>

              <div className="mt-0.5 truncate text-[8px] font-bold">
                BharatScore AI Credit Passport
              </div>
            </div>

            <div className="shrink-0 rounded-lg bg-emerald-400/10 px-2 py-1 text-[6px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-300/20">
              Verified
            </div>
          </div>
        </div>

        {/* PAGE 2 FOOTER */}
        <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-5 py-2">
          <div className="text-center">
            <div className="text-[7px] font-extrabold text-indigo-600">
              Making the Credit-Invisible Visible.
            </div>

            <div className="mt-0.5 text-[5px] font-medium text-slate-400">
              BharatScore AI · Alternative Credit Intelligence
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
});