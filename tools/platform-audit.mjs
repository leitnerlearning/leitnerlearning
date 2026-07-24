#!/usr/bin/env node
/**
 * Static platform safety audit for Leitner Learning (no browsers required).
 * Catches antipatterns that caused real Safari desktop / iOS pain.
 *
 * Usage: node tools/platform-audit.mjs
 * Exit 1 if critical findings; 0 if clean (warnings still print).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const critical = [];
const warnings = [];

function fail(msg) {
  critical.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

// --- Scroll model ---
if (/overflow-x:\s*clip/.test(css)) {
  fail("styles.css uses overflow-x: clip (WebKit may refuse vertical page scroll)");
}
if (!/html\s*\{[^}]*overflow:\s*hidden/s.test(css) && !/html\s*\{[^}]*overflow:\s*hidden/.test(css)) {
  // softer: check body is scrollport
  if (!/body\s*\{[^}]*overflow-y:\s*auto/s.test(css)) {
    fail("body should be the page scrollport (overflow-y: auto) for Safari trackpad");
  }
}
if (/html[^{]*\{[^}]*overflow-y:\s*scroll/s.test(css) && !/body[^{]*\{[^}]*overflow-y:\s*auto/s.test(css)) {
  warn("html overflow-y:scroll without body scrollport can break Safari trackpad");
}
if (!/function getPageScrollY/.test(app)) {
  fail("app.js missing getPageScrollY() — window.scrollY alone fails when body scrolls");
}
if (/window\.scrollY\s*>/.test(app) && !/getPageScrollY\(/.test(app)) {
  warn("window.scrollY used for UI thresholds — prefer getPageScrollY()");
}

// --- iOS focus zoom ---
const inputFontBlocks = css.match(/\.(?:library-search|add-card-form input)[^{]*\{[^}]+\}/g) || [];
for (const block of inputFontBlocks) {
  const m = block.match(/font-size:\s*([^;]+)/);
  if (!m) continue;
  const v = m[1].trim();
  if (/0\.9\d*rem|0\.8\d*rem|1[0-5]px/.test(v) && !/16px|max\(16px/.test(v)) {
    fail(`Input font may zoom on iOS: ${v} in ${block.slice(0, 60).replace(/\s+/g, " ")}…`);
  }
}

// --- Viewport ---
if (!/viewport-fit=cover/.test(html)) {
  warn("viewport-fit=cover missing — notched iPhones may under-inset fixed chrome");
}
if (!/safe-area-inset/.test(css)) {
  warn("No env(safe-area-inset-*) usage found");
}

// --- 100vh trap ---
if (/100vh/.test(css) && !/100dvh/.test(css)) {
  warn("100vh without 100dvh — mobile browser chrome can clip UI");
}

// --- Report ---
console.log("Leitner platform audit\n");
if (critical.length) {
  console.log("CRITICAL:");
  critical.forEach((m) => console.log("  ✗", m));
  console.log("");
}
if (warnings.length) {
  console.log("WARNINGS:");
  warnings.forEach((m) => console.log("  ·", m));
  console.log("");
}
if (!critical.length && !warnings.length) {
  console.log("OK — no static antipatterns matched.\n");
} else if (!critical.length) {
  console.log("OK — no critical findings (warnings only).\n");
}

process.exit(critical.length ? 1 : 0);
