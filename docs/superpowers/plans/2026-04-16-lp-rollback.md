# LP Rollback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert the Landing Page to `feat/merge-lps` design while keeping ProblemSection and Navbar from main.

**Architecture:** Selective checkout of components from `feat/merge-lps` into main. The ProblemSection stays as-is (red cards with 85%/6h/72%) wrapped in SectionWrapper for consistency. Navbar stays from main. All other LP sections come from `feat/merge-lps`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Framer Motion, react-i18next, @tanstack/react-query

---

## Pre-Implementation Context

**Key facts verified during planning:**
- All CSS animations (`animate-fade-in-up`, `text-gradient-primary`, `bg-stripes`, etc.) already exist in `src/index.css` on main
- `usePublicStats` hook and `statsService` methods (`getPublicStats`, `getPublicSiteLogos`) already exist on main — identical to feat/merge-lps
- `useCountUp` hook exists on main at `src/hooks/useCountUp.ts` — used by ProblemSection
- Accordion UI component exists at `src/components/ui/accordion.tsx`
- Button `glow` variant exists in `src/components/ui/button.tsx`
- No changes to `tailwind.config.ts` or `src/index.css` between branches
- No changes to `src/components/ui/` between branches

**Files to bring from feat/merge-lps:**
- `src/pages/Landing.tsx` (modified)
- `src/components/landingPage/section-wrapper.tsx` (new)
- `src/components/landingPage/hero-section.tsx` (modified)
- `src/components/landingPage/value-features-section.tsx` (modified)
- `src/components/landingPage/how-it-works-section.tsx` (new)
- `src/components/landingPage/social-proof-section.tsx` (new)
- `src/components/landingPage/stats-counter-section.tsx` (new)
- `src/components/landingPage/savings-calculator-section.tsx` (new)
- `src/components/landingPage/pricing-section.tsx` (modified)
- `src/components/landingPage/faq-section.tsx` (new)
- `src/components/landingPage/cta-final-section.tsx` (new)
- `src/components/landingPage/problem-promise.tsx` (new — used by feat/merge-lps ProblemSection, NOT needed since we keep main's version. Skip this file.)
- `src/components/landingPage/footer.tsx` (modified)
- `src/components/landingPage/ui-snippets/ats-analysis-card.tsx` (modified)
- `src/components/landingPage/ui-snippets/pdf-preview-card.tsx` (modified)
- `src/components/landingPage/ui-snippets/radar-notifications.tsx` (modified)
- `src/i18n/locales/pt-BR/landing.json` (modified)
- `src/i18n/locales/en-US/landing.json` (modified)

**Files to keep from main (do NOT overwrite):**
- `src/components/landingPage/navbar.tsx`
- `src/components/landingPage/problem-section.tsx`
- `src/hooks/useCountUp.ts`

**Files to delete (no longer used):**
- `src/components/landingPage/sticky-cta-bar.tsx`
- `src/components/landingPage/trust-section.tsx`
- `src/components/landingPage/__tests__/sticky-cta-bar.test.tsx`
- `src/hooks/__tests__/useCountUp.test.ts` — keep this (useCountUp still used)

---

### Task 1: Checkout new and updated components from feat/merge-lps

**Files:**
- Create: `src/components/landingPage/section-wrapper.tsx`
- Create: `src/components/landingPage/how-it-works-section.tsx`
- Create: `src/components/landingPage/social-proof-section.tsx`
- Create: `src/components/landingPage/stats-counter-section.tsx`
- Create: `src/components/landingPage/savings-calculator-section.tsx`
- Create: `src/components/landingPage/faq-section.tsx`
- Create: `src/components/landingPage/cta-final-section.tsx`
- Modify: `src/components/landingPage/hero-section.tsx`
- Modify: `src/components/landingPage/value-features-section.tsx`
- Modify: `src/components/landingPage/pricing-section.tsx`
- Modify: `src/components/landingPage/footer.tsx`
- Modify: `src/components/landingPage/ui-snippets/ats-analysis-card.tsx`
- Modify: `src/components/landingPage/ui-snippets/pdf-preview-card.tsx`
- Modify: `src/components/landingPage/ui-snippets/radar-notifications.tsx`

- [ ] **Step 1: Checkout all components from feat/merge-lps (excluding navbar, problem-section, problem-promise)**

```bash
git checkout feat/merge-lps -- \
  src/components/landingPage/section-wrapper.tsx \
  src/components/landingPage/hero-section.tsx \
  src/components/landingPage/value-features-section.tsx \
  src/components/landingPage/how-it-works-section.tsx \
  src/components/landingPage/social-proof-section.tsx \
  src/components/landingPage/stats-counter-section.tsx \
  src/components/landingPage/savings-calculator-section.tsx \
  src/components/landingPage/pricing-section.tsx \
  src/components/landingPage/faq-section.tsx \
  src/components/landingPage/cta-final-section.tsx \
  src/components/landingPage/footer.tsx \
  src/components/landingPage/ui-snippets/ats-analysis-card.tsx \
  src/components/landingPage/ui-snippets/pdf-preview-card.tsx \
  src/components/landingPage/ui-snippets/radar-notifications.tsx
```

- [ ] **Step 2: Verify the files were checked out**

Run: `git status`
Expected: 14 files staged (7 new, 7 modified). `navbar.tsx` and `problem-section.tsx` must NOT appear in the diff.

- [ ] **Step 3: Commit**

```bash
git add src/components/landingPage/
git commit -m "feat(landing): bring LP components from feat/merge-lps

Checkout section-wrapper, hero, value-features, how-it-works,
social-proof, stats-counter, savings-calculator, pricing,
faq, cta-final, footer, and ui-snippets from feat/merge-lps.
Navbar and ProblemSection intentionally kept from main."
```

---

### Task 2: Update Landing.tsx page

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Checkout Landing.tsx from feat/merge-lps**

```bash
git checkout feat/merge-lps -- src/pages/Landing.tsx
```

- [ ] **Step 2: Verify Landing.tsx imports ProblemSection from the correct path**

Read `src/pages/Landing.tsx` and confirm it imports `ProblemSection` from `@/components/landingPage/problem-section`. The import already exists in feat/merge-lps's Landing.tsx because it also has a ProblemSection — it just has a different implementation. No changes needed.

Expected content of Landing.tsx:
```tsx
import { useLayoutEffect } from 'react'
import { CtaFinalSection } from '@/components/landingPage/cta-final-section'
import { FaqSection } from '@/components/landingPage/faq-section'
import { Footer } from '@/components/landingPage/footer'
import { HeroSection } from '@/components/landingPage/hero-section'
import { HowItWorksSection } from '@/components/landingPage/how-it-works-section'
import { LandingNavbar } from '@/components/landingPage/navbar'
import { PricingSection } from '@/components/landingPage/pricing-section'
import { ProblemSection } from '@/components/landingPage/problem-section'
import { ValueFeaturesSection } from '@/components/landingPage/value-features-section'
import { SavingsCalculatorSection } from '@/components/landingPage/savings-calculator-section'
import { SocialProofSection } from '@/components/landingPage/social-proof-section'
import { StatsCounterSection } from '@/components/landingPage/stats-counter-section'

export function Landing() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains('dark')
    root.classList.remove('dark')
    return () => {
      if (hadDark) root.classList.add('dark')
    }
  }, [])

  return (
    <div className="bg-emerald-100/30">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <ValueFeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <StatsCounterSection />
      <SavingsCalculatorSection />
      <PricingSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat(landing): update Landing.tsx with feat/merge-lps section order"
```

---

### Task 3: Update i18n files

**Files:**
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

- [ ] **Step 1: Save main's problem.* i18n keys before overwriting**

Read `src/i18n/locales/pt-BR/landing.json` and `src/i18n/locales/en-US/landing.json`. Extract and save the `problem` object from each.

On main, the pt-BR keys are:
```json
"problem": {
  "headline": "A realidade de quem busca emprego hoje",
  "subheading": "E provavelmente a sua também.",
  "pain1": "dos currículos são descartados por robôs antes de um humano ver",
  "pain2": "por semana perdidas buscando vagas manualmente em dezenas de sites",
  "pain3": "das vagas ideais são preenchidas antes de você sequer descobrir"
}
```

- [ ] **Step 2: Checkout i18n files from feat/merge-lps**

```bash
git checkout feat/merge-lps -- \
  src/i18n/locales/pt-BR/landing.json \
  src/i18n/locales/en-US/landing.json
```

- [ ] **Step 3: Replace the `problem` and `problemSection` keys with main's problem keys**

In both locale files:
1. Replace whatever `"problem"` object exists with main's version (saved in step 1)
2. Remove the `"problemSection"` object entirely (it was used by feat/merge-lps's ProblemSection which we're not using)

For pt-BR, ensure the `problem` key contains exactly:
```json
"problem": {
  "headline": "A realidade de quem busca emprego hoje",
  "subheading": "E provavelmente a sua também.",
  "pain1": "dos currículos são descartados por robôs antes de um humano ver",
  "pain2": "por semana perdidas buscando vagas manualmente em dezenas de sites",
  "pain3": "das vagas ideais são preenchidas antes de você sequer descobrir"
}
```

For en-US, read main's version first and apply the same pattern.

- [ ] **Step 4: Verify i18n files are valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/pt-BR/landing.json','utf8')); console.log('pt-BR: valid')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en-US/landing.json','utf8')); console.log('en-US: valid')"
```

Expected: Both print "valid"

- [ ] **Step 5: Commit**

```bash
git add src/i18n/locales/
git commit -m "feat(landing): merge i18n from feat/merge-lps, keep problem keys from main"
```

---

### Task 4: Adapt ProblemSection to use SectionWrapper

**Files:**
- Modify: `src/components/landingPage/problem-section.tsx`

- [ ] **Step 1: Wrap ProblemSection's `<section>` in SectionWrapper**

Current code (main):
```tsx
export function ProblemSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-50">
      <div className="max-w-5xl mx-auto">
        ...
      </div>
    </section>
  )
}
```

Change to:
```tsx
import { SectionWrapper } from './section-wrapper'

