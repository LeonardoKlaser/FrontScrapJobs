# Meta Ads Disclaimer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three contextual legal disclaimers to the public LP (footer + trust-section carousel caption + radar-notifications mock caption) to support the Meta Ads appeal and make the nominative use of third-party trademarks explicit.

**Architecture:** Zero structural change. Three inline JSX additions, each driven by a new i18n key in `landing.json` (PT-BR + EN-US). No shared component (YAGNI — three distinct contexts, three distinct strings).

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, react-i18next, framer-motion.

**Reference spec:** `docs/superpowers/specs/2026-04-17-meta-ads-disclaimer-design.md`

---

## File Map

**Modify (5 files, 0 creates):**

- `src/i18n/locales/pt-BR/landing.json` — add `footer.disclaimer`, `trust.disclaimer`, `valueFeatures.radar.mockDisclaimer`
- `src/i18n/locales/en-US/landing.json` — same 3 keys in English
- `src/components/landingPage/footer.tsx` — render `t('footer.disclaimer')` in a new trailing block
- `src/components/landingPage/trust-section.tsx` — render `t('trust.disclaimer')` as caption inside the `{hasLogos && ...}` block
- `src/components/landingPage/ui-snippets/radar-notifications.tsx` — render `t('valueFeatures.radar.mockDisclaimer')` as last child of the `{!compact && ...}` block

**No tests:** the `landingPage/` directory has no established unit-test pattern (tests live under `common/__tests__/` and `hooks/__tests__/` only). These changes are pure i18n-driven display — manual visual verification via `npm run dev` plus the existing E2E suite (which mounts the LP) is sufficient. Introducing a new testing pattern just for this PR violates the "follow existing patterns" principle.

---

## Task 1: Add PT-BR i18n keys

**Files:**
- Modify: `src/i18n/locales/pt-BR/landing.json`

- [ ] **Step 1: Add `footer.disclaimer` to the `footer` object**

In `src/i18n/locales/pt-BR/landing.json`, locate the `"footer"` object (currently containing `terms`, `privacy`, `copyright`). Add `disclaimer` as a new key:

```json
"footer": {
  "terms": "Termos",
  "privacy": "Privacidade",
  "copyright": "© {{year}} ScrapJobs",
  "disclaimer": "As marcas, logotipos e nomes de empresas exibidos pertencem aos seus respectivos proprietários e são usados apenas para identificação. O ScrapJobs não possui afiliação, patrocínio ou endosso dessas empresas."
}
```

- [ ] **Step 2: Add `trust.disclaimer` to the `trust` object**

Locate the `"trust"` object (currently containing `overline`, `statSites`, `statJobs`, `statsError`). Add `disclaimer` as a new key:

```json
"trust": {
  "overline": "Monitorando em tempo real",
  "statSites": "sites monitorados",
  "statJobs": "vagas encontradas",
  "statsError": "Não foi possível carregar as estatísticas. Tente novamente em instantes.",
  "disclaimer": "Logos exibidos são marcas registradas de seus respectivos proprietários. Monitoramos páginas públicas de carreiras — sem afiliação oficial."
}
```

- [ ] **Step 3: Add `mockDisclaimer` inside `valueFeatures.radar`**

Locate the `"valueFeatures"."radar"` object (currently containing `title`, `description`, `newBadge`, `analyzeButton`, `matchBadge`, `viewAnalysis`, `sourceBadge`). Add `mockDisclaimer` as a new key:

```json
"radar": {
  "title": "Radar de Vagas",
  "description": "Monitoramento automático em centenas de sites. Receba alertas das vagas certas no seu perfil, em tempo real.",
  "newBadge": "NOVA",
  "analyzeButton": "Analisar",
  "matchBadge": "Match",
  "viewAnalysis": "Ver análise",
  "sourceBadge": "Fonte verificada · site oficial da empresa",
  "mockDisclaimer": "Exemplos ilustrativos. Marcas pertencem a seus proprietários."
}
```

- [ ] **Step 4: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/pt-BR/landing.json', 'utf8')); console.log('OK')"`
Expected output: `OK`

---

## Task 2: Add EN-US i18n keys

**Files:**
- Modify: `src/i18n/locales/en-US/landing.json`

- [ ] **Step 1: Add `footer.disclaimer` (English)**

