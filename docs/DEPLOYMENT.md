# CareerFit — Free Deployment Guide (₹0 Budget)

This guide provides end-to-end instructions for deploying the **CareerFit** platform to 100% free hosting tiers:
- **Database**: MongoDB Atlas (M0 Shared Sandbox — Free forever, no credit card required)
- **Backend API**: Render (Free Web Service — Free tier, no credit card required)
- **Frontend SPA**: Vercel (Hobby Tier — Free forever, no credit card required)
- **Source Control**: GitHub (Free Public/Private Repository)

---

## Architecture Overview

```
                      +-----------------------------+
                      |       Vercel (Hobby)        |
                      |  React + Vite SPA Frontend  |
                      |  https://<app>.vercel.app   |
                      +--------------+--------------+
                                     |
                         HTTPS /api  | (CORS Protected)
                                     v
                      +-----------------------------+
                      |     Render (Free Service)   |
                      |     Node.js Express API     |
                      | https://<api>.onrender.com  |
                      +--------------+--------------+
                                     |
                                Mongoose
                                     v
                      +-----------------------------+
                      |   MongoDB Atlas (M0 Free)   |
                      |    Cloud Database Cluster   |
                      +-----------------------------+
```

---

## Step 1: Set Up Free MongoDB Atlas Database

1. Sign up or log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new organization/project (e.g., `CareerFit`).
3. Click **Create Deployment** and select the **M0 Shared (Free)** tier:
   - Cloud Provider: **AWS** or **GCP**
   - Region: Select the closest region (e.g., `ap-south-1` Mumbai)
   - Cluster Name: e.g., `Cluster0`
   - Cost: **$0.00 / Free Forever** (Ensure M0 is selected, do NOT enter billing details)
4. Set up **Database Access (User Credentials)**:
   - Navigate to **Security** > **Database Access** > **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g., `careerfit_admin`.
   - Password: Click **Autogenerate Secure Password** or enter a strong password. (Save this securely; if password contains special characters like `@`, `:`, `/`, or `#`, URL-encode them).
   - Database User Privileges: **Read and write to any database**.
   - Click **Add User**.
5. Set up **Network Access (IP Whitelist)**:
   - Navigate to **Security** > **Network Access** > **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Description: `Render dynamic hosting IP access`.
   - *Note: Render Free Web Services use shared, dynamically changing outbound IP addresses, so `0.0.0.0/0` is mandatory for connection.*
   - Click **Confirm**.
6. Obtain your connection string:
   - Navigate to **Database** > **Connect** > **Drivers** (Node.js).
   - Copy the URI string:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/careerfit?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your credentials, and specify `/careerfit` before the `?` query parameters.

---

## Step 2: Push Repository to GitHub

Ensure you are in the project root (`C:\projects\CareerFit`).

### 1. Verify that secrets are ignored
Before staging, verify that local `.env` files are ignored:
```bash
git status
```
Confirm that neither `client/.env` nor `server/.env` appears under untracked files. Only `.env.example` templates should be tracked.

### 2. Stage and commit
```bash
git add .
git commit -m "feat: complete CareerFit platform and cloud deployment configuration"
```

