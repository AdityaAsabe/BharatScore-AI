"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FactorResult } from "@/lib/scoring";

/* ========================================================= */
/* FACTOR COLORS                                             */
/* ========================================================= */

export function factorColor(value: number) {
  if (value >= 0.7) return "#059669";
  if (value >= 0.45) return "#14B8A6";
  if (value >= 0.25) return "#F59E0B";
  return "#F43F5E";
}

/* ========================================================= */
/* TYPES                                                     */
/* ========================================================= */

interface Datum {
  label: string;
  points: number;
  gap: number;
  max: number;
  value: number;
  weight: number;
}

interface ShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: Datum;
}

interface TickProps {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
  index?: number;
}

/* ========================================================= */
/* STRENGTH LABEL                                            */
/* ========================================================= */

function getStrengthLabel(
  value: number,
  lang: "en" | "hi" | "mr",
) {
  if (value >= 0.7) {
    return lang === "mr"
      ? "मजबूत"
      : lang === "hi"
        ? "मजबूत"
        : "Strong";
  }

  if (value >= 0.45) {
    return lang === "mr"
      ? "चांगले"
      : lang === "hi"
        ? "अच्छा"
        : "Good";
  }

  if (value >= 0.25) {
    return lang === "mr"
      ? "मध्यम"
      : lang === "hi"
        ? "मध्यम"
        : "Moderate";
  }

  return lang === "mr"
    ? "सुधारणा आवश्यक"
    : lang === "hi"
      ? "सुधार आवश्यक"
      : "Needs improvement";
}

/* ========================================================= */
/* EARNED BAR                                                */
/* ========================================================= */

function EarnedBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  payload,
}: ShapeProps) {
  const safeWidth = Math.max(width, 0);
  const safeHeight = Math.max(height, 0);

  return (
    <motion.rect
      x={x}
      y={y}
      width={safeWidth}
      height={safeHeight}
      rx={6}
      fill={factorColor(payload?.value ?? 0)}
      initial={{
        width: 0,
      }}
      animate={{
        width: safeWidth,
      }}
      transition={{
        duration: 0.6,
        delay: 0.25 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}

/* ========================================================= */
/* GAP BAR                                                    */
/* ========================================================= */

function GapBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
}: ShapeProps) {
  return (
    <motion.rect
      x={x}
      y={y}
      width={Math.max(width, 0)}
      height={Math.max(height, 0)}
      rx={6}
      fill="#EEF2F7"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
      }}
    />
  );
}

/* ========================================================= */
/* FACTOR CHART                                               */
/* ========================================================= */

