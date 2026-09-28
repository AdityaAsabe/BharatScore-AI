"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileBadge2,
  Gauge,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Timer,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  buildApiResponse,
  type Applicant,
  type ScoreResult,
  type Signals,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";

import { CreditPassport } from "./credit-passport";

interface Props {
  applicant: Applicant;
  signals: Signals;
  result: ScoreResult;
  requestId: string;
  issuedAt: string;
  photo: string | null;
  onBack: () => void;
  onRestart: () => void;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(json: string) {
  return escapeHtml(json).replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      let cls = "text-amber-300";

      if (m.startsWith('"')) {
        cls = m.endsWith(":")
          ? "text-indigo-300"
          : "text-emerald-300";
      } else if (/true|false/.test(m)) {
        cls = "text-sky-300";
      } else if (m === "null") {
        cls = "text-rose-300";
      }

      return `<span class="${cls}">${m}</span>`;
    },
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");

    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";

    document.body.appendChild(ta);
    ta.select();

    const ok = document.execCommand("copy");

    document.body.removeChild(ta);

    return ok;
  }
}

function getDecisionMeta(decision: ScoreResult["recommendation"]["decision"]) {
  switch (decision) {
    case "APPROVE":
      return {
        label: "Approved",
        description: "Automated lender signal",
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        iconBg: "bg-emerald-50",
        textClass: "text-emerald-700",
        borderClass: "border-emerald-100",
      };

    case "APPROVE_WITH_CONDITIONS":
      return {
        label: "Conditional",
        description: "Review the recommended conditions",
        icon: AlertCircle,
        iconClass: "text-amber-600",
        iconBg: "bg-amber-50",
        textClass: "text-amber-700",
        borderClass: "border-amber-100",
      };

    case "MANUAL_REVIEW":
      return {
        label: "Manual Review",
        description: "Additional lender review required",
        icon: Timer,
        iconClass: "text-indigo-600",
        iconBg: "bg-indigo-50",
        textClass: "text-indigo-700",
        borderClass: "border-indigo-100",
      };

    default:
      return {
        label: "Not Ready",
        description: "Review applicant signals",
        icon: AlertCircle,
        iconClass: "text-rose-600",
        iconBg: "bg-rose-50",
        textClass: "text-rose-700",
        borderClass: "border-rose-100",
      };
  }
}

