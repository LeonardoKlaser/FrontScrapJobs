# Hero Section — Toast Notifications Design

## Goal

Replace the static image mockups (dashboard_mockup.png + analysis_mockup_cel.png) in the hero section's right column with coded toast notification components matching Design 5 from `original-5-designs.html`.

## Scope

- **In scope**: Hero section right column visual only
- **Out of scope**: Left column text/CTA (unchanged), other landing page sections, i18n additions

## Architecture

### Component Structure

```
hero-section.tsx
├── Left column (unchanged — headline, subheading, CTA, microcopy, login link)
└── Right column (REPLACE)
    ├── Glow orb (keep existing emerald blur background)
    └── HeroToastNotifications (NEW component)
        ├── Toast 1 — Nubank (full, with action buttons)
        ├── Toast 2 — iFood (compact, no actions)
        ├── Toast 3 — Mercado Livre (compact, faded)
        └── Toast 4 — Itaú (compact, most faded)
```

### New File

`src/components/landingPage/ui-snippets/hero-toast-notifications.tsx`

Follows existing pattern of `ui-snippets/` directory (see `radar-notifications.tsx`, `ats-analysis-card.tsx`).

### Toast Data

Hardcoded array in the component (not i18n — these are visual demo data):

| # | Company | Logo URL | Job Title | Location | Timestamp | Opacity | Actions |
|---|---------|----------|-----------|----------|-----------|---------|---------|
| 1 | Nubank | `scrapjobs-state-bucket.s3.amazonaws.com/logos/1630b6e3-7956-4677-85e2-f92b34a01364.png` | Senior Frontend Developer | Nubank · São Paulo · Remoto | agora | 1.0 | Yes (Analisar + Apliquei) |
| 2 | iFood | `scrapjobs-state-bucket.s3.amazonaws.com/logos/373e4794-7189-489a-8844-7df3273d2322.jpeg` | Product Designer Pleno | iFood · Campinas · Híbrido | 1 min atrás | 0.8 | No |
| 3 | Mercado Livre | `scrapjobs-state-bucket.s3.amazonaws.com/logos/86f7f791-9cbd-4996-90ea-163429386d12.png` | Data Engineer Senior | Mercado Livre · São Paulo | 3 min atrás | 0.5 | No |
| 4 | Itaú | `scrapjobs-state-bucket.s3.amazonaws.com/logos/aec1db60-75d9-4d6b-923d-fd87d0eaa1a5.png` | Backend Engineer | Itaú · São Paulo | 5 min atrás | 0.25 | No |

### Toast Anatomy

Each toast card:

```
┌──────────────────────────────────────┐
│ [ScrapJobs icon] ScrapJobs    agora  │  ← Header: app icon (gradient emerald→cyan, 28x28, rounded-lg) + brand name + timestamp
│                                      │
│ [Nu] Nova vaga: Senior Frontend Dev  │  ← Body: company logo (36x36 img from S3) + "Nova vaga: {title}" + "{company} · {location}"
│      Nubank · São Paulo · Remoto     │
│                                      │
│ [🤖 Analisar com IA] [✓ Apliquei]   │  ← Actions (toast 1 only): outline green button + filled green button
└──────────────────────────────────────┘
```

### Positioning

Container: `relative`, width ~400px, height ~480px.

Each toast is `absolute` positioned with staggered offsets:

| Toast | top | left | z-index | width |
|-------|-----|------|---------|-------|
| 1 | 0px | 30px | 4 | 340px |
| 2 | 160px | 60px | 3 | 340px |
| 3 | 290px | 20px | 2 | 340px |
| 4 | 390px | 50px | 1 | 340px |

### Styling

All Tailwind CSS. Key tokens:
- Card: `bg-white border border-zinc-200 rounded-[14px] p-3.5 shadow-lg`
- Toast 1 border: `border-emerald-300` (highlighted)
- App icon: `bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg` with magnifying glass SVG
- Company logo: `w-9 h-9 rounded-lg object-cover` — real logos loaded from S3 URLs
- Action buttons: existing project patterns (outline green + filled green, small size)

### Animations

Using existing project keyframes:

1. **Staggered slide-in**: CSS `@keyframes slideIn` (translateY(-8px) → 0 + opacity 0 → 1)
   - Toast 1: no delay
   - Toast 2: `[animation-delay:200ms]`
   - Toast 3: `[animation-delay:400ms]`
   - Toast 4: `[animation-delay:600ms]`
   - `animation-fill-mode: both` so toasts start invisible

2. **Glow orb**: Keep existing `animate-glow-pulse` on the emerald blur div

Add `slideIn` keyframe to `index.css` if not already present (check first — the HTML prototype defines it but the project may not have it).

### Responsive Behavior

- **Desktop (lg+)**: Side-by-side layout, toast container at full size, `lg:mr-[-40px]` for slight overflow effect
- **Tablet (md)**: Toasts scale down slightly via `scale-[0.85]`
- **Mobile (<md)**: Toasts centered, `scale-[0.75]`, container with `max-h-[360px] overflow-hidden` to prevent excessive height, `mx-auto`

### Changes to hero-section.tsx

1. Remove `<img>` for `dashboard_mockup.png`
2. Remove `<img>` for `analysis_mockup_cel.png` and its absolute-positioned wrapper
3. Remove associated scaling/positioning classes
4. Import and render `<HeroToastNotifications />` inside the glow container
5. Keep mockup disclaimer `<p>` below
6. Simplify the right column wrapper — no need for complex negative margins from the image approach

## Testing

- Visual verification: toasts render correctly at desktop, tablet, mobile breakpoints
- Animations: staggered entrance plays on page load
- No layout shift or overflow on mobile
- Existing i18n keys still work (left column unchanged)
