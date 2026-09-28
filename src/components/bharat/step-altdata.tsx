"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Download,
  FileJson,
  Gauge,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { PERSONAS, type Persona } from "@/lib/data";
import {
  SIGNAL_LIMITS,
  scoreApplicant,
  type Applicant,
  type Signals,
} from "@/lib/scoring";

import { cn } from "@/lib/utils";
import { apiFetch } from "@/utils/api";
import { ScoreGauge } from "./score-gauge";

interface Props {
  applicant: Applicant;
  signals: Signals;
  personaId: string | null;
  onSignals: (s: Signals) => void;
  onPersona: (p: Persona) => void;
  onBack: () => void;
  onNext: () => void;
}

/* ------------------------------------------------ */
/* ANIMATIONS */
/* ------------------------------------------------ */

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardHover = {
  y: -3,
  transition: {
    duration: 0.2,
  },
};

/* ------------------------------------------------ */
/* SIGNAL DEFINITIONS */
/* ------------------------------------------------ */

const SLIDERS: {
  key: keyof Signals;
  label: string;
  help: string;
  unit: string;
}[] = [
  {
    key: "upiPerWeek",
    label: "UPI transactions / week",
    help: "Customer and supplier payments via any UPI app",
    unit: "",
  },
  {
    key: "billsOnTimePct",
    label: "Utility bills paid on time",
    help: "Electricity, water, gas — last 36 months",
    unit: "%",
  },
  {
    key: "rechargePct",
    label: "Recharge consistency",
    help: "Regular prepaid / postpaid mobile top-ups",
    unit: "%",
  },
  {
    key: "incomeStabilityPct",
    label: "Income stability",
    help: "How steady monthly inflows are, season-adjusted",
    unit: "%",
  },
  {
    key: "marketPct",
    label: "Market / mandi records",
    help: "e-NAM, mandi receipts, vendor-app sales history",
    unit: "%",
  },
  {
    key: "monthsAtLocation",
    label: "Months at same location",
    help: "From address on bills and Aadhaar",
    unit: " mo",
  },
];

const STRENGTH_VARIANT = {
  Strong: "green",
  Good: "teal",
  Building: "default",
  Emerging: "amber",
} as const;

/* ------------------------------------------------ */
/* IMPORT ALIASES */
/* ------------------------------------------------ */

const ALIASES: Record<string, keyof Signals> = {
  upi: "upiPerWeek",
  upitxnperweek: "upiPerWeek",
  upiperweek: "upiPerWeek",
  upitransactions: "upiPerWeek",
  upipw: "upiPerWeek",

  bills: "billsOnTimePct",
  billsontimepct: "billsOnTimePct",
  billsontime: "billsOnTimePct",

  recharge: "rechargePct",
  rechargeconsistencypct: "rechargePct",
  rechargepct: "rechargePct",

  income: "incomeStabilityPct",
  incomestabilitypct: "incomeStabilityPct",
  incomestability: "incomeStabilityPct",

  market: "marketPct",
  mandi: "marketPct",
  marketrecordspct: "marketPct",
  marketpct: "marketPct",

  months: "monthsAtLocation",
  monthsatlocation: "monthsAtLocation",
  locationmonths: "monthsAtLocation",
};

/* ------------------------------------------------ */
/* SAMPLE CSV */
/* ------------------------------------------------ */

const SAMPLE_CSV = `upi_txn_per_week,bills_on_time_pct,recharge_consistency_pct,income_stability_pct,market_records_pct,months_at_location,avg_upi_ticket_inr,electricity_bills_paid,water_bills_paid,recharges_12m,mandi_receipts_12m,savings_band
38,88,82,66,52,40,140,35,34,12,18,B`;

/* ------------------------------------------------ */
/* FILE PARSER */
/* ------------------------------------------------ */

