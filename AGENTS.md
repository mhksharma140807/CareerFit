# CareerFit — Permanent Agent Instructions

## 1. Project Identity & Purpose
- **Project Name**: CareerFit
- **Project Title**: Career Readiness and Job Matching Platform
- **Context**: College major project (functional, reliable, maintainable; explainable in viva).
- **Core Purpose**: Helps students evaluate placement readiness by comparing skills against job requirements, identifying skill gaps, taking aptitude/technical assessments, and receiving readiness reports and improvement recommendations.
- **Distinction**: Must remain strictly distinct from *PathPilot* (internship learning platform). CareerFit focuses on readiness evaluation, job matching, assessments, and skill-gap analysis.

## 2. Technology Stack
- **Frontend**: React (JavaScript, JSX) with Vite (`/client`).
- **Styling**: Tailwind CSS (functional in Phases 1-3; polished in Phase 4).
- **Backend**: Node.js & Express (`/server`).
- **Database**: MongoDB with Mongoose.
- **Authentication**: Secure server-side auth (bcrypt password hashing, JWT/session tokens, protected routes).
- **Tooling & VCS**: Git, npm workspaces or root orchestration scripts.

## 3. Phased Implementation Roadmap
- **Phase 1 (Current)**: Architecture & Foundation (scaffolding, DB connection, basic models, API routes, health checks, environment configs).
- **Phase 2**: Core Functional Modules (Profile, Resume parsing, Job matching, Skill-gap analysis, Assessments, Readiness report, Dashboard).
- **Phase 3**: AI Capabilities (Modular resume skill extraction & personalized recommendations; graceful fallback when unconfigured).
- **Phase 4**: UI/UX Redesign (Visual identity, accessibility, responsive polish, micro-interactions without breaking functionality).

## 4. Engineering & Operational Standards
1. **Never fabricate functionality**: Matching and assessment logic must work algorithmically without AI API requirements. Never fake AI outputs or claim unverified tests/operations succeeded.
2. **Backend Validation**: Always validate on the server side; frontend validation is for UX only.
3. **Security**: Store all secrets in `.env`. Never commit credentials or real student data. Maintain `.env.example` with placeholders.
4. **Viva-Ready Code**: Keep code clean, modular, self-explanatory, and free of unnecessary abstractions or bloated dependencies.
5. **Documentation Maintenance**: Before planning or implementing substantial changes, consult `docs/CAREERFIT_MASTER_PLAN.md` as the central architectural reference. Always keep `docs/CAREERFIT_MASTER_PLAN.md`, `docs/PROJECT_PLAN.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md` updated when milestones or technical decisions change.
6. **Efficiency**: Keep agent responses concise, read only necessary files, and maintain the checklist in `docs/PROJECT_PLAN.md` to ensure continuity across sessions.
