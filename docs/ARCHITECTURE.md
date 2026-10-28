# CareerFit — Architecture & Technical Specifications

## 1. System Overview
CareerFit is designed as a modular MERN stack web application with clear separation between client presentation, backend API services, and data persistence.

```
                  +-----------------------------------+
                  |         React 18 / Vite           |
                  |  Tailwind CSS, React Router, UI   |
                  +-----------------+-----------------+
                                    | REST (JSON)
                                    v
                  +-----------------------------------+
                  |       Node.js / Express API       |
                  | Auth, Matcher, Assessments, Profile|
                  +-----------------+-----------------+
                                    | Mongoose ODM
                                    v
                  +-----------------------------------+
                  |          MongoDB Atlas /          |
                  |          Local MongoDB            |
                  +-----------------------------------+
```

---

## 2. Directory Structure

```
CareerFit/
├── AGENTS.md                  # Permanent AI & engineering guidelines
├── docs/                      # Architectural & planning records
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   └── PROJECT_PLAN.md
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
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/        # Reusable UI & layout components
│       ├── pages/             # Route-level views (Dashboard, Jobs, Profile, etc.)
│       ├── services/          # API client modules
│       └── context/           # Auth and App state providers
└── server/                    # Node.js + Express backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js           # Server entry point & DB bootstrap
        ├── app.js             # Express app configuration & middleware
        ├── config/            # DB and environment configuration
        ├── models/            # Mongoose schemas (User, Profile, Job, Assessment)
        ├── routes/            # REST API route handlers
        ├── controllers/       # Business logic controllers
        ├── middleware/        # Auth verification, error handling, validation
        └── utils/             # Matching algorithms, scoring utilities
```

---

## 3. Database Schema Design (Initial)

### 3.1. User Model (`User.js`)
- `name`: String, required
- `email`: String, required, unique, indexed
- `password`: String (bcrypt hash), required
- `role`: String (`student`, `admin`), default `student`
- `createdAt`, `updatedAt`: Timestamps

### 3.2. Student Profile Model (`StudentProfile.js`)
- `userId`: ObjectId (ref: User), required, unique
- `headline`: String, trim: true
- `college`: String, trim: true
- `graduationYear`: Number (1990 - 2040)
- `phone`: String, trim: true
- `education`: Array of `{ institution, degree, fieldOfStudy, startYear, endYear, grade }`
- `skills`: Array of String (deduplicated, trimmed, case-insensitive check)
- `projects`: Array of `{ title, description, techStack: [String], link }`
- `experience`: Array of `{ title, company, duration, description }`
- `resume`: `{ rawText: String, filename: String, uploadedAt: Date }`
- `createdAt`, `updatedAt`: Timestamps

### 3.3. Job Model (`Job.js`)
- `title`: String, required
- `company`: String, required
- `location`: String, default 'Remote / On-site'
- `description`: String
- `requiredSkills`: Array of String, validated (at least 1 required)
- `preferredSkills`: Array of String
- `experienceLevel`: String (`Fresher`, `Junior`, `Mid`, `Senior`), default `Fresher`
- `jobType`: String (`Full-time`, `Internship`, `Part-time`, `Contract`), default `Full-time`
- `isSample`: Boolean, default false (true for initial seed jobs)
- `createdAt`, `updatedAt`: Timestamps

### 3.4. Assessment Model & Attempt (`Assessment.js`, `AssessmentAttempt.js`)
- **Assessment**:
  - `title`: String
  - `category`: String (`aptitude`, `technical`)
  - `questions`: Array of `{ questionText, options: [String], correctIndex: Number, explanation: String }`
- **AssessmentAttempt**:
  - `userId`: ObjectId (ref: User)
  - `assessmentId`: ObjectId (ref: Assessment)
  - `score`: Number
  - `totalQuestions`: Number
  - `answers`: Array of `{ questionIndex: Number, selectedOption: Number, isCorrect: Boolean }`
  - `completedAt`: Date

---

## 4. API Endpoints Structure

### 4.1. Health & Diagnostics
- `GET /api/health` — System health and real-time MongoDB connection status

### 4.2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Student account registration with auto profile provisioning
- `POST /api/auth/login` — Authentication & JWT token issuance
- `GET /api/auth/me` — Authenticated user identity (Protected)

### 4.3. Student Profile (`/api/profile`)
- `GET /api/profile` — Fetch current authenticated student profile (Protected, isolated to `req.user._id`)
- `PUT /api/profile` — Update student profile, display name, skills, projects, experience, and resume text (Protected)
- `POST /api/profile/skills` — Add single skill to profile (Protected, deduplicated)
- `DELETE /api/profile/skills/:skill` — Remove single skill from profile (Protected)

### 4.4. Job Management (`/api/jobs`)
- `GET /api/jobs` — Browse and filter jobs (Public / Student: search, experienceLevel, jobType)
- `GET /api/jobs/:id` — View detailed job specifications (Public / Student)
- `POST /api/jobs` — Create new job posting (Protected, Admin only)
- `PUT /api/jobs/:id` — Update job posting details (Protected, Admin only)
- `DELETE /api/jobs/:id` — Delete job posting (Protected, Admin only)

### 4.5. Upcoming Modules
- `POST /api/matching/evaluate` — Deterministic skill match & gap computation
- `GET /api/assessments` — List available assessments
- `POST /api/assessments/submit` — Submit answers and evaluate score
- `GET /api/readiness/report` — Compile holistic readiness report
