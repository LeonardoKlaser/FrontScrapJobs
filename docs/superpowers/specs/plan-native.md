# UI Standardization — Native Implementation Plan

Sequential checklist. Each step has the exact file, what to find, what to replace.
After each group: `npx tsc --noEmit && npm run dev` to verify.

---

## Phase 1: Base Components (cascade changes)

### Step 1. Update `button.tsx` variants

**File:** `src/components/ui/button.tsx`

**1a. Update `default` variant**
```
FIND:
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',

REPLACE:
        default:
          'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:bg-primary/90',
```

**1b. Update `destructive` variant**
```
FIND:
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

REPLACE:
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
```

**1c. Update `outline` variant**
```
FIND:
        outline:
          'border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-border dark:hover:bg-accent/50',

REPLACE:
        outline:
          'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30',
```

**1d. Update `ghost` variant**
```
FIND:
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground',

REPLACE:
        ghost: 'text-primary hover:bg-primary/5',
```

**Verification:** `npx tsc --noEmit` — should compile clean, no signature changes.

---

### Step 2. Update `card.tsx` base styles

**File:** `src/components/ui/card.tsx`

**2a. Update Card className**
```
FIND:
        'bg-card text-card-foreground flex flex-col gap-6 rounded-lg border border-border/50 py-6 shadow-none transition-colors duration-150',

REPLACE:
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border/30 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-150',
```

Key changes:
- `rounded-lg` -> `rounded-xl`
- `border-border/50` -> `border-border/30`
- `shadow-none` -> `shadow-[0_4px_12px_rgba(0,0,0,0.05)]`
- Added `hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
- `transition-colors` -> `transition-all`

**Verification:** `npx tsc --noEmit` — no signature changes.

---

### Step 3. Update `page-header.tsx` — add `font-display`

**File:** `src/components/common/page-header.tsx`

```
FIND:
              'text-2xl md:text-3xl font-bold tracking-tight',

REPLACE:
              'font-display text-2xl md:text-3xl font-bold tracking-tight',
```

**Verification:** `npx tsc --noEmit`

---

## Phase 2: Remove hardcoded button height overrides

### Step 4. Home.tsx — remove `h-7` from ApplyButton

**File:** `src/pages/Home.tsx`

**4a. ApplyButton component (line ~136)**
```
FIND:
      className="gap-1.5 text-xs h-7"

REPLACE:
      className="gap-1.5 text-xs"
```

**4b. Mobile AI analysis button (line ~643)**
```
FIND:
      className="gap-1.5 ml-auto text-xs h-7"

REPLACE:
      className="gap-1.5 ml-auto text-xs"
```

**4c. Desktop AI analysis button (line ~787)**
```
FIND:
      className="gap-1.5 opacity-70 group-hover/row:opacity-100 transition-opacity text-xs h-7"

REPLACE:
      className="gap-1.5 opacity-70 group-hover/row:opacity-100 transition-opacity text-xs"
```

---

### Step 5. Auth.tsx — remove `h-12 text-base` from login CTA

**File:** `src/components/forms/Auth.tsx`

```
FIND:
        className="mt-1 h-12 text-base font-semibold"

REPLACE:
        className="mt-1 font-semibold"
```

Also add `size="lg"` prop to the Button (it already has `variant="glow"`):
```
FIND:
        variant="glow"
        disabled={loading}
        className="mt-1 font-semibold"

REPLACE:
        variant="glow"
        size="lg"
        disabled={loading}
        className="mt-1 font-semibold"
```

---

### Step 6. ResetPassword.tsx — remove `h-10` from CTA

**File:** `src/pages/ResetPassword.tsx`

```
FIND:
              <Button type="submit" variant="glow" disabled={loading} className="h-10">

REPLACE:
              <Button type="submit" variant="glow" size="lg" disabled={loading}>
```

---

### Step 7. ForgotPassword.tsx — remove `h-10` from CTA

**File:** `src/pages/ForgotPassword.tsx`

```
FIND:
              <Button type="submit" variant="glow" disabled={loading} className="h-10">

REPLACE:
              <Button type="submit" variant="glow" size="lg" disabled={loading}>
