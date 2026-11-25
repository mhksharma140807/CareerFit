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
- **Date / Milestone**: Phase 2 (Module 3) & Phase 3
- **Status**: Implemented & verified (via `pdf-parse` v2 + `mammoth` + `skillTaxonomy`)
- **Decision**: Process uploaded PDF/DOCX/TXT resumes locally on the backend using `multer`, `pdf-parse` (stream decompression), and `mammoth` (DOCX parsing), extracting clean text and running algorithmic keyword matching against verified categorized skill dictionaries and alias maps, with an immediate manual text paste fallback.
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

## ADR-015: Strong Password Enforcement & Self-Service CAPTCHA Password Reset
- **Date / Milestone**: Phase 2 / Security Hardening
- **Status**: Implemented & verified
- **Decision**: Enforce strict server-side and client-side password and email rules, and implement a self-contained, ₹0 budget visual CAPTCHA recovery workflow:
  1. *Strong Password Rules*: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol. Enforced on user registration, password change, and password reset. Real-time visual 5-criteria checklist on frontend.
  2. *Strict Email Validation*: RFC 5322 regex validation requiring valid domain structure and at least 2-character TLDs.
  3. *Self-Contained SVG CAPTCHA Recovery*: Generates distorted 6-character SVG visual challenges with anti-bot noise lines and signed stateless cryptographic JWT tokens (`sha256` solution hash, 10-minute expiry). Bypasses need for external commercial services (e.g. reCAPTCHA) and avoids paid SMS/email infrastructure until OTP verification is added in a future phase.
- **Rationale**: Elevates application security to production placement standards, protects student accounts against brute-force attacks, and maintains strict adherence to the ₹0 budget and offline demo capabilities.

## ADR-016: Dedicated Administrator Bootstrapping & Privilege Escalation Prevention
- **Date / Milestone**: Phase 2 / Admin Authentication
- **Status**: Implemented & verified
- **Decision**: Restrict administrator account creation strictly to backend administrative seed scripts (`npm run seed:admin`) and block public registration privilege escalation:
  1. *Backend Bootstrapping*: The initial admin account is provisioned via `seedInitialAdmin()` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Never prints or logs the plain-text password. Automatically hashes with bcrypt before persistence.
  2. *Idempotency & Integrity*: Re-running the seed script preserves existing admin credentials without duplicate insertions. If the configured email is registered as a student, the script terminates with an error and refuses to promote or overwrite.
  3. *Public Registration Hardening*: `POST /api/auth/register` rejects any request body containing `role !== 'student'` with `403 Forbidden` and strictly forces `role: 'student'` on creation.
  4. *Role-Based Authorization (RBAC)*: Every admin endpoint (`/api/admin/*`, `POST/PUT/DELETE /api/jobs`) is guarded by `protect, authorize('admin')`. Unauthorized student tokens are rejected with `403 Forbidden`.
- **Rationale**: Eliminates the risk of unauthorized privilege escalation on public endpoints, ensures reliable faculty/evaluator access during live viva demonstrations, and guarantees clean separation between student and administrative privileges.

## ADR-017: Hybrid Resume Intelligence & Gemini Flash Integration with Deterministic Fallback
- **Date / Milestone**: Phase 3 / AI Capabilities & Resume Intelligence
- **Status**: Implemented & verified
- **Decision**: Architect resume skill extraction and recommendations as a dual-layer hybrid system:
  1. *Foundation (Deterministic & Local)*: `pdf-parse` decompressing FlateDecode PDF byte streams, `mammoth` parsing DOCX XML, and `skillTaxonomy` matching 150+ CSE skills across 8 categories with alias normalization and boundary-safe regex for punctuation terms (`C++`, `C#`, `.NET`, `Node.js`). 100% offline and autonomous.
  2. *Enrichment (Gemini Flash)*: When `GEMINI_API_KEY` is provided, the backend invokes Google's free-tier Gemini Flash (`gemini-3.5-flash-lite` via REST) for structured project extraction and personalized milestone advice.
  3. *Privacy & PII Stripping*: All student PII (emails, phone numbers, LinkedIn/GitHub profile URLs) is stripped before external transmission.
  4. *Autonomous Fallback*: If Gemini times out, returns HTTP 429 (rate-limited), or is unconfigured, the system automatically falls back to deterministic extraction without throwing user-facing errors. Every extraction reports its origin (`extractionSource: 'ai' | 'deterministic'`).
- **Rationale**: Retains deterministic viva-explainability and ₹0 operational cost while providing high-grade AI features when connected.