export function StepOutputs({
  applicant,
  signals,
  result,
  requestId,
  issuedAt,
  photo,
  onBack,
  onRestart,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const passportRef = useRef<HTMLDivElement>(null);

  const payload = useMemo(
    () =>
      buildApiResponse(
        applicant,
        signals,
        result,
        requestId,
        issuedAt,
      ),
    [applicant, signals, result, requestId, issuedAt],
  );

  const json = useMemo(
    () => JSON.stringify(payload, null, 2),
    [payload],
  );

  const html = useMemo(
    () => highlight(json),
    [json],
  );

  const curl = `curl -X POST https://api.bharatscore.ai/v1/score \\
  -H "Authorization: Bearer $BHARATSCORE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "applicant_ref": "${requestId}", "consent_artefact": "aa_consent_…", "signals": ${JSON.stringify(payload.signals_used)} }'`;

  const decisionMeta = getDecisionMeta(
    result.recommendation.decision,
  );
  const DecisionIcon = decisionMeta.icon;

  const scoreProgress = Math.max(
    0,
    Math.min(100, ((result.score - 300) / 600) * 100),
  );

  const onCopy = async (text: string, what: string) => {
    const ok = await copyText(text);

    if (ok) {
      setCopied(true);

      toast.success(`${what} copied to clipboard`);

      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error(
        "Couldn't copy — please select and copy manually.",
      );
    }
  };

const onDownload = async () => {
  const node = passportRef.current;

  if (!node) {
    toast.error("Credit Passport is not ready.");
    return;
  }

  setDownloading(true);

  try {
    const [{ toPng }, { jsPDF }] = await Promise.all([
      import("html-to-image"),
      import("jspdf"),
    ]);

    /*
     * The Credit Passport now contains two separate A5 sections:
     *
     * #credit-passport-page-1
     * #credit-passport-page-2
     *
     * Capture each section independently so that each becomes
     * a complete A5 PDF page.
     */
    const page1 = node.querySelector(
      "#credit-passport-page-1",
    ) as HTMLElement | null;

    const page2 = node.querySelector(
      "#credit-passport-page-2",
    ) as HTMLElement | null;

    if (!page1 || !page2) {
      throw new Error(
        "Credit Passport pages were not found.",
      );
    }

    /*
     * Render both passport pages as high-resolution PNGs.
     */
    const [page1DataUrl, page2DataUrl] = await Promise.all([
      toPng(page1, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: "#ffffff",
      }),
      toPng(page2, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: "#ffffff",
      }),
    ]);

    /*
     * Create an A5 portrait PDF.
     *
     * A5 = 148 × 210 mm
     */
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
      compress: true,
    });

    const pageWidth = 148;
    const pageHeight = 210;

    /*
     * PAGE 01
     *
     * Fill the entire A5 page.
     */
    pdf.addImage(
      page1DataUrl,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST",
    );

    /*
     * PAGE 02
     *
     * Add a completely new A5 page.
     */
    pdf.addPage("a5", "portrait");

    pdf.addImage(
      page2DataUrl,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST",
    );

    /*
     * PDF metadata.
     */
    pdf.setProperties({
      title: `BharatScore Credit Passport — ${applicant.name}`,
      subject: "BharatScore AI Digital Credit Credential",
      author: "BharatScore AI",
      creator: "BharatScore AI",
      keywords:
        "BharatScore AI, Credit Passport, BharatScore, Digital Credit Credential",
    });

    /*
     * Safe filename.
     */
    const safe = (applicant.name || "applicant")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    pdf.save(
      `bharatscore-passport-${safe || "applicant"}.pdf`,
    );

    toast.success("Credit Passport downloaded", {
      description:
        "Two-page A5 Credit Passport saved to your device.",
    });
  } catch (error) {
    console.error(
      "Credit Passport PDF generation failed:",
      error,
    );

    toast.message("Opening print dialog", {
      description:
        "Choose “Save as PDF” to download the two-page passport.",
    });

    window.print();
  } finally {
    setDownloading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* ================================================== */}
      {/* STEP 05 HEADER */}
      {/* ================================================== */}

      <section className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-50 via-white to-teal-50/50 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-teal-700">
                  <Check className="h-3.5 w-3.5" />
                  CREDIT DECISION COMPLETE
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  Your BharatScore is ready.
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  The score is now packaged into a lender-ready API
                  response and a portable Credit Passport.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-indigo-100 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <Gauge className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Final step
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-indigo-700">
                      05 / 05
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex min-w-max items-center justify-between">
            {[
              { number: "01", label: "Applicant" },
              { number: "02", label: "Alt-Data" },
              { number: "03", label: "BharatScore" },
              { number: "04", label: "Lender View" },
              { number: "05", label: "Outputs" },
            ].map((step, index) => {
              const active = index === 4;
              const completed = index < 4;

              return (
                <div
                  key={step.number}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold",
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : completed
                            ? "bg-teal-50 text-teal-600 ring-1 ring-teal-100"
                            : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {completed ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        step.number
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-xs font-bold",
                        active
                          ? "text-indigo-700"
                          : completed
                            ? "text-teal-600"
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* DECISION SUMMARY */}
      {/* ================================================== */}

      <section className="grid gap-4 lg:grid-cols-12">
        {/* Score */}
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                BharatScore
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-indigo-700">
                  {result.score}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / 900
                </span>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
              <Gauge className="h-5 w-5 text-indigo-600" />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-400">
                Credit readiness
              </span>
              <span className="text-indigo-600">
                {result.band}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${scoreProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decision */}
        <div
          className={cn(
            "rounded-2xl border bg-white p-5 shadow-sm lg:col-span-4",
            decisionMeta.borderClass,
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Credit Decision
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                decisionMeta.iconBg,
              )}
            >
              <DecisionIcon
                className={cn(
                  "h-5 w-5",
                  decisionMeta.iconClass,
                )}
              />
            </div>

            <div className="min-w-0">
              <p
                className={cn(
                  "text-lg font-extrabold leading-tight",
                  decisionMeta.textClass,
                )}
              >
                {decisionMeta.label}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {decisionMeta.description}
              </p>
            </div>
          </div>
        </div>

        {/* Suggested limit */}
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm lg:col-span-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suggested Credit Limit
          </p>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                ₹
                {result.recommendation.limitMax.toLocaleString(
                  "en-IN",
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Indicative maximum amount
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <span className="text-lg font-extrabold text-amber-600">
                ₹
              </span>
            </div>
          </div>
        </div>

        {/* Request metadata */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 lg:col-span-12">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scoring Request
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Unique reference generated for this BharatScore
                  decision.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="slate">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
                Consent-based
              </Badge>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <code className="font-mono text-xs font-bold text-slate-700">
                  {requestId}
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MAIN OUTPUT GRID */}
      {/* ================================================== */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        {/* API RESPONSE */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white px-6 py-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                    <Code2
                      className="h-5 w-5 text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <CardTitle className="text-lg font-extrabold text-slate-950">
                      API Response
                    </CardTitle>

                    <CardDescription className="mt-1 text-xs">
                      Lender-ready BharatScore response
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="green" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    200 OK
                  </Badge>

                  <Badge variant="slate" className="gap-1.5">
                    <Timer className="h-3 w-3" />
                    142 ms
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-600 px-2 py-1 font-mono text-[10px] font-extrabold tracking-wide text-white">
                    POST
                  </span>

                  <code className="font-mono text-xs font-semibold text-slate-600">
                    /v1/score
                  </code>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  BharatScore AI API
                  <span className="text-slate-300">•</span>
                  Production
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <Tabs defaultValue="response">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="response">
                    <Code2 />
                    Response
                  </TabsTrigger>

                  <TabsTrigger value="request">
                    <Terminal />
                    Request
                  </TabsTrigger>
                </TabsList>

                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => onCopy(json, "JSON")}
                  aria-label="Copy JSON response"
                  className="gap-2"
                >
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
              </div>

              {/* RESPONSE */}
              <TabsContent value="response">
                <div className="overflow-hidden rounded-2xl bg-[#0B1020] shadow-inner ring-1 ring-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />

                      <span className="ml-2 font-mono text-[10px] font-semibold text-slate-500">
                        response.json
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-white"
                      onClick={() =>
                        onCopy(json, "JSON response")
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy JSON
                    </Button>
                  </div>

                  <pre
                    className="max-h-[560px] overflow-auto p-5 font-mono text-[12px] leading-6 text-slate-300"
                    tabIndex={0}
                    aria-label="API response JSON"
                  >
                    <code
                      dangerouslySetInnerHTML={{
                        __html: html,
                      }}
                    />
                  </pre>
                </div>
              </TabsContent>

              {/* REQUEST */}
              <TabsContent value="request">
                <div className="overflow-hidden rounded-2xl bg-[#0B1020] shadow-inner ring-1 ring-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-indigo-300" />

                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        request.sh
                      </span>
                    </div>

                    <Badge variant="slate">
                      POST /v1/score
                    </Badge>
                  </div>

                  <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-all p-5 font-mono text-[12px] leading-6 text-emerald-300">
                    {curl}
                  </pre>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onCopy(curl, "cURL request")
                    }
                  >
                    <Copy />
                    Copy cURL
                  </Button>

                  <span className="text-[10px] font-medium text-slate-400">
                    Ready for lender integration
                  </span>
                </div>
              </TabsContent>
            </Tabs>

            {/* API trust strip */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Response
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  JSON
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Authentication
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  Bearer token
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Integration
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  REST API
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CREDIT PASSPORT */}
        <Card className="overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/60">
          <CardHeader className="border-b border-indigo-100/70 bg-white/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileBadge2
                    className="h-5 w-5 text-teal-600"
                    aria-hidden="true"
                  />
                  Credit Passport
                </CardTitle>

                <CardDescription className="mt-1">
                  A portable, shareable proof of an earned score —
                  the applicant keeps it.
                </CardDescription>
              </div>

              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 sm:flex">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            <CreditPassport
              ref={passportRef}
              applicant={applicant}
              result={result}
              requestId={requestId}
              issuedAt={issuedAt}
              photo={photo}
            />

            <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />

                <div>
                  <p className="text-xs font-extrabold text-teal-800">
                    Applicant-owned proof
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-teal-700/80">
                    The passport packages the decision into a
                    portable document that can be shared with a
                    lender.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="teal"
              size="lg"
              className="w-full"
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}

              {downloading
                ? "Preparing PDF…"
                : "Download Credit Passport"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ================================================== */}
      {/* FOOTER ACTIONS */}
      {/* ================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="justify-start"
        >
          <ArrowLeft />
          Lender view
        </Button>

        <Button
          variant="outline"
          onClick={onRestart}
        >
          <RotateCcw />
          Score another applicant
        </Button>
      </div>
    </div>
  );
}