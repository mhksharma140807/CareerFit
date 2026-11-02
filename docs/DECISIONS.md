# CareerFit — Architectural & Technical Decisions Log

## ADR-001: MERN Stack Selection & Pure JavaScript
- **Date / Milestone**: Phase 1
- **Status**: Implemented & verified
- **Decision**: Build the application using the MERN stack with standard modern JavaScript (ES Modules) across both `/client` (React + Vite) and `/server` (Express), avoiding TypeScript.
- **Rationale**: Keeps the codebase approachable and straightforward for college project viva explanations while maintaining high velocity and avoiding transpilation mismatch complexities during live demonstration.

## ADR-002: Deterministic Rule-Based Core Matching Before AI Integration
- **Date / Milestone**: Phase 1
- **Status**: Implemented & verified
- **Decision**: Skill-matching percentage, gap detection (matched, missing, additional), and assessment evaluation are built as transparent, deterministic algorithmic calculations that execute without requiring an external API key or network request.
- **Rationale**: Guarantees CareerFit is 100% functional offline, avoids fragile external service dependencies during grading/viva presentations, and prevents fabricated "mock AI" illusions. AI services (Gemini/OpenAI) can be layered cleanly on top in Phase 3 as an optional enrichment layer.

## ADR-003: Monorepo Structure with Separated Client & Server
- **Date / Milestone**: Phase 1
- **Status**: Implemented & verified
- **Decision**: Organize `/client` and `/server` as distinct sub-packages under a single root project, orchestrated by a root `package.json` with scripts (`npm run dev`, `npm run install:all`).
- **Rationale**: Enables concurrent local development while strictly preserving security boundaries (backend secrets never leak to the frontend build artifacts).

## ADR-004: Graceful Database Connection Handling
- **Date / Milestone**: Phase 1
- **Status**: Implemented & verified
- **Decision**: Backend boots up cleanly even if MongoDB is not immediately connected or if the connection string is unset, signaling degraded status via `/api/health`.
- **Rationale**: Allows developer onboarding, frontend development, and tests to run without crashing prematurely when local or cloud MongoDB instances are momentarily unreachable.

## ADR-005: Student Profile Isolation & Role-Based Job Authorization
- **Date / Milestone**: Phase 2 (Modules 1 & 2)
- **Status**: Implemented & verified
- **Decision**: Student profile updates are strictly bound to `req.user._id` extracted from the cryptographically verified JWT payload, with no client-controllable user parameter. Job write endpoints (`POST`, `PUT`, `DELETE /api/jobs`) are guarded by role-based authorization (`authorize('admin')`), preventing students from modifying or tampering with job requirements. Sample jobs are seeded idempotently via upsert on unique `title` and `company` fields.
- **Rationale**: Enforces horizontal access control preventing students from altering peers' data, maintains academic integrity of job descriptions, and avoids duplicate job records on subsequent server restarts.

## ADR-006: Local Resume Parsing Engine
- **Date / Milestone**: Phase 2 (Module 3)
- **Status**: Under Discussion (Shortlisted: `pdf-parse` + manual fallback)
- **Decision**: Process uploaded PDF/TXT resumes locally on the backend using `multer` and `pdf-parse`, extracting plain text and running algorithmic keyword matching against verified skill dictionaries, with an immediate manual text paste fallback.
- **Rationale**: Preserves the strict ₹0 budget and avoids student PII transmission to third-party commercial cloud parsers. Ensures 100% offline functionality during viva demonstrations.

## ADR-007: Server-Side Assessment Answer Verification
- **Date / Milestone**: Phase 2 (Module 6)
- **Status**: Under Discussion (Shortlisted: Backend verification)
- **Decision**: Assessment questions delivered to the frontend client must omit `correctIndex` and question explanations. Grading occurs exclusively on the backend upon submission via `POST /api/assessments/:id/submit`.
- **Rationale**: Prevents students from inspecting browser network inspection tools or React component state to cheat on placement assessments. Maintains academic integrity.

