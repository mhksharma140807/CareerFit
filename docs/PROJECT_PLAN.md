# CareerFit — Project Plan & Status

> **Reference Note**: Consult `docs/CAREERFIT_MASTER_PLAN.md` for the authoritative 25-page route inventory, user journeys, access control architecture, and page-to-API dependency matrix.

## Project Scope
CareerFit is a Career Readiness and Job Matching Platform designed as a college major project (B.Tech CSE). It enables students to evaluate placement readiness by comparing verified skills against industry job descriptions, identifying skill gaps, attempting role-linked aptitude and technical assessments, and receiving actionable readiness reports and improvement plans.

---

## Implementation Milestone Checklist

### Phase 1: Architecture & Foundation (COMPLETED)
- [x] Workspace inspection & tooling verification (Node v24, npm v11, Git).
- [x] Permanent project rules (`AGENTS.md`) and architectural documentation (`docs/`).
- [x] Monorepo scaffolding (`/client` with Vite + React + Tailwind CSS, `/server` with Express + Mongoose).
- [x] Root orchestration setup (`package.json` concurrently dev scripts, `.gitignore`).
- [x] Environment configuration templates (`.env.example` across root/server/client).
- [x] Resilient database connection handling (`server/src/config/db.js` with degraded mode).
- [x] Foundational models (`User`, `StudentProfile`, `Job`, `Assessment`, `AssessmentAttempt`).
- [x] Core API structure & Health endpoint (`GET /api/health`, `/api/auth`).
- [x] Automated backend test suite (11 passing suites in `server/tests/api.test.js`).
- [x] End-to-end integration verification (`server/tests/verifyFlow.js`).

### Phase 2: Complete Application Modules (COMPLETED)
- [x] **Module A (Initial)**: Student Profile Backend & API (Deduplication, isolated ownership, CRUD).
- [x] **Module B (Initial)**: Job Management Backend & Seed (Idempotent seed, search/filter, admin write auth).
- [x] **Module 1**: Client Routing Foundation & Shared Layouts (`react-router-dom`, `PublicLayout`, `AuthLayout`, `StudentLayout`, `AdminLayout`, `AssessmentAttemptLayout`, route guards).
- [x] **Module 2**: Authentication & Student Profile Views (Dedicated `/login`, `/register`, complete profile view/edit, education, projects, experience).
- [x] **Module 3**: Resume Handling & Extraction (`/resume`, multer upload, keyword detection, profile merge, manual fallback).
- [x] **Module 4**: Job Directory & Dedicated Details (Standalone `/jobs`, `/jobs/:id`, search/filter controls, "Analyze Match" CTA).
- [x] **Module 5**: Deterministic Skill Matching & Gap Engine (`/jobs/:id/match`, Venn gap breakdown: matched, missing mandatory, missing preferred, bonus skills).
- [x] **Module 6**: Placement Assessments, Server-Side Scoring & Seeded Question Bank (Seed 30 reviewed placement MCQs across Quantitative, Logical, JS, SQL, Core CS; `/assessments` catalog; `/assessments/:id/attempt` exam view; `/assessments/attempts/:attemptId` diagnostic; server-side scoring).
- [x] **Module 7**: Career Readiness Reports, Improvement Plan & Progress History (Approved 60/40 composite index engine: 0.60 * Skill Match + 0.40 * Assessment Score; standalone `/improvement-plan` checklist; `/reports/:reportId` with browser print; `/progress` trajectory tables).
- [x] **Module 8**: Saved Jobs, Genuine Notifications, Settings & Help (`/saved-jobs` shortlist; REST-based `/notifications` feed backed by 4 approved genuine event triggers; `/settings` security/preferences; `/help` FAQ accordions).
- [x] **Module 9**: Admin Management Suite (`/admin` dashboard, `/admin/jobs` CRUD, `/admin/assessments` question bank, `/admin/users` student directory).
- [x] **Module 10**: Quality Verification, Accessibility & Viva Demonstration (Verified clean client build with 0 errors in 8.2s, server files syntax checked, ₹0 budget compliance check).

### Phase 3: AI Capabilities & Hybrid Architecture (COMPLETED)
- [x] Document Parser & Stream Decompression (`pdf-parse` v2 for FlateDecode streams, `mammoth` for DOCX, section segmentation).
- [x] Comprehensive CSE Skill Taxonomy & Alias Normalizer (`skillTaxonomy.js` with 150+ skills across 8 categories, punctuation-safe regex for `C++`, `C#`, `.NET`, `Node.js`).
- [x] Modular Gemini Flash AI Adapter (`aiService.js` supporting `gemini-3.5-flash-lite` on free tier, PII redaction before transmission, strict JSON schema validation).
- [x] Autonomous Zero-Budget Fallback (100% deterministic local behavior when API key is unconfigured, times out, or rate limits; explicit `extractionSource: 'ai' | 'deterministic'`).
- [x] Multi-Dimensional Performance Analysis (Aptitude vs. Technical separation, weak-topic identification from question tags, 60/40 composite readiness formula preserved).
- [x] Verified unit & integration test suites (`resumeAndSkillEngine.test.js`, `documentExtractionFormats.test.js`).

