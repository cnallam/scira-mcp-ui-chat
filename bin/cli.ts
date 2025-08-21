#!/usr/bin/env node
// bin/cli.ts (ESM)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import fs from "node:fs";
import getPort from "get-port";
import open from "open";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const standaloneDir = join(pkgRoot, ".next", "standalone");
const serverEntry = join(standaloneDir, "server.js");

// make sure .next/standalone/.next/static exists (symlink to root .next/static)
const rootStatic = join(pkgRoot, ".next", "static");
const targetStatic = join(standaloneDir, ".next", "static");
if (fs.existsSync(rootStatic) && !fs.existsSync(targetStatic)) {
  fs.mkdirSync(join(standaloneDir, ".next"), { recursive: true });
  try { fs.symlinkSync(rootStatic, targetStatic, "junction"); }
  catch { fs.cpSync(rootStatic, targetStatic, { recursive: true }); } // fallback if symlink not allowed
}

// link/copy public as well (if present)
const rootPublic = join(pkgRoot, "public");
const targetPublic = join(standaloneDir, "public");
if (fs.existsSync(rootPublic) && !fs.existsSync(targetPublic)) {
  try { fs.symlinkSync(rootPublic, targetPublic, "junction"); }
  catch { fs.cpSync(rootPublic, targetPublic, { recursive: true }); }
}

if (!fs.existsSync(serverEntry)) {
  console.error("Missing .next/standalone/server.js. Run: npm run build");
  process.exit(1);
}

const port = await getPort({ port: [3000, 3001, 3002, 8787] });
const host = "127.0.0.1";
const child = spawn(process.execPath, [serverEntry], {
  cwd: standaloneDir, // 👈 critical
  env: { ...process.env, NODE_ENV: "production", PORT: String(port), HOSTNAME: host },
  stdio: ["ignore", "pipe", "pipe"]
});
child.stdout.on("data", d => process.stdout.write(d));
child.stderr.on("data", d => process.stderr.write(d));
child.on("exit", code => process.exit(code ?? 0));

const url = `http://${host}:${port}`;
let ready = false;
for (let i = 0; i < 120; i++) { try { await fetch(url); ready = true; break; } catch { await new Promise(r => setTimeout(r, 250)); } }
console.log(`\n${ready ? "✅" : "⚠️"} Running → ${url}\n`);
try { await open(url); } catch {}

