# Deploying Trinetra Exam Portal to Render

This guide outlines the step-by-step process to deploy your full-stack project (React frontend + Node.js Express backend + Database) using Render.

Since you have pushed the repository to GitHub, Render can automatically deploy new updates whenever you push to your `main` branch.

---

## 1. Database Setup Options

Since Render does not offer MySQL hosting natively on its free tier, you have two options:

### Option A: PostgreSQL on Render (Recommended & Easiest)
Render provides free managed PostgreSQL databases. You can switch your database provider from MySQL to PostgreSQL in 2 minutes:
1. Open `backend/prisma/schema.prisma` and change the database provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Commit and push this change to GitHub.

### Option B: External MySQL (Preserves Current MySQL Setup)
If you want to keep MySQL, you can use a free cloud MySQL provider:
- **TiDB Cloud** (Free Tier available)
- **Aiven.io** (Free MySQL database available)
- **Clever Cloud** (Free MySQL instance available)

Once created, copy the connection string (e.g., `mysql://user:pass@host:port/db`) to use as your `DATABASE_URL` env variable.

---

## 2. Deploying the Database (If using Option A)

If you chose **Option A (PostgreSQL on Render)**:
1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **PostgreSQL**.
3. Fill in the database details:
   - **Name**: `trinetra-db`
   - **Database Name**: `trinetra`
   - **User**: (leave default)
   - **Region**: Select the region closest to you (e.g., Singapore or US East).
4. Select the **Free** tier.
5. Click **Create Database**.
6. Once the status shows **Available**, copy the **Internal Database URL** (for backend communication) or **External Database URL** (to connect from outside).

---

## 3. Deploying the Backend (Render Web Service)

1. On the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository `trinetra_exam`.
3. Configure the Web Service:
   - **Name**: `trinetra-backend`
   - **Region**: Same region as your database.
   - **Branch**: `main`
   - **Root Directory**: `backend` (Important: points to the backend folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Choose the **Free** tier.
5. Expand the **Advanced** section to add your Environment Variables:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | *Your Database Connection URL* | PostgreSQL or external MySQL URL |
| `JWT_SECRET` | *Generates a random secret string* | e.g. `super_secret_trinetra_key` |
| `FRONTEND_URL` | `https://trinetra-exam.onrender.com` | Set this to your frontend URL once deployed |

6. Click **Create Web Service**.
7. Render will build and deploy the backend. Note the backend live URL (e.g., `https://trinetra-backend.onrender.com`).

---

## 4. Deploying the Frontend (Render Static Site)

1. On the Render Dashboard, click **New +** and select **Static Site**.
2. Connect your GitHub repository `trinetra_exam`.
3. Configure the Static Site:
   - **Name**: `trinetra-exam`
   - **Region**: Same region as backend.
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty or root)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Expand the **Advanced** section to add the Environment Variables for the client:

| Key | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://trinetra-backend.onrender.com/api` | Your deployed backend live URL + `/api` |

5. Click **Create Static Site**.
6. Render will build your React code and deploy the frontend.

---

## 5. Post-Deployment Verification

1. **Database Migrations & Seeding**:
   To seed your initial exams and questions into the database, you can run the migrations from your local machine pointing to the remote database by replacing the local `DATABASE_URL` in `.env` with the external deployment database URL, then running:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```
2. **CORS Update Check**:
   Double-check that the `FRONTEND_URL` env variable in your backend matches your frontend URL (e.g., `https://trinetra-exam.onrender.com`). If you need to update it, update it in Render's Env Settings; Render will automatically restart the service.
