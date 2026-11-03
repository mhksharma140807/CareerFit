# CareerFit — Master Project Reference Plan

> [!IMPORTANT]
> **Authoritative Baseline & Operating Rules**:
> 1. This document serves as the master architectural and planning reference for **CareerFit**. It does **not** constitute proof that every listed or planned feature is currently functioning.
> 2. The physical codebase in this repository and verified, reproducible test executions are the sole source of truth for actual implementation status.
> 3. Only explicitly approved decisions (marked as `Approved` or `Implemented`) represent committed architectural directions. Items marked `Exploring`, `Shortlisted`, or `Deferred` are candidate options and must not be treated as implementation instructions.
> 4. If any section of this document conflicts with the repository code or test output, flag the discrepancy and investigate rather than assuming either source is unconditionally correct.
> 5. When technical decisions, schema structures, or milestones evolve, update this master plan, `docs/PROJECT_PLAN.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md`.

---

## A. Project Overview

### 1. Identity & Classification
- **Project Name**: CareerFit
- **Project Title**: Career Readiness and Job Matching Platform
- **Academic Context**: B.Tech Computer Science & Engineering (CSE) Final Year Major Project.
- **Target Audience**: College undergraduate students, placement coordinators/training officers, and prospective campus recruiters.

### 2. Problem Statement
College students preparing for campus placements and off-campus recruitment frequently face significant uncertainty regarding their actual readiness for industry roles:
- Job descriptions (JDs) list dense combinations of mandatory and preferred technologies without clear benchmarks.
- Students possess fragmented skill sets, unguided academic projects, and resumes that do not clearly indicate alignment with specific job requirements.
- Standard preparation involves taking generic, uncontextualized aptitude tests that fail to link performance back to specific job criteria.
- Students lack actionable feedback identifying precisely which skills they already possess, which critical gaps prevent qualification, and what targeted steps are required to become job-ready.

### 3. Core Objectives & Expected Outcomes
- **Profile Centralization**: Enable students to record academic credentials, technical skills, projects, work experience, and resume data in a single structured profile.
- **Explainable Skill-Job Matching**: Compare a student's verified skills against industry job descriptions using a deterministic, transparent algorithmic match percentage (no black-box scoring).
- **Skill-Gap Analysis**: Categorize skills into clear buckets: Matched Skills, Missing Mandatory Skills, Missing Preferred Skills, and Additional/Bonus Skills.
- **Role-Specific Assessments**: Administer aptitude and technical multiple-choice assessments linked to required job domains, capturing objective attempt scores and historical progress.
- **Holistic Readiness Reports**: Generate consolidated readiness evaluations that synthesize skill match scores, assessment performance, strengths, weaknesses, and concrete recommendations using the approved 60/40 weighting.
- **Longitudinal Tracking & Improvement**: Provide students with an actionable improvement checklist and progress history across preparation cycles.

### 4. Distinction from PathPilot
- **PathPilot (Internship Project)**: A career-learning platform focused on roadmap exploration, milestone learning paths, and educational curriculum navigation.
- **CareerFit (College Major Project)**: A career readiness evaluation and job matching engine focused on placement qualification, JD comparison, deterministic skill-gap detection, role-linked testing, and actionable placement readiness reporting.

### 5. Differentiator & Scope Boundaries
- **Proposed Differentiator**: Unifying explainable, rule-based job matching with domain-specific assessment performance and actionable skill-gap reports under a single, cohesive workflow.
- **Academic Scope Disclaimer**: CareerFit does not claim global uniqueness or proprietary novelty. Its academic merit lies in practical engineering, explainable algorithms suitable for viva defence, robust full-stack architecture, clean security practices, and a zero-budget operational design.

```
                              CORE APPLICATION WORKFLOW
 +-------------------+      +-------------------+      +-------------------+
 |  Student Profile  | ---> |   Job Directory   | ---> | Skill Match & Gap |
 | Skills & Projects |      | Curated Roles/JDs |      |  (Deterministic)  |
 +-------------------+      +-------------------+      +---------+---------+
                                                                 |
                                                                 v
 +-------------------+      +-------------------+      +-------------------+
 | Actionable Plan   | <--- | Holistic Readiness| <--- |   Placement MCQ   |
 | & Progress History|      |   Report Engine   |      |    Assessments    |
 +-------------------+      +-------------------+      +-------------------+
```

---

## B. Current Implementation Status & Codebase Baseline

**Latest Git Commit Baseline**: `579550c` (*"test: add end-to-end flow verification script"*)  
**Verified Working Environment**: Node.js v24.18.0, npm 11.16.0, local MongoDB service `careerfit`.

### Status Breakdown by Component (Verified Against Physical Codebase)

| Module / Feature | Status | Verification Evidence | Notes & Operational Context |
| :--- | :--- | :--- | :--- |
| **Monorepo Structure** | **Implemented & verified** | Root `package.json`, `/client`, `/server` | Script orchestration with `concurrently` for unified local execution. |
| **Database Connection** | **Implemented & verified** | `server/src/config/db.js` | Resilient Mongoose connection; exposes live status via `/api/health` without crashing if offline. |
| **User Authentication** | **Implemented & verified** | `server/src/controllers/authController.js` | Bcrypt password hashing, JWT token issuance (`7d` expiry), `/api/auth/register`, `/api/auth/login`, `/api/auth/me`. |
| **Student Profile Management** | **Implemented & verified** | `server/src/controllers/profileController.js` | Auto-provisioned on registration. Supports college, graduation year (1990–2040), skills, projects, experience, resume text. |
| **Skill Deduplication** | **Implemented & verified** | `profileController.js`, `api.test.js` | Case-insensitive deduplication and normalization (`React` vs `react`). |
| **Profile Ownership Isolation** | **Implemented & verified** | `profileController.js`, `api.test.js` | Routes bind strictly to `req.user._id` from validated JWT; horizontal privilege escalation prevented. |
| **Job Directory & Public Read** | **Implemented & verified** | `server/src/controllers/jobController.js` | Public/student listing with keyword search and filtering by `experienceLevel` and `jobType`. |
| **Job Management Write Auth** | **Implemented & verified** | `server/src/middleware/auth.js` | Write operations (`POST`, `PUT`, `DELETE /api/jobs`) guarded by `authorize('admin')`. Students rejected with `403`. |
| **Sample Job Seed Script** | **Implemented & verified** | `server/src/utils/seedJobs.js` | 5 curated sample roles; uses idempotent upsert on `{ title, company }` to prevent duplicates. |
| **Automated Backend Tests** | **Implemented & verified** | `server/tests/api.test.js` | 11 test suites passing when executed with active MongoDB service. |
| **End-to-End Flow Verification** | **Implemented & verified** | `server/tests/verifyFlow.js` | 8-step live integration test validating auth, profile persistence, duplicate checks, job search, and authorization. |
| **Frontend Foundation (Tab State)** | **Implemented & verified** | `client/src/App.jsx`, `Navbar.jsx` | React 18, Vite 6, Tailwind CSS, tab state (`Student Profile`, `Job Directory`, `System Status`), Auth modal. |
| **Frontend Production Build** | **Implemented & verified** | `client/package.json`, Vite 6 | Production Vite build compiles cleanly (`npm run build --prefix client`) with 0 errors. |
| **Assessment Data Models** | **Present but not verified** | `Assessment.js`, `AssessmentAttempt.js` | Mongoose schemas exist; 25–30 question seed script and server scoring planned. |
| **Client-Side Page Routing** | **Planned / not implemented** | Tab-state currently in `App.jsx` | Conversion to standard client routes via `react-router-dom` across 25 routes. |
| **Deterministic Skill Matcher**| **Planned / not implemented** | `docs/PROJECT_PLAN.md` | Algorithmic percentage comparison between student skills and job requirements. |
| **Skill-Gap Categorization**   | **Planned / not implemented** | `docs/PROJECT_PLAN.md` | Matched, missing mandatory, missing preferred, and bonus skill categorization. |
| **Resume File Upload/Parsing** | **Planned / not implemented** | Fallback rawText implemented | PDF/TXT file extraction with multer/pdf-parse. Manual entry fallback active. |
| **Readiness Report Engine**    | **Planned / not implemented** | Approved (ADR-012) | Synthesizes approved 60/40 composite index ($0.60 \times \text{Match} + 0.40 \times \text{Assessment}$). |
| **Standalone Improvement Plan**| **Planned / not implemented** | Approved (ADR-011) | Separate protected student route `/improvement-plan` with task completion tracking. |
| **Genuine Notifications**      | **Planned / not implemented** | Approved (ADR-009) | Event-driven REST notifications across 4 approved genuine event triggers. |
| **Seeded Question Bank**       | **Planned / not implemented** | Approved (ADR-013) | 25–30 reviewed placement MCQs across Quantitative, Logical, JS, SQL, Core CS. |
| **Student Dashboard**          | **Planned / not implemented** | `docs/PROJECT_PLAN.md` | Centralized student metrics, saved attempts, and readiness gauges. |
| **Saved Jobs Management**     | **Planned / not implemented** | Scope specification | Student shortlist tracking and match monitoring. |
| **Admin Management Suite**     | **Planned / not implemented** | `jobController.js` has write auth | Full administrative UI for job CRUD, question bank, and user management. |
| **AI Recommendation Layer**    | **Planned (Phase 3)** | `docs/PROJECT_PLAN.md` | Optional Gemini API backend wrapper; strictly non-blocking when unconfigured. |
| **UI/UX Visual Overhaul**      | **Planned (Phase 4)** | `docs/PROJECT_PLAN.md` | Typography, spacing, micro-interactions, responsive polish after functionality stabilizes. |

---

## C. Current Technology Stack & Tool Evaluation Register

