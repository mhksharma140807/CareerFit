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
- `headline`: String
- `education`: Array of `{ institution, degree, fieldOfStudy, startYear, endYear, grade }`
- `skills`: Array of String (e.g., `["React", "Node.js", "MongoDB", "SQL"]`)
- `projects`: Array of `{ title, description, techStack: [String], link }`
- `experience`: Array of `{ title, company, duration, description }`
- `resume`: `{ rawText: String, filename: String, uploadedAt: Date }`
- `createdAt`, `updatedAt`: Timestamps

### 3.3. Job Model (`Job.js`)
- `title`: String, required (e.g., "Full Stack Developer", "Data Analyst")
- `company`: String (or sample industry category)
- `description`: String
- `requiredSkills`: Array of String (e.g., `["JavaScript", "Node.js", "Express", "MongoDB"]`)
- `preferredSkills`: Array of String
- `experienceLevel`: String (`Fresher`, `Junior`, `Mid`)
- `isSample`: Boolean, default true
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

- `GET /api/health` — Service health & database connectivity status
- `POST /api/auth/register` — Student account registration
- `POST /api/auth/login` — Authentication & JWT token issuance
- `GET /api/auth/me` — Authenticated user identity (Protected)
- `GET /api/profile` — Fetch student profile (Protected)
- `PUT /api/profile` — Upsert student profile details (Protected)
- `GET /api/jobs` — Retrieve curated sample job postings
- `POST /api/jobs` — Add custom job role for matching
- `POST /api/matching/evaluate` — Deterministic skill match & gap computation
- `GET /api/assessments` — List available assessments
- `POST /api/assessments/submit` — Submit answers and evaluate score
- `GET /api/readiness/report` — Compile holistic readiness report
