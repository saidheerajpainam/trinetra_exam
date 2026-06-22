# Trinetra Exam Portal

A complete, production-ready, full-stack online examination portal built for **Trinetra Drones & Robotics** using **React, Node.js, PostgreSQL, Prisma ORM, and JWT Authentication**.

---

## 🛠 Technology Stack

### Frontend
- React 18 & Vite
- Tailwind CSS
- Axios (API requests)
- React Hook Form & Zod
- React Icons & Lucide React
- Recharts (Analytics and charts)
- Sonner (Rich UI notifications)

### Backend
- Node.js & Express.js
- PostgreSQL (Database)
- Prisma ORM (Database client & migrations)
- JWT (Access token verification)
- bcryptjs (Password hashing)
- Multer (File uploads)

---

## 🔑 Default Credentials

- **Admin Login**:
  - **Username / Email**: `admin@trinetra.com`
  - **Password**: `Password@123`
- **Student Login**: Register directly on the student registration page.

---

## 🚀 Setup & Installation (Without Docker)

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally (port 5432)

### Step 1: Database Setup
1. Create a database in PostgreSQL named `trinetra`.
   ```sql
   CREATE DATABASE trinetra;
   ```

### Step 2: Backend Configuration & Run
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables in `.env` (you can copy `.env.example` as a template):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:<your_postgres_password>@localhost:5432/trinetra?schema=public"
   JWT_SECRET="trinetra_super_secret_jwt_key_2026"
   FRONTEND_URL="http://localhost:5173"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push the database schema and run the seed script:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *The seed script inserts the default administrator, 7 domain-specific exams (Reasoning, Aptitude, Robotics, IoT, Drones, Python, Java), 70 comprehensive MCQ questions, and portal announcements.*
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start running on `http://localhost:5000`.

### Step 3: Frontend Configuration & Run
1. Open a new terminal in the project root.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start running on `http://localhost:5173`.

---

## 🐳 Setup & Installation (With Docker Compose)

If you have Docker and Docker Compose installed:

1. Open a terminal in the project root directory.
2. Spin up all services (PostgreSQL, Backend API, Frontend Client):
   ```bash
   docker-compose up --build
   ```
3. In a separate terminal, apply Prisma migrations and seed the database inside the running backend container:
   ```bash
   docker-compose exec backend npx prisma db push
   docker-compose exec backend npx prisma db seed
   ```
4. Open your browser and navigate to:
   - **Frontend client**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`
