import { execSync } from "child_process";

console.log("[Trinetra Backend] Starting backend initialization...");

if (process.env.DATABASE_URL) {
  try {
    console.log("[Trinetra Backend] Syncing database schema (prisma db push)...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("[Trinetra Backend] Seeding database (admin user & questions)...");
    execSync("node prisma/seed.js", { stdio: "inherit" });
    console.log("[Trinetra Backend] Database initialized successfully!");
  } catch (error) {
    console.error("[Trinetra Backend Warning] DB sync/seed could not complete:", error.message);
    console.warn("[Trinetra Backend Warning] Server will continue starting. Ensure your DATABASE_URL is valid and reachable.");
  }
} else {
  console.warn("[Trinetra Backend Warning] No DATABASE_URL set. Skipping DB sync.");
}

// Start Express server
import("./src/server.js");