### Current Implemented Stack

| Layer | Technology | Verified Version | Purpose in CareerFit | Known Limitations & Viva Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `v24.18.0` | Server runtime environment | Active LTS. Standard ES Modules (`import/export`) used throughout. |
| **Package Manager**| npm | `11.16.0` | Dependency orchestration | Workspaces/prefix scripts orchestrated via root `package.json`. |
| **Backend Framework**| Express | `^4.21.2` | RESTful API routing & middleware | Mature, minimalistic, lightweight, and easily explainable in viva. |
| **Database** | MongoDB Local | Service Running | Document database persistence | Flexible JSON document storage ideal for profile, JD, and test structures. |
| **ODM** | Mongoose | `^8.9.5` | Schema modeling & validation | Provides schema constraints, defaults, indexes, and relationship refs. |
| **Password Hashing** | bcryptjs | `^2.4.3` | One-way password hashing | Pure JavaScript implementation (avoids native C++ compilation bindings). |
| **Authentication** | jsonwebtoken | `^9.0.2` | Stateless bearer token auth | Standard HS256 JWT tokens with client storage in localStorage. |
| **HTTP Logger** | morgan | `^1.10.0` | Development request logging | Lightweight request tracing on Express. |
| **Frontend Framework**| React | `^18.3.1` | Component-based UI hierarchy | Stable industry standard; hooks-based functional components. |
| **Build Tool** | Vite | `^6.1.0` | Dev server & production bundler | Extremely fast HMR (Hot Module Replacement) and optimized Rollup builds. |
| **CSS Utility** | Tailwind CSS | `^3.4.17` | Utility-first CSS styling | Eliminates dead CSS; highly predictable styling in Phases 1–3. |
| **Icons** | lucide-react | `^0.475.0` | Modern SVG interface icons | Tree-shakeable, clean visual indicators. |
| **Dev Runner** | nodemon | `^3.1.9` | Automatic server reload | Restarts backend on file edits in development. |
| **Process Orchestration**| concurrently | `^9.1.2` | Root multi-process runner | Runs backend (`:5000`) and frontend (`:5173`) from single root script. |
| **Test Runner** | Node Test Runner| Built-in (`node:test`) | Unit & integration testing | Zero-dependency, native runner in Node v24; avoids heavy Jest overhead. |

### Technology and Tool Evaluation Register

| Technology / Tool | Category | Proposed Use in CareerFit | Primary Benefit | Complexity & Trade-offs | Cost & Free Tier | Current Status | Decision Rationale & Intended Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **React Router DOM** (`react-router-dom`) | Routing | Client-side routing across 25 proposed pages | Standard deep-linking, route guards, URL bookmarks, browser history | Requires converting single-page tab state to router hierarchy | **Free (MIT)** | **Shortlisted** | Required to implement proposed multi-page routing cleanly without custom hash navigation. |
| **Node Native Test Runner** (`node:test`) | Testing | Backend unit and integration API testing | Zero dependencies, blazing fast, built into Node v24 | Fewer third-party mock utilities than Jest | **Free (Built-in)** | **Implemented** | Selected over Jest/Mocha to keep dependencies minimal and viva explainability high. |
| **Bcryptjs** | Security | Password hashing | Reliable, pure JS, no native compilation bugs | Slightly slower than C++ bcrypt (negligible for web apps) | **Free (MIT)** | **Implemented** | Eliminates node-gyp / Python build tool errors on Windows development machines. |
| **Mongoose** | Database | Data modeling & validation | Strong schema enforcement, pre-save hooks, clean queries | Overhead compared to native MongoDB driver | **Free (Apache 2)** | **Implemented** | Critical for college project clarity, validation rules, and relational refs (`userId`). |
| **Tailwind CSS** | Styling | Utility CSS styling | Rapid UI construction, no class name collisions | Verbose JSX markup | **Free (MIT)** | **Implemented** | Chosen for rapid development across Phases 1–3 without custom CSS bloat. |
| **pdf-parse** | Resume | Safe local text extraction from PDF resumes | Server-side text extraction without external SaaS | Formatted columns/tables can require text cleaning | **Free (MIT)** | **Shortlisted** | Candidate for Module 3 resume handling; operates entirely offline with ₹0 cost. |
| **PDF Export (jsPDF vs print CSS)** | Reporting | PDF export of Career Readiness Reports | Offline PDF export directly in browser | Styling must be adjusted for standard A4 page breaks | **Free (MIT / Native)** | **Under Discussion / Open** | Decision kept open per owner approval until report design is reviewed. Strictly ₹0 cost. |
| **Google Gemini API** | AI Service | Optional resume enrichment & custom advice | Modern AI capabilities with generous free tier | Requires network, API rate limits, non-deterministic | **Free Tier Available** | **Shortlisted** | Optional Phase 3 adapter. Application must operate 100% deterministically without it. |
| **Zod** | Validation | Runtime request schema validation | Type inference, clean composable validation rules | Adds another dependency; redundant with Mongoose/manual checks | **Free (MIT)** | **Exploring** | Kept in exploring. Current manual/Mongoose validation is sufficient; add only if schema complexity explodes. |
| **Swagger / OpenAPI** | Documentation| Interactive API documentation for viva | Interactive API exploration for external evaluators | Maintenance overhead to sync annotations with code | **Free (Apache 2)** | **Shortlisted** | Candidate for Phase 4 / viva prep to document REST endpoints for professors. |
| **TypeScript** | Language | Type safety across client and server | Compile-time type error detection | Build complexity, configuration overhead, harder viva code review | **Free (Apache 2)** | **Deferred** | Deferred per ADR-001. Pure JavaScript keeps viva explanations direct and compilation instant. |
| **Playwright** | Testing | Automated end-to-end browser testing | Real browser UI verification | Browser binary downloads can fail in offline/restricted networks | **Free (Apache 2)** | **Deferred** | Automated Playwright driver download hit network restrictions; verified via integration scripts. |
| **Docker** | DevOps | Containerized local & deployment environments | Uniform development environment across machines | Heavy resource consumption on modest laptop hardware | **Free (Apache 2)** | **Deferred** | Deferred unless student machine setup issues necessitate a containerized environment. |
| **GitHub Actions** | CI/CD | Automated test and build verification on push | Immediate feedback on pull requests | Setup overhead; unnecessary for single-developer local repo | **Free for Public** | **Exploring** | Candidate for Phase 4 once project is pushed to a remote GitHub repository. |
| **Socket.IO** | Real-time | Real-time notifications / live scoring | Instant updates | Adds persistent connection state; completely unneeded for REST | **Free (MIT)** | **Rejected** | Rejected per ADR-009. CareerFit uses REST-based notification retrieval; zero socket complexity. |
| **Microservices / Redis** | Architecture | Distributed services / distributed cache | Scalability at million-user scale | Massive architectural overengineering for college project | **Cost/complexity** | **Rejected** | Rejected. Monolithic MERN is viva-ready, debuggable, and perfectly performant. |
| **MongoDB Atlas (M0)** | Hosting | Cloud database hosting for live deployment | 512 MB permanent free tier, managed backups | Internet connection required; connection latency | **Free Tier (M0)** | **Shortlisted** | Candidate for Phase 4 deployment. Local MongoDB remains default for development. |
| **Render / Vercel** | Hosting | Backend web service & frontend static hosting | Free tier with HTTPS and continuous deployment | Render free backend sleeps after inactivity (~50s cold start) | **Free Tier** | **Shortlisted** | Candidate for Phase 4 deployment demonstration. |

---

## D. Complete Page & Route Specifications (Approved 25-Page Inventory)

The platform comprises **25 routes** grouped into four logical categories: Public & Authentication, Student Pages, Admin Pages, and Supporting Routes.

```
                           CAREERFIT ROUTE ARCHITECTURE
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                          A. Public & Auth Pages                          │
 │   / (Home)  •  /jobs (Directory)  •  /jobs/:id (Details)                 │
 │   /register (Sign Up)  •  /login (Sign In)  •  /help (FAQ & Guide)       │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
 ┌───────────────────────────┐                 ┌────────────────────────────┐
 │      B. Student Pages     │                 │       C. Admin Pages       │
 │ /dashboard                │                 │ /admin                     │
 │ /profile                  │                 │ /admin/jobs                │
 │ /resume                   │                 │ /admin/assessments         │
 │ /jobs/:id/match           │                 │ /admin/users               │
 │ /assessments              │                 └────────────────────────────┘
 │ /assessments/:id/attempt  │                               │
 │ /assessments/attempts/:id │                 ┌─────────────┴──────────────┐
 │ /reports/:reportId        │                 │    D. Supporting Routes    │
 │ /progress                 │                 │ /unauthorized              │
 │ /saved-jobs               │                 │ * (404 Not Found)          │
 │ /improvement-plan         │                 └────────────────────────────┘
 │ /notifications            │
 │ /settings                 │
 └───────────────────────────┘
```

---

### Category A: Public and Authentication Pages