### Phase 4: UI/UX Redesign & Brand Identity (COMPLETED)
- [x] Visual identity tokens & typography hierarchy (`Plus Jakarta Sans`, `Inter`, Royal Violet & Obsidian Glass palette).
- [x] Official SVG emblem and favicon (`favicon.svg`) with role-aware `BrandLogo` component integrated across all layouts.
- [x] Accessibility compliance (WCAG 2.1 AA keyboard navigation, contrast ratios, `@media (prefers-reduced-motion)`).
- [x] Micro-interactions, loading skeletons, radial gauges, and responsive mobile polish without touching core logic.
- [x] Animated two-column Hero section on Landing Page (`HomePage.jsx`).

### Phase 5: AI-Assisted Career Readiness & Platform Expansion (IN PROGRESS)
- [x] **Slice 1 (COMPLETED)**: Dynamic Custom Job Description Matcher & Universal Domain Intelligence.
  - Multi-domain JD understanding (Tech, Business, Finance, Marketing, HR, Design, Analytics).
  - Deterministic 85/15 Venn matching for custom pasted job descriptions (`POST /api/matching/custom-jd`).
  - Interactive "Analyze Custom JD" UI tab on `/jobs` with 1-click viva presets.
  - Explainable AI gap breakdown with deterministic offline fallback (`parseJobDescriptionDeterministic`).
  - 6 unit tests passing (`customJdMatching.test.js`).
- [x] **Slice 2 (COMPLETED)**: Dynamic AI-Assisted Assessment Generation & Adaptive Testing.
  - Batch question generation (8-10 MCQs) for any role or custom JD via Gemini Flash (`POST /api/assessments/adaptive/start`).
  - Reliable offline fallback question bank covering Tech, Data, Finance, and Product Management for demo resilience.
  - Practical adaptive question follow-up targeting weak competencies (<60% accuracy) (`POST /api/assessments/adaptive/:id/follow-up`).
  - Preserved immutable question snapshots in `AssessmentAttempt` for 100% reproducible viva scoring.
  - Interactive AI Career Tutor panel (`POST /api/assessments/tutor/explain`) for deep-dive doubt resolution.
  - 4 unit tests passing (`dynamicAssessment.test.js`).
- [x] **Slice 3 (COMPLETED)**: Written Professional Communication Assessment (English Only).
  - 8-dimension written response rubric (Clarity, Structure, Professional Tone, Relevance, Conciseness, Grammar, Problem Framing, Actionability).
  - Curated 7-domain scenario catalog (`Technology`, `Product`, `Finance`, `Data`, `Marketing`, `HR`, `Design`) and dynamic Gemini generation (`POST /api/communication/scenarios/generate`).
  - Deterministic NLP heuristic analyzer (`evaluateResponseDeterministic`) guaranteeing 100% offline resilience and ₹0 budget.
  - Interactive split-view editor (`/communication/assess`) with live word/character counts, format starters, and required element checklist.
  - Granular rubric report (`/communication/attempts/:id`) with 8-dimension progress visualizers, key strengths, improvement areas, and AI exemplar rewrites.
  - 6 unit tests passing (`communicationAssessment.test.js`) and 5 integration tests passing (`verifySlice3Integration.mjs`).
  - Transparent limitation notices (written workplace communication only; zero fake speech/audio).
- [ ] **Slice 4 (Next)**: AI Career Tutor & Structured Practice Workflows.
  - 7 structured learning workflows (weak topic explanation, mock interview, JD prep).
  - Atomic ₹0 quota safeguards in MongoDB (concurrency-safe, zero Redis).

---

## Current Status
- **Current Milestone**: Phase 5 / Slice 3 Complete $\rightarrow$ Advancing to Slice 4 (AI Career Tutor & Structured Practice Workflows).
- **Frontend State**: 28 routes operational with unified BrandLogo, light/dark Obsidian Glass design system, clean Vite build (0 errors).
- **Backend State**: Express API, deterministic 85/15 Venn matcher, 60/40 readiness index, Gemini Flash hybrid integration, adaptive testing engine, 8-dimension written communication evaluator, 100% offline fallback.
- **Immediate Next Step**: Implement Slice 4 — AI Career Tutor & Structured Practice Workflows with atomic ₹0 safeguards.
