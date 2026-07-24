#!/usr/bin/env python3
"""
Static platform safety audit for Leitner Learning (no browsers required).
Catches antipatterns that caused real Safari desktop / iOS pain.

Usage: python3 tools/platform-audit.py
Exit 1 if critical findings; 0 if clean.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
css = (ROOT / "styles.css").read_text(encoding="utf-8")
app = (ROOT / "app.js").read_text(encoding="utf-8")
html = (ROOT / "index.html").read_text(encoding="utf-8")

critical: list[str] = []
warnings: list[str] = []


def fail(msg: str) -> None:
    critical.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


# --- Scroll model ---
if re.search(r"overflow-x:\s*clip", css):
    fail("styles.css uses overflow-x: clip (WebKit may refuse vertical page scroll)")

if not re.search(r"body\s*\{[^}]*overflow-y:\s*auto", css, re.S):
    # allow multiline body block
    body_blocks = re.findall(r"body\s*\{[^}]+\}", css, re.S)
    if not any("overflow-y: auto" in b for b in body_blocks[:3]):
        fail("body should be the page scrollport (overflow-y: auto) for Safari trackpad")

if re.search(r"html[^{]*\{[^}]*overflow-y:\s*scroll", css, re.S) and not re.search(
    r"overflow-y:\s*auto", css
):
    warn("html overflow-y:scroll without body scrollport can break Safari trackpad")

if "function getPageScrollY" not in app:
    fail("app.js missing getPageScrollY() — window.scrollY alone fails when body scrolls")

if re.search(r"window\.scrollY\s*>", app) and "getPageScrollY(" not in app:
    warn("window.scrollY used for UI thresholds — prefer getPageScrollY()")

# --- iOS focus zoom ---
for sel in (r"\.library-search\s*\{[^}]+\}", r"\.add-card-form input\s*\{[^}]+\}"):
    for block in re.findall(sel, css, re.S):
        m = re.search(r"font-size:\s*([^;]+)", block)
        if not m:
            continue
        v = m.group(1).strip()
        if re.search(r"0\.9\d*rem|0\.8\d*rem|1[0-5]px", v) and not re.search(
            r"16px|max\(16px", v
        ):
            fail(f"Input font may zoom on iOS: {v}")

# --- Viewport ---
if "viewport-fit=cover" not in html:
    warn("viewport-fit=cover missing — notched iPhones may under-inset fixed chrome")
if "safe-area-inset" not in css:
    warn("No env(safe-area-inset-*) usage found")

# --- 100vh trap ---
if "100vh" in css and "100dvh" not in css:
    warn("100vh without 100dvh — mobile browser chrome can clip UI")

# --- Report ---
print("Leitner platform audit\n")
if critical:
    print("CRITICAL:")
    for m in critical:
        print("  ✗", m)
    print()
if warnings:
    print("WARNINGS:")
    for m in warnings:
        print("  ·", m)
    print()
if not critical and not warnings:
    print("OK — no static antipatterns matched.\n")
elif not critical:
    print("OK — no critical findings (warnings only).\n")

sys.exit(1 if critical else 0)