#### 1. Home / Landing — `/`
- **Purpose & Primary User**: Public landing page for prospective students, placement coordinators, recruiters, and academic evaluators. Introduces platform purpose, demonstrates the 3-step readiness workflow, highlights key metrics, and drives student registration.
- **Main Information & Actions**:
  - Hero section with clear headline, value proposition, and dual CTAs: "Evaluate My Readiness" (`/register` or `/dashboard`) and "Explore Job Roles" (`/jobs`).
  - Interactive "How CareerFit Works" section illustrating the core 3-step workflow (Profile & Resume -> Skill Matching & Assessments -> Readiness Report).
  - Feature showcase: Deterministic Matching (explainable, zero black-box scoring), Placement MCQ Assessments, Actionable Skill-Gap Analysis.
  - Featured Job Postings ticker/cards with quick links to view requirements.
  - Platform Health badge and viva-friendly system statistics.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/jobs?limit=4` (curated sample roles).
  - `GET /api/health` (live database connectivity indicator).
  - Navigation links to `/jobs`, `/register`, `/login`, `/help`.
- **Relevant API Endpoints**:
  - `GET /api/jobs` — *Implemented & verified* (existing sample seed).
  - `GET /api/health` — *Implemented & verified*.
- **Authentication & Authorization**: Public (accessible to all). If already authenticated, CTA dynamically switches to "Go to Dashboard" (`/dashboard`).
- **Expected UI States**:
  - *Loading*: Animated skeleton placeholders for featured job cards and platform metrics.
  - *Empty*: Graceful fallback cards if no jobs are seeded.
  - *Error*: Subtle warning banner if backend is in degraded offline mode.
  - *Success*: Fully interactive landing page with responsive animations.

#### 2. Job Directory — `/jobs`
- **Purpose & Primary User**: Searchable, filterable catalog of curated campus placement and industry job descriptions for students and public visitors.
- **Main Information & Actions**:
  - Search bar supporting keyword search across role title, company name, and required skills.
  - Filter controls: Experience Level (`Fresher`, `Junior`, `Mid`, `Senior`), Job Type (`Full-time`, `Internship`, `Part-time`, `Contract`).
  - Job Cards Grid: Displays title, company, location, experience badge, job type badge, required skills chips, preferred skills chips, and sample job badge.
  - Primary Actions: "View Details" (navigates to `/jobs/:id`), "Check Match" (navigates to `/jobs/:id/match` if logged in, prompts auth if guest), "Save Job" bookmark icon (planned).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/jobs` with query parameters (`search`, `experienceLevel`, `jobType`).
  - Links to `/jobs/:id`, `/jobs/:id/match`, `/saved-jobs`.
- **Relevant API Endpoints**:
  - `GET /api/jobs` — *Implemented & verified*.
  - `POST /api/saved-jobs/:id` — *Planned / not implemented*.
- **Authentication & Authorization**: Public read. Bookmark and Match actions require authenticated student session.
- **Expected UI States**:
  - *Loading*: 6-card shimmer skeleton grid.
  - *Empty*: "No job roles match your criteria" with a "Reset Filters" action button.
  - *Error*: Error alert banner with "Retry Connection" button.
  - *Success*: Paginated/scrolling grid with total count badge.

#### 3. Job Details — `/jobs/:id`
- **Purpose & Primary User**: Dedicated specification page for a single job role, allowing students and recruiters to review complete requirements before matching.
- **Main Information & Actions**:
  - Complete job header: Title, Company, Location, Job Type, Experience Level, Posting Date.
  - Multi-paragraph job description and role responsibilities.
  - Categorized skill requirements: Mandatory Required Skills (distinct badges) and Nice-to-Have Preferred Skills.
  - Actions: "Analyze My Match" (primary CTA leading to `/jobs/:id/match`), "Save to Shortlist" (toggle), "Back to Job Directory" navigation.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/jobs/:id`.
  - Links to `/jobs`, `/jobs/:id/match`.
- **Relevant API Endpoints**:
  - `GET /api/jobs/:id` — *Implemented & verified*.
  - `POST /api/saved-jobs/:id` — *Planned / not implemented*.
- **Authentication & Authorization**: Public read. "Analyze My Match" redirects guest visitors to `/login?redirect=/jobs/:id/match`.
- **Expected UI States**:
  - *Loading*: Detail view skeleton showing header, tag placeholders, and paragraph skeletons.
  - *Error*: 404 alert card if job ID is non-existent or invalid ObjectId.
  - *Success*: Full role specification view.

#### 4. Register — `/register`
- **Purpose & Primary User**: Student onboarding page for creating an account and auto-provisioning a blank student profile.
- **Main Information & Actions**:
  - Clean card form: Full Name, College Email Address, Password, Password Confirmation.
  - Interactive password requirements indicator enforcing 5 complexity rules (minimum 8 characters, uppercase letter, lowercase letter, number, and special symbol).
  - Submit button with loading state.
  - Link to `/login` for existing users.
- **Dependencies on Other Pages & Backend**:
  - `POST /api/auth/register`.
  - Auto-provisions `StudentProfile` record and returns JWT token + user payload.
  - Redirects to `/profile` on initial registration for profile setup.
- **Relevant API Endpoints**:
  - `POST /api/auth/register` — *Implemented & verified*.
- **Authentication & Authorization**: Public (guests only). Authenticated users visiting `/register` are automatically redirected to `/dashboard`.
- **Expected UI States**:
  - *Loading*: Spinner on submit button with disabled form inputs.
  - *Error*: Inline field validation alerts (email already registered, password mismatch, short password).
  - *Success*: Toast message "Account created successfully! Redirecting to profile..." and seamless session start.

#### 5. Login — `/login`
- **Purpose & Primary User**: Authentication gateway for returning students and system administrators.
- **Main Information & Actions**:
  - Email and Password input fields with show/hide password toggle.
  - "Remember session" checkbox.
  - Primary "Sign In" button.
  - Links to `/register` and `/help`.
- **Dependencies on Other Pages & Backend**:
  - `POST /api/auth/login`.
  - `GET /api/auth/me` (to verify user role).
  - Stores JWT token in `localStorage`.
  - Redirects student to `?redirect=` param or `/dashboard`; redirects admin to `/admin`.
- **Relevant API Endpoints**:
  - `POST /api/auth/login` — *Implemented & verified*.
  - `GET /api/auth/me` — *Implemented & verified*.
- **Authentication & Authorization**: Public (guests only). Authenticated users are redirected based on role (`/dashboard` or `/admin`).
- **Expected UI States**:
  - *Loading*: Submit button loading spinner.
  - *Error*: "Invalid email or password" banner.
  - *Success*: Immediate transition to destination dashboard.

#### 5b. Forgot / Reset Password — `/forgot-password`
- **Purpose & Primary User**: Self-service account recovery page allowing students and administrators to reset a forgotten password securely using human verification (CAPTCHA) and strong password rules without requiring external paid email/SMS services (OTP planned for future iteration).
- **Main Information & Actions**:
  - Registered Email Address input with strict RFC email validation.
  - Visual anti-bot SVG CAPTCHA puzzle (6-character distorted challenge with noise lines and rotation) and refresh button.
  - New Password input with real-time 5-criteria Password Strength Indicator (min 8 chars, uppercase, lowercase, number, special symbol).
  - Confirm Password input.
  - Primary "Verify CAPTCHA & Reset Password" button with loading spinner.
  - "Back to Sign In" footer link.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/auth/captcha` — Generates signed CAPTCHA token and SVG challenge.
  - `POST /api/auth/reset-password` — Validates CAPTCHA cryptographic token, email, and strong password rules, then updates password hash.
- **Authentication & Authorization**: Public (guests only). Authenticated users are redirected to `/dashboard`.
- **Expected UI States**:
  - *Loading*: Spinner while loading CAPTCHA challenge or submitting reset request.
  - *Error*: Inline alert if CAPTCHA solution is incorrect/expired, email is unregistered, or password fails complexity rules.
  - *Success*: Green check banner confirming password reset and a direct "Proceed to Sign In" CTA.

#### 6. Help and FAQ — `/help`
- **Purpose & Primary User**: Comprehensive reference guide and FAQ for students, placement officers, and viva examiners explaining the platform's methodology, algorithmic fairness, and troubleshooting steps.
- **Main Information & Actions**:
  - Categorized FAQ accordions:
    - *Matching Methodology*: Explains the transparent, deterministic Venn matching formula without black-box scoring.
    - *PathPilot Distinction*: Clarifies that CareerFit is for readiness evaluation & job matching, not curriculum learning.
    - *Assessments & Integrity*: Explains why answers are validated server-side to prevent client-side inspection.
    - *Readiness Report*: Explains how the approved 60/40 composite readiness index is synthesized.
    - *Zero-Budget & Privacy*: Explains the ₹0 cost policy, synthetic test data, and local storage rules.
  - Search bar to filter FAQs by keyword.
  - Placement Cell contact info and feedback submission form.
- **Dependencies on Other Pages & Backend**:
  - Static client-side FAQ data; optional `GET /api/health` diagnostic display.
  - Links to `/jobs`, `/assessments`, `/profile`.
- **Relevant API Endpoints**:
  - Static documentation or optional `GET /api/health` — *Implemented & verified*.
- **Authentication & Authorization**: Public (accessible to all).
- **Expected UI States**:
  - *Success*: Instant render with accordion toggle animations.
  - *Empty Search*: "No answers match your question" with reset button.

---

### Category B: Student Pages (Authenticated Student Role)

