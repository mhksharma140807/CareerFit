# CareerFit — Architectural & Technical Decisions Log

## ADR-001: MERN Stack Selection & Pure JavaScript
- **Date**: Phase 1
- **Decision**: Build the application using the MERN stack with standard modern JavaScript (ES Modules) across both `/client` (React + Vite) and `/server` (Express), avoiding TypeScript.
- **Rationale**: Keeps the codebase approachable and straightforward for college project viva explanations while maintaining high velocity and avoiding transpilation mismatch complexities during live demonstration.

## ADR-002: Deterministic Rule-Based Core Matching Before AI Integration
- **Date**: Phase 1
- **Decision**: Skill-matching percentage, gap detection (matched, missing, additional), and assessment evaluation are built as transparent, deterministic algorithmic calculations that execute without requiring an external API key or network request.
- **Rationale**: Guarantees CareerFit is 100% functional offline, avoids fragile external service dependencies during grading/viva presentations, and prevents fabricated "mock AI" illusions. AI services (Gemini/OpenAI) can be layered cleanly on top in Phase 3 as an optional enrichment layer.

## ADR-003: Monorepo Structure with Separated Client & Server
- **Date**: Phase 1
- **Decision**: Organize `/client` and `/server` as distinct sub-packages under a single root project, orchestrated by a root `package.json` with scripts (`npm run dev`, `npm run install:all`).
- **Rationale**: Enables concurrent local development while strictly preserving security boundaries (backend secrets never leak to the frontend build artifacts).

## ADR-004: Graceful Database Connection Handling
- **Date**: Phase 1
- **Decision**: Backend boots up cleanly even if MongoDB is not immediately connected or if the connection string is unset, signaling degraded status via `/api/health`.
- **Rationale**: Allows developer onboarding, frontend development, and tests to run without crashing prematurely when local or cloud MongoDB instances are momentarily unreachable.

## ADR-005: Student Profile Isolation & Role-Based Job Authorization
- **Date**: Phase 2 (Modules 1 & 2)
- **Decision**: Student profile updates are strictly bound to `req.user._id` extracted from the cryptographically verified JWT payload, with no client-controllable user parameter. Job write endpoints (`POST`, `PUT`, `DELETE /api/jobs`) are guarded by role-based authorization (`authorize('admin')`), preventing students from modifying or tampering with job requirements. Sample jobs are seeded idempotently via upsert on unique `title` and `company` fields.
- **Rationale**: Enforces horizontal access control preventing students from altering peers' data, maintains academic integrity of job descriptions, and avoids duplicate job records on subsequent server restarts.
