# Deploying Trinetra Exam Portal to Render

This repository contains the complete full-stack exam portal (React frontend + Express Node.js backend + PostgreSQL database managed via Prisma).

There are two easy ways to deploy this project to Render:
- **Method 1: 1-Click Render Blueprint (Recommended)** — Automatically creates the database, backend, frontend, rewrites, and environment variables together.
- **Method 2: Manual Dashboard Setup** — Step-by-step setup using the Render Web UI.

---

## Default Admin Credentials
Once deployed, the database is automatically seeded with:
* **Admin Login URL**: `https://<YOUR-FRONTEND-URL>/admin-login`
* **Email**: `admin@trinetra.com`
* **Password**: `Password@123`

---

## Method 1: Deploy with Render Blueprint (1-Click)

The repository includes a preconfigured `render.yaml` Blueprint file.

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. In the top-right corner, click **`New +`** and select **`Blueprint`**.
3. Connect your GitHub repository: `saidheerajpainam/trinetra_exam`.
4. Render will read `render.yaml` and show:
   * **Database**: `trinetra-db` (PostgreSQL Free)
   * **Backend**: `trinetra-backend` (Node Web Service)
   * **Frontend**: `trinetra-exam-portal` (Static Site with SPA rewrite `/*` -> `/index.html`)
5. Click **`Apply`**.
6. Render will automatically:
   * Provision the PostgreSQL database.
   * Connect `DATABASE_URL` to the backend.
   * Auto-generate a secure `JWT_SECRET`.
   * Run schema migrations (`prisma db push`) and seed the admin user & exam questions automatically on startup.
   * Build and publish the React frontend.

---

## Method 2: Manual Dashboard Setup

If you prefer to configure each service manually in the Render dashboard:

### Step 1: Create the Database
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **PostgreSQL**.
2. Settings:
   * **Name**: `trinetra-db`
   * **Database Name**: `trinetra`
   * **User**: `trinetra_user`
   * **Region**: `Oregon` (or any region closest to you)
   * **Plan**: `Free`
3. Click **Create Database**.
4. Once the status turns green (**Available**), copy the **Internal Database URL** (e.g., `postgresql://trinetra_user:...@dpg-.../trinetra`).

### Step 2: Deploy Backend Web Service
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository `saidheerajpainam/trinetra_exam`.
3. Configure the fields:
   * **Name**: `trinetra-backend`
   * **Region**: Same as database (e.g., `Oregon`).
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate`
   * **Start Command**: `npm start`
   * **Plan**: `Free`
4. Under **Advanced** -> **Add Environment Variable**:
   * `DATABASE_URL`: *(Paste the **Internal Database URL** from Step 1)*
   * `JWT_SECRET`: `trinetra_super_secret_jwt_key_2026`
   * `NODE_ENV`: `production`
5. Click **Create Web Service**.
6. When deployment finishes, note down your live Backend URL (e.g., `https://trinetra-backend-xxxx.onrender.com`).

### Step 3: Deploy Frontend Static Site
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository `saidheerajpainam/trinetra_exam`.
3. Configure the fields:
   * **Name**: `trinetra-exam-portal`
   * **Region**: Same region as backend.
   * **Branch**: `main`
   * **Root Directory**: `.` (leave empty or dot)
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
4. Under **Advanced** -> **Add Environment Variable**:
   * `VITE_API_BASE_URL`: `https://<YOUR-BACKEND-URL>.onrender.com/api`
5. Under **Redirects/Rewrites**:
   * **Source**: `/*`
   * **Destination**: `/index.html`
   * **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## Important Render Free-Tier Notes

1. **Spin-down / Inactivity**:
   On Render's free tier, backend Web Services spin down after 15 minutes without traffic. The first request after spin-down may take 30–50 seconds to wake up.
2. **Automatic DB Initialization**:
   The backend's `start.js` script automatically executes `npx prisma db push --accept-data-loss` and `node prisma/seed.js` every time the server boots, ensuring all database tables and the admin account always exist even if a database was newly created or recreated.