### 3. Link remote and push
Create a new empty repository on [GitHub](https://github.com/new) (e.g., `CareerFit`). Do not initialize with README or license.
```bash
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CareerFit.git
git push -u origin main
```

---

## Step 3: Deploy Backend on Render (Free Web Service)

1. Sign up or log in at [render.com](https://render.com) using your GitHub account.
2. Click **New +** > **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `CareerFit` repository.
4. Configure the service:
   - **Name**: `careerfit-api` (or any unique name)
   - **Region**: Choose the region closest to your MongoDB Atlas cluster (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server` *(Important! Set this so Render builds inside the server folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ($0/month, 512 MB RAM)
5. Scroll down to **Environment Variables** and add the following keys:

| Key | Suggested Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations and security |
| `PORT` | `10000` | Port for Render to bind (Render auto-routes this) |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/careerfit?retryWrites=true&w=majority` | Atlas connection string |
| `JWT_SECRET` | *(Random 32+ character string)* | Used to sign JWT auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration lifespan |
| `CLIENT_URL` | `http://localhost:5173` *(Update with Vercel URL in Step 5)* | CORS origin whitelist |

6. Click **Advanced Settings**:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`
7. Click **Create Web Service**.
8. Wait 2-3 minutes for the build to finish. Once live, Render will provide a URL like:
   `https://careerfit-api.onrender.com`
9. Test backend health: Open `https://careerfit-api.onrender.com/api/health` in your browser.
   It should return:
   ```json
   {
     "status": "healthy",
     "database": {
       "connected": true,
       "state": "connected"
     }
   }
   ```
   *(Initial cold start on free tier may take 30–50 seconds if the instance is sleeping).*

---

## Step 4: Deploy Frontend on Vercel (Hobby Free Plan)

1. Sign up or log in at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** > **Project**.
3. Import your `CareerFit` repository.
4. Configure the Project:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Click **Edit** and choose `client` *(Important! Select the `client` subfolder)*
   - **Build and Output Settings**:
     - Build Command: `npm run build` (default)
     - Output Directory: `dist` (default)
     - Install Command: `npm install` (default)
5. Expand **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://careerfit-api.onrender.com/api` *(Use your actual Render backend URL followed by `/api`)*
6. Click **Deploy**.
7. Vercel will build and deploy the frontend in ~1 minute, providing a production domain such as:
   `https://careerfit-client.vercel.app`

*(Note: `client/vercel.json` and `vercel.json` are already pre-configured with SPA route rewrites, ensuring URLs like `/jobs/123` and `/dashboard` reload cleanly without 404 errors).*

---

## Step 5: Final CORS Handshake

Now that your Vercel frontend URL is known:
1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your `careerfit-api` Web Service > **Environment**.
3. Update the `CLIENT_URL` environment variable:
   ```env
   CLIENT_URL=https://careerfit-client.vercel.app,http://localhost:5173
   ```
   *(Render will automatically restart the service with the new CORS origin whitelist).*

---

## Step 6: Post-Deployment Verification Checklist

Verify the deployed application by walking through the following checks:

- [ ] **Health Check**: Open `https://<your-render-url>/api/health` — status must be `healthy` and `database.connected` must be `true`.
- [ ] **Home Page**: Visit `https://<your-vercel-url>/` — landing page, header, and footer load without console errors.
- [ ] **Job Directory**: Visit `/jobs` — seeded jobs (Frontend Engineer, Full Stack Developer, etc.) display properly.
- [ ] **Student Registration**: Register a new student account at `/register`. Verify redirection to `/dashboard`.
- [ ] **Profile Management**: Update skills, education, and preferences at `/profile`. Verify save succeeds.
- [ ] **Job Match Analysis**: Open any job and click "Check Match" (`/jobs/:id/match`) — verify algorithmic match score, matched skills, and gap analysis calculate.
- [ ] **Assessments**: Go to `/assessments`, start a quiz, submit answers, and verify scoring and review page.
- [ ] **Readiness Report**: Generate a readiness report and review recommendations.
- [ ] **SPA Route Refresh**: While on `/dashboard` or `/profile`, press browser refresh (F5) — page reloads smoothly without 404.

---

## Troubleshooting & Maintenance

### 1. Render Free Tier Cold Starts
- **Symptom**: The first request after 15 minutes of inactivity takes 30-50 seconds.
- **Cause**: Free tier instances spin down to conserve server resources when idle.
- **Mitigation**: The database timeout has been tuned to 10 seconds in `server/src/config/db.js` so connection retries do not fail prematurely. A free service like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org) can optionally ping `https://<your-api>/api/health` every 14 minutes to prevent sleep.

### 2. CORS Blocked Errors
- **Symptom**: Browser console logs `Access to fetch at ... blocked by CORS policy`.
- **Cause**: `CLIENT_URL` on Render does not match your Vercel URL, or has a trailing slash.
- **Fix**: The backend automatically normalizes trailing slashes, but ensure the domain name in Render matches the exact Vercel deployment URL (e.g., `https://careerfit-xxx.vercel.app`).

### 3. MongoDB Connection Timeout or SRV Lookup Failure (querySrv ECONNREFUSED)
- **Symptom**: `querySrv ECONNREFUSED _mongodb._tcp...` or health check reports `database: disconnected`.
- **Cause**: Some ISPs, university firewalls, or cloud container networks fail to resolve DNS SRV records for `mongodb+srv://`.
- **Fix**: The backend automatically sets public DNS servers (`dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])`) in `server/src/config/db.js` before connecting to MongoDB Atlas. Also verify that MongoDB Atlas Network Access has `0.0.0.0/0` (Allow from Anywhere) active and credentials are correct.

---

## Step 7: Administrator Account Setup & Secure Operations

CareerFit features a dedicated administrative console for managing job descriptions, reviewing placement questions, and monitoring student readiness metrics. Administrative accounts cannot be registered via public registration.

### 1. Configure Admin Environment Variables
In your local `.env` or Render environment settings:
```env
ADMIN_EMAIL=admin@careerfit.local
ADMIN_PASSWORD="YourStrongPassword123!#"
```
*(Always quote passwords containing special characters like `#`, `!`, or `$` to prevent shell/dotenv parsing errors).*

### 2. Provision Initial Admin Account
Run the idempotent seed script from the project root:
```bash
npm run seed:admin
```
- If the admin user does not exist, it hashes the password with bcrypt and creates the account.
- If the admin already exists, it preserves existing credentials without duplicate insertion.
- If the email belongs to an existing student, it refuses to overwrite or auto-promote.

### 3. Log In & Open the Admin Dashboard
1. Open the login page: `http://localhost:5173/login` (or `https://<your-vercel-app>.vercel.app/login`).
2. Enter your configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Upon successful authentication, CareerFit automatically detects the `admin` role and navigates directly to the **Admin Overview** (`/admin`).
4. Accessible management sections:
   - **Overview Metrics**: `/admin` (student count, job count, assessment volume, readiness averages)
   - **Job Management**: `/admin/jobs` (CRUD job listings, requirement tags)
   - **Assessments & Question Bank**: `/admin/assessments` (add/edit questions, test difficulty)
   - **Student Directory**: `/admin/users` (view student skills, toggle roles, remove records)

### 4. Production Security Recommendations
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your Render Environment Variables dashboard before deploying.
- After the initial deployment boots and provisions the admin user in MongoDB Atlas, you may safely remove `ADMIN_PASSWORD` from Render environment variables to ensure zero plain-text retention.

### 5. Changing the Admin Password Safely
- **While Logged In**: Navigate to `/settings` and use the change-password form with your current password and a new 8+ character strong password.
- **If Forgotten**: Navigate to `/forgot-password`, solve the human verification CAPTCHA, enter your registered admin email, and set a new password meeting the 5 complexity rules.