```

---

### Step 8. Checkout step buttons — remove `h-11 text-base`

**File:** `src/components/checkout/personal-data-step.tsx` (line ~370)
```
FIND:
          className="h-11 w-full text-base"

REPLACE:
          className="w-full"
```
Also add `size="lg"` to this Button element.

**File:** `src/components/checkout/card-payment-step.tsx` (line ~406)
```
FIND:
          className="h-11 w-full text-base"

REPLACE:
          className="w-full"
```
Also add `size="lg"` to this Button element.

**File:** `src/pages/paymentConfirmation.tsx` (line ~58)
```
FIND:
              className="h-11 w-full text-base"

REPLACE:
              className="w-full"
```
Also add `size="lg"` to this Button element.

**Verification:** `npx tsc --noEmit && npm run dev` — check auth pages + checkout visually.

---

## Phase 3: Remove Card padding overrides

### Step 9. Home.tsx — mobile job cards

**File:** `src/pages/Home.tsx`

**9a. Mobile job card (line ~592)**
```
FIND:
                <Card key={job.id} className="p-4 space-y-2.5">

REPLACE:
                <Card key={job.id} className="space-y-2.5">
```

**9b. Mobile monitored URL card (line ~890)**
```
FIND:
                  className="p-3 flex items-center justify-between"

REPLACE:
                  className="flex items-center justify-between"
```

---

### Step 10. Home.tsx — StatsCard `p-5` override

**File:** `src/pages/Home.tsx`

```
FIND:
      className="animate-fade-in-up hover-lift group relative flex flex-col gap-3 p-5 overflow-hidden hover:border-primary/20"

REPLACE:
      className="animate-fade-in-up group relative flex flex-col gap-3 overflow-hidden hover:border-primary/20"
```

Note: Removed `hover-lift` too — the card base now has hover-lift built in. Also removed `p-5` (card uses py-6 + px-6 via CardContent).

However, StatsCard uses raw children not CardContent, so padding will come from the Card's `py-6`. StatsCard currently has direct children — we need to either wrap them in CardContent or keep `p-5`. Since StatsCard is a compact stat display, keep the padding:

**REVISED: Keep the padding but standardize to px-6 py-6 via the base card. StatsCard's `p-5` is fine to keep since it overrides the base py-6 for compactness. Only remove `hover-lift` since the card base now does this.**

```
FIND:
      className="animate-fade-in-up hover-lift group relative flex flex-col gap-3 p-5 overflow-hidden hover:border-primary/20"

REPLACE:
      className="animate-fade-in-up group relative flex flex-col gap-3 p-5 overflow-hidden hover:border-primary/20"
```

---

### Step 11. Admin Dashboard — remove padding overrides from Cards

**File:** `src/components/adminDashboard/kpi-cards.tsx`

```
FIND:
    <Card className="p-5 hover:border-primary/30 transition-colors duration-150 group hover-lift">

REPLACE:
    <Card className="p-5 hover:border-primary/30 group">
```

Removed redundant `hover-lift` (built into card now), `transition-colors duration-150` (card now has `transition-all duration-150`).

**File:** `src/components/adminDashboard/charts-section.tsx`

```
FIND (line 10):
      <Card className="p-5">

REPLACE:
      <Card className="p-5">
```
(No change needed — p-5 padding override is acceptable for charts content.)

**File:** `src/components/adminDashboard/activity-logs.tsx`

```
FIND:
    <Card className="p-5 animate-fade-in-up">

REPLACE:
    <Card className="p-5">
```

(Remove duplicate `animate-fade-in-up` since parent div already has it.)

**File:** `src/components/adminDashboard/email-config-section.tsx`

Line 58 (loading state):
```
FIND:
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">

REPLACE:
      <Card>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
```
(And close with `</CardContent>` instead of `</div>`.)

Line 68 (main card):
```
FIND:
    <Card className="p-6">

REPLACE:
    <Card>
```
Then wrap the inner content in `<CardContent>` and `<CardHeader>` properly. However, this is a larger refactor — simpler to just leave `p-6` as-is since it matches base card padding. **REVISED: Leave p-6 as-is, it matches the standard.**

**Verification:** `npx tsc --noEmit`

---

## Phase 4: Page Header Migration

### Step 12. Applications.tsx — replace custom `<h1>` with `<PageHeader>`

**File:** `src/pages/Applications.tsx`

**12a. Add PageHeader import**
```
FIND:
import { toast } from 'sonner'