In `src/i18n/locales/en-US/landing.json`, add `disclaimer` to the `footer` object:

```json
"footer": {
  "terms": "Terms",
  "privacy": "Privacy",
  "copyright": "© {{year}} ScrapJobs",
  "disclaimer": "The brands, logos, and company names displayed belong to their respective owners and are used for identification purposes only. ScrapJobs has no affiliation, sponsorship, or endorsement from these companies."
}
```

- [ ] **Step 2: Add `trust.disclaimer` (English)**

Add `disclaimer` to the `trust` object:

```json
"trust": {
  "overline": "Monitoring in real-time",
  "statSites": "sites monitored",
  "statJobs": "jobs found",
  "statsError": "Unable to load statistics. Please try again shortly.",
  "disclaimer": "Logos displayed are registered trademarks of their respective owners. We monitor public career pages — no official affiliation."
}
```

- [ ] **Step 3: Add `mockDisclaimer` (English)**

Add `mockDisclaimer` to `valueFeatures.radar`:

```json
"radar": {
  "title": "Job Radar",
  "description": "Automatic monitoring across hundreds of sites. Get alerts for the right jobs for your profile in real-time.",
  "newBadge": "NEW",
  "analyzeButton": "Analyze",
  "matchBadge": "Match",
  "viewAnalysis": "View analysis",
  "sourceBadge": "Verified source · official company site",
  "mockDisclaimer": "Illustrative examples. Trademarks belong to their owners."
}
```

- [ ] **Step 4: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en-US/landing.json', 'utf8')); console.log('OK')"`
Expected output: `OK`

---

## Task 3: Footer disclaimer

**Files:**
- Modify: `src/components/landingPage/footer.tsx`

- [ ] **Step 1: Replace the footer JSX with the version that includes the disclaimer block**

Replace the entire `return (...)` of the `Footer` function with:

```tsx
return (
  <footer className="py-8 px-4 sm:px-6 border-t border-zinc-200 bg-white">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <Logo size={20} showText textClassName="text-base" />

      <div className="flex items-center gap-6">
        <Link
          to={PATHS.terms}
          className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
        >
          {t('footer.terms')}
        </Link>
        <Link
          to={PATHS.privacy}
          className="text-sm text-zinc-500 hover:text-emerald-500 transition-colors"
        >
          {t('footer.privacy')}
        </Link>
      </div>

      <p className="text-xs text-zinc-400">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </p>
    </div>

    <p className="mt-6 pt-4 border-t border-zinc-100 max-w-3xl mx-auto text-xs text-zinc-400 text-center leading-relaxed">
      {t('footer.disclaimer')}
    </p>
  </footer>
)
```

