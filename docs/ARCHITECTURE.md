# CareerFit — Architecture & Technical Specifications

> **Master Reference**: Consult `docs/CAREERFIT_MASTER_PLAN.md` for the authoritative 25-page route inventory, user journeys, access control architecture, and page-to-API dependency matrix.

## 1. System Overview
CareerFit is designed as a modular MERN stack web application with clear separation between client presentation, backend API services, and data persistence.

```
                  +-----------------------------------+
                  |         React 18 / Vite           |
                  |  Tailwind CSS, React Router v6    |
                  |  4 Shared Layouts, 25 Pages       |
                  +-----------------+-----------------+
                                    | REST (JSON)
                                    v
                  +-----------------------------------+
                  |       Node.js / Express API       |
                  | Auth, Matcher, Assessments,       |
                  | Profile, Reports, Notifications   |
                  +-----------------+-----------------+
                                    | Mongoose ODM
                                    v
                  +-----------------------------------+
                  |          MongoDB Local /          |
                  |          MongoDB Atlas            |
                  +-------------------+---------------+
```

---

## 2. Directory Structure

```
CareerFit/
├── AGENTS.md                  # Permanent AI & engineering guidelines
├── docs/                      # Architectural & planning records
│   ├── ARCHITECTURE.md        # Technical specs & schemas
│   ├── CAREERFIT_MASTER_PLAN.md # Central reference & route specifications
│   ├── DECISIONS.md           # Architectural Decision Records (ADRs)
│   └── PROJECT_PLAN.md        # Milestone checklist & status
├── package.json               # Root scripts (concurrent dev runner)
├── .gitignore
├── .env.example               # Root/sample environment variables
├── client/                    # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx           # App entry point
│       ├── App.jsx            # Router provider & route definitions
│       ├── index.css          # Tailwind CSS directives
│       ├── components/        # Reusable UI widgets (cards, badges, modals, charts)
│       ├── layouts/           # Shared layouts (Public, Auth, Student, Admin, Exam)
│       ├── pages/             # Page views grouped by domain:
│       │   ├── public/        # Home (/), Help (/help), Unauthorized (/unauthorized), NotFound (*)
│       │   ├── auth/          # Login (/login), Register (/register)
│       │   ├── student/       # Dashboard, Profile, Resume, Match, Assessments, Reports, Progress, Saved, Plan, Notifications, Settings
│       │   └── admin/         # Admin Dashboard, Job Mgmt, Assessment Mgmt, User Mgmt
│       ├── services/          # API client modules (api.js, tokenStorage)
│       └── context/           # Auth and App state providers (AuthContext)
└── server/                    # Node.js + Express backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js           # Server bootstrap & port listener
        ├── app.js             # Express app configuration & middleware
        ├── config/            # DB connection (db.js) & environment
        ├── models/            # Mongoose schemas:
        │   ├── User.js                # (Implemented & verified)
        │   ├── StudentProfile.js      # (Implemented & verified)
        │   ├── Job.js                 # (Implemented & verified)
        │   ├── Assessment.js          # (Present but not verified; 25-30 seed planned)
        │   ├── AssessmentAttempt.js   # (Present but not verified; server-scored)
        │   ├── ReadinessReport.js     # (Planned; 60/40 composite index)
        │   ├── SavedJob.js            # (Planned)
        │   └── Notification.js        # (Planned; 4 genuine event types)
        ├── routes/            # REST API route handlers
        ├── controllers/       # Business logic controllers
        ├── middleware/        # Auth verification, role guards, error handling
        └── utils/             # Matching algorithms, scoring & seed scripts
```

---

## 3. Database Schema Design

### 3.1. User Model (`User.js`) — *Implemented & verified*
- `name`: String, required, trim: true
- `email`: String, required, unique, indexed, lowercase: true
- `password`: String (bcrypt hash), required
- `role`: String (`student`, `admin`), default `student`
- `createdAt`, `updatedAt`: Timestamps

### 3.2. Student Profile Model (`StudentProfile.js`) — *Implemented & verified*
- `userId`: ObjectId (ref: User), required, unique, indexed
- `headline`: String, trim: true
- `college`: String, trim: true
- `graduationYear`: Number (validation: 1990 - 2040)
- `phone`: String, trim: true
- `education`: Array of `{ institution, degree, fieldOfStudy, startYear, endYear, grade }`
- `skills`: Array of String (case-insensitive deduplication & normalization)
- `projects`: Array of `{ title, description, techStack: [String], link }`
- `experience`: Array of `{ title, company, duration, description }`
- `resume`: `{ rawText: String, filename: String, uploadedAt: Date }`
- `savedJobs`: Array of ObjectId (ref: Job) — *Planned addition for Module 8*
- `createdAt`, `updatedAt`: Timestamps

