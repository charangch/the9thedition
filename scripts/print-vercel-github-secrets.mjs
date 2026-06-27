#!/usr/bin/env node
/**
 * Prints Vercel org/project IDs for GitHub Actions secrets setup.
 * Run after: npx vercel link
 *
 *   node scripts/print-vercel-github-secrets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectFile = path.join(root, ".vercel", "project.json");

if (!fs.existsSync(projectFile)) {
  console.error("Missing .vercel/project.json — run: npx vercel link");
  process.exit(1);
}

const { orgId, projectId } = JSON.parse(fs.readFileSync(projectFile, "utf8"));
console.log("Add these GitHub repository secrets (Settings → Secrets → Actions):\n");
console.log(`VERCEL_ORG_ID=${orgId}`);
console.log(`VERCEL_PROJECT_ID=${projectId}`);
console.log("\nAlso add VERCEL_TOKEN from https://vercel.com/account/tokens");