## ADR-008: Client-Side Routing Architecture with React Router
- **Date / Milestone**: Phase 2 (Module 1)
- **Status**: Under Discussion (Shortlisted: `react-router-dom` v6)
- **Decision**: Transition from the initial single-page tab-state system in `App.jsx` to standard client-side routing using `react-router-dom` (v6) across the agreed 25 pages, organized under 4 shared layouts (`PublicLayout`, `AuthLayout`, `StudentLayout`, `AdminLayout`) with `ProtectedRoute` and `AdminRoute` guards.
- **Rationale**: Enables direct URL bookmarking, deep-linking to specific job specifications and assessment results, clean browser forward/back history, and clear separation of concerns across public, student, and admin views.

## ADR-009: Event-Driven REST Architecture for Genuine Notifications
- **Date / Milestone**: Phase 2 (Module 8)
- **Status**: Approved by Owner
- **Decision**: Retain `/notifications` and the navbar notification dropdown, backing them strictly with real application events rather than simulated or decorative alerts. Implement the notification subsystem via persistent REST endpoints (`GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`) without real-time WebSockets or third-party paid notification services.
- **Approved Event Categories**:
  1. *Job match*: A newly posted job matches the student's verified skills at 75% or higher.
  2. *Assessment*: An assessment attempt has been submitted and evaluated.
  3. *Readiness report*: A readiness report has been generated or recalculated.
  4. *Profile completion*: The student reaches a defined profile-completion milestone.
- **Implementation Constraints**:
  - Notification creation, database persistence, read/unread state updates, and retrieval must be executed on the backend.
  - The profile-completion threshold must be explicitly defined as an implementation detail prior to coding that trigger.
  - Notification triggers must be idempotent: avoid generating duplicate notifications for repeated processing of the same event.
- **Rationale**: CareerFit is not a real-time messaging application; REST-based polling or on-navigation fetch maintains the ₹0 budget, eliminates persistent socket state, and guarantees all alerts correspond to genuine student achievements.

## ADR-010: Career Readiness Report PDF Export Evaluation
- **Date / Milestone**: Phase 2 (Module 7)
- **Status**: Under Discussion / Open (Awaiting Report Design Review)
- **Context**: The project owner has explicitly kept the PDF export library and implementation method open until the visual design and layout of the Career Readiness Report (`/reports/:reportId`) have been reviewed.
- **Candidate Options Under Consideration**:
  1. *Client-side `jsPDF` / `html2pdf.js`*: Direct browser-side DOM-to-PDF rendering.
  2. *Browser native print stylesheet (`@media print`)*: Clean print-to-PDF using the browser's native print dialogue.
- **Constraints**:
  - The eventual solution must strictly respect the ₹0 project budget.
  - No server-side headless browser (e.g., Puppeteer) dependencies will be introduced unless strictly necessary, avoiding heavy RAM/CPU overhead.
  - Neither candidate is approved at this stage; no package will be installed until the design is finalized.

## ADR-011: Standalone Improvement Plan Route & Task Tracking
- **Date / Milestone**: Phase 2 (Module 7)
- **Status**: Approved by Owner
- **Decision**: Retain `/improvement-plan` as a separate, protected student route and include it directly in the student navigation sidebar. The Career Readiness Report (`/reports/:reportId`) will link directly to this plan.
- **Scope & Behavior**:
  - Provides a practical, actionable preparation checklist derived from identified skill gaps and assessment mistakes.
  - Supports interactive task-completion tracking with persisted completion status.
  - Will remain an independent route unless the project owner explicitly approves a future change.
- **Rationale**: Students require a dedicated daily study and remediation space they can revisit without having to re-open or re-generate an entire formal readiness evaluation report.