### 3.3. Job Model (`Job.js`) — *Implemented & verified*
- `title`: String, required, trim: true
- `company`: String, required, trim: true
- `location`: String, default 'Remote / On-site'
- `description`: String, required
- `requiredSkills`: Array of String, validated (minimum 1 required)
- `preferredSkills`: Array of String
- `experienceLevel`: String (`Fresher`, `Junior`, `Mid`, `Senior`), default `Fresher`
- `jobType`: String (`Full-time`, `Internship`, `Part-time`, `Contract`), default `Full-time`
- `isSample`: Boolean, default false (true for idempotent seed jobs)
- `createdAt`, `updatedAt`: Timestamps

### 3.4. Assessment Models (`Assessment.js`, `AssessmentAttempt.js`) — *Present but not verified*
- **Assessment**:
  - `title`: String, required, trim: true
  - `category`: String (`aptitude`, `technical`), required
  - `skillTag`: String, default 'General'
  - `difficulty`: String (`Easy`, `Medium`, `Hard`), default `Medium`
  - `durationMinutes`: Number, default 15
  - `questions`: Array of `{ questionText, options: [String], correctIndex: Number, explanation: String }`
  - *Seed Plan*: 25–30 verified placement MCQs across Quantitative, Logical, JavaScript, SQL, and Core CS.
- **AssessmentAttempt**:
  - `userId`: ObjectId (ref: User), required, indexed
  - `assessmentId`: ObjectId (ref: Assessment), required
  - `score`: Number, required (scored exclusively on the backend server)
  - `totalQuestions`: Number, required
  - `percentage`: Number, required (normalized 0–100)
  - `answers`: Array of `{ questionIndex: Number, selectedOption: Number, isCorrect: Boolean, questionSnapshot: Object }`
  - `completedAt`: Date, default Date.now
  - *Historical Reliability*: Attempts must retain question snapshots or immutable references so past scores remain mathematically valid if questions are edited later.

### 3.5. Readiness Report Model (`ReadinessReport.js`) — *Planned / not implemented*
- `userId`: ObjectId (ref: User), required, indexed
- `jobId`: ObjectId (ref: Job), required
- `matchPercentage`: Number, required (0–100, explainable skill-matching formula)
- `assessmentScore`: Number, required (0–100, aggregated from evaluated attempts)
- `readinessIndex`: Number, required:
  $$\text{Readiness Index} = (0.60 \times \text{matchPercentage}) + (0.40 \times \text{assessmentScore})$$
  *(Strictly bounded between 0 and 100; presented as a project-defined readiness indicator)*
- `status`: String (`complete`, `incomplete_assessment`, `incomplete_match`), default `complete`
  *(Missing data must never be silently treated as zero; clear incomplete states must be recorded)*
- `matchedSkills`: [String]
- `missingMandatorySkills`: [String]
- `missingPreferredSkills`: [String]
- `bonusSkills`: [String]
- `verifiedStrengths`: [String]
- `criticalGaps`: [String]
- `recommendations`: [String]
- `tasks`: Array of `{ title, category, isCompleted: Boolean, linkUrl: String }`
- `createdAt`: Date, default Date.now

### 3.6. Genuine Notification Model (`Notification.js`) — *Planned / not implemented*
- `userId`: ObjectId (ref: User), required, indexed
- `title`: String, required
- `message`: String, required
- `type`: String, enum: [`job_match`, `assessment_result`, `readiness_update`, `profile_completion`], required
- `link`: String (target internal URL, e.g. `/jobs/:id/match`, `/assessments/attempts/:id`, `/reports/:id`)
- `isRead`: Boolean, default false
- `eventFingerprint`: String, indexed (hash or compound key to guarantee trigger idempotency and prevent duplicate alerts)
- `createdAt`: Date, default Date.now

---

## 4. API Endpoints Structure (Current vs. Planned)

### 4.1. Health & Diagnostics
- `GET /api/health` — System status and live MongoDB connection state (*Implemented & verified*)

### 4.2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Student registration + auto profile provisioning (*Implemented & verified*)
- `POST /api/auth/login` — Student/Admin authentication & JWT issuance (*Implemented & verified*)
- `GET /api/auth/me` — Authenticated identity verification (*Implemented & verified*)
- `PUT /api/auth/change-password` — Password update (*Planned*)