REPLACE:
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/page-header'
```

**12b. Replace empty state header (line ~194-199)**
```
FIND:
        <div className="animate-fade-in-up text-center">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            {t('kanban.title')}
          </h1>
        </div>

REPLACE:
        <PageHeader title={t('kanban.title')} />
```

**12c. Replace main header (line ~209-213)**
```
FIND:
      <div className="animate-fade-in-up text-center">
        <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {t('kanban.title')}
        </h1>
      </div>

REPLACE:
      <PageHeader title={t('kanban.title')} />
```

**12d. Change `space-y-6` to `space-y-10` (line ~208)**
```
FIND:
    <div className="space-y-6">

REPLACE:
    <div className="space-y-10">
```

Also change the empty state wrapper:
```
FIND (line ~193):
      <div className="space-y-10">

(Already space-y-10, no change needed.)
```

---

### Step 13. ListSites.tsx — replace custom `<h1>` with `<PageHeader>`

**File:** `src/pages/ListSites.tsx`

**13a. Add PageHeader import**
```
FIND:
import { RequestSiteForm } from '@/components/sites/request-site-form'

REPLACE:
import { RequestSiteForm } from '@/components/sites/request-site-form'
import { PageHeader } from '@/components/common/page-header'
```

**13b. Replace custom header (lines ~110-116)**
```
FIND:
      <div className="animate-fade-in-up text-center">
        <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

REPLACE:
      <PageHeader title={t('title')} description={t('description')} />
```

---

### Step 14. checkout.tsx — replace custom `<h1>` with `<PageHeader>`

**File:** `src/pages/checkout.tsx`

**14a. Add PageHeader import**
```
FIND:
import { useTranslation } from 'react-i18next'

