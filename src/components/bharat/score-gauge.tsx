"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useId } from "react";
import { bandFor } from "@/lib/scoring";

const START = 135;
const SWEEP = 270;

function polar(c: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: c + r * Math.cos(rad),
    y: c + r * Math.sin(rad),
  };
}

function arcPath(c: number, r: number, from: number, to: number) {
  const a = polar(c, r, from);
  const b = polar(c, r, to);
  const large = to - from > 180 ? 1 : 0;

  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

export const BAND_COLOR: Record<string, string> = {
  Excellent: "#059669",
  Good: "#0D9488",
  Fair: "#D97706",
  "Needs Improvement": "#E11D48",
};

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  animated?: boolean;
  duration?: number;
  showTicks?: boolean;
  label?: string;
  dark?: boolean;
}

export function ScoreGauge({
  score,
  size = 300,
  stroke = 22,
  animated = true,
  duration = 1.2,
  showTicks = true,
  label = "BharatScore",
  dark = false,
}: Props) {
  const id = useId().replace(/:/g, "");

  const c = size / 2;

  const r =
    c -
    stroke / 2 -
    (showTicks ? 18 : 4);

  const mv = useMotionValue(animated ? 300 : score);

  const pct = useTransform(
    mv,
    (v) => ((v - 300) / 600) * 100,
  );

  const offset = useTransform(
    pct,
    (p) => 100 - p,
  );

  const rounded = useTransform(
    mv,
    (v) => Math.round(v).toString(),
  );

  const tipX = useTransform(
    pct,
    (p) =>
      polar(
        c,
        r,
        START + (SWEEP * p) / 100,
      ).x,
  );

  const tipY = useTransform(
    pct,
    (p) =>
      polar(
        c,
        r,
        START + (SWEEP * p) / 100,
      ).y,
  );

  useEffect(() => {
    if (!animated) {
      mv.set(score);
      return;
    }

    const controls = animate(
      mv,
      score,
      {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    );

    return () => controls.stop();
  }, [score, animated, duration, mv]);

  const band = bandFor(score);

  const path = arcPath(
    c,
    r,
    START,
    START + SWEEP,
  );

  const ticks = [
    300,
    450,
    600,
    750,
    900,
  ];

  return (
    <div
      role="meter"
      aria-valuemin={300}
      aria-valuemax={900}
      aria-valuenow={score}
      aria-valuetext={`${label} ${score} out of 900, ${band}`}
      aria-label={label}
      className="relative inline-block"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`g-${id}`}
            x1="0"
            y1="1"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#E11D48"
            />

            <stop
              offset="38%"
              stopColor="#F59E0B"
            />

            <stop
              offset="68%"
              stopColor="#14B8A6"
            />

            <stop
              offset="100%"
              stopColor="#059669"
            />
          </linearGradient>

          <filter
            id={`glow-${id}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              stdDeviation="4"
              result="b"
            />

            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={path}
          fill="none"
          stroke={
            dark
              ? "rgba(255,255,255,0.12)"
              : "#E2E8F0"
          }
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        {/* Score arc */}
        <motion.path
          d={path}
          fill="none"
          stroke={`url(#g-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100 100"
          style={{
            strokeDashoffset: offset,
          }}
        />

        {/* Score indicator */}
        <motion.circle
          cx={tipX}
          cy={tipY}
          r={stroke / 2 + 3}
          fill="white"
          stroke={BAND_COLOR[band]}
          strokeWidth={4}
          filter={`url(#glow-${id})`}
        />

        {/* Scale ticks */}
        {showTicks &&
          ticks.map((t) => {
            const deg =
              START +
              (SWEEP * (t - 300)) /
                600;

            const p = polar(
              c,
              r + stroke / 2 + 12,
              deg,
            );

            return (
              <text
                key={t}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill={
                  dark
                    ? "rgba(255,255,255,0.5)"
                    : "#94A3B8"
                }
              >
                {t}
              </text>
            );
          })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
            dark
              ? "text-indigo-200"
              : "text-slate-400"
          }`}
          style={{
            fontSize: Math.max(
              9,
              size * 0.037,
            ),
          }}
        >
          {label}
        </span>

        <motion.span
          className={`tabular font-extrabold leading-none tracking-tight ${
            dark
              ? "text-white"
              : "text-slate-900"
          }`}
          style={{
            fontSize: size * 0.24,
          }}
        >
          {rounded}
        </motion.span>

        <span
          className={`mt-1 font-medium ${
            dark
              ? "text-indigo-200/80"
              : "text-slate-400"
          }`}
          style={{
            fontSize: Math.max(
              9,
              size * 0.04,
            ),
          }}
        >
          out of 900
        </span>
      </div>
    </div>
  );
}