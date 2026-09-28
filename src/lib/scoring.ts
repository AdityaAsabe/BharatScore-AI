/**
 * BharatScore AI — scoring engine (model v0.2, client-side mock).
 *
 * This module is intentionally pure and side-effect free so it can later be
 * swapped for a real API call (e.g. POST /v1/score) without touching the UI.
 */

export const MODEL_VERSION = "v0.2";

export const WEIGHTS = {
  upi: 0.3,
  bills: 0.25,
  income: 0.2,
  recharge: 0.1,
  market: 0.1,
  stability: 0.05,
} as const;

export type FactorKey = keyof typeof WEIGHTS;

/** Raw, consented alternative-data signals. */
export interface Signals {
  /** UPI transactions per week (0–80) */
  upiPerWeek: number;

  /** Utility bills paid on time, % (0–100) */
  billsOnTimePct: number;

  /** Mobile recharge consistency, % (0–100) */
  rechargePct: number;

  /** Income stability, % (0–100) */
  incomeStabilityPct: number;

  /** Market / mandi record strength, % (0–100) */
  marketPct: number;

  /** Months at the same location (1–120) */
  monthsAtLocation: number;
}

export type Occupation =
  | "vendor"
  | "farmer"
  | "gig"
  | "micro"
  | "daily";

export interface Applicant {
  name: string;
  occupation: Occupation;
  city: string;
  monthlyIncome: number;
  loanAmount: number;
  purpose: string;
}

export type Band =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Needs Improvement";

export type Decision =
  | "APPROVE"
  | "APPROVE_WITH_CONDITIONS"
  | "MANUAL_REVIEW"
  | "DECLINE";

export interface FactorResult {
  key: FactorKey;

  /** English */
  label: string;

  /** Hindi */
  labelHi: string;

  /** Marathi */
  labelMr: string;

  weight: number;

  /** normalized feature 0..1 */
  value: number;

  /** points contributed above the 300 floor */
  points: number;

  /** maximum possible points for this factor */
  maxPoints: number;
}

export interface Recommendation {
  decision: Decision;
  label: string;
  limitMin: number;
  limitMax: number;
  tenureMonths: number;
  secured: boolean;

  /** English improvement tips */
  tips: string[];

  /** Hindi improvement tips */
  tipsHi: string[];

  /** Marathi improvement tips */
  tipsMr: string[];
}

export interface ScoreResult {
  score: number;
  band: Band;
  factors: FactorResult[];
  recommendation: Recommendation;
  confidence: number;
}

export const FACTOR_META: Record<
  FactorKey,
  {
    label: string;
    labelHi: string;
    labelMr: string;
  }
> = {
  upi: {
    label: "UPI Regularity",
    labelHi: "UPI नियमितता",
    labelMr: "UPI नियमितता",
  },

  bills: {
    label: "Bill Discipline",
    labelHi: "बिल भुगतान अनुशासन",
    labelMr: "बिल भरण्याची शिस्त",
  },

  income: {
    label: "Income Stability",
    labelHi: "आय स्थिरता",
    labelMr: "उत्पन्न स्थिरता",
  },

  recharge: {
    label: "Recharge Consistency",
    labelHi: "रिचार्ज निरंतरता",
    labelMr: "रिचार्ज नियमितता",
  },

  market: {
    label: "Market/Mandi Records",
    labelHi: "बाज़ार/मंडी रिकॉर्ड",
    labelMr: "बाजार/मंडी नोंदी",
  },

  stability: {
    label: "Stability Index",
    labelHi: "स्थिरता सूचकांक",
    labelMr: "स्थिरता निर्देशांक",
  },
};

export const SIGNAL_LIMITS = {
  upiPerWeek: { min: 0, max: 80 },
  billsOnTimePct: { min: 0, max: 100 },
  rechargePct: { min: 0, max: 100 },
  incomeStabilityPct: { min: 0, max: 100 },
  marketPct: { min: 0, max: 100 },
  monthsAtLocation: { min: 1, max: 120 },
} as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * UPI saturates at 50 txns/week;
 * location stability saturates at 5 years.
 */
export function normalize(
  s: Signals,
): Record<FactorKey, number> {
  return {
    upi: clamp(s.upiPerWeek / 50, 0, 1),
    bills: clamp(s.billsOnTimePct / 100, 0, 1),
    income: clamp(s.incomeStabilityPct / 100, 0, 1),
    recharge: clamp(s.rechargePct / 100, 0, 1),
    market: clamp(s.marketPct / 100, 0, 1),
    stability: clamp(s.monthsAtLocation / 60, 0, 1),
  };
}

