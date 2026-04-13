# UI Standardization — Design Spec

## Problem

The ScrapJobs app has accumulated UI inconsistencies across pages: buttons with different heights, cards with varying padding, page headers styled differently, spacing between sections changing per page. This undermines perceived quality and makes the product feel unfinished.

## Approach

Base-components first: update the 3 core components (`button.tsx`, `card.tsx`, `page-header.tsx`), let changes cascade, then clean per-page overrides. Apply the same standards to landing page, auth pages, and internal app.

## Scope

- All authenticated pages (Home, Applications, ListSites, Curriculum, Checkout, Account, AdminDashboard)
- Auth pages (Login, Register, ForgotPassword, ResetPassword)
- Landing page (corrections only, not a redesign)

---

## 1. Button Variants (Glow Emerald)

Update `button.tsx` variants:

| Variant | New Styles |
|---------|-----------|
| `default` | `bg-primary text-primary-foreground shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:bg-primary/90` |
| `outline` | `border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30` |
| `ghost` | `text-primary hover:bg-primary/5` |
| `destructive` | `bg-destructive text-destructive-foreground shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:bg-destructive/90` |
| `secondary` | Keep as-is (neutral, for non-accented actions) |
| `glow` | Keep as-is (auth + landing CTAs only) |
| `link` | Keep as-is |

### Size rules

- `size="default"` (h-9): all buttons inside the app
- `size="sm"` (h-8): compact contexts (table rows, badges)
- `size="lg"` (h-10): auth page CTAs only (with `variant="glow"`)
- `size="icon"` (size-9): icon-only buttons
- **Remove all hardcoded heights** (`h-7`, `h-10`, `h-12`, `text-base` overrides)

## 2. Card Component (Elevated + Hover-Lift)

Update `card.tsx` base styles:

```
Before: bg-card rounded-lg border border-border/50 py-6 shadow-none
After:  bg-card rounded-xl border border-border/30 shadow-[0_4px_12px_rgba(0,0,0,0.05)]
        hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        transition-all duration-150 py-6
```

Key changes:
- `rounded-lg` -> `rounded-xl` (12px)
- `border-border/50` -> `border-border/30` (subtler)
- Add elevation shadow
- Add hover-lift effect (translateY -0.5 + deeper shadow)
- Add `transition-all duration-150`

### Padding rules

Cards use `py-6` base + `px-6` via CardHeader/CardContent/CardFooter. Remove all per-component padding overrides:
- Remove `p-4` from mobile job cards (Home.tsx)
- Remove `p-5` from StatsCards (Home.tsx), KPI cards, charts cards
- Remove `p-6` from email config cards

## 3. Page Header (Sora + Standardized)

Update `page-header.tsx`:

```
Before: text-2xl md:text-3xl font-bold tracking-tight
After:  font-display text-2xl md:text-3xl font-bold tracking-tight
```

Single change: add `font-display` (Sora) to the `<h1>`.

### Migration

Pages that bypass PageHeader must migrate:

| Page | Current | Action |
|------|---------|--------|
| Applications.tsx | Custom `<h1>` with `text-3xl sm:text-4xl` | Replace with `<PageHeader>` |
| ListSites.tsx | Custom `<h1>` with `text-3xl sm:text-4xl` | Replace with `<PageHeader>` |
| checkout.tsx | Custom `<h1>` with `text-3xl sm:text-4xl` | Replace with `<PageHeader>` |
| AdminDashboard | DashboardHeader component | Align styles or replace with `<PageHeader>` |
| Home.tsx | StatsCard `<p>` tag for title | Use `font-display` on title text |
| Curriculum.tsx | Already uses PageHeader | No change |
| Account.tsx | Already uses PageHeader | No change |

## 4. Page Layout Spacing

All authenticated pages use `space-y-10` as the top-level section gap:

```tsx
<div className="space-y-10">
  <PageHeader title={...} description={...}>
    {/* optional actions */}
  </PageHeader>
  {/* content sections */}
</div>
```

Pages to update:
- Home.tsx: `gap-10` -> `space-y-10`
- Applications.tsx: `space-y-6` -> `space-y-10`
- AdminDashboard: `space-y-8` -> `space-y-10`
- Account.tsx: `space-y-8` -> `space-y-10`

## 5. Auth Pages

- CTA button: `variant="glow" size="lg"` (standardized h-10)
- Remove hardcoded `h-10`, `h-12`, `text-base` from all auth buttons
- Form field gap: `space-y-1.5` between label and input (already used in Auth.tsx, verify in others)

Files: `Auth.tsx`, `ResetPassword.tsx`, `ForgotPassword.tsx`

## 6. Hover States (Subtle)

- Cards: hover-lift via `hover:-translate-y-0.5` + shadow increase (built into card.tsx)
- Buttons: color change on hover (built into button.tsx variants)
- Interactive elements: `transition-all duration-150` universally
- No scale transforms on buttons

## 7. Landing Page

Apply same standardizations (corrections, not redesign):
- Pricing cards: add hover-lift matching new card.tsx pattern
- Feature cards: verify hover-lift aligns with new standard
- Outline buttons (if any): migrate to new emerald tint outline
- CTA buttons: already use `variant="glow"` (keep)

## 8. Icon Sizes

Standardize across the app:
- `size-4` (16px): default, inside buttons
- `size-5` (20px): section headers, card headers
- `size-3` (12px): badges, compact contexts

## 9. Animation Delays

Standardize stagger increment to `60ms` across all pages.

## 10. Form Fields

- Label-to-input gap: `space-y-1.5` everywhere
- Input height: `h-9` (default, already set)
- SelectTrigger: add explicit `h-9` for alignment

---

## Files Changed (estimated)

| Category | Count |
|----------|-------|
| Base components | 3 (button.tsx, card.tsx, page-header.tsx) |
| Pages to standardize | 10 |
| Internal components to clean | ~8 |
| Landing page components | ~4 |
| i18n files | 0 |

## Risk

Low. Most changes are removing overrides and letting base components do their job. The base component changes (button, card, page-header) cascade automatically. Visual regression risk is limited to hover effects and shadow changes.