## ADR-018: Multi-Dimensional Assessment Analytics & Readiness Engine
- **Date / Milestone**: Phase 3 / Performance Analytics
- **Status**: Implemented & verified
- **Decision**: Upgrade assessment evaluation and readiness report generation to provide multi-dimensional placement readiness:
  1. *Aptitude vs. Technical Separation*: Categorizes attempts into Quantitative/Logical Aptitude and Technical/Core CS proficiency rather than an unweighted flat average.
  2. *Weak-Topic Identification*: Mines question-level errors and tags to identify specific conceptual weaknesses (e.g., Recursion, DBMS Normalization).
  3. *Readiness Formula Preservation*: Strictly preserves the documented 60% skill match + 40% assessment readiness formula (ADR-012) and 85% mandatory / 15% preferred job matching formula (ADR-002), supplemented with justified partial matches (e.g. JavaScript for TypeScript).
- **Rationale**: Delivers authentic academic value and placement preparation diagnostics to students while strictly complying with baseline mathematical formulas agreed in project planning.

## ADR-019: Dynamic Multi-Domain Expansion, AI Intelligence Layer & Custom JD Matching
- **Date / Milestone**: Phase 4 / AI Platform Expansion
- **Status**: Approved by Owner & Under Implementation
- **Decision**: Expand CareerFit into an extensible, domain-independent AI career readiness platform while preserving strict ₹0 budget and viva explainability:
  1. *Unrestricted Role & Custom JD Matching*: In addition to curated catalog roles, students can paste any raw Job Description (JD) across any professional domain (Tech, Finance, Business, Marketing, Design, HR). The backend extracts mandatory/preferred competencies using Gemini Flash with deterministic fallback and evaluates fit using the approved 85/15 Venn formula.
  2. *AI Dynamic Question Generation & Small Offline Bank*: Rather than manually authoring thousands of questions across all professions, Gemini generates role- and competency-specific assessment questions, scenario questions, explanations, and interview prompts in batches. A small reviewed offline question bank is maintained for reliable fallback during viva presentation.
  3. *Simplified Adaptive Assessments*: Evaluates responses, identifies weak competencies, and dynamically requests targeted follow-up question batches from Gemini or offline pools based on performance.
  4. *Strict ₹0 Budget & Basic Safeguards*: Gemini Flash is used within free-tier limits without billing activation. Usage tracking is managed via MongoDB with graceful fallback to deterministic logic if rate-limited or offline.
  5. *Preservation of Core Formulas & RBAC*: The 85% mandatory / 15% preferred match formula and the 60% match / 40% assessment readiness formula remain locked and strictly calculated by the backend. The four diagnostic gap dimensions (Skill, Knowledge, Performance, Communication) provide itemized qualitative guidance separate from the readiness score.
- **Rationale**: Delivers a flexible, high-utility platform suitable for college-wide demonstrations across multiple academic departments while maintaining complete reliability, deterministic grading, and zero financial cost.

## ADR-020: Written Professional Communication Architecture & 8-Dimension Rubric Evaluation
- **Date / Milestone**: Phase 5 / Slice 3
- **Status**: Implemented & verified
- **Decision**: Architect a dedicated, cross-domain Written Professional Communication assessment module strictly evaluated across 8 workplace communication dimensions:
  1. *8-Dimension Rubric*: Clarity, Structure, Professional Tone, Relevance, Conciseness, Grammar & Mechanics, Problem Framing, and Actionability. Each dimension is scored 0–10 with specific diagnostic feedback; the overall communication score is normalized to 0–100.
  2. *Strictly Non-Spoken Scope*: The module explicitly tests written corporate communication (Emails, Executive Briefs, Incident Reports, Slack/Team Updates, Memos). Does not fabricate speech recognition, pronunciation, video, or body language analysis.
  3. *Dual-Layer Evaluation Engine*:
     - *Primary*: Gemini Flash (`gemini-3.5-flash-lite`) evaluates responses against the structured 8-dimension JSON rubric and generates an exemplary suggested rewrite.
     - *Autonomous Fallback*: When offline, unconfigured, or rate-limited, `evaluateResponseDeterministic` evaluates word-count bounds, greeting/sign-off structure, paragraph segmentation, polite register markers, actionability timestamps, and scenario term density. Guarantees 100% test and viva resilience at ₹0 cost.
  4. *Preservation of Locked Formulas*: Communication scores are presented as independent qualitative diagnostic reports and do not alter the baseline Readiness Index ($0.60 \times \text{Skill Match} + 0.40 \times \text{Assessment Score}$) or Job Match ($0.85 \times \text{Mandatory} + 0.15 \times \text{Preferred}$).
- **Rationale**: Equips students across diverse academic domains with realistic, actionable workplace communication feedback while maintaining academic integrity, deterministic viva explainability, and zero infrastructure budget.