export function computeScore(s: Signals): number {
  const f = normalize(s);

  const sum = (
    Object.keys(WEIGHTS) as FactorKey[]
  ).reduce(
    (acc, k) => acc + WEIGHTS[k] * f[k],
    0,
  );

  return clamp(
    Math.round(300 + 600 * sum),
    300,
    900,
  );
}

export function bandFor(score: number): Band {
  if (score >= 750) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 550) return "Fair";

  return "Needs Improvement";
}

/* -----------------------------------------
   Band translations
----------------------------------------- */

export const BAND_HI: Record<Band, string> = {
  Excellent: "उत्कृष्ट",
  Good: "अच्छा",
  Fair: "ठीक-ठाक",
  "Needs Improvement": "सुधार की ज़रूरत",
};

export const BAND_MR: Record<Band, string> = {
  Excellent: "उत्कृष्ट",
  Good: "चांगला",
  Fair: "समाधानकारक",
  "Needs Improvement": "सुधारणेची गरज",
};

export const DECISION_LABEL: Record<
  Decision,
  string
> = {
  APPROVE: "APPROVE",
  APPROVE_WITH_CONDITIONS:
    "APPROVE WITH CONDITIONS",
  MANUAL_REVIEW: "MANUAL REVIEW",
  DECLINE: "DECLINE — COACH & RE-SCORE",
};

/* -----------------------------------------
   Improvement tips
----------------------------------------- */

const TIP_BANK: Record<
  FactorKey,
  {
    en: string;
    hi: string;
    mr: string;
  }
> = {
  upi: {
    en: "Accept more customer payments via UPI — even small ₹20–₹50 sales build a visible, regular record.",
    hi: "ग्राहकों से ज़्यादा भुगतान UPI से लें — ₹20–₹50 की छोटी बिक्री भी नियमित रिकॉर्ड बनाती है।",
    mr: "ग्राहकांकडून अधिक पेमेंट UPI द्वारे स्वीकारा — ₹20–₹50 सारख्या छोट्या विक्रीमुळेही नियमित आणि स्पष्ट व्यवहार नोंद तयार होते.",
  },

  bills: {
    en: "Set a monthly reminder to pay electricity and water bills before the due date.",
    hi: "बिजली और पानी के बिल समय से पहले भरने के लिए हर महीने रिमाइंडर लगाएँ।",
    mr: "वीज आणि पाण्याची बिले अंतिम तारखेपूर्वी भरण्यासाठी दर महिन्याला रिमाइंडर लावा.",
  },

  income: {
    en: "Route your earnings into one bank account so steady income becomes easier to see.",
    hi: "अपनी कमाई एक ही बैंक खाते में जमा करें ताकि स्थिर आय साफ़ दिखे।",
    mr: "तुमचे उत्पन्न एका बँक खात्यात जमा करा, त्यामुळे नियमित उत्पन्न स्पष्टपणे दिसून येईल.",
  },

  recharge: {
    en: "Switch to a monthly mobile plan and recharge on the same date each month.",
    hi: "मासिक मोबाइल प्लान लें और हर महीने एक ही तारीख को रिचार्ज करें।",
    mr: "मासिक मोबाइल प्लॅन वापरा आणि दर महिन्याला त्याच तारखेला रिचार्ज करा.",
  },

  market: {
    en: "Keep mandi / market receipts or register on e-NAM / a vendor app to record your sales.",
    hi: "मंडी/बाज़ार की रसीदें संभालें या e-NAM / वेंडर ऐप पर बिक्री दर्ज करें।",
    mr: "मंडी किंवा बाजाराच्या पावत्या जतन करा किंवा e-NAM / विक्रेता अॅपवर तुमच्या विक्रीची नोंद ठेवा.",
  },

  stability: {
    en: "Update your address on Aadhaar and bills — time at one place counts in your favour.",
    hi: "आधार और बिलों पर अपना पता अपडेट करें — एक जगह पर बिताया समय आपके पक्ष में गिना जाता है।",
    mr: "आधार आणि बिलांवरील तुमचा पत्ता अपडेट ठेवा — एका ठिकाणी जास्त काळ राहणे तुमच्या स्थिरतेच्या नोंदीसाठी उपयुक्त ठरते.",
  },
};