#### 7. Student Dashboard — `/dashboard`
- **Purpose & Primary User**: Central command center for authenticated students to review their placement readiness posture, recent test performance, active preparation goals, and quick actions.
- **Main Information & Actions**:
  - High-level metric cards: Overall Readiness Score (radial gauge), Verified Skills Count, Assessments Completed, Target Roles Matched.
  - Quick Actions Bar: "Upload / Analyze Resume" (`/resume`), "Take Assessment" (`/assessments`), "Browse Curated Jobs" (`/jobs`), "View Latest Report" (`/reports/:reportId`), "View Improvement Plan" (`/improvement-plan`).
  - Recent Assessment Activity table: Latest 3 test attempts with scores, pass badges, and "Review Result" links.
  - Priority Skill Recommendations widget: Top 3 missing skills across saved/target jobs with direct "Take Practice Quiz" actions.
  - Readiness Progress mini-sparkline showing preparation trajectory.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/profile` (skills, profile completion).
  - `GET /api/assessments/attempts` (recent test scores).
  - `GET /api/reports/latest` (latest readiness report).
  - Links to `/profile`, `/resume`, `/jobs`, `/assessments`, `/reports/:reportId`, `/progress`, `/improvement-plan`.
- **Relevant API Endpoints**:
  - `GET /api/profile` — *Implemented & verified*.
  - `GET /api/assessments/attempts` — *Planned / not implemented*.
  - `GET /api/reports/latest` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role). Guests redirected to `/login?redirect=/dashboard`.
- **Expected UI States**:
  - *Loading*: Multi-widget dashboard skeleton layout.
  - *Empty / New Student*: Welcoming onboarding checklist: "1. Add your college details, 2. Add your skills or upload resume, 3. Check your first job match".
  - *Error*: Widget-level retry buttons if a specific metric fails to load.
  - *Success*: Full multi-card interactive dashboard.

#### 8. My Profile — `/profile`
- **Purpose & Primary User**: Profile editing center for students to manage academic credentials, verified skills inventory, projects portfolio, and work experiences.
- **Main Information & Actions**:
  - Academic Profile Card: Full Name, Email (read-only), Headline, College Name, Graduation Year (1990–2040 validation), Phone.
  - Interactive Skills Manager: Case-insensitive deduplicated skill tags, autocomplete input, popular skill suggestions, one-click delete chips.
  - Education History Section: Institution, degree, field of study, start/end year, grade/CGPA with Add/Edit/Remove items.
  - Academic & Personal Projects: Title, description, tech stack tags, live demo / GitHub link.
  - Work Experience & Internships: Title, company, duration, description.
  - Resume Snapshot Card: Current resume status (filename, upload date, raw text preview, CTA to `/resume`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/profile`, `PUT /api/profile`, `POST /api/profile/skills`, `DELETE /api/profile/skills/:skill`.
  - Links to `/resume`, `/dashboard`.
- **Relevant API Endpoints**:
  - `GET /api/profile` — *Implemented & verified*.
  - `PUT /api/profile` — *Implemented & verified*.
  - `POST /api/profile/skills` — *Implemented & verified*.
  - `DELETE /api/profile/skills/:skill` — *Implemented & verified*.
- **Authentication & Authorization**: Protected (Student role; strictly bound to authenticated `req.user._id`).
- **Expected UI States**:
  - *Loading*: Profile form shimmer skeleton.
  - *Validation Error*: Inline red warnings on out-of-range graduation years or empty mandatory fields.
  - *Unsaved Changes*: Floating save bar alert when edits are detected.
  - *Success*: Green success toast on save.

#### 9. Resume Analyzer — `/resume`
- **Purpose & Primary User**: Focused workspace for students to upload a resume document (PDF/TXT), extract raw text locally, detect technical skills algorithmically, and selectively merge detected skills into their verified profile.
- **Main Information & Actions**:
  - Drag-and-drop file upload zone supporting `.pdf` and `.txt` files with file size (< 2MB) and type checking.
  - Local text extraction preview with collapsible text viewer.
  - Algorithmic Skill Extractor results table:
    - *Already Verified Skills*: Skills already present in student profile.
    - *Detected New Skills*: Skills detected in resume but missing from profile; includes multi-select checkboxes and a "Merge Selected into Profile" CTA.
    - *Unmatched Keywords*: Extracted technical terms for manual review.
  - Manual Text Fallback: Collapsible textarea allowing students to paste raw resume text if upload fails or is skipped.
  - Phase 3 Optional AI Enrichment button: Suggests bullet point enhancements with offline fallback.
- **Dependencies on Other Pages & Backend**:
  - `POST /api/resume/upload` (multipart/form-data upload via `multer`).
  - `POST /api/resume/extract-skills` (keyword matching against skill dictionary).
  - `PUT /api/profile` (updates `resume.rawText` and skills).
  - Links to `/profile`, `/jobs`.
- **Relevant API Endpoints**:
  - `PUT /api/profile` (rawText storage) — *Implemented & verified*.
  - `POST /api/resume/upload` — *Planned / not implemented* (`multer` + `pdf-parse`).
  - `POST /api/resume/extract-skills` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Empty / Ready*: Upload drop-zone with file guidelines.
  - *Uploading / Extracting*: Progress bar with animated extraction steps.
  - *Error*: Clear message on unreadable PDF (scanned image) with prompt to paste text manually.
  - *Success*: Split view showing text snippet preview and detected skill confirmation checklist.