## ADR-012: Career Readiness Index Formulation (60/40 Weighting)
- **Date / Milestone**: Phase 2 (Module 7)
- **Status**: Approved by Owner (Weighting Approved; Component Aggregations Open)
- **Decision**: Compute the composite Career Readiness Index using the approved weighting formula:
  $$\text{Readiness Index} = (0.60 \times \text{Skill Match Percentage}) + (0.40 \times \text{Assessment Score Percentage})$$
- **Mandatory Calculation & Display Rules**:
  1. *Normalization*: Both `Skill Match Percentage` and `Assessment Score Percentage` must be normalized to a 0–100 scale; the resulting `Readiness Index` must strictly remain between 0 and 100.
  2. *Matching Methodology Integrity*: Skill Match Percentage must strictly use the agreed explainable matching methodology; its exact formula must not be invented or silently changed.
  3. *Assessment Score Aggregation*: Assessment Score Percentage must be calculated from evaluated assessment attempts using a clearly documented aggregation rule.
  4. *Missing Data Handling*: If assessment results or job-match data are missing, the system must **not silently treat missing data as zero**. Instead, an appropriate incomplete or unavailable state (e.g., `"Assessment Pending"`, `"Incomplete Evaluation"`) must be defined and displayed.
  5. *Explainability*: Component scores (Skill Match % and Assessment Score %) must always be displayed alongside the composite index so students clearly understand how their score was calculated.
  6. *Project Scope Presentation*: The index must be presented as a project-defined readiness indicator, not as a scientifically validated hiring probability.
- **Open Detail**: The 60/40 weighting is approved, but the specific multi-test aggregation formula (combining aptitude vs technical test scores into the single assessment percentage) remains open for formal design in Module 6/7.

## ADR-013: Seeded Assessment Question Bank Scope & Integrity Constraints
- **Date / Milestone**: Phase 2 (Module 6)
- **Status**: Approved by Owner
- **Decision**: Seed an initial question bank of **25–30 reviewed placement MCQs** using an idempotent seed script across five mandatory domains:
  1. *Quantitative Aptitude*
  2. *Logical Reasoning*
  3. *JavaScript*
  4. *SQL*
  5. *Core Computer Science* (Operating Systems, DBMS, Computer Networks, OOP)
- **Quality & Integrity Constraints**:
  - Every seeded question must have a verified correct answer, difficulty label, category tag, and pedagogical explanation.
  - The seed script must be idempotent: re-running it must not duplicate questions or reset students' existing assessment attempt histories.
  - Assessment-delivery APIs must never expose `correctIndex` or explanations to the client prior to test submission.
  - Scoring must be performed strictly on the backend Express server.
  - Historical student attempts must remain reliable and mathematically accurate even if administrators later edit or retire questions (e.g., via question snapshots on attempt records).
  - Question quality must be reviewed before questions are marked as verified in production.
  - No question bank implementation or dependency installation will occur in documentation-only tasks.

## ADR-014: Zero-Cost Cloud Deployment Architecture (Vercel + Render + MongoDB Atlas)
- **Date / Milestone**: Phase 2 / Deployment Prep
- **Status**: Implemented & verified
- **Decision**: Deploy the full CareerFit platform using zero-cost free hosting tiers:
  1. *Frontend*: Vercel Hobby Free Tier (React + Vite SPA with `vercel.json` rewrite routing).
  2. *Backend*: Render Free Web Service (Node.js/Express, bound to `0.0.0.0`, port from `process.env.PORT || 5000`, `/api/health` probe).
  3. *Database*: MongoDB Atlas M0 Sandbox Cluster (Free 512 MB forever, no credit card required, 10s server selection timeout for cold starts).
  4. *Security*: Strict origin-based CORS on Render accepting only authorized frontend origins (e.g., `CLIENT_URL` pointing to Vercel and local dev), zero secrets in source control.
- **Rationale**: Meets the mandatory ₹0 budget constraint for college project demonstrations while delivering a resilient, publicly accessible live deployment with persistent cloud database storage.