The only change is the new `<p>` block after the existing inner `<div>`. The outer `<footer>` now contains two children: the original flex row and the new disclaimer paragraph.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit` (from the `FrontScrapJobs` directory)
Expected: no errors.

---

## Task 4: Trust-section carousel caption

**Files:**
- Modify: `src/components/landingPage/trust-section.tsx`

- [ ] **Step 1: Add the disclaimer `<p>` inside the `{hasLogos && (...)}` block**

Locate the block `{hasLogos && (...)}` in the JSX (currently wraps the `relative overflow-hidden mb-16` div with the scrolling logos). Add a new `<p>` element as a sibling **inside** the fragment, directly after the closing `</div>` of the `relative overflow-hidden mb-16` block:

Before:

```tsx
{hasLogos && (
  <div className="relative overflow-hidden mb-16">
    <div className="flex gap-12 animate-logo-scroll whitespace-nowrap items-center">
      {[...siteLogos, ...siteLogos].map((logo, i) => (
        <img
          key={`${logo.site_name}-${i}`}
          src={logo.logo_url}
          alt={logo.site_name}
          loading="lazy"
          className="h-8 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        />
      ))}
    </div>
    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
  </div>
)}
```

After — wrap in a fragment and add the caption:

```tsx
{hasLogos && (
  <>
    <div className="relative overflow-hidden mb-4">
      <div className="flex gap-12 animate-logo-scroll whitespace-nowrap items-center">
        {[...siteLogos, ...siteLogos].map((logo, i) => (
          <img
            key={`${logo.site_name}-${i}`}
            src={logo.logo_url}
            alt={logo.site_name}
            loading="lazy"
            className="h-8 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
    </div>
    <p className="text-xs text-zinc-500 text-center max-w-2xl mx-auto mb-16">
      {t('trust.disclaimer')}
    </p>
  </>
)}
```

Three changes:
1. Wrapped the block contents in a React fragment (`<>...</>`) so two siblings can coexist inside `{hasLogos && (...)}`.
2. Changed the carousel `<div>`'s bottom margin from `mb-16` → `mb-4` (the margin moves to the caption so spacing is preserved).
3. Added the new `<p>` with `mb-16` to restore the bottom spacing before the stats grid.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

---

## Task 5: Radar-notifications mock caption

**Files:**
- Modify: `src/components/landingPage/ui-snippets/radar-notifications.tsx`

- [ ] **Step 1: Add the disclaimer `<p>` after the source badge inside `{!compact && (...)}`**

Locate the `{!compact && (...)}` block (wraps Card 3 + the source badge motion.div). Add a new `<motion.p>` as the last element inside the fragment, after the source badge.

Before:

```tsx
{!compact && (
  <>
    {/* Card 3 — Faded / older */}
    <motion.div ...>
      ...
    </motion.div>

    {/* Source badge */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="flex items-center gap-2 mt-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg"
    >
      <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
      <span className="text-[0.65rem] text-emerald-800 font-semibold">
        {t('valueFeatures.radar.sourceBadge')}
      </span>
    </motion.div>
  </>
)}
```

After — add the mock disclaimer as the last child:

```tsx
{!compact && (
  <>
    {/* Card 3 — Faded / older */}
    <motion.div ...>
      ...
    </motion.div>

    {/* Source badge */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className="flex items-center gap-2 mt-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg"
    >
      <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
      <span className="text-[0.65rem] text-emerald-800 font-semibold">
        {t('valueFeatures.radar.sourceBadge')}
      </span>
    </motion.div>

    {/* Mock disclaimer */}
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: 0.85 }}
      className="text-[0.65rem] text-zinc-400 italic text-center mt-1"
    >
      {t('valueFeatures.radar.mockDisclaimer')}
    </motion.p>
  </>
)}
```

Note: the `delay: 0.85` sits just after the source badge's `0.7` to preserve the staggered entrance feel. The italic + zinc-400 styling deliberately makes it read as a meta-caption rather than a primary card element.

**Do not** remove or modify the existing `aria-hidden="true" role="presentation"` on the outer `<div>` — the mock cards remain decorative for screen readers (which would only find literal text about jobs confusing without context). The disclaimer is for human readers and scanning bots, both of which see the rendered DOM.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

---

## Task 6: Lint

**Files:** none (validation only)

- [ ] **Step 1: Run ESLint on the modified files**

Run:

```bash
npx eslint \
  src/i18n/locales/pt-BR/landing.json \
  src/i18n/locales/en-US/landing.json \
  src/components/landingPage/footer.tsx \
  src/components/landingPage/trust-section.tsx \
  src/components/landingPage/ui-snippets/radar-notifications.tsx
```

Expected: no errors. If JSON files aren't covered by eslint, the command will simply skip them — that's fine.

- [ ] **Step 2: Run full lint if step 1 passes**

Run: `npm run lint`
Expected: no errors introduced by our changes.

---

## Task 7: Run existing test suite

**Files:** none (validation only)

- [ ] **Step 1: Run vitest**

Run: `npm run test`
Expected: all tests pass. Our changes are pure display additions with no logic — any test failure would indicate an i18n key mismatch or a typo.

If a test fails with a missing-translation warning for one of the new keys, that means either the JSON key name doesn't match the `t(...)` call, or the JSON wasn't saved correctly. Re-read the files and verify.

---

## Task 8: Manual visual verification

**Files:** none (visual check)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Wait for: `VITE vX.X.X  ready in XXX ms` + `Local: http://localhost:5173/`

- [ ] **Step 2: Open the LP in the browser**

Navigate to `http://localhost:5173/` (or whatever path the LP lives at — check `src/router/` if unsure; the `Landing` component is the default public route).

- [ ] **Step 3: Verify the radar-notifications caption**

Scroll to the "Value Features" section (the one titled "O ScrapJobs resolve tudo isso"). Find the Radar de Vagas card showing animated job notifications. Below the source badge ("Fonte verificada · site oficial da empresa"), confirm the italic gray caption reads: **"Exemplos ilustrativos. Marcas pertencem a seus proprietários."**

Acceptance: caption is visible, italic, light gray, does not overlap the source badge, and appears after a short fade-in delay.

- [ ] **Step 4: Verify the trust-section caption**

Scroll to the Trust section (dark-background section with the overline "Monitorando em tempo real"). Below the scrolling logo carousel and above the stats ("X sites monitorados" / "X vagas encontradas"), confirm the caption reads: **"Logos exibidos são marcas registradas de seus respectivos proprietários. Monitoramos páginas públicas de carreiras — sem afiliação oficial."**

Acceptance: caption is centered, small zinc-500 text, spacing between carousel and caption is tight, spacing between caption and stats grid is preserved.

Note: if the `usePublicSiteLogos` hook returns no logos (API down or empty), the entire block including this caption won't render — that's intended.

- [ ] **Step 5: Verify the footer disclaimer**

Scroll to the very bottom of the page. Below the row with Logo / Termos / Privacidade / Copyright, confirm a new line appears separated by a light hairline border, reading (centered): **"As marcas, logotipos e nomes de empresas exibidos pertencem aos seus respectivos proprietários e são usados apenas para identificação. O ScrapJobs não possui afiliação, patrocínio ou endosso dessas empresas."**

Acceptance: paragraph is centered, `max-w-3xl`, text-xs, zinc-400, separated from the footer row above by the `border-t border-zinc-100` hairline.

- [ ] **Step 6: Verify EN-US translations render correctly**

The LP currently does not mount the `LanguageSelector` component. To verify the English strings without shipping a UI toggle, change the browser/i18n language manually:

1. In the browser DevTools Console, run:
   ```js
   localStorage.setItem('i18nextLng', 'en-US')
   location.reload()
   ```
2. After the reload, repeat steps 3, 4, and 5 above — confirm each disclaimer matches the EN-US string defined in Task 2.
3. Restore PT-BR when done:
   ```js
   localStorage.setItem('i18nextLng', 'pt-BR')
   location.reload()
   ```

If react-i18next is not configured to persist language via `localStorage` (check `src/i18n/` init), fall back to a static check: open `src/i18n/locales/en-US/landing.json` and visually confirm the three keys match Task 2 exactly — typos here would show up as missing-translation warnings in step 7.

- [ ] **Step 7: Check DevTools Console**

Open browser DevTools → Console. Confirm: no missing-translation warnings (react-i18next logs a warning per missing key like `i18next::translator: missingKey ...`). If any appear for the new keys, return to Tasks 1/2 and verify the JSON paths match the component calls exactly.

- [ ] **Step 8: Stop the dev server**

Ctrl+C in the terminal running `npm run dev`.

---

## Task 9: Commit

**Files:** all 5 modified files

- [ ] **Step 1: Stage the changes**

```bash
git add \
  src/i18n/locales/pt-BR/landing.json \
  src/i18n/locales/en-US/landing.json \
  src/components/landingPage/footer.tsx \
  src/components/landingPage/trust-section.tsx \
  src/components/landingPage/ui-snippets/radar-notifications.tsx
```

- [ ] **Step 2: Verify staged diff**

Run: `git diff --cached --stat`
Expected output: 5 files changed, roughly +20 to +30 insertions total, 0 or few deletions (only the margin change in trust-section is a modification; everything else is additions).

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(landing): add trademark disclaimers for Meta Ads compliance

Three contextual disclaimers on the public LP (footer, trust-section
logo carousel caption, radar-notifications mock caption) to support
the Meta Ads appeal and make nominative use of third-party trademarks
explicit. i18n in PT-BR and EN-US.

Spec: docs/superpowers/specs/2026-04-17-meta-ads-disclaimer-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Verify**

Run: `git log -1 --stat`
Expected: commit summary shows the 5 files modified.

---

## Post-Implementation Checklist

After Task 9, confirm with the user:

1. The three disclaimers are visible in production build (`npm run build && npm run preview`).
2. The Meta Ads contestation form is submitted with the technical justification text referencing nominative fair use + these LP disclaimers as evidence.
3. If the Meta contestation is rejected → activate **Plano B** (substitute brand names in `radar-notifications.tsx` with fictional equivalents like "TechBank", "MarketHub", "FoodFast"). That is a separate spec + plan, not part of this PR.