export function ProblemSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-50">
      <div className="max-w-5xl mx-auto">
        ...
      </div>
    </SectionWrapper>
  )
}
```

Specifically:
1. Add import: `import { SectionWrapper } from './section-wrapper'`
2. Replace `<section className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-50">` with `<SectionWrapper className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-50">`
3. Replace closing `</section>` with `</SectionWrapper>`

- [ ] **Step 2: Verify ProblemSection renders correctly**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/landingPage/problem-section.tsx
git commit -m "feat(landing): wrap ProblemSection in SectionWrapper for consistency"
```

---

### Task 5: Remove unused components

**Files:**
- Delete: `src/components/landingPage/sticky-cta-bar.tsx`
- Delete: `src/components/landingPage/trust-section.tsx`
- Delete: `src/components/landingPage/__tests__/sticky-cta-bar.test.tsx`

- [ ] **Step 1: Verify no other files import these components**

```bash
grep -r "sticky-cta-bar\|StickyCtaBar" src/ --include="*.tsx" --include="*.ts" -l
grep -r "trust-section\|TrustSection" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: Only the files themselves (and their tests) should appear. Landing.tsx should NOT appear (it was updated in Task 2 and no longer imports them).

- [ ] **Step 2: Delete the unused files**

```bash
git rm src/components/landingPage/sticky-cta-bar.tsx
git rm src/components/landingPage/trust-section.tsx
git rm src/components/landingPage/__tests__/sticky-cta-bar.test.tsx
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(landing): remove StickyCtaBar and TrustSection (replaced by new sections)"
```

---

### Task 6: Remove unused i18n keys

**Files:**
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

- [ ] **Step 1: Remove `stickyBar` and `trust` keys from both locale files**

These keys were used by StickyCtaBar and TrustSection which no longer exist. Check if they're present in the current landing.json (after Task 3 checkout). If feat/merge-lps already removed them, this step is a no-op.

```bash
grep -c '"stickyBar"\|"trust"' src/i18n/locales/pt-BR/landing.json
```

If count > 0, remove those top-level keys from both files.

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/pt-BR/landing.json','utf8')); console.log('pt-BR: valid')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en-US/landing.json','utf8')); console.log('en-US: valid')"
```

- [ ] **Step 3: Commit (if changes were made)**

```bash
git add src/i18n/locales/
git commit -m "chore(landing): remove unused stickyBar and trust i18n keys"
```

---

### Task 7: Build verification and smoke test

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run the dev server and verify the page loads**

```bash
npm run dev
```

Open the landing page in browser and verify:
1. All 12 sections render in the correct order
2. ProblemSection shows red cards with 85%, 6h, 72% animated counters
3. Navbar is the main version (not feat/merge-lps version)
4. No console errors
5. Animations work (scroll through page)

- [ ] **Step 3: Run existing tests**

```bash
npm test -- --run
```

Expected: All tests pass (some LP tests may need updates if they reference removed components)

- [ ] **Step 4: Fix any failing tests**

If sticky-cta-bar tests fail because the test file was deleted, that's expected (already handled in Task 5). If other tests reference StickyCtaBar or TrustSection, update them to remove those references.

- [ ] **Step 5: Final commit if any test fixes were needed**

```bash
git add -A
git commit -m "test(landing): fix tests after LP rollback"
```