function parseFile(
  text: string,
  name: string,
): {
  count: number;
  mapped: Partial<Signals>;
} {
  let record: Record<string, unknown> = {};

  if (
    name.toLowerCase().endsWith(".json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    const parsed = JSON.parse(text);

    const obj = Array.isArray(parsed)
      ? parsed[parsed.length - 1]
      : parsed;

    const flat = (
      object: Record<string, unknown>,
      output: Record<string, unknown>,
    ) => {
      for (const [key, value] of Object.entries(object)) {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          flat(value as Record<string, unknown>, output);
        } else {
          output[key] = value;
        }
      }

      return output;
    };

    record = flat(obj ?? {}, {});
  } else {
    const rows = text
      .trim()
      .split(/\r?\n/)
      .map((row) =>
        row.split(",").map((cell) => cell.trim()),
      );

    if (rows.length >= 2 && rows[0].length > 2) {
      rows[0].forEach(
        (header, index) => {
          record[header] = rows[rows.length - 1][index];
        },
      );
    } else {
      rows.forEach((row) => {
        if (row.length >= 2) {
          record[row[0]] = row[1];
        }
      });
    }
  }

  const mapped: Partial<Signals> = {};

  for (const [key, value] of Object.entries(record)) {
    const mappedKey =
      ALIASES[
        key.toLowerCase().replace(/[^a-z]/g, "")
      ];

    const number = Number(value);

    if (mappedKey && Number.isFinite(number)) {
      const { min, max } = SIGNAL_LIMITS[mappedKey];

      mapped[mappedKey] = Math.min(
        max,
        Math.max(min, Math.round(number)),
      );
    }
  }

  return {
    count: Object.keys(record).length,
    mapped,
  };
}

/* ------------------------------------------------ */
/* SIGNAL STRENGTH */
/* ------------------------------------------------ */

function getSignalStrength(
  value: number,
  min: number,
  max: number,
) {
  const percentage =
    ((value - min) / (max - min)) * 100;

  if (percentage >= 75) return "Strong";
  if (percentage >= 50) return "Good";
  if (percentage >= 25) return "Building";

  return "Emerging";
}

/* ------------------------------------------------ */
/* SIGNAL VALIDATION */
/* ------------------------------------------------ */

function areAllSignalsValid(signals: Signals): boolean {
  return SLIDERS.every((slider) => {
    const value = signals[slider.key];
    const limits = SIGNAL_LIMITS[slider.key];

    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= limits.min &&
      value <= limits.max
    );
  });
}

/* ------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------ */

export function StepAltData({
  applicant,
  signals,
  personaId,
  onSignals,
  onPersona,
  onBack,
  onNext,
}: Props) {
  const preview = scoreApplicant(
    signals,
    applicant.loanAmount,
  );

  const [tab, setTab] = useState("personas");

  const [dragging, setDragging] = useState(false);

  const [parsing, setParsing] = useState<{
    pct: number;
    label: string;
  } | null>(null);

  const [imported, setImported] =
    useState<string | null>(null);

  const fileRef =
    useRef<HTMLInputElement>(null);

  /* ------------------------------------------------ */
  /* IMPORT */
  /* ------------------------------------------------ */

  const runImport = (
    text: string,
    name: string,
  ) => {
    let result: {
      count: number;
      mapped: Partial<Signals>;
    };

    try {
      result = parseFile(text, name);
    } catch {
      toast.error("Couldn't read that file", {
        description:
          "Please upload a valid CSV or JSON export.",
      });

      return;
    }

    const stages = [
      "Reading file…",
      "Detecting signals…",
      "Normalising to model features…",
      "Done",
    ];

    let index = 0;

    setParsing({
      pct: 5,
      label: stages[0],
    });

    const timer = setInterval(() => {
      index++;

      setParsing({
        pct: Math.min(100, index * 34),
        label: stages[Math.min(index, 3)],
      });

      if (index >= 3) {
        clearInterval(timer);

        setTimeout(() => {
          setParsing(null);

          const count = result.count || 12;

          if (Object.keys(result.mapped).length) {
            onSignals({
              ...signals,
              ...result.mapped,
            });
          }

          setImported(name);

          toast.success(
            `${count} signals imported`,
            {
              description:
                `${Object.keys(result.mapped).length} mapped to scoring features from ${name}`,
            },
          );
        }, 250);
      }
    }, 280);
  };

  const onFiles = async (
    files: FileList | null,
  ) => {
    const file = files?.[0];

    if (!file) return;

    if (!/\.(csv|json)$/i.test(file.name)) {
      toast.error("Unsupported file", {
        description:
          "Upload a .csv or .json file.",
      });

      return;
    }

    runImport(
      await file.text(),
      file.name,
    );
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    setDragging(false);

    onFiles(event.dataTransfer.files);
  };

  const downloadSample = () => {
    const url = URL.createObjectURL(
      new Blob([SAMPLE_CSV], {
        type: "text/csv",
      }),
    );

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "bharatscore-sample-signals.csv";

    anchor.click();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000,
    );
  };

  /* ------------------------------------------------ */
  /* SIGNAL COVERAGE */
  /* ------------------------------------------------ */

  const signalEntries = SLIDERS.map(
    (slider) => {
      const limits =
        SIGNAL_LIMITS[slider.key];

      const value =
        signals[slider.key];

      const percentage =
        ((value - limits.min) /
          (limits.max - limits.min)) *
        100;

      return {
        ...slider,
        value,
        percentage: Math.max(
          0,
          Math.min(100, percentage),
        ),
      };
    },
  );

  const strongSignals =
    signalEntries.filter(
      (signal) =>
        signal.percentage >= 75,
    ).length;

  const signalsValid =
    areAllSignalsValid(signals);

  /* ------------------------------------------------ */
  /* GENERATE SCORE */