export function FactorChart({
  factors,
  lang = "en",
}: {
  factors: FactorResult[];
  lang?: "en" | "hi" | "mr";
}) {
  /* ------------------------------------------------------- */
  /* CHART DATA                                              */
  /* ------------------------------------------------------- */

  const data: Datum[] = factors.map((factor) => ({
    label:
      lang === "mr"
        ? factor.labelMr
        : lang === "hi"
          ? factor.labelHi
          : factor.label,

    points: factor.points,

    gap: Math.max(
      factor.maxPoints - factor.points,
      0,
    ),

    max: factor.maxPoints,

    value: factor.value,

    weight: factor.weight,
  }));

  /* ------------------------------------------------------- */
  /* ACCESSIBILITY                                           */
  /* ------------------------------------------------------- */

  const ariaLabel = factors
    .map((factor) => {
      const label =
        lang === "mr"
          ? factor.labelMr
          : lang === "hi"
            ? factor.labelHi
            : factor.label;

      return `${label} ${factor.points} of ${factor.maxPoints} points`;
    })
    .join(", ");

  /* ------------------------------------------------------- */
  /* EMPTY STATE                                             */
  /* ------------------------------------------------------- */

  if (data.length === 0) {
    return (
      <div
        className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50"
        role="status"
      >
        <span className="text-sm font-medium text-slate-400">
          No factor data available.
        </span>
      </div>
    );
  }

  /* ======================================================= */
  /* UI                                                       */
  /* ======================================================= */

  return (
    <div
      className="h-[300px] w-full min-w-0"
      role="img"
      aria-label={`Factor contributions: ${ariaLabel}`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{
          width: 520,
          height: 300,
        }}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 4,
            right: 72,
            bottom: 4,
            left: 4,
          }}
          barCategoryGap={12}
        >
          {/* ================================================= */}
          {/* X AXIS                                             */}
          {/* ================================================= */}

          <XAxis
            type="number"
            hide
            domain={[0, 180]}
          />

          {/* ================================================= */}
          {/* Y AXIS                                             */}
          {/* ================================================= */}

          <YAxis
            type="category"
            dataKey="label"
            width={175}
            tickLine={false}
            axisLine={false}
            tick={(props) => {
              const {
                x = 0,
                y = 0,
                payload,
                index = 0,
              } = props as TickProps;

              const datum = data[index];

              const value =
                datum?.value ?? 0;

              const strength =
                getStrengthLabel(
                  value,
                  lang,
                );

              return (
                <g
                  transform={`translate(${x},${y})`}
                >
                  {/* Factor name */}
                  <text
                    x={-8}
                    y={-6}
                    textAnchor="end"
                    fontSize={13}
                    fontWeight={700}
                    fill="#1E293B"
                  >
                    {payload?.value ??
                      datum?.label ??
                      ""}
                  </text>

                  {/* Weight + strength */}
                  <text
                    x={-8}
                    y={12}
                    textAnchor="end"
                    fontSize={10.5}
                    fill="#94A3B8"
                  >
                    {Math.round(
                      (datum?.weight ?? 0) *
                        100,
                    )}
                    % weight
                    {" · "}
                    <tspan
                      fill={factorColor(value)}
                      fontWeight={600}
                    >
                      {strength}
                    </tspan>
                  </text>
                </g>
              );
            }}
          />

          {/* ================================================= */}
          {/* TOOLTIP                                            */}
          {/* ================================================= */}

          <Tooltip
            cursor={{
              fill: "rgba(79,70,229,0.04)",
            }}
            content={({
              active,
              payload,
            }) => {
              if (
                !active ||
                !payload?.length
              ) {
                return null;
              }

              const raw =
                payload[0]?.payload;

              if (!raw) {
                return null;
              }

              const datum =
                raw as Datum;

              return (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
                  {/* Factor */}
                  <div className="font-semibold text-slate-900">
                    {datum.label}
                  </div>

                  {/* Points */}
                  <div className="mt-0.5 text-slate-500">
                    +{datum.points} of{" "}
                    {datum.max} pts
                  </div>

                  {/* Signal */}
                  <div className="mt-0.5 text-slate-400">
                    Signal strength{" "}
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          factorColor(
                            datum.value,
                          ),
                      }}
                    >
                      {Math.round(
                        datum.value * 100,
                      )}
                      %
                    </span>
                  </div>

                  {/* Weight */}
                  <div className="mt-0.5 text-slate-400">
                    Weight{" "}
                    <span className="font-semibold text-slate-600">
                      {Math.round(
                        datum.weight * 100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              );
            }}
          />

          {/* ================================================= */}
          {/* EARNED POINTS                                      */}
          {/* ================================================= */}

          <Bar
            dataKey="points"
            stackId="factor"
            isAnimationActive={false}
            shape={(props: unknown) => (
              <EarnedBar
                {...(props as ShapeProps)}
              />
            )}
          />

          {/* ================================================= */}
          {/* REMAINING GAP                                      */}
          {/* ================================================= */}

          <Bar
            dataKey="gap"
            stackId="factor"
            isAnimationActive={false}
            shape={(props: unknown) => (
              <GapBar
                {...(props as ShapeProps)}
              />
            )}
          >
            {/* ----------------------------------------------- */}
            {/* POINT LABEL                                     */}
            {/* ----------------------------------------------- */}

            <LabelList
              dataKey="points"
              content={(props) => {
                const {
                  x = 0,
                  y = 0,
                  width = 0,
                  height = 0,
                  index = 0,
                } = props as {
                  x?: number;
                  y?: number;
                  width?: number;
                  height?: number;
                  index?: number;
                };

                const datum =
                  data[index];

                if (!datum) {
                  return null;
                }

                const labelX =
                  Number(x) +
                  Number(width) +
                  10;

                const labelY =
                  Number(y) +
                  Number(height) /
                    2;

                return (
                  <motion.text
                    x={labelX}
                    y={labelY}
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill={factorColor(
                      datum.value,
                    )}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay:
                        0.5 +
                        index * 0.08,
                      duration: 0.25,
                    }}
                  >
                    +{datum.points}

                    <tspan
                      fill="#94A3B8"
                      fontWeight={500}
                      fontSize={11}
                    >
                      {` /${datum.max}`}
                    </tspan>
                  </motion.text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}