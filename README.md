<div align="center">

# BharatScore AI

### **Making the Credit-Invisible Visible**

`Alternative credit intelligence for Bharat` · `A B2B scoring API for NBFCs, MFIs & Banks`

**We never lend. We just see clearly.**

[![Java 25](https://img.shields.io/badge/Java-25-ED8B00?logo=java&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.8-6DB33F?logo=spring&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

</div>

---

## 🇮🇳 The Problem

- Roughly **75% of India's working-age population has no credit file** — the banking system literally cannot see them.
- Farmers, street vendors, gig riders and micro-entrepreneurs have repaid money, on time, for years — but every formal loan application ends the same way: **"no file → reject"**.
- Bureau scores (CIBIL etc.) are a **snapshot of the past**. Our users have no past to score — they have **behaviour**.

## 💡 The Solution

BharatScore AI scores people on **consented alternative data** — UPI activity, utility-bill discipline, income & gig payouts, digital footprint — and returns a **300–900 BharatScore + a lending recommendation** in a single REST call, in under a second.

| Bureau world | BharatScore world |
|---|---|
| Sees ~25% of India (those with a credit file) | Scores the other **75%** — from behaviour, not history |
| Output: *no file → likely reject* | Output: *804 · LOW risk · Approve ₹50,000 / 12 mo* |
| Needs lending history | Needs **consent** — that's it |

**We are a scoring engine, not a lender.** No RBI lending licence needed — we're the intelligence layer that NBFCs, MFIs and banks plug into via API.

## ⚙️ How It Works

```
Consented signals (0–100 each)
        │
        ▼
┌─────────────────────────────┐
│   WEIGHTED SCORING ENGINE    │
│  Σ (weightᵢ × scoreᵢ)       │
└─────────────────────────────┘
        │
        ▼
BharatScore = round(300 + 6 × weightedAvg)   →  300 – 900
        │
        ▼
Risk level (LOW / MEDIUM / HIGH)
        │
        ▼
Recommendation (action + limit + tenure + confidence)
```

**The 4 signals & weights**

| Signal | What it measures | Weight |
|---|---|---|
| UPI & Transaction Consistency | Regularity of digital payments & collections | **30%** |
| Utility Bill Discipline | % of bills paid on time | **25%** |
| Income & Employment Stability | Steadiness of income / gig payouts | **25%** |
| Digital Footprint Activity | Recharges, app payments, digital identity | **20%** |

**Risk levels & recommendations**

| BharatScore | Risk | Recommendation |
|---|---|---|
| ≥ 750 | LOW | **APPROVE** — up to ₹50,000 · 12 months |
| 600 – 749 | MEDIUM | **APPROVE WITH CONDITIONS** — ₹25,000 · 6 months |
| < 600 | HIGH | **REJECT WITH ROADMAP** — 3 actionable tips to improve the score |

> The "reject with roadmap" is by design: our users get a *path back into credit*, not a dead end.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | **Java 25** |
| Framework | **Spring Boot 4.0.8** |
| Data | **Spring Data JPA + Hibernate · PostgreSQL 16** |
| Security | **Spring Security · JWT (stateless) · BCrypt** |
| Build | **Maven** |
| REST | OpenAPI-ready controllers, DTOs + validation, global exception handling |

## 🏗️ Architecture

```
        Frontend (Next.js :3000 / demo UI)
                        │
                        │  Authorization: Bearer <JWT>
                        ▼
        ┌─────────────────────────────────────┐
        │        Spring Boot :8080            │
        │                                     │
        │  AuthController        (public)     │
        │  ApplicantController               │
        │  AlternativeDataController         │
        │  AssessmentController              │
        │     ├─ ScoringEngine               │
        │     ├─ RiskClassifier              │
        │     ├─ RecommendationEngine        │
        │     └─ persist Assessment          │
        └─────────────────────────────────────┘
                        │
                        ▼
        PostgreSQL  →  users · applicants · alternative_data
                       assessments · consents
```

## ✨ Features

- [x] **User authentication** — registration, login, email & password validation, BCrypt hashing, duplicate-email detection
- [x] **JWT security** — stateless, `Authorization: Bearer`, protected APIs, public register/login
- [x] **Applicant module** — full CRUD, persisted to PostgreSQL
- [x] **Alternative-data module** — 4 consented signals per applicant (1:1), full CRUD
- [x] **Weighted scoring engine** — transparent 30/25/25/20 weights, 300–900 scale
- [x] **Risk classification** — LOW / MEDIUM / HIGH
- [x] **Recommendation engine** — action + loan limit + tenure + confidence
- [x] **DTO layer** — request/response separation with Bean validation
- [x] **Global exception handling** — structured error JSON
- [x] **CORS** — configured for the frontend origin

## 🚀 Getting Started

**Prerequisites:** Java 25, Maven 3.9+, PostgreSQL 16 running locally.

```bash
# 1. Create the database
createdb bharatscore

# 2. Configure (application.properties / .env)
spring.datasource.url=jdbc:postgresql://localhost:5432/bharatscore
spring.datasource.username=<your-user>
spring.datasource.password=<your-password>
jwt.secret=<a-long-random-string-256-bit>

# 3. Run
mvn spring-boot:run
# → API on http://localhost:8080
```

## 🔌 API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users` | public | Register a partner user |
| POST | `/api/users/login` | public | Login → JWT |
| GET | `/api/users/me` | JWT | Current user |
| POST | `/api/applicants` | JWT | Create applicant |
| GET | `/api/applicants` | JWT | List applicants |
| GET | `/api/applicants/{id}` | JWT | Get applicant |
| PUT | `/api/applicants/{id}` | JWT | Update applicant |
| DELETE | `/api/applicants/{id}` | JWT | Delete applicant |
| POST | `/api/alternative-data` | JWT | Attach the 4 signals |
| GET | `/api/alternative-data/applicant/{id}` | JWT | Get signals for applicant |
| PUT/DELETE | `/api/alternative-data/{id}` | JWT | Update / delete |
| POST | `/api/assessments/calculate/{applicantId}` | JWT | **Run the scoring engine** |
| GET | `/api/model` | public | Weights + formula (transparency) |

**Example — run an assessment:**

```bash
curl -X POST http://localhost:8080/api/assessments/calculate/1 \
  -H "Authorization: Bearer <JWT>"
```

```json
{
  "bharat_score": 804,
  "risk_level": "LOW",
  "factors": [
    { "name": "UPI & Transaction Consistency", "weight": 0.30, "score": 82, "points": "+148" },
    { "name": "Utility Bill Discipline",       "weight": 0.25, "score": 85, "points": "+128" },
    { "name": "Income & Employment Stability", "weight": 0.25, "score": 90, "points": "+135" },
    { "name": "Digital Footprint Activity",    "weight": 0.20, "score": 78, "points": "+94" }
  ],
  "recommendation": {
    "action": "APPROVE",
    "suggested_limit_inr": 50000,
    "tenure_months": 12,
    "confidence": 0.88
  },
  "traditional_bureau": { "status": "no_history", "outcome": "likely_reject" },
  "model_version": "v1.0"
}
```

## 🎬 Demo Flow (5 minutes)

1. **Login** — partner signs in → JWT issued.
2. **Onboard Ramesh Kadam** — street vendor, Pune, ₹25,000 working-capital need.
3. **Attach alternative data** — UPI consistency 74, bills 84, income stability 60, digital 75.
4. **Calculate** — score lands at **~745 · MEDIUM → Approve with conditions, ₹25,000 / 6 mo**, factor breakdown animates.
5. **Contrast** — bureau: *no file → reject* · BharatScore: *approved*. Then show the rejection case (<600) returning **3 improvement tips**.

## 📁 Project Structure

```
src/main/java/com/bharatscore/
├── BharatScoreApplication.java
├── config/        SecurityConfig, JwtFilter, CorsConfig
├── controller/    Auth, Applicant, AlternativeData, Assessment
├── service/       AuthService, ApplicantService, ScoringEngine,
│                  RiskClassifier, RecommendationEngine
├── repository/    (JPA)
├── model/         (entities) User, Applicant, AlternativeData, Assessment, Consent
├── dto/           request / response records + validation
└── exception/     GlobalExceptionHandler
```

## 🧪 Testing

```bash
mvn test
```

Unit tests cover the scoring engine (exact expected scores per persona), risk classification boundaries (750 / 600), and JWT auth flow.

## 🗺️ Roadmap

- **Account Aggregator** integration (Sahamati/DEPAR) — real consented UPI/bank data
- **ML v2** — retrain weights on partner repayment outcomes; SHAP explainability
- **Microservices** — scoring, consent & notification services behind a Spring Cloud Gateway
- **Kafka** `score.generated` events → lender webhooks
- **Rate limiting + per-NBFC billing metering** at the API gateway

## ⚖️ Compliance & Ethics

- **Scoring-only.** BharatScore AI does not extend credit and holds no lending licence.
- **Consent-first.** Every score is computed only on data the applicant explicitly consented to.
- **DPDP Act 2023 aligned** — purpose-limited processing, user control, data minimisation.
- **Transparent model** — every score is reproducible from published weights (no black box).

## 👥 Team

| Role | Name |
|---|---|
| Backend · Scoring Engine | *(your name)* |
| Frontend · UX | *(name)* |
| Product · Demo | *(name)* |

<div align="center">

**© 2026 BharatScore AI · Made in India 🇮🇳**
*Built for a hackathon, designed for the 75% the system forgot.*

</div>