/* ------------------------------------------------ */

  const handleGenerateScore = async () => {
  if (!signalsValid) {
    toast.error(
      "Complete all financial signals",
      {
        description:
          "Please provide valid values for all 6 signals before generating the BharatScore.",
      },
    );

    setTab("sliders");
    return;
  }

  const applicantId = localStorage.getItem("applicantId");

  if (!applicantId) {
    toast.error("Applicant not found", {
      description:
        "Please go back and save the applicant details first.",
    });
    return;
  }

  try {
    const data = await apiFetch("/api/alternative-data", {
  method: "POST",
  body: JSON.stringify({
    applicantId: Number(applicantId),

    // UPI: normalize 0–50 transactions into 0–100
    transactionConsistencyScore: Math.round(
      Math.min(100, (signals.upiPerWeek / 50) * 100)
    ),

    // Bills: already 0–100
    utilityPaymentScore: signals.billsOnTimePct,

    // Income stability: already 0–100
    employmentStabilityScore:
      signals.incomeStabilityPct,

    // Recharge: already 0–100
    rechargeConsistencyScore:
      signals.rechargePct,

    // Market records: already 0–100
    marketRecordScore:
      signals.marketPct,

    // Stability: normalize 0–60 months into 0–100
    stabilityScore: Math.round(
      Math.min(
        100,
        (signals.monthsAtLocation / 60) * 100
      )
    ),
  }),
});

    console.log(
      "Alternative data saved:",
      data
    );

    toast.success("Alternative data saved", {
      description:
        "Your financial signals are ready for BharatScore calculation.",
    });

    onNext();
  } catch (error) {
    console.error(
      "Alternative data save error:",
      error
    );

    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(
          error.message
        );

        toast.error(
          parsedError.message ||
            parsedError.error ||
            "Failed to save alternative data"
        );
      } catch {
        toast.error(
          error.message ||
            "Cannot connect to BharatScore server"
        );
      }
    } else {
      toast.error(
        "Cannot connect to BharatScore server"
      );
    }
  }
};

  /* ------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------ */

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-teal-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
                <Zap className="h-3.5 w-3.5" />
                SIGNAL INTELLIGENCE
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Understand financial behaviour.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Bring together everyday financial signals and
                transform them into a transparent,
                explainable credit profile.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Signals active
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl font-black text-slate-950">
                    {Object.keys(signals).length}
                  </span>

                  <span className="text-xs font-semibold text-teal-600">
                    / 6
                  </span>
                </div>
              </div>

              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 sm:flex">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================== */}
      {/* MAIN */}
      {/* ================================================== */}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* ================================================== */}
        {/* LEFT */}
        {/* ================================================== */}

        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">

            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-950">
                    Alternative data signals
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Consented, summarised financial behaviour —
                    never raw transactions.
                  </CardDescription>
                </div>

                <Badge
                  variant="teal"
                  className="w-fit gap-1.5"
                >
                  <Sparkles />
                  Live scoring
                </Badge>

              </div>
            </CardHeader>

            <CardContent className="px-6 py-7 sm:px-7">

              {/* ================================================== */}
              {/* TABS */}
              {/* ================================================== */}

              <Tabs
                value={tab}
                onValueChange={setTab}
              >
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1 sm:w-fit">

                  <TabsTrigger
                    value="personas"
                    className="gap-1.5 rounded-lg px-4 py-2.5"
                  >
                    <Users className="h-4 w-4" />
                    Personas
                  </TabsTrigger>

                  <TabsTrigger
                    value="sliders"
                    className="gap-1.5 rounded-lg px-4 py-2.5"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Sliders
                  </TabsTrigger>

                  <TabsTrigger
                    value="upload"
                    className="gap-1.5 rounded-lg px-4 py-2.5"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload
                  </TabsTrigger>

                </TabsList>

                {/* ================================================== */}
                {/* TAB CONTENT */}
                {/* ================================================== */}

                <AnimatePresence mode="wait">

                  <motion.div
                    key={tab}
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
                      duration: 0.2,
                    }}
                  >

                    {/* ================================================== */}
                    {/* PERSONAS */}
                    {/* ================================================== */}

                    {tab === "personas" && (
                      <TabsContent
                        value="personas"
                        forceMount
                        className="mt-6"
                      >
                        <div className="mb-5 flex items-center justify-between">

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Start with a realistic profile
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Load a persona to instantly populate
                              representative signals.
                            </p>
                          </div>

                          <span className="hidden text-xs font-semibold text-slate-400 sm:block">
                            {PERSONAS.length} profiles
                          </span>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">

                          {PERSONAS.map((persona) => {
                            const score =
                              scoreApplicant(
                                persona.signals,
                              ).score;

                            const loaded =
                              personaId ===
                              persona.id;

                            return (
                              <motion.div
                                key={persona.id}
                                whileHover={cardHover}
                                className={cn(
                                  "group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all",
                                  loaded
                                    ? "border-indigo-600 shadow-xl shadow-indigo-600/10"
                                    : "border-slate-200 hover:border-indigo-300 hover:shadow-md",
                                )}
                              >

                                {loaded && (
                                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-teal-400" />
                                )}

                                <div className="flex gap-4 p-5">

                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-2 ring-white">

                                    <Image
                                      src={persona.photo}
                                      alt={`Portrait of ${persona.name}`}
                                      fill
                                      sizes="80px"
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <div className="flex items-start justify-between gap-2">

                                      <div>
                                        <h4 className="font-bold text-slate-900">
                                          {persona.name}
                                        </h4>

                                        <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                                          {persona.tagline}
                                        </p>
                                      </div>

                                      {loaded && (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                                          <Check className="h-4 w-4" />
                                        </div>
                                      )}

                                    </div>

                                    <Badge
                                      variant={
                                        STRENGTH_VARIANT[
                                          persona.strength
                                        ]
                                      }
                                      className="mt-2"
                                    >
                                      {persona.strength} profile
                                    </Badge>

                                  </div>
                                </div>

                                <p className="flex-1 px-5 text-sm leading-6 text-slate-600">
                                  {persona.story}
                                </p>

                                <div className="mt-5 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">

                                  <div className="flex items-center justify-between gap-3">

                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Estimated score
                                      </p>

                                      <p className="mt-0.5 text-lg font-black tabular-nums text-slate-950">
                                        {score}
                                      </p>
                                    </div>

                                    <Button
                                      size="sm"
                                      variant={
                                        loaded
                                          ? "teal"
                                          : "default"
                                      }
                                      onClick={() => {
                                        onPersona(persona);

                                        toast.success(
                                          `${persona.name.split(" ")[0]}'s signals loaded`,
                                          {
                                            description:
                                              "Applicant details and alt-data filled in.",
                                          },
                                        );
                                      }}
                                    >
                                      {loaded ? (
                                        <>
                                          <Check />
                                          Loaded
                                        </>
                                      ) : (
                                        <>
                                          Load profile
                                          <ArrowRight />
                                        </>
                                      )}
                                    </Button>

                                  </div>
                                </div>

                              </motion.div>
                            );
                          })}

                        </div>
                      </TabsContent>
                    )}

                    {/* ================================================== */}
                    {/* SLIDERS */}
                    {/* ================================================== */}

                    {tab === "sliders" && (
                      <TabsContent
                        value="sliders"
                        forceMount
                        className="mt-6"
                      >

                        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">

                          <div className="flex gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                              <Gauge className="h-4 w-4 text-indigo-600" />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Tune the financial signals
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Adjust the signals below and watch the
                                BharatScore preview update instantly.
                              </p>
                            </div>

                          </div>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">

                          {SLIDERS.map((slider) => {
                            const limits =
                              SIGNAL_LIMITS[
                                slider.key
                              ];

                            const value =
                              signals[slider.key];

                            const percentage =
                              ((value -
                                limits.min) /
                                (limits.max -
                                  limits.min)) *
                              100;

                            const strength =
                              getSignalStrength(
                                value,
                                limits.min,
                                limits.max,
                              );

                            return (
                              <motion.div
                                key={slider.key}
                                whileHover={{
                                  y: -2,
                                }}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                              >

                                <div className="flex items-start justify-between gap-3">

                                  <div>
                                    <label
                                      id={`lbl-${slider.key}`}
                                      className="text-sm font-bold text-slate-800"
                                    >
                                      {slider.label}
                                    </label>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                      {slider.help}
                                    </p>
                                  </div>

                                  <motion.span
                                    key={value}
                                    initial={{
                                      scale: 0.9,
                                      opacity: 0.5,
                                    }}
                                    animate={{
                                      scale: 1,
                                      opacity: 1,
                                    }}
                                    className="shrink-0 rounded-xl bg-indigo-50 px-2.5 py-1.5 text-sm font-black tabular-nums text-indigo-700"
                                  >
                                    {value}
                                    {slider.unit}
                                  </motion.span>

                                </div>

                                <div className="mt-5">

                                  <Slider
                                    aria-labelledby={`lbl-${slider.key}`}
                                    thumbLabel={slider.label}
                                    min={limits.min}
                                    max={limits.max}
                                    step={1}
                                    value={[value]}
                                    onValueChange={([
                                      nextValue,
                                    ]) =>
                                      onSignals({
                                        ...signals,
                                        [slider.key]:
                                          nextValue,
                                      })
                                    }
                                  />

                                </div>

                                <div className="mt-3 flex items-center justify-between">

                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {limits.min}
                                  </span>

                                  <Badge
                                    variant={
                                      STRENGTH_VARIANT[
                                        strength as keyof typeof STRENGTH_VARIANT
                                      ]
                                    }
                                    className="text-[10px]"
                                  >
                                    {strength}
                                  </Badge>

                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {limits.max}
                                  </span>

                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                                    animate={{
                                      width: `${Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          percentage,
                                        ),
                                      )}%`,
                                    }}
                                    transition={{
                                      duration: 0.25,
                                    }}
                                  />

                                </div>

                              </motion.div>
                            );
                          })}

                        </div>

                      </TabsContent>
                    )}

                    {/* ================================================== */}
                    {/* UPLOAD */}
                    {/* ================================================== */}

                    {tab === "upload" && (
                      <TabsContent
                        value="upload"
                        forceMount
                        className="mt-6"
                      >

                        <div
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={() =>
                            setDragging(false)
                          }
                          onDrop={onDrop}
                          className={cn(
                            "relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
                            dragging
                              ? "scale-[1.01] border-indigo-500 bg-indigo-50 shadow-xl shadow-indigo-500/10"
                              : "border-slate-300 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/20",
                          )}
                        >

                          <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#4f46e5_1px,transparent_1px),linear-gradient(90deg,#4f46e5_1px,transparent_1px)] [background-size:28px_28px]" />

                          <motion.div
                            animate={
                              dragging
                                ? {
                                    scale: 1.1,
                                    y: -5,
                                  }
                                : {
                                    scale: 1,
                                    y: 0,
                                  }
                            }
                            className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg ring-1 ring-slate-200"
                          >
                            {imported ? (
                              <FileJson className="h-8 w-8 text-teal-600" />
                            ) : (
                              <UploadCloud className="h-8 w-8 text-indigo-600" />
                            )}
                          </motion.div>

                          <p className="relative mt-6 text-lg font-extrabold text-slate-900">
                            {imported
                              ? `Imported ${imported}`
                              : "Bring your financial signals"}
                          </p>

                          <p className="relative mt-2 max-w-lg text-sm leading-6 text-slate-500">
                            Drop a CSV or JSON export containing
                            account-aggregator summaries, UPI signals
                            or bill histories.
                          </p>

                          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                              CSV
                            </span>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                              JSON
                            </span>

                            <span className="flex items-center gap-1 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[11px] font-semibold text-teal-700">
                              <Lock className="h-3 w-3" />
                              Browser processed
                            </span>

                          </div>

                          {parsing ? (
                            <div
                              className="relative mt-8 w-full max-w-md space-y-3"
                              aria-live="polite"
                            >

                              <div className="flex items-center justify-between">

                                <span className="text-xs font-bold text-indigo-700">
                                  {parsing.label}
                                </span>

                                <span className="text-xs font-bold tabular-nums text-slate-400">
                                  {parsing.pct}%
                                </span>

                              </div>

                              <Progress
                                value={parsing.pct}
                                className="h-2"
                              />

                              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                                <span>Read</span>
                                <span>Detect</span>
                                <span>Normalise</span>
                                <span>Ready</span>
                              </div>

                            </div>
                          ) : (
                            <div className="relative mt-7 flex flex-wrap justify-center gap-2">

                              <input
                                ref={fileRef}
                                type="file"
                                accept=".csv,.json,application/json,text/csv"
                                className="sr-only"
                                aria-label="Upload signal file"
                                onChange={(event) => {
                                  onFiles(
                                    event.target.files,
                                  );

                                  event.target.value =
                                    "";
                                }}
                              />

                              <Button
                                onClick={() =>
                                  fileRef.current?.click()
                                }
                                className="h-11 rounded-xl px-5"
                              >
                                <UploadCloud />
                                Choose file
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() =>
                                  runImport(
                                    SAMPLE_CSV,
                                    "sample-signals.csv",
                                  )
                                }
                                className="h-11 rounded-xl"
                              >
                                <Wand2 />
                                Use sample data
                              </Button>

                              <Button
                                variant="ghost"
                                onClick={
                                  downloadSample
                                }
                                className="h-11 rounded-xl"
                              >
                                <Download />
                                Sample CSV
                              </Button>

                            </div>
                          )}

                          <p className="relative mt-6 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                            Nothing leaves this device during parsing.
                          </p>

                        </div>

                      </TabsContent>
                    )}

                  </motion.div>

                </AnimatePresence>
              </Tabs>

              {/* ================================================== */}
              {/* SIGNAL STATUS */}
              {/* ================================================== */}

              <div
                className={cn(
                  "mt-8 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3",
                  signalsValid
                    ? "border-teal-100 bg-teal-50/60"
                    : "border-amber-100 bg-amber-50/60",
                )}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      signalsValid
                        ? "bg-teal-100 text-teal-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {signalsValid ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Gauge className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {signalsValid
                        ? "All 6 signals are ready"
                        : "6 signals required"}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {signalsValid
                        ? "Your alternative-data profile is ready for scoring."
                        : "Complete the financial signal inputs before continuing."}
                    </p>
                  </div>

                </div>

                <span
                  className={cn(
                    "hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex",
                    signalsValid
                      ? "bg-teal-100 text-teal-700"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  {signalsValid
                    ? "READY"
                    : "INCOMPLETE"}
                </span>

              </div>

              {/* ================================================== */}
              {/* BOTTOM NAVIGATION */}
              {/* ================================================== */}

              <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="w-fit"
                >
                  <ArrowLeft />
                  Back
                </Button>

                <Button
                  size="lg"
                  onClick={handleGenerateScore}
                  disabled={!signalsValid}
                  className={cn(
                    "group h-12 rounded-xl px-7 font-bold shadow-lg transition-all",
                    signalsValid
                      ? "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
                      : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none",
                  )}
                >
                  {signalsValid ? (
                    <>
                      <Sparkles className="transition-transform group-hover:rotate-12" />
                      Generate BharatScore
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      <ShieldCheck />
                      Complete 6 signals
                    </>
                  )}
                </Button>

              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================== */}
        {/* RIGHT INTELLIGENCE PANEL */}
        {/* ================================================== */}

        <motion.aside
          variants={fadeUp}
          className="space-y-4 lg:sticky lg:top-40 lg:self-start"
        >

          {/* SCORE PREVIEW */}

          <Card className="overflow-hidden border-0 bg-[#1E1B4B] text-white shadow-xl shadow-indigo-950/10">

            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-indigo-950 to-[#312E81] p-5">

              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                    Live intelligence
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    BharatScore preview
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 text-[10px] font-bold text-teal-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
                  LIVE
                </div>

              </div>

              <div className="mt-3 flex justify-center">
                <ScoreGauge
                  score={preview.score}
                  size={210}
                  stroke={16}
                  duration={0.3}
                  showTicks={false}
                  label="Preview"
                  dark
                />
              </div>

              <div className="relative -mt-2 flex justify-center">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  {preview.band}
                </span>
              </div>

            </div>

            <CardContent className="space-y-5 bg-white p-5">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scoring for
                </p>

                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                  {applicant.name ||
                    "Unnamed applicant"}
                </p>
              </div>

              {/* factor list */}

              <div className="space-y-3">

                {preview.factors.map(
                  (factor) => (
                    <div key={factor.key}>

                      <div className="flex items-center justify-between gap-2 text-xs">

                        <span className="truncate text-slate-600">
                          {factor.label}
                        </span>

                        <span className="shrink-0 font-bold tabular-nums text-slate-900">
                          +{factor.points}

                          <span className="font-medium text-slate-400">
                            /{factor.maxPoints}
                          </span>
                        </span>

                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${factor.value * 100}%`,
                          }}
                          transition={{
                            duration: 0.45,
                          }}
                        />

                      </div>

                    </div>
                  ),
                )}

              </div>

            </CardContent>
          </Card>

          {/* SIGNAL COVERAGE */}

          <Card className="border-slate-200 shadow-sm">

            <CardContent className="p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Signal coverage
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {strongSignals} strong signals
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
                  <Database className="h-4 w-4 text-teal-600" />
                </div>

              </div>

              <div className="mt-5 space-y-3">

                {signalEntries.map(
                  (signal) => (
                    <div
                      key={signal.key}
                      className="flex items-center gap-3"
                    >

                      <div
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",

                          signal.percentage >= 75
                            ? "bg-emerald-500"
                            : signal.percentage >= 50
                              ? "bg-teal-500"
                              : signal.percentage >= 25
                                ? "bg-amber-500"
                                : "bg-rose-500",
                        )}
                      />

                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                        {signal.label}
                      </span>

                      <span className="text-[11px] font-bold tabular-nums text-slate-400">
                        {Math.round(
                          signal.percentage,
                        )}
                        %
                      </span>

                    </div>
                  ),
                )}

              </div>

            </CardContent>
          </Card>

          {/* TRUST */}

          <Card className="border-teal-100 bg-teal-50/60 shadow-none">

            <CardContent className="p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Lock className="h-4 w-4 text-teal-600" />
                </div>

                <div>

                  <p className="text-sm font-bold text-slate-900">
                    Privacy by design
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Signals are summarised before scoring.
                    Raw transaction data is never required by
                    the demo scoring engine.
                  </p>

                </div>

              </div>

            </CardContent>
          </Card>

        </motion.aside>

      </div>
    </motion.div>
  );
}