"use client";

import {
  ArrowRight,
  Check,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/utils/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import { CITIES, OCCUPATIONS, PURPOSES } from "@/lib/data";
import type { Applicant } from "@/lib/scoring";
import { cn, inr } from "@/lib/utils";

interface Props {
  applicant: Applicant;
  onChange: (a: Applicant) => void;
  onNext: () => void;
}

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
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
      staggerChildren: 0.07,
    },
  },
};

export function StepApplicant({
  applicant,
  onChange,
  onNext,
}: Props) {
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof Applicant>(
    key: K,
    value: Applicant[K],
  ) => {
    onChange({
      ...applicant,
      [key]: value,
    });
  };

  const nameValid = applicant.name.trim().length >= 2;

  const occupationValid =
    applicant.occupation !== undefined &&
    applicant.occupation !== null &&
    String(applicant.occupation).trim().length > 0;

  const cityValid =
    applicant.city !== undefined &&
    applicant.city !== null &&
    String(applicant.city).trim().length > 0;

  const purposeValid =
    applicant.purpose !== undefined &&
    applicant.purpose !== null &&
    String(applicant.purpose).trim().length > 0;

  const incomeValid =
    Number.isFinite(Number(applicant.monthlyIncome)) &&
    Number(applicant.monthlyIncome) > 0;

  const loanValid =
    Number.isFinite(Number(applicant.loanAmount)) &&
    Number(applicant.loanAmount) > 0;

  const formValid =
    nameValid &&
    occupationValid &&
    cityValid &&
    purposeValid &&
    incomeValid &&
    loanValid;

  const nameError = touched && !nameValid;
  const occupationError = touched && !occupationValid;
  const cityError = touched && !cityValid;
  const purposeError = touched && !purposeValid;
  const incomeError = touched && !incomeValid;
  const loanError = touched && !loanValid;

  const selectedOccupation = OCCUPATIONS.find(
    (o) => o.id === applicant.occupation,
  );

  const submit = async (e: FormEvent) => {
  e.preventDefault();

  setTouched(true);

  if (!formValid) {
    return;
  }

  try {
    const data = await apiFetch("/api/applicants", {
      method: "POST",
      body: JSON.stringify({
        name: applicant.name,
        city: applicant.city,
        occupation: applicant.occupation,
        incomeMonthly: Number(applicant.monthlyIncome),
        loanAmount: Number(applicant.loanAmount),
        purpose: applicant.purpose,
      }),
    });

    localStorage.setItem(
      "applicantId",
      String(data.id)
    );

    onNext();
  } catch (error) {
    console.error("Applicant save error:", error);

    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);

        alert(
          parsedError.message ||
            parsedError.error ||
            "Failed to save applicant"
        );
      } catch {
        alert(
          error.message ||
            "Cannot connect to BharatScore server"
        );
      }
    } else {
      alert("Cannot connect to BharatScore server");
    }
  }
};

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* APPLICATION PROGRESS */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 overflow-x-auto">
            {[
              { number: "01", label: "Applicant", active: true },
              { number: "02", label: "Alt-Data", active: false },
              { number: "03", label: "BharatScore", active: false },
              { number: "04", label: "Lender View", active: false },
              { number: "05", label: "Outputs", active: false },
            ].map((step, index) => (
              <div
                key={step.number}
                className="flex min-w-max items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold",
                      step.active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {step.number}
                  </div>

                  <span
                    className={cn(
                      "text-xs font-bold",
                      step.active
                        ? "text-indigo-700"
                        : "text-slate-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < 4 && (
                  <div className="mx-3 h-px w-8 bg-slate-200 sm:w-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* TOP INTRO */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-teal-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                APPLICANT PROFILE
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Make the applicant visible.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Start with a few basic details. BharatScore combines this
                context with consent-based alternative data to build an
                explainable credit profile.
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                <User className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* FORM */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-950">
                    Applicant details
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Tell us enough to understand the applicant — not enough
                    to overwhelm them.
                  </CardDescription>
                </div>

                <div className="hidden rounded-xl bg-white px-3 py-2 text-right shadow-sm ring-1 ring-slate-200 sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step
                  </p>

                  <p className="text-sm font-extrabold text-indigo-600">
                    01 / 05
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-7 sm:px-7">
              <form
                onSubmit={submit}
                className="space-y-8"
                noValidate
              >
                {/* NAME */}
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="name"
                      className="text-sm font-bold text-slate-800"
                    >
                      Full name
                    </Label>

                    <span className="text-[11px] font-medium text-slate-400">
                      Applicant identity
                    </span>
                  </div>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="name"
                      value={applicant.name}
                      onChange={(e) =>
                        set("name", e.target.value)
                      }
                      placeholder="e.g. Ramesh Kadam"
                      className={cn(
                        "h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition-all",
                        "focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10",
                        nameError &&
                          "border-rose-400 focus:border-rose-400 focus:ring-rose-500/10",
                      )}
                      aria-invalid={nameError}
                      aria-describedby={
                        nameError ? "name-err" : undefined
                      }
                      autoComplete="name"
                    />
                  </div>

                  {nameError && (
                    <motion.p
                      id="name-err"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold text-rose-600"
                    >
                      Please enter the applicant&apos;s name.
                    </motion.p>
                  )}
                </motion.div>

                {/* OCCUPATION */}
                <motion.div
                  variants={fadeUp}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-sm font-bold text-slate-800">
                      Occupation
                    </Label>

                    <p className="mt-1 text-xs text-slate-400">
                      Select the applicant&apos;s primary source of livelihood.
                    </p>
                  </div>

                  <fieldset>
                    <legend className="sr-only">
                      Occupation
                    </legend>

                    <div
                      role="radiogroup"
                      aria-label="Occupation"
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                    >
                      {OCCUPATIONS.map((occupation) => {
                        const selected =
                          applicant.occupation === occupation.id;

                        return (
                          <motion.button
                            key={occupation.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            whileHover={{
                              y: -3,
                              scale: 1.01,
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            onClick={() =>
                              set(
                                "occupation",
                                occupation.id,
                              )
                            }
                            className={cn(
                              "group relative min-h-[132px] cursor-pointer overflow-hidden rounded-2xl border p-4 text-center transition-all duration-200",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                              selected
                                ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30",
                              occupationError &&
                                "border-rose-300",
                            )}
                          >
                            {selected && (
                              <motion.div
                                layoutId="occupation-selected"
                                className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white"
                              >
                                <Check className="h-3 w-3" />
                              </motion.div>
                            )}

                            <motion.span
                              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl ring-1 ring-slate-100 transition-colors group-hover:bg-white"
                              animate={
                                selected
                                  ? { scale: 1.08 }
                                  : { scale: 1 }
                              }
                            >
                              {occupation.emoji}
                            </motion.span>

                            <span
                              className={cn(
                                "mt-3 block text-sm font-bold",
                                selected
                                  ? "text-indigo-700"
                                  : "text-slate-800",
                              )}
                            >
                              {occupation.label}
                            </span>

                            <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                              {occupation.hint}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {occupationError && (
                    <p className="text-xs font-semibold text-rose-600">
                      Please select an occupation.
                    </p>
                  )}
                </motion.div>

                {/* LOCATION + PURPOSE */}
                <motion.div
                  variants={fadeUp}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="city"
                      className="text-sm font-bold text-slate-800"
                    >
                      Location
                    </Label>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Select
                        id="city"
                        value={applicant.city}
                        onChange={(e) =>
                          set("city", e.target.value)
                        }
                        className={cn(
                          "h-12 rounded-xl bg-slate-50/50 pl-11",
                          cityError && "border-rose-400",
                        )}
                      >
                        {CITIES.map((city) => (
                          <option key={city}>
                            {city}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {cityError && (
                      <p className="text-xs font-semibold text-rose-600">
                        Please select a location.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="purpose"
                      className="text-sm font-bold text-slate-800"
                    >
                      Loan purpose
                    </Label>

                    <Select
                      id="purpose"
                      value={applicant.purpose}
                      onChange={(e) =>
                        set("purpose", e.target.value)
                      }
                      className={cn(
                        "h-12 rounded-xl bg-slate-50/50",
                        purposeError && "border-rose-400",
                      )}
                    >
                      {PURPOSES.map((purpose) => (
                        <option key={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </Select>

                    {purposeError && (
                      <p className="text-xs font-semibold text-rose-600">
                        Please select a loan purpose.
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* INCOME */}
                <motion.div
                  variants={fadeUp}
                  className={cn(
                    "rounded-2xl border bg-slate-50/60 p-5 sm:p-6",
                    incomeError
                      ? "border-rose-300"
                      : "border-slate-200",
                  )}
                >
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <Label
                        id="income-label"
                        className="text-sm font-bold text-slate-800"
                      >
                        Rough monthly income
                      </Label>

                      <p className="mt-1 text-xs text-slate-400">
                        Approximate income is enough.
                      </p>
                    </div>

                    <motion.div
                      key={applicant.monthlyIncome}
                      initial={{
                        scale: 0.92,
                        opacity: 0.6,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200"
                    >
                      <IndianRupee className="h-4 w-4 text-indigo-600" />

                      <span className="text-lg font-extrabold tabular-nums text-indigo-700">
                        {inr(applicant.monthlyIncome)}
                      </span>
                    </motion.div>
                  </div>

                  <div className="mt-6">
                    <Slider
                      aria-labelledby="income-label"
                      thumbLabel="Monthly income in rupees"
                      min={5000}
                      max={80000}
                      step={1000}
                      value={[applicant.monthlyIncome]}
                      onValueChange={([value]) =>
                        set("monthlyIncome", value)
                      }
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>₹5k</span>
                    <span>₹80k</span>
                  </div>

                  {incomeError && (
                    <p className="mt-3 text-xs font-semibold text-rose-600">
                      Please provide a valid monthly income.
                    </p>
                  )}
                </motion.div>

                {/* LOAN AMOUNT */}
                <motion.div
                  variants={fadeUp}
                  className="space-y-3"
                >
                  <div>
                    <Label
                      htmlFor="loan"
                      className="text-sm font-bold text-slate-800"
                    >
                      Loan amount wanted
                    </Label>

                    <p className="mt-1 text-xs text-slate-400">
                      Enter the approximate amount the applicant needs.
                    </p>
                  </div>

                  <div className="relative">
                    <IndianRupee className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <Input
                      id="loan"
                      type="number"
                      inputMode="numeric"
                      min={1000}
                      max={500000}
                      step={500}
                      value={applicant.loanAmount}
                      onChange={(e) =>
                        set(
                          "loanAmount",
                          Math.max(
                            0,
                            Number(e.target.value) || 0,
                          ),
                        )
                      }
                      className={cn(
                        "h-12 rounded-xl bg-slate-50/50 pl-11 text-base font-semibold tabular-nums focus:bg-white",
                        loanError && "border-rose-400",
                      )}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[10000, 25000, 50000].map((value) => {
                      const selected =
                        applicant.loanAmount === value;

                      return (
                        <motion.button
                          key={value}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            set("loanAmount", value)
                          }
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                            selected
                              ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700",
                          )}
                        >
                          {inr(value)}
                        </motion.button>
                      );
                    })}
                  </div>

                  {loanError && (
                    <p className="text-xs font-semibold text-rose-600">
                      Please enter a valid loan amount.
                    </p>
                  )}
                </motion.div>

                {/* SUBMIT */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    Consent-first scoring
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="group h-12 rounded-xl bg-indigo-600 px-7 font-bold shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25"
                  >
                    Continue to data signals

                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT INTELLIGENCE PANEL */}
        <motion.aside
          variants={fadeUp}
          className="space-y-4"
        >
          <Card className="overflow-hidden border-0 bg-[#1E1B4B] text-white shadow-xl shadow-indigo-950/10">
            <CardContent className="relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                      <Wallet className="h-4 w-4 text-teal-300" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                        Live profile
                      </p>

                      <p className="text-[11px] text-indigo-200/60">
                        Updates as you type
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 text-[10px] font-bold text-teal-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
                    LIVE
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-medium text-indigo-200/60">
                    Applicant
                  </p>

                  <p className="mt-1 truncate text-2xl font-extrabold">
                    {applicant.name.trim() || "New applicant"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedOccupation && (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                        {selectedOccupation.emoji}{" "}
                        {selectedOccupation.label}
                      </span>
                    )}

                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {applicant.city}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/60">
                      Monthly income
                    </p>

                    <p className="mt-2 text-lg font-extrabold tabular-nums">
                      {inr(applicant.monthlyIncome)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/60">
                      Loan request
                    </p>

                    <p className="mt-2 text-lg font-extrabold tabular-nums">
                      {inr(applicant.loanAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-100/70">
                      Loan purpose
                    </span>

                    <span className="text-xs font-bold text-white">
                      {applicant.purpose}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Why this matters
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Beyond traditional credit
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-4xl font-black tracking-tight text-slate-950">
                  ~40
                  <span className="text-indigo-600">cr</span>
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  working Indians have little or no bureau history — yet
                  earn, spend, pay and save every day.
                </p>
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <p className="text-sm leading-6 text-slate-600">
                BharatScore looks at the rhythm of everyday financial
                life — UPI payments, bills, recharges and mandi activity —
                to create an explainable credit signal.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 bg-teal-50/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Consent-first
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Only data explicitly shared by the applicant is used.
                    BharatScore provides the signal — lenders make the
                    final decision.
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