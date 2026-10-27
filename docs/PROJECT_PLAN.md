# CareerFit — Project Plan & Status

## Project Scope
CareerFit is a Career Readiness and Job Matching Platform designed as a college major project. It allows students to build profiles, assess job readiness against industry job descriptions, detect skill gaps, take technical and aptitude assessments, and receive actionable readiness reports and recommendations.

---

## Milestone Checklist

### Phase 1: Architecture & Foundation
- [x] Workspace inspection & tooling verification (Node v24, npm v11, Git).
- [x] Permanent project rules (`AGENTS.md`) and documentation setup (`docs/`).
- [x] Project scaffolding (`/client` with Vite + React + Tailwind CSS, `/server` with Express + Mongoose).
- [x] Root orchestration setup (`package.json` scripts, `.gitignore`).
- [x] Environment configuration templates (`.env.example` in root/server/client).
- [x] Database connection handling (Mongoose with reconnect/graceful status checks).
- [x] Foundational models (`User`, `StudentProfile`, `Job`, `AssessmentAttempt`).
- [x] Core API structure & Health/Status endpoints (`/api/health`, `/api/auth`).
- [x] Functional verification of client & server communication.

### Phase 2: Core Functional Modules
- [ ] **Module 1**: Student Profile (Personal details, education, skills, projects, experience).
- [ ] **Module 2**: Resume Handling (Upload, text extraction, skill detection).
- [ ] **Module 3**: Job Management (Curated sample jobs, custom job role input/selection).
- [ ] **Module 4**: Skill Matching (Transparent, deterministic match percentage algorithm).
- [ ] **Module 5**: Skill-Gap Analysis (Matched, missing, and bonus skills categorized).
- [ ] **Module 6**: Placement Assessments (Aptitude & technical MCQs, scoring, attempt history).
- [ ] **Module 7**: Readiness Report (Combined job-fit score, assessment score, strengths & weaknesses).
- [ ] **Module 8**: Student Dashboard (Progress metrics, quick actions, recent reports).

### Phase 3: AI Capabilities
- [ ] Modular AI service adapter (Google Gemini / OpenAI compatible backend wrapper).
- [ ] Resume skill extraction fallback & AI enrichment.
- [ ] Personalized learning path & improvement recommendations.
- [ ] Graceful fallback to deterministic recommendations when AI key is absent.

### Phase 4: UI/UX Redesign
- [ ] Information architecture & navigation flow overhaul.
- [ ] Design system tokens (typography, color palette, spacing).
- [ ] Responsive layouts, accessible components, and micro-interactions.
- [ ] Viva presentation readiness polish.

---

## Current Status
- **Current Milestone**: Phase 1 (Architecture & Foundation) in progress.
- **Active Task**: Scaffolding backend and frontend, setting up DB connection, and verifying health check.
