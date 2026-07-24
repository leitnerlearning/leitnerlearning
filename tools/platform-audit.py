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
for sel in (
    r"\.library-search\s*\{[^}]+\}",
    r"\.add-card-form input\s*\{[^}]+\}",
    r"\.answer-form input\[type=[\"']text[\"']\]\s*\{[^}]+\}",
):
    for block in re.findall(sel, css, re.S):
        m = re.search(r"font-size:\s*([^;]+)", block)
        if not m:
            continue
        v = m.group(1).strip()
        if re.search(r"0\.9\d*rem|0\.8\d*rem|1[0-5]px", v) and not re.search(
            r"16px|max\(16px|max\(1\.\d+rem,\s*16px", v
        ):
            fail(f"Input font may zoom on iOS: {v}")

# Answer field must always floor at 16px (base rule, not only mobile media)
answer_blocks = re.findall(
    r"\.answer-form input\[type=[\"']text[\"']\]\s*\{([^}]+)\}", css, re.S
)
if answer_blocks:
    base = answer_blocks[0]
    if not re.search(r"16px", base):
        fail("Base .answer-form input missing 16px font-size floor (iPad desktop width zooms)")

# --- Coarse pointer primary controls ---
if "pointer: coarse" not in css:
    warn("No (pointer: coarse) rules — finger targets on wide iPad may stay <44px")
elif not re.search(
    r"pointer:\s*coarse[^}]*\.answer-action|pointer:\s*coarse[\s\S]{0,400}min-height:\s*44px",
    css,
    re.S,
):
    warn("pointer:coarse present but answer-action may lack min-height 44px")

# --- Viewport ---
if "viewport-fit=cover" not in html:
    warn("viewport-fit=cover missing — notched iPhones may under-inset fixed chrome")
if "safe-area-inset" not in css:
    warn("No env(safe-area-inset-*) usage found")

# --- 100vh trap ---
if "100vh" in css and "100dvh" not in css:
    warn("100vh without 100dvh — mobile browser chrome can clip UI")

# --- getPageScrollY honesty (body scrollport) ---
gps = re.search(r"function getPageScrollY\s*\(\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}", app, re.S)
if gps and "Math.max" not in gps.group(0) and "body" not in gps.group(0):
    warn("getPageScrollY may ignore body.scrollTop when body is the scrollport")

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