### 4.3. Student Profile (`/api/profile`)
- `GET /api/profile` — Fetch current student's profile (*Implemented & verified*)
- `PUT /api/profile` — Update profile fields (*Implemented & verified*)
- `POST /api/profile/skills` — Add single skill (deduplicated) (*Implemented & verified*)
- `DELETE /api/profile/skills/:skill` — Remove single skill (*Implemented & verified*)

### 4.4. Job Management (`/api/jobs`)
- `GET /api/jobs` — Browse & filter jobs (Public) (*Implemented & verified*)
- `GET /api/jobs/:id` — View job specification (Public) (*Implemented & verified*)
- `POST /api/jobs` — Create job (Admin only) (*Implemented & verified*)
- `PUT /api/jobs/:id` — Update job (Admin only) (*Implemented & verified*)
- `DELETE /api/jobs/:id` — Delete job (Admin only) (*Implemented & verified*)

### 4.5. Planned Application Modules (Modules 3–9)
- `POST /api/resume/upload` — Multer file upload & `pdf-parse` local text extraction (*Planned*)
- `POST /api/resume/extract-skills` — Algorithmic skill keyword detector (*Planned*)
- `POST /api/matching/evaluate` — Deterministic skill match & gap computation (*Planned*)
- `GET /api/assessments` — List available tests by category with student score badges (*Planned*)
- `GET /api/assessments/:id/start` — Start timed test, deliver questions without answers (*Planned*)
- `POST /api/assessments/:id/submit` — Server-side answer grading & attempt recording (*Planned*)
- `GET /api/assessments/attempts/:attemptId` — Question-by-question diagnostic review (*Planned*)
- `POST /api/reports/generate` — Synthesize 60/40 composite readiness index into report (*Planned*)
- `GET /api/reports/:reportId` — Retrieve specific readiness report (*Planned*)
- `GET /api/progress` — Aggregate historical scores and readiness trends (*Planned*)
- `GET /api/saved-jobs` — Retrieve student shortlisted jobs (*Planned*)
- `POST /api/saved-jobs/:jobId` — Add job to shortlist (*Planned*)
- `DELETE /api/saved-jobs/:jobId` — Remove job from shortlist (*Planned*)
- `GET /api/improvement-plan` — Retrieve active study checklist (*Planned*)
- `PATCH /api/improvement-plan/tasks/:taskId` — Toggle milestone completion (*Planned*)
- `GET /api/notifications` — Fetch genuine student event feed (*Planned, REST-based*)
- `PATCH /api/notifications/:id/read` — Mark notification read (*Planned*)
- `PATCH /api/notifications/read-all` — Mark all notifications read (*Planned*)
- `GET /api/admin/metrics` — Placement analytics and system counters (*Planned*)
- `GET /api/admin/users` — Searchable student directory (*Planned*)
- `PATCH /api/admin/users/:id/role` — Update user permissions (*Planned*)

---

## 5. Client Routing & Access Control Architecture

The client application will transition from single-page tab state to standard client-side routing via `react-router-dom` (v6) across **25 pages** organized under **4 shared layouts**:

1. **`PublicLayout`**: Shared sticky header, navigation links, and footer for public discovery (`/`, `/jobs`, `/jobs/:id`, `/help`, `/unauthorized`, `*`).
2. **`AuthLayout`**: Focused split/centered card layout for authentication (`/login`, `/register`).
3. **`StudentLayout`**: Responsive sidebar navigation, top notification bar, and mobile bottom nav for authenticated student workflows (`/dashboard`, `/profile`, `/resume`, `/jobs/:id/match`, `/assessments`, `/assessments/attempts/:id`, `/reports/:id`, `/progress`, `/saved-jobs`, `/improvement-plan`, `/notifications`, `/settings`).
4. **`AdminLayout`**: Administrative sidebar, platform metric bar, and quick exit to student view for management workflows (`/admin`, `/admin/jobs`, `/admin/assessments`, `/admin/users`).
5. **`AssessmentAttemptLayout`**: Minimal distraction-free header with timer and progress bar for active test attempts (`/assessments/:id/attempt`).

### Key Approved Routing Decisions
- **/improvement-plan**: Retained as a separate, protected student route and included in student navigation. The readiness report links directly to it.
- **/notifications**: Retained as a standalone route alongside the navbar bell dropdown; both display genuine events across 4 approved categories (job match $\ge 75\%$, assessment submitted, readiness report generated, profile completion milestone).
- **Route Guards**: Enforced via `ProtectedRoute` (verifies active JWT token, redirecting guests to `/login?redirect=...`) and `AdminRoute` (verifies `user.role === 'admin'`, redirecting non-admin users to `/unauthorized`).
