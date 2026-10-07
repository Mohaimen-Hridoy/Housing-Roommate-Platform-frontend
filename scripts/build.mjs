/**
 * Runs `next build` into a dedicated output directory.
 *
 * A production build and `next dev` both default to `.next`. Running them at the
 * same time makes the dev server fail every route with "SegmentViewNode in the
 * React Client Manifest", because the build replaces the chunks the dev server
 * is still serving from. Pointing the build at `.next-build` removes the
 * collision, so a build can be verified without taking the running site down.
 *
 * Env vars are set through `spawn` rather than inline shell syntax so this
 * works the same on Windows, macOS and Linux.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const distDir = process.env.NEXT_DIST_DIR ?? (process.env.VERCEL ? ".next" : ".next-build");

const child = spawn("npx", ["next", "build"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NEXT_DIST_DIR: distDir },
});

child.on("error", (error) => {
  console.error("Failed to start next build:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});