REPLACE:
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/common/page-header'
```

**14b. Replace custom header (lines ~72-77)**
```
FIND:
        <div className="animate-fade-in-up mb-6">
          <h1 className="text-gradient-primary text-3xl font-bold tracking-tight sm:text-4xl">
            {t('checkout.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('checkout.description')}</p>
        </div>

REPLACE:
        <div className="mb-6">
          <PageHeader title={t('checkout.title')} description={t('checkout.description')} />
        </div>
```

---

### Step 15. AdminDashboard header — add `font-display` to `<h1>`

**File:** `src/components/adminDashboard/dashboard-header.tsx`

```
FIND:
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gradient-primary">

REPLACE:
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gradient-primary">
```

(Also removed `lg:text-4xl` to match the PageHeader standard of `text-2xl md:text-3xl`.)

**Verification:** `npx tsc --noEmit`

---

## Phase 5: Page Layout Spacing

### Step 16. Home.tsx — already uses `gap-10`, change to `space-y-10`

**File:** `src/pages/Home.tsx`

**16a. Main wrapper (line ~397)**
```
FIND:
    <div className="flex flex-col gap-10">

REPLACE:
    <div className="space-y-10">
```

**16b. Loading skeleton wrapper (line ~344)**
```
FIND:
      <div className="flex flex-col gap-10">

REPLACE:
      <div className="space-y-10">
```

---

### Step 17. AdminDashboard — `space-y-8` to `space-y-10`

**File:** `src/pages/adminDashboard.tsx`

```
FIND:
    <div className="space-y-8">

REPLACE:
    <div className="space-y-10">
```

---

### Step 18. AccountPage — `space-y-8` to `space-y-10`

**File:** `src/pages/accountPage.tsx`

```
FIND:
    <div className="space-y-8">

REPLACE:
    <div className="space-y-10">
```

---

### Step 19. Curriculum.tsx — standardize spacing

**File:** `src/pages/Curriculum.tsx`

Currently uses `<div className="mb-10">` for header gap then grid. Change to `space-y-10` wrapper:

```
FIND:
    <div>
      <div className="mb-10">
        <PageHeader title={t('title')} description={t('description')} />
      </div>

REPLACE:
    <div className="space-y-10">
      <PageHeader title={t('title')} description={t('description')} />
```

**Verification:** `npx tsc --noEmit && npm run dev` — check all pages visually.

---

## Phase 6: Animation Stagger Standardization

### Step 20. Home.tsx — StatsCard delay `80ms` -> `60ms`

**File:** `src/pages/Home.tsx`

```
FIND:
          <StatsCard key={s.title} {...s} delay={i * 80} />

REPLACE:
          <StatsCard key={s.title} {...s} delay={i * 60} />
```

---

### Step 21. Landing features — `150ms` -> `60ms` stagger (per-card)

**File:** `src/components/landingPage/features-section.tsx`

```
FIND:
              style={{ animationDelay: `${index * 150}ms` }}

REPLACE:
              style={{ animationDelay: `${index * 60}ms` }}
```

---

### Step 22. Landing how-it-works — `150ms` -> `60ms`

**File:** `src/components/landingPage/how-it-works-section.tsx`

```
FIND:
              style={{ animationDelay: `${index * 150}ms` }}

REPLACE:
              style={{ animationDelay: `${index * 60}ms` }}
```

---

### Step 23. Landing pricing — `150ms` -> `60ms`

**File:** `src/components/landingPage/pricing-section.tsx`

```
FIND:
                    style={{ animationDelay: `${index * 150}ms` }}

REPLACE:
                    style={{ animationDelay: `${index * 60}ms` }}
```

---

### Step 24. ListSites company grid — `40ms` already close, standardize to `60ms`

**File:** `src/pages/ListSites.tsx`

```
FIND:
            style={{ animationDelay: `${150 + index * 40}ms` }}

REPLACE:
            style={{ animationDelay: `${150 + index * 60}ms` }}
```

---

### Step 25. Curriculum list — `40ms` -> `60ms`

**File:** `src/components/curriculum/curriculum-list.tsx`

```
FIND:
                style={{ animationDelay: `${index * 40}ms` }}

REPLACE:
                style={{ animationDelay: `${index * 60}ms` }}
```

**Verification:** `npx tsc --noEmit`

---

## Phase 7: Landing Page Corrections

### Step 26. Hero CTA — remove `hover:scale-105`

**File:** `src/components/landingPage/hero-section.tsx`

```
FIND:
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg hover:scale-105 transition-transform duration-200 animate-pulse-glow"

REPLACE:
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg animate-pulse-glow"
```

---

### Step 27. Pricing cards — remove `hover-lift` class (now built into card)

These are raw `<div>` elements, not `<Card>`, so they DON'T get the card base styles. The `hover-lift` class on these divs is correct and should be **kept**.

**No change needed.** The pricing cards are not using the `<Card>` component — they use raw `<div>` elements with `rounded-2xl p-8`. The `hover-lift` CSS utility remains valid here.

---

### Step 28. Feature cards — same as pricing, raw divs, keep `hover-lift`

**No change needed.** Feature cards are also raw divs with `hover-lift`, not `<Card>`.

---

### Step 29. ListSites company buttons — remove redundant `hover-lift`

**File:** `src/pages/ListSites.tsx`

These are `<button>` elements, not `<Card>`, so `hover-lift` is valid. **Keep as-is.**

---

## Phase 8: Remove Redundant hover-lift from Card Components

Since `card.tsx` now has hover-lift built in (via `hover:-translate-y-0.5`), remove the `hover-lift` class from elements using `<Card>`.

### Step 30. Home.tsx StatsCard — already handled in Step 10

Already removed in Step 10.

### Step 31. KPI cards — already handled in Step 11

Already removed in Step 11.

### Step 32. Card stories — update examples

**File:** `src/components/ui/card.stories.tsx`

```
FIND:
      <Card className="hover-lift w-64 cursor-pointer">

REPLACE:
      <Card className="w-64 cursor-pointer">
```

Apply to both occurrences (lines 72 and 83).

**Verification:** `npx tsc --noEmit`

---

## Phase 9: Cleanup and Final Verification

### Step 33. Remove `hover-lift` CSS utility? NO.

The `hover-lift` CSS class in `src/index.css` is still used by raw `<div>` and `<button>` elements (pricing cards, feature cards, ListSites company buttons). **Keep it.**

---

### Step 34. Verify no remaining `h-7` on buttons

Run:
```bash
grep -rn 'h-7' src/pages/ src/components/ --include='*.tsx' | grep -i button
```

Expected: No matches after Steps 4a-4c.

Note: `h-7` on non-button elements (curriculum form delete icons, input.tsx file styling, how-it-works step circles) are NOT button size overrides and should be **left as-is**.

---

### Step 35. Verify no remaining hardcoded button heights

Run:
```bash
grep -rn 'className=.*h-1[012]' src/pages/ src/components/ --include='*.tsx' | grep -i 'button\|Button'
```

Expected results should only be non-button elements (icons, containers, spinners).

---

### Step 36. Final type-check and visual review

```bash
npx tsc --noEmit
npm run dev
```

Visual checklist:
- [ ] Home page: stat cards have elevation shadow + hover lift
- [ ] Home page: all buttons same height (h-9 default, h-8 for sm)
- [ ] Applications: uses PageHeader, space-y-10
- [ ] ListSites: uses PageHeader, space-y-10
- [ ] Checkout: uses PageHeader
- [ ] Account: space-y-10
- [ ] Admin Dashboard: space-y-10, font-display on header
- [ ] Auth (Login): CTA uses size="lg" (h-10), no h-12
- [ ] Auth (ResetPassword): CTA uses size="lg"
- [ ] Auth (ForgotPassword): CTA uses size="lg"
- [ ] Landing: no hover:scale on hero CTA
- [ ] Landing: pricing/feature cards still have hover-lift
- [ ] Cards: rounded-xl, subtle border, elevation shadow, hover-lift effect
- [ ] Buttons: default has emerald glow shadow, outline has emerald tint

---

## Summary of Files Changed

| # | File | Changes |
|---|------|---------|
| 1 | `src/components/ui/button.tsx` | Update 4 variant styles |
| 2 | `src/components/ui/card.tsx` | Update Card base className |
| 3 | `src/components/common/page-header.tsx` | Add `font-display` |
| 4 | `src/pages/Home.tsx` | Remove h-7 (x3), remove hover-lift, gap->space-y, delay 80->60 |
| 5 | `src/components/forms/Auth.tsx` | Remove h-12 text-base, add size="lg" |
| 6 | `src/pages/ResetPassword.tsx` | Remove h-10, add size="lg" |
| 7 | `src/pages/ForgotPassword.tsx` | Remove h-10, add size="lg" |
| 8 | `src/components/checkout/personal-data-step.tsx` | Remove h-11 text-base, add size="lg" |
| 9 | `src/components/checkout/card-payment-step.tsx` | Remove h-11 text-base, add size="lg" |
| 10 | `src/pages/paymentConfirmation.tsx` | Remove h-11 text-base, add size="lg" |
| 11 | `src/pages/Applications.tsx` | PageHeader migration, space-y-10 |
| 12 | `src/pages/ListSites.tsx` | PageHeader migration, stagger 60ms |
| 13 | `src/pages/checkout.tsx` | PageHeader migration |
| 14 | `src/components/adminDashboard/dashboard-header.tsx` | Add font-display, remove lg:text-4xl |
| 15 | `src/pages/adminDashboard.tsx` | space-y-10 |
| 16 | `src/pages/accountPage.tsx` | space-y-10 |
| 17 | `src/pages/Curriculum.tsx` | space-y-10 wrapper |
| 18 | `src/components/adminDashboard/kpi-cards.tsx` | Remove redundant hover-lift/transition |
| 19 | `src/components/adminDashboard/activity-logs.tsx` | Remove redundant animate class |
| 20 | `src/components/landingPage/hero-section.tsx` | Remove hover:scale-105 |
| 21 | `src/components/landingPage/features-section.tsx` | Stagger 60ms |
| 22 | `src/components/landingPage/how-it-works-section.tsx` | Stagger 60ms |
| 23 | `src/components/landingPage/pricing-section.tsx` | Stagger 60ms |
| 24 | `src/components/curriculum/curriculum-list.tsx` | Stagger 60ms |
| 25 | `src/components/ui/card.stories.tsx` | Remove hover-lift from examples |

**Total: 25 files, ~40 find-and-replace operations.**
