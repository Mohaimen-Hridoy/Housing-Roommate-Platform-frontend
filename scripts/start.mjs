/**
 * Runs `next start` against the same output directory `scripts/build.mjs` writes
 * to. Without this the server would look in `.next` and find nothing, because the
 * production build lands in `.next-build`.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const distDir = process.env.NEXT_DIST_DIR ?? (process.env.VERCEL ? ".next" : ".next-build");

const child = spawn("npx", ["next", "start", "--port", "3000"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NEXT_DIST_DIR: distDir },
});

child.on("error", (error) => {
  console.error("Failed to start next start:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});