/* -----------------------------------------
   Recommendation engine
----------------------------------------- */

export function recommend(
  score: number,
  factors: FactorResult[],
  requested = Infinity,
): Recommendation {
  const weakest = [...factors]
    .sort(
      (a, b) =>
        a.maxPoints -
        a.points -
        (b.maxPoints - b.points),
    )
    .reverse()
    .slice(0, 3);

  const tips = weakest.map(
    (f) => TIP_BANK[f.key].en,
  );

  const tipsHi = weakest.map(
    (f) => TIP_BANK[f.key].hi,
  );

  const tipsMr = weakest.map(
    (f) => TIP_BANK[f.key].mr,
  );

  const cap = (n: number) =>
    Math.min(n, Math.max(requested, 1000));

  if (score >= 750) {
    return {
      decision: "APPROVE",
      label: "Approve",
      limitMin: 0,
      limitMax: cap(50000),
      tenureMonths: 12,
      secured: false,
      tips: [],
      tipsHi: [],
      tipsMr: [],
    };
  }

  if (score >= 650) {
    return {
      decision: "APPROVE_WITH_CONDITIONS",
      label: "Approve with conditions",
      limitMin: 0,
      limitMax: cap(25000),
      tenureMonths: 6,
      secured: false,
      tips: tips.slice(0, 1),
      tipsHi: tipsHi.slice(0, 1),
      tipsMr: tipsMr.slice(0, 1),
    };
  }

  if (score >= 550) {
    return {
      decision: "MANUAL_REVIEW",
      label: "Manual review — small secured loan",
      limitMin: 5000,
      limitMax: cap(10000),
      tenureMonths: 6,
      secured: true,
      tips: tips.slice(0, 2),
      tipsHi: tipsHi.slice(0, 2),
      tipsMr: tipsMr.slice(0, 2),
    };
  }

  return {
    decision: "DECLINE",
    label: "Decline for now",
    limitMin: 0,
    limitMax: 0,
    tenureMonths: 0,
    secured: false,
    tips,
    tipsHi,
    tipsMr,
  };
}

/* -----------------------------------------
   Main scoring function
----------------------------------------- */

export function scoreApplicant(
  s: Signals,
  requested?: number,
): ScoreResult {
  const f = normalize(s);

  const factors: FactorResult[] = (
    Object.keys(WEIGHTS) as FactorKey[]
  ).map((k) => ({
    key: k,

    label: FACTOR_META[k].label,

    labelHi: FACTOR_META[k].labelHi,

    labelMr: FACTOR_META[k].labelMr,

    weight: WEIGHTS[k],

    value: f[k],

    points: Math.round(
      600 * WEIGHTS[k] * f[k],
    ),

    maxPoints: Math.round(
      600 * WEIGHTS[k],
    ),
  }));

  const score = computeScore(s);

  const sum = (score - 300) / 600;

  // Confidence rises with signal strength
  // and coverage (non-zero signals).
  const coverage =
    factors.filter(
      (x) => x.value > 0.05,
    ).length / factors.length;

  const confidence = Math.round(
    clamp(
      52 + 30 * sum + 8 * coverage,
      40,
      97,
    ),
  );

  return {
    score,
    band: bandFor(score),
    factors,
    recommendation: recommend(
      score,
      factors,
      requested,
    ),
    confidence,
  };
}

/* ------------------------------------------------------------------ */
/* Plain-language explanations                                         */
/* ------------------------------------------------------------------ */

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

function tenureText(months: number) {
  if (months >= 24) {
    return `${Math.round(months / 12)} years`;
  }

  if (months >= 12) {
    return `${(months / 12).toFixed(
      months % 12 === 0 ? 0 : 1,
    )} year${months >= 24 ? "s" : ""}`;
  }

  return `${months} months`;
}

function tenureTextHi(months: number) {
  if (months >= 12) {
    return `${Math.round(months / 12)} साल`;
  }

  return `${months} महीने`;
}

function tenureTextMr(months: number) {
  if (months >= 12) {
    return `${Math.round(months / 12)} वर्षे`;
  }

  return `${months} महिने`;
}

/* -----------------------------------------
   Multilingual explanation
----------------------------------------- */