#### 10. Job Match Analysis — `/jobs/:id/match`
- **Purpose & Primary User**: Interactive diagnostic screen calculating and explaining the exact algorithmic match between the student's skills and a target job role.
- **Main Information & Actions**:
  - Job Header Summary: Title, company, location, experience level, total required skills.
  - Overall Match Score Gauge: Prominent deterministic percentage calculated via:
    $$\text{Match Percentage} = \left(\frac{|\text{Student Skills} \cap \text{Required Skills}|}{|\text{Required Skills}|}\right) \times 100$$
  - Four Explainable Skill-Gap Quadrants:
    1. **Matched Mandatory Skills** (Green badges with checkmarks).
    2. **Missing Mandatory Skills** (Red badges with warning icons).
    3. **Missing Preferred Skills** (Yellow/amber badges).
    4. **Bonus Profile Skills** (Blue badges representing extra competencies).
  - Action Plan CTAs: "Take Assessment in [Missing Skill]" (deep links to `/assessments`), "Generate Full Readiness Report" (`/reports/generate`), "Save Role" (`/saved-jobs`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/jobs/:id`.
  - `GET /api/profile`.
  - `POST /api/matching/evaluate` (deterministic scoring endpoint).
  - Links to `/jobs/:id`, `/assessments`, `/reports/:reportId`.
- **Relevant API Endpoints**:
  - `GET /api/jobs/:id` — *Implemented & verified*.
  - `GET /api/profile` — *Implemented & verified*.
  - `POST /api/matching/evaluate` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Circular progress animation while skills are compared.
  - *Incomplete Profile Alert*: Banner if student profile has 0 skills with "Add Skills First" button.
  - *Error*: 404 alert if job not found.
  - *Success*: Full breakdown with color-coded tags and direct action links.

#### 11. Assessment Center — `/assessments`
- **Purpose & Primary User**: Catalog and discovery hub for students to browse and launch placement-focused aptitude and technical assessments.
- **Main Information & Actions**:
  - Category Filter Tabs: All, Aptitude (Quantitative, Logical, Verbal), Technical (JavaScript, Python, Core CS, SQL, Web Development).
  - Assessment Cards Grid: Test title, category badge, question count (e.g., 15 MCQs), duration (e.g., 20 mins), target skill tag.
  - Student Attempt Badge on cards: "Best Score: 85% (Passed)" or "Not Attempted".
  - Actions: "Start Assessment" (navigates to `/assessments/:id/attempt`), "Review Past Attempts" link (`/progress`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/assessments`.
  - `GET /api/assessments/attempts/summary` (student's past scores).
  - Links to `/assessments/:id/attempt`, `/progress`.
- **Relevant API Endpoints**:
  - `Assessment.js`, `AssessmentAttempt.js` models — *Present but not verified*.
  - `GET /api/assessments` — *Planned / not implemented*.
  - `GET /api/assessments/attempts` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Card skeleton grid.
  - *Empty*: "No assessments found in this category".
  - *Error*: Retry banner.
  - *Success*: Interactive catalog with filtering.

#### 12. Take Assessment — `/assessments/:id/attempt`
- **Purpose & Primary User**: Distraction-free, timed test-taking environment for a student actively attempting an assessment.
- **Main Information & Actions**:
  - Minimal Assessment Layout: No main navigation sidebar; sticky header with test title, Question X of Y counter, countdown timer with visual warning when < 2 mins remain.
  - Question View: Question text, 4 radio/pill options, "Clear Selection" button, "Mark for Review" flag.
  - Question Palette: Grid of question pills color-coded by state (Answered, Unanswered, Marked for Review) for instant navigation.
  - Action Controls: "Previous", "Next", and prominent "Submit Assessment" button with modal confirmation showing answered count.
  - Auto-submit trigger on timer expiration.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/assessments/:id/start` (questions delivered with correct answers and explanations omitted to prevent client inspection).
  - `POST /api/assessments/:id/submit` (grades answers server-side).
  - Links to `/assessments/attempts/:attemptId` on submission.
- **Relevant API Endpoints**:
  - `GET /api/assessments/:id/start` — *Planned / not implemented*.
  - `POST /api/assessments/:id/submit` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Full-page test loading spinner.
  - *Active Test*: Real-time countdown timer and option selection.
  - *Timer Warning*: Pulsing orange/red indicator when time is running out.
  - *Submitting*: Full-screen processing spinner: "Grading your answers server-side...".
  - *Submission Error*: Retry modal with saved local answers so student never loses work.

#### 13. Assessment Result — `/assessments/attempts/:attemptId`
- **Purpose & Primary User**: Detailed diagnostic feedback screen displaying overall score, pass/fail status, topic breakdown, and question-by-question review with explanations.
- **Main Information & Actions**:
  - Performance Summary Card: Total Score, Total Questions, Percentage Score, Pass/Fail Status (benchmark: >= 70%), Time Taken.
  - Topic Accuracy Breakdown: Percentage accuracy in sub-topics.
  - Detailed Question-by-Question Review:
    - Question text.
    - Student's selected option.
    - Correct answer highlighted in green.
    - Red indicator if student selected incorrectly.
    - Detailed pedagogical explanation for the correct answer.
  - Actions: "Re-take Assessment" (`/assessments/:id/attempt`), "Explore Matching Jobs" (`/jobs`), "View Readiness Report" (`/reports/:reportId`), "Return to Assessments" (`/assessments`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/assessments/attempts/:attemptId`.
  - Links to `/assessments`, `/reports/:reportId`, `/progress`.
- **Relevant API Endpoints**:
  - `GET /api/assessments/attempts/:attemptId` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role, owner only: `attempt.userId === req.user._id`).
- **Expected UI States**:
  - *Loading*: Skeleton result cards.
  - *Error*: 404 if attempt not found or unauthorized.
  - *Success*: Rich diagnostic report with collapsible questions.

#### 14. Career Readiness Report — `/reports/:reportId`
- **Purpose & Primary User**: Flagship deliverable of CareerFit — an authoritative, comprehensive placement readiness report synthesizing skill matching against a target role with objective assessment scores.
- **Main Information & Actions**:
  - Header: Student Name, Target Job Title, Target Company, Evaluation Date, Report ID.
  - **Approved Composite Readiness Index**:
    $$\text{Readiness Index} = (0.60 \times \text{Skill Match Percentage}) + (0.40 \times \text{Assessment Score Percentage})$$
  - **Calculation & Display Rules (per ADR-012)**:
    1. Both inputs normalized to a 0–100 scale; resulting index strictly bounded between 0 and 100.
    2. `Skill Match Percentage` uses the agreed explainable matching formula; its formula must not be invented or silently changed.
    3. `Assessment Score Percentage` is calculated from evaluated assessment attempts using a clearly documented aggregation rule.
    4. **Missing Data State**: If assessment results or job-match data are missing, the system must **not silently treat missing data as zero**. Instead, an appropriate incomplete or unavailable state (e.g., `"Assessment Pending"`, `"Incomplete Evaluation"`) must be defined and displayed.
    5. Component scores (Skill Match % and Assessment Score %) must always be displayed alongside the composite index so students understand their results.
    6. Presented as a project-defined readiness indicator, not a scientifically validated hiring probability.
  - Four Diagnostic Quadrants:
    1. **Verified Core Strengths**: Skills present in profile and validated by passing test scores.
    2. **Critical Placement Gaps**: Missing mandatory job skills and failed assessment topics.
    3. **Aptitude & Technical Rating**: Standardized scoring breakdown.
    4. **Targeted Remediation Roadmap**: Prioritized milestones to achieve >= 80% readiness.
  - Action Toolbar:
    - "Download Report as PDF" (*Method selection under discussion; candidates: client-side `jsPDF` vs. browser print-to-PDF; strictly ₹0 budget*).
    - "View Actionable Improvement Plan" (primary action leading to dedicated route `/improvement-plan`).
    - "Re-evaluate Readiness" (`/reports/generate`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/reports/:reportId`.
  - `POST /api/reports/generate`.
  - Links to `/improvement-plan`, `/progress`, `/jobs/:id/match`.
- **Relevant API Endpoints**:
  - `GET /api/reports/:reportId` — *Planned / not implemented*.
  - `POST /api/reports/generate` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role, owner only).
- **Expected UI States**:
  - *Generating*: Calculation animation with progress indicators.
  - *Error*: 404 if report not found.
  - *Success*: High-fidelity report view with print-ready stylesheet.

#### 15. Progress History — `/progress`
- **Purpose & Primary User**: Longitudinal tracking view for students to monitor skill growth, test score trajectories, and readiness index improvement over time.
- **Main Information & Actions**:
  - Readiness Trajectory Chart: Visual line chart showing score progression across generated reports.
  - Assessment Score History: Bar chart comparing Aptitude vs Technical scores over time.
  - Complete Attempt History Table: Date, Assessment Title, Category, Score, Percentage, Status Badge, Action link to `/assessments/attempts/:attemptId`.
  - Past Generated Reports Table: Date, Target Job, Readiness Index, Action link to `/reports/:reportId`.
  - Overall Velocity Metric: Score improvement delta (+18% over the last 30 days).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/progress` (aggregates user attempts and reports).
  - Links to `/assessments/attempts/:attemptId`, `/reports/:reportId`, `/dashboard`.
- **Relevant API Endpoints**:
  - `GET /api/progress` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Chart and table shimmer skeletons.
  - *Empty*: "No test attempts or reports recorded yet" with CTA to "Take your first assessment".
  - *Success*: Interactive charts and sortable history tables.

#### 16. Saved Jobs — `/saved-jobs`
- **Purpose & Primary User**: Personal shortlist manager for students to organize target job postings, track changing requirements, and monitor current match percentages.
- **Main Information & Actions**:
  - Saved Job Cards: Job Title, Company, Location, Date Saved, Live Match Score Badge.
  - Readiness Status Indicator: "Ready to Apply" (>= 80%), "Needs Preparation" (< 80%), "Assessment Pending".
  - Quick Actions: "Check Current Match" (`/jobs/:id/match`), "View Specification" (`/jobs/:id`), "Remove from Saved" (with optimistic removal).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/saved-jobs`.
  - `DELETE /api/saved-jobs/:jobId`.
  - Links to `/jobs/:id`, `/jobs/:id/match`, `/jobs`.
- **Relevant API Endpoints**:
  - `GET /api/saved-jobs` — *Planned / not implemented*.
  - `DELETE /api/saved-jobs/:jobId` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Card skeleton placeholders.
  - *Empty*: "You have no saved jobs" with CTA to "Browse Job Directory".
  - *Success*: Grid of shortlisted jobs with real-time match badges.

#### 17. Improvement Plan — `/improvement-plan` (Approved Standalone Route)
- **Purpose & Primary User**: Actionable, task-oriented preparation curriculum derived directly from identified skill gaps and failed assessment questions. Approved by project owner as an independent protected student route (ADR-011).
- **Main Information & Actions**:
  - Target Role Header & Estimated Preparation Timeline (e.g., "Target: Full-Stack Developer • 3 Weeks to Placement Ready").
  - Plan Completion Progress Bar (e.g., "5 of 12 Tasks Completed - 42%").
  - Categorized Task Checklist:
    - *Priority 1: Missing Mandatory Skills* (e.g., "Learn Express routing and middleware", "Complete MongoDB indexing exercise").
    - *Priority 2: Assessment Remediation* (e.g., "Review SQL Joins and Aggregations", "Practice 10 Quantitative Reasoning problems").
    - *Priority 3: Preferred Competencies* (e.g., "Deploy sample app to Render").
  - Interactive checkboxes to toggle task completion with persisted status.
  - Direct CTA button on each item: "Take Assessment on this Topic" or "View Tutorial Guide".
  - Direct navigation link to the associated Readiness Report (`/reports/:reportId`).
- **Dependencies on Other Pages & Backend**:
  - `GET /api/improvement-plan`.
  - `PATCH /api/improvement-plan/tasks/:taskId`.
  - Links to `/reports/:reportId`, `/assessments`, `/profile`.
- **Relevant API Endpoints**:
  - `GET /api/improvement-plan` — *Planned / not implemented*.
  - `PATCH /api/improvement-plan/tasks/:taskId` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role). Accessible directly from student navigation sidebar. Kept unless owner explicitly approves a future change.
- **Expected UI States**:
  - *Loading*: Checklist skeleton.
  - *Empty*: "No active improvement plan. Generate a Readiness Report to create your customized plan."
  - *Success*: Interactive checklist with celebratory progress milestone animations.

#### 18. Notifications — `/notifications` (Approved Route & Dropdown)
- **Purpose & Primary User**: Dedicated activity feed for students to review genuine platform events, alerts, and placement readiness updates. Approved by project owner to be retained alongside the navbar notification dropdown (ADR-009).
- **Main Information & Actions**:
  - Filter Tabs: All, Job Alerts, Assessment Results, Readiness Updates, Profile Milestones.
  - Event Cards List: Title, detailed message, timestamp, unread indicator, direct action link.
  - Actions: "Mark All as Read", "Clear All", click item to navigate to target entity.
  - **Approved Event Categories**:
    1. *Job match*: A newly posted job matches the student's skills at 75% or higher.
    2. *Assessment*: An assessment attempt has been submitted and evaluated.
    3. *Readiness report*: A readiness report has been generated or recalculated.
    4. *Profile completion*: The student reaches a defined profile-completion milestone (exact threshold to be defined before coding).
  - **Integrity & Operational Rules**:
    - Notification generation, persistence, read/unread state, and retrieval require backend Express implementation.
    - Deduplication rule: Notification triggers must be idempotent to avoid duplicate alerts for repeated processing of the same event.
    - Zero fake, simulated, or decorative notification spam.
    - Strictly REST-based retrieval; no paid external notification services or real-time socket infrastructure.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/notifications`.
  - `PATCH /api/notifications/:id/read`.
  - `PATCH /api/notifications/read-all`.
  - Links to related entity pages (`/assessments/attempts/:id`, `/jobs/:id/match`, `/reports/:id`).
- **Relevant API Endpoints**:
  - `GET /api/notifications` — *Planned / not implemented*.
  - `PATCH /api/notifications/:id/read` — *Planned / not implemented*.
  - `PATCH /api/notifications/read-all` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Notification list shimmer skeleton.
  - *Empty*: "No notifications yet — You're all caught up!".
  - *Success*: Categorized notification feed with real-time read/unread toggle.

#### 19. Settings — `/settings`
- **Purpose & Primary User**: Student account settings, security preferences, and notification controls.
- **Main Information & Actions**:
  - Security Section: Change Password form (Current Password, New Password, Confirm New Password) with validation.
  - Notification Preferences: Toggle email/in-app alerts for new job matches, assessment reminders, and readiness score recalculations.
  - Session Management: Active session details and "Sign Out from All Devices" action.
  - Danger Zone: "Delete Account / Reset Profile" with modal confirmation requiring password re-entry.
- **Dependencies on Other Pages & Backend**:
  - `PUT /api/auth/change-password`.
  - `PUT /api/users/preferences`.
  - `DELETE /api/users/account`.
  - Links to `/profile`, `/login`.
- **Relevant API Endpoints**:
  - `PUT /api/auth/change-password` — *Planned / not implemented*.
  - `DELETE /api/users/account` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Student role).
- **Expected UI States**:
  - *Loading*: Settings panel skeleton.
  - *Error*: Validation error alerts (incorrect current password, password mismatch).
  - *Success*: Success confirmation toast.

---

### Category C: Admin Pages (Authenticated Admin Role)

#### 20. Admin Dashboard — `/admin`
- **Purpose & Primary User**: Administrative command center for placement officers and platform administrators to monitor platform usage, student placement readiness metrics, and system operations.
- **Main Information & Actions**:
  - System Overview Metric Cards: Total Registered Students, Total Curated Job Postings, Total Assessment Attempts, Average Platform Readiness Score.
  - Placement Readiness Distribution Chart: Percentage of students in Ready (>= 80%), Developing (60–79%), and Needs Focus (< 60%) tiers.
  - In-Demand Skills vs Student Availability matrix: Highlights top skill shortages across the student body.
  - Quick Administration Tiles: "Manage Job Descriptions" (`/admin/jobs`), "Manage Assessments & Questions" (`/admin/assessments`), "Manage Users" (`/admin/users`).
  - System Health & Diagnostics widget showing live MongoDB latency and server status.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/admin/metrics`.
  - `GET /api/health`.
  - Links to `/admin/jobs`, `/admin/assessments`, `/admin/users`.
- **Relevant API Endpoints**:
  - `GET /api/admin/metrics` — *Planned / not implemented*.
  - `GET /api/health` — *Implemented & verified*.
- **Authentication & Authorization**: Protected (Admin role only: `role === 'admin'`). Non-admin students redirected to `/unauthorized`.
- **Expected UI States**:
  - *Loading*: Multi-stat dashboard shimmer.
  - *Error*: Error alert with retry button.
  - *Success*: Complete administrative analytics dashboard.

#### 21. Job Management — `/admin/jobs`
- **Purpose & Primary User**: Administrative CRUD interface for placement coordinators to curate, create, edit, and retire industry job descriptions.
- **Main Information & Actions**:
  - Job Postings Data Table: Title, Company, Location, Experience Level, Job Type, Required Skills Count, Sample Role Badge, Actions (Edit, Delete).
  - Search & Filter bar for job records.
  - Job Editor Modal / Form:
    - Inputs: Title, Company, Location, Experience Level (dropdown), Job Type (dropdown), Full Description textarea.
    - Required Skills tag input (enforces at least 1 mandatory skill).
    - Preferred Skills tag input.
    - Sample Job toggle (`isSample`).
  - Actions: "Add New Job", "Edit Job", "Delete Job" with modal confirmation, "Re-seed Default Sample Jobs" utility button.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`.
  - Links to `/admin`.
- **Relevant API Endpoints**:
  - `GET /api/jobs` — *Implemented & verified*.
  - `POST /api/jobs` — *Implemented & verified* (guarded by `authorize('admin')`).
  - `PUT /api/jobs/:id` — *Implemented & verified* (guarded by `authorize('admin')`).
  - `DELETE /api/jobs/:id` — *Implemented & verified* (guarded by `authorize('admin')`).
- **Authentication & Authorization**: Protected (Admin role only).
- **Expected UI States**:
  - *Loading*: Table shimmer skeleton.
  - *Empty*: "No job descriptions configured" with "Seed Default Jobs" CTA.
  - *Error*: Form validation alerts on missing required fields.
  - *Success*: Updated table with instant optimistic or refetched rows.

#### 22. Assessment and Question Management — `/admin/assessments`
- **Purpose & Primary User**: Administrative interface to create and manage assessment tests and maintain multiple-choice question banks.
- **Main Information & Actions**:
  - Assessments Data Table: Title, Category (Aptitude, Technical), Skill Tag, Duration (minutes), Question Count, Actions (Manage Questions, Edit Settings, Delete Test).
  - Question Bank Drawer / Modal:
    - List of questions in selected assessment.
    - Question Editor Form: Question Text, Option 1 to 4 inputs, Correct Option selector (Radio 0–3), Pedagogical Explanation textarea, Category and Difficulty labels.
  - Actions: "Create New Assessment", "Add Question", "Seed Default Question Bank" (approved seed utility providing 25–30 verified placement MCQs), "Preview Test as Student".
  - **Integrity Rules (per ADR-013)**: Re-running seed must be idempotent; historical student attempts must remain stable even if questions are edited later.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/admin/assessments`, `POST /api/admin/assessments`, `PUT /api/admin/assessments/:id`, `DELETE /api/admin/assessments/:id`.
  - Links to `/admin`.
- **Relevant API Endpoints**:
  - `GET /api/admin/assessments` — *Planned / not implemented*.
  - `POST /api/admin/assessments` — *Planned / not implemented*.
  - `PUT /api/admin/assessments/:id` — *Planned / not implemented*.
  - `DELETE /api/admin/assessments/:id` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Admin role only).
- **Expected UI States**:
  - *Loading*: Table shimmer.
  - *Validation Error*: Alert if question has fewer than 2 options or no correct option designated.
  - *Success*: Real-time question list update.

#### 23. User Management — `/admin/users`
- **Purpose & Primary User**: Administrative directory for placement officers to inspect student registrations, monitor student readiness progress, and manage role assignments.
- **Main Information & Actions**:
  - Users Data Table: Name, Email, Role (`student`, `admin`), College, Graduation Year, Skills Count, Date Registered, Actions (View Summary, Change Role, Delete User).
  - Search & Filters: Search by name or email; filter by graduation year, college, or role.
  - Student Detail Inspection Modal: Read-only summary of verified skills, assessment attempt count, and latest readiness report score.
  - Role Assignment Action: Elevate student to admin or revert admin to student with confirmation dialog.
- **Dependencies on Other Pages & Backend**:
  - `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users/:id`.
  - Links to `/admin`.
- **Relevant API Endpoints**:
  - `GET /api/admin/users` — *Planned / not implemented*.
  - `PATCH /api/admin/users/:id/role` — *Planned / not implemented*.
  - `DELETE /api/admin/users/:id` — *Planned / not implemented*.
- **Authentication & Authorization**: Protected (Admin role only). Cannot revoke own admin role to prevent lockout.
- **Expected UI States**:
  - *Loading*: Table skeleton.
  - *Empty Search*: "No users found matching query".
  - *Success*: Searchable, paginated user records.

---

### Category D: Supporting Routes

#### 24. Unauthorized — `/unauthorized`
- **Purpose & Primary User**: Standard HTTP 403 Forbidden screen displayed when an authenticated student attempts to access administrative pages or unauthorized resources.
- **Main Information & Actions**:
  - Clear error header: "403 — Administrative Access Restricted".
  - Explanation: "You do not have the required administrative role to view this page. If you believe this is an error, please contact your placement officer."
  - Action buttons: "Return to Student Dashboard" (`/dashboard`) and "Sign In with Different Account" (`/login`).
- **Dependencies on Other Pages & Backend**: Client-side static route. Links to `/dashboard`, `/login`.
- **Relevant API Endpoints**: None (client-side route).
- **Authentication & Authorization**: Accessible to all authenticated users.
- **Expected UI States**: Static rendered error view.

#### 25. Not Found — `*`
- **Purpose & Primary User**: Standard HTTP 404 screen for invalid, broken, or expired URL paths.
- **Main Information & Actions**:
  - Friendly 404 graphic and heading: "Page Not Found".
  - Explanation: "The page you are looking for doesn't exist or has been moved."
  - Action buttons: "Go to Home" (`/`), "Browse Jobs" (`/jobs`), "Go to Dashboard" (`/dashboard`).
- **Dependencies on Other Pages & Backend**: Client-side catch-all route.
- **Relevant API Endpoints**: None (client-side route).
- **Authentication & Authorization**: Public.
- **Expected UI States**: Static rendered error view.

---

## E. Route Architecture & Approved Overlap Decisions

```
                               OVERLAP DECISION REGISTER
 ┌───────────────────────────────────────┬──────────────────────────────────────────┐
 │ Proposed Route Pair / Overlap         │ Finalized Status & Architectural Role    │
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 1. /jobs/:id vs. /jobs modal          │ Keep /jobs/:id as dedicated deep link;   │
 │                                       │ keep directory preview modal as optional.│
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 2. /jobs/:id/match vs. /jobs/:id      │ Keep /jobs/:id/match separate: authenticated│
 │                                       │ personalized diagnostic vs public JD.    │
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 3. /resume vs. /profile sub-tab       │ Keep /resume separate: dedicated upload &│
 │                                       │ extraction workspace; sync back to profile.│
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 4. /assessments/:id/attempt vs catalog│ Keep /attempt strictly separate: minimal │
 │                                       │ distraction-free layout with active timer│
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 5. /improvement-plan vs /reports/:id  │ APPROVED (ADR-011): Keep standalone      │
 │                                       │ route in student navigation & link from  │
 │                                       │ readiness report.                        │
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 6. /notifications vs navbar dropdown  │ APPROVED (ADR-009): Retain BOTH dropdown │
 │                                       │ and dedicated /notifications route       │
 │                                       │ backed by 4 genuine event categories.    │
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 7. /login & /register vs AuthModal    │ Implement dedicated routes with AuthLayout;│
 │                                       │ retain modal for in-place public actions. │
 ├───────────────────────────────────────┼──────────────────────────────────────────┤
 │ 8. /saved-jobs vs /jobs filter        │ Keep /saved-jobs separate: personalized   │
 │                                       │ shortlist with application status tracking│
 └───────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## F. Core User Journeys & Workflow Integration

The platform architecture directly supports the 5 major user journeys. Each journey has been verified against backend dependencies to identify prerequisite endpoints.

```
                          1. NEW STUDENT ONBOARDING JOURNEY
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Public Home  │ ──> │   Register   │ ──> │ Profile Setup│ ──> │ Resume Upload│
  │     (/)      │     │ (/register)  │     │  (/profile)  │     │   (/resume)  │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                        │
                       ┌──────────────┐     ┌──────────────┐            │
                       │ Match Engine │ <── │  Job Details │ <──────────┘
                       │(/jobs/:id/mat│     │ (/jobs/:id)  │
                       └──────────────┘     └──────────────┘

                          2. ASSESSMENT & GRADING JOURNEY
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Assessment  │ ──> │ Select Test  │ ──> │ Take Attempt │ ──> │ Server Score │
  │    Center    │     │ & Read Rules │     │  with Timer  │     │   & Result   │
  │(/assessments)│     │              │     │  (/attempt)  │     │  (/attempts) │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

                          3. READINESS & IMPROVEMENT JOURNEY
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Review Match │ ──> │ Pass Domain  │ ──> │ Generate Full│ ──> │ Work Through │
  │  & Skill Gap │     │ Assessments  │     │ Readiness Rep│     │ Improvement  │
  │(/jobs/:id/mat│     │(/assessments)│     │ (/reports/:id│     │ Plan (/plan) │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

                          4. RETURNING STUDENT PROGRESS JOURNEY
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │    Login     │ ──> │   Student    │ ──> │ Revisit Saved│ ──> │ Track Score  │
  │   (/login)   │     │  Dashboard   │     │ Jobs & Tests │     │ Progress     │
  │              │     │ (/dashboard) │     │ (/saved-jobs)│     │  (/progress) │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

                          5. ADMINISTRATOR PLACEMENT JOURNEY
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Admin Login  │ ──> │    Admin     │ ──> │ Manage Jobs  │ ──> │ Manage Tests │
  │   (/login)   │     │  Dashboard   │     │ & Seed Data  │     │  & Questions │
  │              │     │   (/admin)   │     │ (/admin/jobs)│     │ (/admin/tests│
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## G. Navigation, Access Control & Shared Layout Architecture

```
                           LAYOUT HIERARCHY & ROUTE GUARDS
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ PublicLayout (Sticky Navbar, Responsive Container, Footer)               │
 │ Routes: /, /jobs, /jobs/:id, /help, /unauthorized, *                     │
 └──────────────────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ AuthLayout (Clean Split/Centered Card Layout, Minimal Header)            │
 │ Routes: /login, /register                                                │
 └──────────────────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ StudentLayout [ProtectedRoute: Student Role]                             │
 │ Desktop Sidebar + Top Header (Notifications, Profile) + Mobile Bottom Bar│
 │ Routes: /dashboard, /profile, /resume, /jobs/:id/match, /assessments,   │
 │         /assessments/attempts/:id, /reports/:id, /progress, /saved-jobs, │
 │         /improvement-plan, /notifications, /settings                     │
 └──────────────────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ AdminLayout [AdminRoute: Admin Role]                                     │
 │ Admin Sidebar + Top Metric Bar + "Exit to Student View" Action           │
 │ Routes: /admin, /admin/jobs, /admin/assessments, /admin/users            │
 └──────────────────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ AssessmentAttemptLayout [Distraction-Free Minimal]                       │
 │ Sticky Header (Timer, Progress Bar, Exit Confirmation) • No Sidebar      │
 │ Route: /assessments/:id/attempt                                          │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## H. Backend and Data Dependencies Matrix

| Page / Route | Primary Backend Capability | Database Models Involved | Capability Status | API Endpoint Contract |
| :--- | :--- | :--- | :--- | :--- |
| **Home (`/`)** | System Health & Sample Jobs | `Job` | **Implemented & verified** | `GET /api/health`, `GET /api/jobs?limit=4` |
| **Job Directory (`/jobs`)** | Search & Filter Jobs | `Job` | **Implemented & verified** | `GET /api/jobs?search=&experienceLevel=&jobType=` |
| **Job Details (`/jobs/:id`)** | Single Job Retrieval | `Job` | **Implemented & verified** | `GET /api/jobs/:id` |
| **Register (`/register`)** | User Registration & Auto Profile | `User`, `StudentProfile` | **Implemented & verified** | `POST /api/auth/register` |
| **Login (`/login`)** | User Login & Role Check | `User` | **Implemented & verified** | `POST /api/auth/login`, `GET /api/auth/me` |
| **Help & FAQ (`/help`)** | Platform Status & FAQs | None / Health | **Implemented & verified** | `GET /api/health` |
| **Dashboard (`/dashboard`)** | Profile & Recent Activity | `StudentProfile`, `AssessmentAttempt`, `ReadinessReport` | **Present but not verified** (Profile verified; attempts & reports planned) | `GET /api/profile`, `GET /api/assessments/attempts`, `GET /api/reports/latest` |
| **Profile (`/profile`)** | Profile CRUD & Skill Dedup | `StudentProfile` | **Implemented & verified** | `GET /api/profile`, `PUT /api/profile`, `POST /api/profile/skills`, `DELETE /api/profile/skills/:skill` |
| **Resume (`/resume`)** | File Upload & Skill Extraction | `StudentProfile` | **Planned / not implemented** (rawText field exists on model) | `POST /api/resume/upload` (`multer` + `pdf-parse`), `POST /api/resume/extract-skills` |
| **Match Analysis (`/jobs/:id/match`)** | Deterministic Venn Matching | `StudentProfile`, `Job` | **Planned / not implemented** | `POST /api/matching/evaluate` |
| **Assessment Center (`/assessments`)** | Assessment Catalog & Scores | `Assessment`, `AssessmentAttempt` | **Present but not verified** (25–30 question seed approved per ADR-013) | `GET /api/assessments`, `GET /api/assessments/attempts/summary` |
| **Take Assessment (`/assessments/:id/attempt`)** | Question Delivery & Server Grading | `Assessment`, `AssessmentAttempt` | **Planned / not implemented** (Answers hidden prior to submission per ADR-007) | `GET /api/assessments/:id/start`, `POST /api/assessments/:id/submit` |
| **Assessment Result (`/assessments/attempts/:id`)**| Detailed Diagnostic & Explanations| `AssessmentAttempt`, `Assessment` | **Planned / not implemented** | `GET /api/assessments/attempts/:attemptId` |
| **Readiness Report (`/reports/:reportId`)** | 60/40 Synthesis Engine & PDF Export | `ReadinessReport` (New Model) | **Planned / not implemented** (Formula approved per ADR-012; PDF open) | `POST /api/reports/generate`, `GET /api/reports/:reportId` |
| **Progress History (`/progress`)** | Longitudinal Growth Aggregator | `AssessmentAttempt`, `ReadinessReport` | **Planned / not implemented** | `GET /api/progress` |
| **Saved Jobs (`/saved-jobs`)** | Shortlist Persistence & Status | `SavedJob` or `StudentProfile.savedJobs` | **Planned / not implemented** | `GET /api/saved-jobs`, `POST /api/saved-jobs/:jobId`, `DELETE /api/saved-jobs/:jobId` |
| **Improvement Plan (`/improvement-plan`)** | Actionable Study Checklist | `ImprovementPlan` or `ReadinessReport.tasks` | **Planned / not implemented** (Approved standalone route per ADR-011) | `GET /api/improvement-plan`, `PATCH /api/improvement-plan/tasks/:taskId` |
| **Notifications (`/notifications`)** | Event-Driven Activity Feed | `Notification` (New Model) | **Planned / not implemented** (4 event triggers approved per ADR-009) | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all` |
| **Settings (`/settings`)** | Password Change & Preferences | `User` | **Planned / not implemented** | `PUT /api/auth/change-password`, `DELETE /api/users/account` |
| **Admin Dashboard (`/admin`)** | Platform Analytics & Metrics | `User`, `Job`, `AssessmentAttempt` | **Planned / not implemented** | `GET /api/admin/metrics`, `GET /api/health` |
| **Admin Jobs (`/admin/jobs`)** | Job CRUD & Idempotent Seeding | `Job` | **Implemented & verified** (Backend controllers exist with admin auth; admin UI planned) | `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id` |
| **Admin Assessments (`/admin/assessments`)** | Assessment & Question CRUD | `Assessment` | **Planned / not implemented** (Idempotent seed planned per ADR-013) | `GET /api/admin/assessments`, `POST /api/admin/assessments`, `PUT /api/admin/assessments/:id`, `DELETE /api/admin/assessments/:id` |
| **Admin Users (`/admin/users`)** | Student Directory & Roles | `User`, `StudentProfile` | **Planned / not implemented** | `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users/:id` |
| **Unauthorized (`/unauthorized`)** | Client Error Display | None | **Client-side only** | Static view |
| **Not Found (`*`)** | Client Error Display | None | **Client-side only** | Static view |

---

## I. Implementation Roadmap & Testable Module Breakdown

Development is structured into **10 sequential, testable modules**:

```
                           SEQUENTIAL MODULE ROADMAP
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 1: Client Routing Foundation & Shared Layouts                     │
 │ Install react-router-dom, build 4 shared layouts, implement route guards │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 2: Authentication & Student Profile Completion                    │
 │ Dedicated /login, /register, full profile view/edit, education/projects  │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 3: Resume Handling & Safe Text Extraction                         │
 │ Multer upload, local pdf-parse, keyword extractor, profile sync          │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 4: Job Directory & Dedicated Job Details                          │
 │ Full /jobs page, /jobs/:id specification view, search/filtering polish   │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 5: Deterministic Skill Matching & Skill-Gap Engine                │
 │ /jobs/:id/match route, Venn gap categorization, explainable scoring      │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 6: Assessments, Server-Side Scoring & Question Bank               │
 │ Seed 25-30 MCQs (ADR-013), /assessments, /attempt view, /attempts/:id   │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 7: Career Readiness Reports, Improvement Plan & Progress History  │
 │ 60/40 composite index (ADR-012), standalone /improvement-plan (ADR-011)  │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 8: Saved Jobs, Genuine Notifications, Settings & Help             │
 │ /saved-jobs, REST notifications for 4 genuine triggers (ADR-009)         │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 9: Admin Management Suite                                         │
 │ /admin dashboard, /admin/jobs CRUD, /admin/assessments, /admin/users     │
 └──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Module 10: Quality Verification, Accessibility & Viva Demonstration      │
 │ End-to-end flow tests, mobile responsiveness, zero-budget audit, defense │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## J. Architectural Decisions Log (ADR Summary)

| ADR ID | Date / Milestone | Decision Topic | Options Considered | Final Decision | Rationale & Viva Defense |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Phase 1 | Language & Framework Selection | TypeScript vs. Pure JavaScript (ESM) | Pure JavaScript with ES Modules | Avoids compilation mismatch in live viva; approachable for college level. |
| **ADR-002** | Phase 1 | Skill Matching Architecture | AI-First Scoring vs. Deterministic Formula | Deterministic Algorithm with Optional AI | Guarantees 100% offline functionality, zero cost, and explainable scoring. |
| **ADR-003** | Phase 1 | Repository Organization | Multi-repo vs. Monorepo (`/client`, `/server`)| Single Monorepo with root scripts | Keeps all project assets unified while preserving client/server security boundaries. |
| **ADR-004** | Phase 1 | Database Connection Resilience | Strict Crash vs. Graceful Degraded Mode | Graceful Degraded Mode with Health API | Permits frontend UI work and offline route testing even if DB is momentarily unreachable. |
| **ADR-005** | Phase 2 | Profile Isolation & Job Authorization | Open CRUD vs. Role-Based Permissions | JWT Binding for Profiles; Admin for Job CRUD | Prevents horizontal privilege escalation and guarantees job description integrity. |
| **ADR-006** | Open | Resume Parsing Engine | Local `pdf-parse` vs. Cloud OCR vs. Manual | *Shortlisted*: `pdf-parse` + manual fallback | Local parsing preserves ₹0 budget and data privacy without external API tokens. |
| **ADR-007** | Open | Assessment Answer Protection | Client-side grading vs. Backend verification | *Shortlisted*: Backend grading | Prevents students from inspecting browser network payloads to discover correct answers. |
| **ADR-008** | Open | Client-Side Routing Architecture | Single-Page Tab State vs. `react-router-dom` | *Shortlisted*: `react-router-dom` (v6) | Required to support 25 distinct routes, deep linking, browser history, and modular layouts. |
| **ADR-009** | Phase 2 (Module 8) | Notification Delivery Architecture | Real-time WebSocket vs. Event-Driven REST | **Approved by Owner**: Event-Driven REST API | 4 genuine event triggers; no socket complexity; strictly ₹0 budget. |
| **ADR-010** | Phase 2 (Module 7) | Career Readiness Report Export | Headless Puppeteer vs. Client `jsPDF` vs. Print CSS | **Under Discussion / Open** | Decision kept open pending report design review. Strictly ₹0 cost. |
| **ADR-011** | Phase 2 (Module 7) | Improvement Plan Route Architecture | Embedded Tab in Report vs. Standalone Route | **Approved by Owner**: Standalone Protected Route | Provides dedicated preparation checklist with task completion tracking in student navigation. |
| **ADR-012** | Phase 2 (Module 7) | Readiness Index Weighting & Missing Data | Equal 50/50 vs. 60/40 Weighting | **Approved by Owner**: 60/40 Weighting | $(0.60 \times \text{Skill Match}) + (0.40 \times \text{Assessment})$; missing data not treated as zero; normalized 0-100. |
| **ADR-013** | Phase 2 (Module 6) | Assessment Question Bank Scope & Seeding | Ad-hoc creation vs. Curated Seed Bank | **Approved by Owner**: 25–30 Reviewed Seed MCQs | Curated across Quantitative, Logical, JS, SQL, Core CS; idempotent seed; answer protection. |

---

## K. Budget, Privacy & Quality Standards

### 1. Financial & Operational Constraints
- **Total Project Budget**: **₹0 (Zero Rupees)**.
- Under no circumstances will paid APIs, commercial subscriptions, or paid cloud services be introduced.
- Credit card / billing activation is strictly prohibited.
- All core features (matching, assessments, reports, PDF export, notifications) must execute offline or on free local services.

### 2. Privacy & Data Handling Guidelines
- **Zero Real Student Data**: Never commit, upload, or test with real student credentials, phone numbers, addresses, or private academic transcripts.
- **Synthetic Test Personas**: All demonstration data must use clearly labeled synthetic accounts (e.g., `student.test@example.edu`, `Aarav Mehta`).
- **AI Processing Guardrails (Phase 3)**: If resume text is sent to an external AI provider (Google Gemini API), strip out PII (emails, phone numbers, full addresses) on the backend prior to dispatch.

### 3. Engineering & viva Quality Standards
- **Zero Placeholder Policy**: No decorative pages, no placeholder buttons ("Coming Soon"), and no mock data presented as real user records. Every retained page must connect to working backend capabilities.
- **Server-Side Enforcement**: All security, role checks, and scoring formulas must be validated on the backend. Frontend validation is strictly for user guidance.
- **Resilient UI States**: Every data-driven component must implement four distinct states: Loading (skeleton/shimmer), Empty (helpful guidance), Error (actionable message + retry), and Success.

---

## L. Remaining Open Decisions for Future Architectural Alignment

The project owner has finalized decisions on the standalone improvement-plan route, the 4 genuine notification categories, the 60/40 readiness index weighting, and the 25–30 question seed bank. The following items remain open for future technical review:

1. **Career Readiness Report PDF Export Method (ADR-010)**:
   - Kept explicitly **open** until the visual design and layout of `/reports/:reportId` have been reviewed.
   - Candidate options: client-side `jsPDF` / `html2pdf.js` vs. browser native print-to-PDF with clean `@media print` CSS.
   - Strict constraint: Must respect the ₹0 budget and avoid heavy server-side headless browsers.
2. **Component Scoring & Multi-Assessment Aggregation Rules**:
   - The 60/40 weighting is approved, but the specific mathematical aggregation rule to combine multiple assessment attempts across different skills/categories (e.g., Aptitude test score + JavaScript technical score) into the single 0–100 `Assessment Score Percentage` remains to be finalized in Module 6/7.
   - The exact weighting formula between mandatory and preferred skills in the `Skill Match Percentage` calculation remains to be finalized in Module 5.
3. **Profile Completion Notification Milestone Threshold**:
   - The exact percentage and required checklist fields (e.g., college, graduation year, $\ge 3$ skills, $\ge 1$ project) to trigger the `profile_completion` notification must be formally defined prior to coding Module 8.
4. **Historical Attempt Immutability Schema Pattern**:
   - The exact schema mechanism (e.g., storing a full question snapshot inside `AssessmentAttempt.answers` vs. immutable question versioning) to ensure past student scores remain mathematically valid if administrators later edit or retire questions.
5. **Secondary UX Option Preferences**:
   - Future preference on whether `/jobs/:id` quick-preview drawer should remain alongside the dedicated route, and whether `AuthModal.jsx` should be retained for in-place public actions.

---

## M. Standard Development Workflow

When implementing future tasks or modifying code, follow this disciplined sequence:

```
[1] Read Master Plan & AGENTS.md
       │
[2] Inspect Existing Implementation (Never guess file paths or models)
       │
[3] Formulate Minimal Implementation Scope
       │
[4] Implement Code Changes (Adhere to MERN, ES Modules, Viva standards)
       │
[5] Execute Automated Tests & Production Build (`npm test`, `npm run build`)
       │
[6] Verify Live Application Endpoints
       │
[7] Update Project Documentation (Master Plan, Project Plan, Architecture)
       │
[8] Provide Concise, Evidence-Based Summary
```

**Golden Rule of Verification**: Never claim a feature works, an integration succeeds, or a test passed unless the terminal or script output has explicitly verified it.

---

## N. Document Change History

| Version | Date | Author / Context | Summary of Major Changes |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-10-28 | Senior Full-Stack Agent / Major Project | Initial creation of central reference document encompassing overview, verified status, tech stack, roadmap, evaluation register, zero-budget privacy rules, ADR log, and next actions. |
| **1.1.0** | 2026-11-01 | Senior Full-Stack Agent / Major Project | Updated with complete 25-page route structure, detailed route specifications, overlap analysis, 5 core user journeys, navigation & access control architecture, page-to-API dependency matrix with physical repository verification, 10-module testable roadmap, and initial evaluation records. |
| **1.2.0** | 2026-11-01 | Senior Full-Stack Agent / Major Project | Recorded owner-approved decisions: standalone `/improvement-plan` route (ADR-011), genuine REST notifications for 4 approved event categories (ADR-009), 60/40 Career Readiness Index weighting and missing-data rules (ADR-012), and 25–30 placement MCQ seed bank constraints (ADR-013). Maintained PDF export (ADR-010) and component aggregation formulas as open decisions. |
