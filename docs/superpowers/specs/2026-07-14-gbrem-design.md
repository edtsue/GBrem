# GBrem — Googlebook × Rembrand · Design Spec

**Date:** 2026-07-14
**Repo:** edtsue/GBrem (`~/GBrem`)
**Style lineage:** Beckett + Set Your Sunday (YTSTEngine) — vanilla SPA pitch site + Vercel functions.

## 1. Concept

A pitch/concept site for **AI-native product placement**: using **Rembrand's** in-content technology to drop **Google's revolutionary new AI laptop, the "Googlebook,"** into the exact scenes in premium TV where **the speed of thought** is happening — creativity, quick thinking, the breakthrough moment — at scale, without ever touching production.

**Thesis one-liner:** *Placed at the speed of thought.*

**The tension the site resolves:** the Googlebook belongs in scenes where fast, creative thinking happens — but traditional product placement can't move at that speed (production locked months out, IP/legal friction, reshoots impossible). Rembrand's AI dissolves that constraint: hand over a render, and the laptop is composited natively into approved scenes post-production.

## 2. Aesthetic direction — "Google keynote"

Premium, sleek, product-launch keynote energy — restraint over decoration.

- **Palette:** near-white paper (`#FFFFFF` / `#F8F9FA`), deep Google-grey ink (`#202124`), secondary grey (`#5F6368`). Google's four brand colors as **accents only**: Blue `#4285F4`, Red `#EA4335`, Yellow `#FBBC04`, Green `#34A853`.
- **Google branding as restraint:** a small "G" spectrum mark in nav; a soft blurred four-color gradient-mesh glow behind the hero; a thin spectrum-sweep line under keynote section numerals; a four-color underline on one key word per section. Never rainbow-spammed.
- **Type:** *Manrope* (tight geometric display headlines, Google-Sans-adjacent) + *Inter* (body). Google Fonts.
- **Motion:** restrained/expensive — scroll reveals (fade + 16px rise), animated stat counters, one signature spectrum-line sweep, hero gradient-mesh drift. A whisper of grain (very low opacity), not heavy editorial texture.
- **Components:** rounded cards (~20px radius), soft elevation shadows, pill buttons, oversized keynote section numerals ("01 / 02 / 03").
- **Responsive:** fully mobile-friendly; hero and stats reflow to single column.

## 3. Architecture

```
index.html      · single-page pitch — nav, hero, 3 sections, footer, Brief panel
app.js          · scroll reveals, stat counters, Brief toggle, live Placement Finder fetch
styles.css      · full house style + keynote theme
gate.html       · password wall (typed password → POST /api/gate)
api/gate.js      · verifies GBREM_PASSWORD, sets signed HttpOnly cookie
api/generate.js  · Gemini call powering the Placement Finder demo
middleware.js   · edge gate enforcement (redirect unauthenticated → gate.html)
vercel.json     · config (functions, headers)
package.json    · type:module, @vercel/edge
assets/          · favicon.svg, hero-poster (optional), + user drops demo.mp4 & mockup.png later
docs/superpowers/specs/2026-07-14-gbrem-design.md
```

Vanilla — no build step. Deployed on Vercel (account/domain confirmed at deploy time; likely a subdomain in the mfgpilots / edtsue family).

## 4. Access gate

