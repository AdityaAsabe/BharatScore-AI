import type { Applicant, Occupation, Signals } from "./scoring";

export const OCCUPATIONS: { id: Occupation; emoji: string; label: string; hint: string }[] = [
  { id: "vendor", emoji: "🧺", label: "Street Vendor", hint: "Carts, stalls, haats" },
  { id: "farmer", emoji: "🌾", label: "Farmer", hint: "Crops, dairy, mandi" },
  { id: "gig", emoji: "🛵", label: "Gig Worker", hint: "Delivery, ride, tasks" },
  { id: "micro", emoji: "🧵", label: "Micro-entrepreneur", hint: "Tailoring, kirana, repair" },
  { id: "daily", emoji: "👷", label: "Daily Wage", hint: "Construction, loading" },
];

export const OCCUPATION_LABEL: Record<Occupation, string> = Object.fromEntries(
  OCCUPATIONS.map((o) => [o.id, o.label]),
) as Record<Occupation, string>;

export const CITIES = [
  "Pune","Pandharpur","Mumbai", "Nashik", "Patna", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Jaipur", "Lucknow", "Indore", "Ahmedabad", "Bhubaneswar", "Guwahati", "Coimbatore",
];

export const PURPOSES = ["Working capital", "Stock / inventory", "Seeds & fertiliser", "Two-wheeler repair", "Equipment", "Education", "Medical", "Home repair"];

export interface Persona {
  id: string;
  name: string;
  photo: string;
  tagline: string;
  story: string;
  strength: "Strong" | "Good" | "Emerging" | "Building";
  applicant: Applicant;
  signals: Signals;
}

export const PERSONAS: Persona[] = [
  {
    id: "ramesh",
    name: "Ramesh Kadam",
    photo: "/personas/ramesh.jpg",
    tagline: "Vegetable vendor · Pune",
    story: "Runs a sabzi cart in Kothrud. 40+ UPI payments a week and 3 years of on-time electricity bills.",
    strength: "Strong",
    applicant: { name: "Ramesh Kadam", occupation: "vendor", city: "Pune", monthlyIncome: 28000, loanAmount: 30000, purpose: "Stock / inventory" },
    signals: { upiPerWeek: 42, billsOnTimePct: 85, rechargePct: 80, incomeStabilityPct: 60, marketPct: 45, monthsAtLocation: 36 },
  },
  {
    id: "sunita",
    name: "Sunita Devi",
    photo: "/personas/sunita.jpg",
    tagline: "Small farmer · Nashik",
    story: "Grows onions on 2 acres. Seasonal income, but consistent mandi sales records every harvest for a decade.",
    strength: "Good",
    applicant: { name: "Sunita Devi", occupation: "farmer", city: "Nashik", monthlyIncome: 18000, loanAmount: 25000, purpose: "Seeds & fertiliser" },
    signals: { upiPerWeek: 21, billsOnTimePct: 80, rechargePct: 75, incomeStabilityPct: 72, marketPct: 90, monthsAtLocation: 120 },
  },
  {
    id: "meena",
    name: "Meena Kumari",
    photo: "/personas/meena.jpg",
    tagline: "Tailor · Patna",
    story: "New to credit. Small but perfectly regular UPI usage from her tailoring shop, opened 14 months ago.",
    strength: "Building",
    applicant: { name: "Meena Kumari", occupation: "micro", city: "Patna", monthlyIncome: 14000, loanAmount: 15000, purpose: "Equipment" },
    signals: { upiPerWeek: 18, billsOnTimePct: 70, rechargePct: 90, incomeStabilityPct: 80, marketPct: 20, monthsAtLocation: 14 },
  },
  {
    id: "amit",
    name: "Amit Verma",
    photo: "/personas/amit.jpg",
    tagline: "Delivery gig worker · Mumbai",
    story: "Delivers across Andheri on two apps. Earns well some weeks, less in others; bills are a mixed record.",
    strength: "Emerging",
    applicant: { name: "Amit Verma", occupation: "gig", city: "Mumbai", monthlyIncome: 22000, loanAmount: 20000, purpose: "Two-wheeler repair" },
    signals: { upiPerWeek: 32, billsOnTimePct: 50, rechargePct: 45, incomeStabilityPct: 30, marketPct: 10, monthsAtLocation: 8 },
  },
];

export const DEFAULT_APPLICANT: Applicant = {
  name: "",
  occupation: "vendor",
  city: "Pune",
  monthlyIncome: 20000,
  loanAmount: 25000,
  purpose: "Working capital",
};

export const DEFAULT_SIGNALS: Signals = PERSONAS[0].signals;