## ADR-021: AI Career Tutor & Structured Practice Workflows Architecture
- **Date / Milestone**: Phase 5 / Slice 4
- **Status**: Implemented & verified
- **Decision**: Architect an interactive, multi-turn AI Career Tutor with 7 structured practice workflows grounded in holistic student diagnostic context:
  1. *Context Synthesis*: Aggregates student profile skills, target role, diagnosed weak competencies (<70% accuracy from `AssessmentAttempt`), historical assessment errors, and written communication gaps from `CommunicationAttempt`.
  2. *7 Practice Workflows*:
     - `weak_topic`: Socratic breakdown and scenario testing for diagnosed weak competencies.
     - `competency_drill`: Fast-paced domain/technical scenario drill.
     - `mock_interview`: Realistic interview questions (technical, situational, behavioral) with follow-up probing.
     - `job_interview_prep`: Role-specific interview prep aligned with custom role or pasted JD.
     - `mistake_remediation`: Re-testing concepts missed in prior assessment questions.
     - `resume_project_prep`: Interrogation on resume project architecture, trade-offs, and design choices.
     - `communication_practice`: Executive updates, cross-functional dependencies, and escalation scenarios.
  3. *Turn-Based Interactive Progression*: Exactly ONE question per turn. Student submits an answer $\rightarrow$ immediate substantive feedback (score 0-100, strengths, missing points, mentor feedback, exemplary answer) $\rightarrow$ next turn $\rightarrow$ final completion summary (overall score, aggregated strengths, improvement priorities, and concrete placement readiness action items).
  4. *Atomic ₹0 Budget Rate Limiter & Concurrency Guard*: Track daily usage via MongoDB `TutorQuota` collection (max 35 requests/day per student) with atomic concurrency locking (`isLocked`, `lockedAt` with 25-second auto-expiration). Rejects concurrent turns with HTTP 429 without requiring external Redis or paid infrastructure.
  5. *100% Offline Deterministic Fallback*: `getDeterministicTutorTurn`, `evaluateTutorTurnResponseDeterministic`, and `generateTutorSessionSummaryDeterministic` ensure flawless local tests, offline viva demonstrations, and zero dependence on live API keys.
  6. *Preservation of Locked Formulas*: Practice session scores serve as formative coaching diagnostics; baseline formulas ($0.60 \times \text{Skill Match} + 0.40 \times \text{Assessment Score}$ and $0.85 \times \text{Mandatory} + 0.15 \times \text{Preferred}$) remain strictly preserved.
- **Rationale**: Gives students authentic, personalized placement coaching without requiring generic open-ended chatbots or expensive AI subscriptions, ensuring high academic demonstration quality and deterministic reliability for viva defense.

## ADR-022: Unified Career Readiness Intelligence, Evidence Confidence & Longitudinal Tracking
- **Date / Milestone**: Phase 5 / Slice 5
- **Status**: Implemented & verified
- **Decision**: Unify candidate readiness diagnostics across existing CareerFit collections (`StudentProfile`, `Job`, `ReadinessReport`, `AssessmentAttempt`, `CommunicationAttempt`, `TutorSession`) in `readinessIntelligenceService.js` without duplicating database models or altering locked formulas:
  1. *Locked Formulas & Honest Insufficient-Data States*: Preserves $0.85 \times \text{Mandatory} + 0.15 \times \text{Preferred}$ (Job Match) and $0.60 \times \text{Skill Match} + 0.40 \times \text{Assessment Score}$ (Readiness Index). When either target role context or assessment attempts are missing, `readinessIndex` remains `null` with an explicit `insufficient_role_context` or `insufficient_assessment_data` status rather than fabricating a score.
  2. *Three-Tier Evidence Confidence System*: Classifies each competency as `VERIFIED` (backed by scored assessment or communication attempt), `INFERRED` (present in profile skills, projects, or resume text only), or `UNASSESSED` (no evidence yet). Missing resume skills are never labeled as demonstrated weaknesses.
  3. *Four Diagnostic Dimensions*: Reports `Skill Gap`, `Knowledge Gap`, `Performance Gap`, and `Communication & Professional Gap` as qualitative diagnostic categories separate from the 60/40 readiness formula.
  4. *Longitudinal Comparability Guards*: Enhances `GET /api/progress` with communication, AI Tutor, competency accuracy deltas, and improvement-plan tracking while suppressing misleading same-role readiness deltas and surfacing warnings whenever target roles or assessment structures change.
  5. *Optional AI Narrative*: Uses Gemini Flash (`generateReadinessNarrativeWithGemini`) strictly to summarize already-computed deterministic metrics, with instant deterministic fallback when unconfigured or rate-limited.
- **Rationale**: Delivers transparent, evidence-backed career readiness intelligence across arbitrary domains at ₹0 cost while maintaining strict academic integrity and backward compatibility.