Password gate like YTST:
- `middleware.js` (edge) checks a signed cookie; unauthenticated requests for the app redirect to `gate.html`.
- `gate.html` posts the typed password to `/api/gate`; `api/gate.js` compares against the **`gate_pw`** env var (already set on the Vercel project for Preview + Production, Encrypted) and, on match, sets a signed HttpOnly cookie (HMAC with a `GBREM_GATE_SECRET`, rotatable to evict all sessions).
- **Fail-open if `gate_pw` is unset** (so local dev / preview isn't bricked — `gate_pw` is intentionally absent from the Development environment), matching YTST's forgiving pattern.

## 5. Sections

### Hero
- Full-viewport, keynote-stage. Soft four-color gradient-mesh glow behind.
- Kicker: `Google × Rembrand · AI-native product placement`
- Headline: **Placed at the speed of thought.** (one word carries the four-color underline)
- Lede: introduces the Googlebook as a new AI-laptop category and the promise of native, at-scale placement.
- Primary CTA scrolls to Section 1; secondary opens the Brief.
- Small nav: brand mark ("G" spectrum + Googlebook wordmark), section anchors (Opportunity / How it works / Production), a **Brief** button.

### Section 01 — The Opportunity
- Framing: the Googlebook is the "thinking machine" for the moments of fastest thought; it belongs *inside* those stories, not in the ad break beside them.
- The constraint traditional placement hits (production schedules, IP, no reshoots) → Rembrand removes it.
- **Slot for `demo.mp4`** — a clearly-marked, styled video frame (poster + play control) for the user's Rembrand tech reel; graceful placeholder state until the file exists.
- **Animated proof-stats** (from Rembrand, cited as their metrics): `+35% sales lift`, `100% viewability`, `2× engagement`, `225+ global partners`, `79% like the format`. Count-up on scroll.

### Section 02 — How It Works
- Walk the **All-American** example: the Googlebook composited into scenes where it makes sense (a study grind, a plan coming together).
- **Placeholder frame** sized for the user's mockup image (`assets/mockup.png`), staged as a **before → after reveal** (empty desk → Googlebook present) using a slider/toggle; shows an obvious "mockup drops here" state until the asset exists.
- **Live AI "Placement Finder"** (interactive centerpiece):
  - Viewer picks a **show** (curated premium lineup, default incl. All-American) and a **moment-type** ("the writers'-room breakthrough," "the late-night study grind," "the pitch that lands," "the kitchen rush," "the deal that closes").
  - Calls `POST /api/generate` → Gemini returns a structured placement concept: **scene**, **why it fits the speed-of-thought thesis**, **the Googlebook's role in the moment**, and a **one-line render note**.
  - Rendered in a keynote card with a subtle generating animation. Graceful error/empty states.
  - Curated show lineup (illustrative, current premium titles): All-American, The Bear, Industry, Only Murders in the Building, Abbott Elementary, Severance. (Editable array in app.js.)

### Section 03 — Production & Media
- The buyer pitch: **you just hand over a render.** Three-step "how a deal flows" strip: Render → AI composite → Programmatic delivery.
- **Dual-lock trust badge:** every show and scene co-approved by **Google** *and* the **content owner**. Visualized as two locks / two checkmarks.
- Flagship offer: **"Own a Show"** — consistent Googlebook presence across every episode of a series, then wrap it with conventional ad inventory around the show. Presented as the premium tier / hero offer card.

### Brief panel
- Slide-out panel (like Beckett/YTST) summarizing the one-page pitch: the thesis, the three sections in a sentence each, the ask. Toggled from nav and hero.

### Footer
- Quiet keynote footer: "A Google × Rembrand concept · [year]", spectrum rule, links back to sections.

## 6. `api/generate.js` contract

- Input: `{ show: string, moment: string }`.
- Reads `GEMINI_KEY` (or `GBREM_KEY`) env var; model `gemini-2.5-flash` (fast, cheap).
- Prompt: system framing = "AI-native contextual product placement strategist for the Googlebook, a new Google AI laptop, using Rembrand in-content tech; keep it plausible, premium, brand-safe; center the 'speed of thought' thesis." Ask for a compact JSON object: `{ scene, whyItFits, googlebookRole, renderNote }`.
- Returns that JSON. On missing key / API error: return a graceful canned example (so the demo never hard-fails in a pitch), flagged so the UI can note it's a sample.
- Short timeout, no streaming needed (single compact response).

## 7. Out of scope (YAGNI)

- No CMS, no database, no user accounts beyond the shared gate password.
- No real image generation of placements (text concept only; visual is the user's mockup).
- No analytics beyond what Vercel provides by default.
- `demo.mp4` and `mockup.png` are user-supplied later; the site ships with tasteful placeholders.

## 8. Success criteria

- Opens to a polished, premium, unmistakably-"Google-launch" pitch that loads fast.
- Three sections read as a clean argument: opportunity → how → commercial.
- The Placement Finder returns a plausible, on-brand concept live.
- Gate protects the pitch; fails open without env config so dev/preview works.
- Drop-in slots for the real demo.mp4 and mockup.png with zero code changes.