export function explain(
  result: ScoreResult,
  s: Signals,
  name: string,
  lang: "en" | "hi" | "mr",
): string[] {
  const first =
    name.trim().split(" ")[0] ||
    (lang === "en"
      ? "You"
      : lang === "hi"
        ? "आप"
        : "तुम्ही");

  const top = [...result.factors].sort(
    (a, b) => b.value - a.value,
  );

  const low = [...result.factors].sort(
    (a, b) => a.value - b.value,
  )[0];

  const r = result.recommendation;

  /* -----------------------------------------
     ENGLISH
  ----------------------------------------- */

  if (lang === "en") {
    const regular =
      s.upiPerWeek >= 35
        ? "high regularity"
        : s.upiPerWeek >= 15
          ? "steady regularity"
          : "a small but growing rhythm";

    const lines = [
      `${first}, your BharatScore is ${result.score} (${result.band}).`,

      `You made ~${s.upiPerWeek} UPI transactions every week with ${regular}, and paid ${s.billsOnTimePct}% of utility bills on time over ${tenureText(s.monthsAtLocation)} at the same address.`,

      `Your strongest signals are ${top[0].label} and ${top[1].label}. Recharges were ${s.rechargePct}% consistent and income stability is ${s.incomeStabilityPct}%.`,
    ];

    if (r.decision === "APPROVE") {
      lines.push(
        `This earned record supports a loan of up to ${inr(r.limitMax)} for ${r.tenureMonths} months.`,
      );
    } else if (
      r.decision === "APPROVE_WITH_CONDITIONS"
    ) {
      lines.push(
        `This supports a starter loan of up to ${inr(r.limitMax)} for ${r.tenureMonths} months. Improving ${low.label} can unlock more.`,
      );
    } else if (
      r.decision === "MANUAL_REVIEW"
    ) {
      lines.push(
        `A lender can start you with a small secured loan of ${inr(r.limitMin)}–${inr(r.limitMax)} while your record grows. ${low.label} is the quickest lever.`,
      );
    } else {
      lines.push(
        `Your record is becoming visible. A few consistent months — especially in ${low.label} — can move you into the approval range.`,
      );
    }

    return lines;
  }

  /* -----------------------------------------
     HINDI
  ----------------------------------------- */

  if (lang === "hi") {
    const regularHi =
      s.upiPerWeek >= 35
        ? "बहुत नियमित रूप से"
        : s.upiPerWeek >= 15
          ? "स्थिर रूप से"
          : "धीरे-धीरे बढ़ती नियमितता के साथ";

    const lines = [
      `${first}, आपका भारतस्कोर ${result.score} (${BAND_HI[result.band]}) है।`,

      `आपने हर हफ़्ते लगभग ${s.upiPerWeek} UPI लेन-देन ${regularHi} किए, और एक ही पते पर ${tenureTextHi(s.monthsAtLocation)} में ${s.billsOnTimePct}% बिजली-पानी के बिल समय पर भरे।`,

      `आपके सबसे मज़बूत संकेत ${top[0].labelHi} और ${top[1].labelHi} हैं। रिचार्ज ${s.rechargePct}% नियमित रहे और आय स्थिरता ${s.incomeStabilityPct}% है।`,
    ];

    if (r.decision === "APPROVE") {
      lines.push(
        `आपके इस कमाए हुए रिकॉर्ड के आधार पर ${r.tenureMonths} महीनों के लिए ${inr(r.limitMax)} तक का ऋण संभव है।`,
      );
    } else if (
      r.decision === "APPROVE_WITH_CONDITIONS"
    ) {
      lines.push(
        `इसके आधार पर ${r.tenureMonths} महीनों के लिए ${inr(r.limitMax)} तक का शुरुआती ऋण संभव है। ${low.labelHi} सुधारने से और ज़्यादा मिल सकता है।`,
      );
    } else if (
      r.decision === "MANUAL_REVIEW"
    ) {
      lines.push(
        `ऋणदाता आपको ${inr(r.limitMin)}–${inr(r.limitMax)} के छोटे सुरक्षित ऋण से शुरुआत करा सकते हैं। ${low.labelHi} सबसे तेज़ सुधार का रास्ता है।`,
      );
    } else {
      lines.push(
        `आपका रिकॉर्ड अब दिखने लगा है। कुछ महीनों की निरंतरता — ख़ासकर ${low.labelHi} में — आपको मंज़ूरी की सीमा तक ले जा सकती है।`,
      );
    }

    return lines;
  }

  /* -----------------------------------------
     MARATHI
  ----------------------------------------- */

  const regularMr =
    s.upiPerWeek >= 35
      ? "खूप नियमितपणे"
      : s.upiPerWeek >= 15
        ? "स्थिरपणे"
        : "हळूहळू वाढणाऱ्या नियमिततेसह";

  const lines = [
    `${first}, तुमचा BharatScore ${result.score} (${BAND_MR[result.band]}) आहे.`,

    `तुम्ही दर आठवड्याला सुमारे ${s.upiPerWeek} UPI व्यवहार ${regularMr} केले आणि एकाच पत्त्यावर ${tenureTextMr(s.monthsAtLocation)} राहून ${s.billsOnTimePct}% युटिलिटी बिले वेळेवर भरली.`,

    `तुमचे सर्वात मजबूत संकेत ${top[0].labelMr} आणि ${top[1].labelMr} आहेत. रिचार्ज ${s.rechargePct}% नियमित होते आणि उत्पन्न स्थिरता ${s.incomeStabilityPct}% आहे.`,
  ];

  if (r.decision === "APPROVE") {
    lines.push(
      `तुमच्या या नियमित नोंदीच्या आधारावर ${r.tenureMonths} महिन्यांसाठी ${inr(r.limitMax)} पर्यंतचे कर्ज शक्य आहे.`,
    );
  } else if (
    r.decision === "APPROVE_WITH_CONDITIONS"
  ) {
    lines.push(
      `या आधारावर ${r.tenureMonths} महिन्यांसाठी ${inr(r.limitMax)} पर्यंतचे सुरुवातीचे कर्ज शक्य आहे. ${low.labelMr} सुधारल्यास पुढे अधिक मर्यादा मिळू शकते.`,
    );
  } else if (
    r.decision === "MANUAL_REVIEW"
  ) {
    lines.push(
      `तुमची नोंद वाढत असताना कर्जदाता ${inr(r.limitMin)}–${inr(r.limitMax)} इतक्या छोट्या सुरक्षित कर्जापासून सुरुवात करू शकतो. ${low.labelMr} हा सर्वात जलद सुधारता येणारा घटक आहे.`,
    );
  } else {
    lines.push(
      `तुमची आर्थिक नोंद आता दिसू लागली आहे. काही महिने सातत्य ठेवणे — विशेषतः ${low.labelMr} मध्ये — तुम्हाला मंजुरीच्या श्रेणीत जाण्यास मदत करू शकते.`,
    );
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/* B2B API payload (mirrors the future POST /v1/score response)        */
/* ------------------------------------------------------------------ */

export function makeRequestId(
  seed: string,
): string {
  let h = 2166136261;

  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return (
    "bs_req_" +
    (h >>> 0)
      .toString(16)
      .padStart(8, "0") +
    "_" +
    seed.length.toString(36)
  );
}

export function buildApiResponse(
  applicant: Applicant,
  s: Signals,
  r: ScoreResult,
  requestId: string,
  timestamp: string,
) {
  return {
    request_id: requestId,

    model_version: MODEL_VERSION,

    timestamp,

    applicant: {
      name: applicant.name,
      occupation: applicant.occupation,
      city: applicant.city,
      requested_amount: applicant.loanAmount,
      purpose: applicant.purpose,
    },

    bharat_score: r.score,

    score_range: [300, 900],

    risk_band: r.band,

    confidence: +(r.confidence / 100).toFixed(2),

    factors: r.factors.map((f) => ({
      name: f.key,
      label: f.label,
      weight: f.weight,
      normalized: +f.value.toFixed(3),
      points: f.points,
      max_points: f.maxPoints,
    })),

    signals_used: {
      upi_txn_per_week: s.upiPerWeek,
      bills_on_time_pct: s.billsOnTimePct,
      recharge_consistency_pct: s.rechargePct,
      income_stability_pct: s.incomeStabilityPct,
      market_records_pct: s.marketPct,
      months_at_location: s.monthsAtLocation,
    },

    recommendation: {
      decision: r.recommendation.decision,
      suggested_limit_inr:
        r.recommendation.limitMax,
      min_limit_inr:
        r.recommendation.limitMin || undefined,
      tenure_months:
        r.recommendation.tenureMonths,
      secured: r.recommendation.secured,
      improvement_tips:
        r.recommendation.tips,
    },

    traditional_bureau:
      "no_history → likely_reject",

    consent: {
      status: "granted",
      scope: [
        "upi_summary",
        "utility_bills",
        "telecom",
        "market_records",
      ],
    },
  };
}