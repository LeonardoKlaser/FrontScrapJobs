# Hero Toast Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static image mockups in the hero section with coded floating toast notification components (Design 5).

**Architecture:** Single new component `HeroToastNotifications` in `ui-snippets/`, rendered inside the existing hero right column. The left column text/CTA remains untouched. Uses existing `slide-in-from-top` CSS animation with staggered delays.

**Tech Stack:** React, Tailwind CSS, existing CSS keyframes from `index.css`

---

### Task 1: Create the HeroToastNotifications component

**Files:**
- Create: `src/components/landingPage/ui-snippets/hero-toast-notifications.tsx`

- [ ] **Step 1: Create the component file with toast data and rendering**

```tsx
// src/components/landingPage/ui-snippets/hero-toast-notifications.tsx
import { Search } from 'lucide-react'

const TOAST_DATA = [
  {
    company: 'Nubank',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/1630b6e3-7956-4677-85e2-f92b34a01364.png',
    title: 'Senior Frontend Developer',
    location: 'Nubank · São Paulo · Remoto',
    time: 'agora',
    hasActions: true,
    top: 'top-0',
    left: 'left-[30px]',
    zIndex: 'z-[4]',
    opacity: 'opacity-100',
    borderClass: 'border-emerald-300',
    delay: '[animation-delay:0ms]',
  },
  {
    company: 'iFood',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/373e4794-7189-489a-8844-7df3273d2322.jpeg',
    title: 'Product Designer Pleno',
    location: 'iFood · Campinas · Híbrido',
    time: '1 min atrás',
    hasActions: false,
    top: 'top-[160px]',
    left: 'left-[60px]',
    zIndex: 'z-[3]',
    opacity: 'opacity-80',
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:200ms]',
  },
  {
    company: 'Mercado Livre',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/86f7f791-9cbd-4996-90ea-163429386d12.png',
    title: 'Data Engineer Senior',
    location: 'Mercado Livre · São Paulo',
    time: '3 min atrás',
    hasActions: false,
    top: 'top-[290px]',
    left: 'left-[20px]',
    zIndex: 'z-[2]',
    opacity: 'opacity-50',
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:400ms]',
  },
  {
    company: 'Itaú',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/aec1db60-75d9-4d6b-923d-fd87d0eaa1a5.png',
    title: 'Backend Engineer',
    location: 'Itaú · São Paulo',
    time: '5 min atrás',
    hasActions: false,
    top: 'top-[390px]',
    left: 'left-[50px]',
    zIndex: 'z-[1]',
    opacity: 'opacity-25',
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:600ms]',
  },
] as const

export function HeroToastNotifications() {
  return (
    <div
      className="relative w-[400px] h-[480px] mx-auto lg:mx-0 scale-75 md:scale-[0.85] lg:scale-100"
      aria-hidden="true"
      role="presentation"
    >
      {TOAST_DATA.map((toast) => (
        <div
          key={toast.company}
          className={`absolute w-[340px] bg-white border ${toast.borderClass} rounded-[14px] p-3.5 shadow-lg animate-slide-in-from-top ${toast.top} ${toast.left} ${toast.zIndex} ${toast.opacity} ${toast.delay}`}
        >
          {/* Toast header — ScrapJobs branding + timestamp */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-emerald-500">ScrapJobs</span>
            <span className="text-[10px] text-zinc-400 ml-auto">{toast.time}</span>
          </div>

          {/* Toast body — company logo + job info */}
          <div className="flex items-center gap-2.5">
            <img
              src={toast.logoUrl}
              alt={toast.company}
              className="w-9 h-9 rounded-lg object-cover"
            />
            <div>
              <p className="text-[13px] font-semibold text-zinc-900">
                Nova vaga: {toast.title}
              </p>
              <p className="text-[11px] text-zinc-500">{toast.location}</p>
            </div>
          </div>

          {/* Action buttons — only on first toast */}
          {toast.hasActions && (
            <div className="flex gap-1.5 mt-2.5">
              <span className="flex-1 py-1.5 rounded-md border border-emerald-500 bg-white text-emerald-600 text-[11px] font-semibold text-center">
                🤖 Analisar com IA
              </span>
              <span className="flex-1 py-1.5 rounded-md bg-emerald-500 text-white text-[11px] font-semibold text-center">
                ✓ Apliquei
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify the file was created**

Run: `ls -la src/components/landingPage/ui-snippets/hero-toast-notifications.tsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add src/components/landingPage/ui-snippets/hero-toast-notifications.tsx
git commit -m "feat(hero): add HeroToastNotifications component"
```

---

### Task 2: Update hero-section.tsx to use the new component

**Files:**
- Modify: `src/components/landingPage/hero-section.tsx`

- [ ] **Step 1: Replace the right column content**

Replace the entire right column (`{/* Right column — Mockup Composition */}` div) with the new toast component. Keep the glow orb and mockup disclaimer. The full updated file:

```tsx
// src/components/landingPage/hero-section.tsx
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'
import { HeroToastNotifications } from './ui-snippets/hero-toast-notifications'

export function HeroSection() {
  const { t } = useTranslation('landing')
  return (
    <SectionWrapper className="pt-20 lg:pt-12 pb-8 lg:pb-12 px-6 sm:px-8 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
          {/* Left column — Text */}
          <div className="lg:w-[420px] lg:shrink-0 space-y-8 text-center lg:text-left max-w-xl lg:max-w-none lg:pt-16">
            {/* Headline */}
            <h1 className="text-3xl min-[400px]:text-4xl lg:text-[56px] font-semibold leading-tight tracking-tight animate-fade-in-up text-balance text-zinc-900 [animation-delay:0ms]">
              {t('hero.heading1')}
              <br />
              <span className="text-gradient-primary">{t('hero.heading2')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-zinc-500 leading-relaxed animate-fade-in-up text-pretty max-w-[480px] mx-auto lg:mx-0 [animation-delay:100ms]">
              {t('hero.subheading')}
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up [animation-delay:200ms]">
              <Button
                variant="glow"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium rounded-lg animate-pulse-glow"
                onClick={() =>
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Micro-copy */}
              <p className="flex items-center justify-center lg:justify-start gap-2 text-sm text-zinc-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t('hero.microcopy')}
              </p>

              <p className="text-sm text-zinc-500 mt-3 text-center lg:text-left">
                {t('hero.loginPrompt')}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('hero.loginLink')}
                </Link>
              </p>
            </div>
          </div>

          {/* Right column — Toast Notifications */}
          <div className="flex-1 min-w-0 w-full lg:w-auto mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-[460px] lg:max-w-none lg:mr-[-40px] pt-8 lg:pt-16 pb-4">
              {/* Glow effect — large blurred emerald orb */}
              <div
                aria-hidden="true"
                className="absolute z-0 w-[700px] h-[700px] bg-emerald-400/10 rounded-full blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-pulse pointer-events-none"
              />

              <div className="relative z-10">
                <HeroToastNotifications />
              </div>
            </div>

            <p className="text-[0.7rem] text-zinc-400 italic text-center max-w-md mx-auto mt-4 lg:mt-6 px-4 leading-relaxed">
              {t('hero.mockupDisclaimer')}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
```

Key changes from the current file:
- Added import for `HeroToastNotifications`
- Replaced the dashboard `<img>` and phone `<img>` with `<HeroToastNotifications />`
- Simplified right column wrapper: `max-w-[460px]` instead of `max-w-[560px]`, `lg:mr-[-40px]` instead of `lg:mr-[-180px]`
- Wrapped toast in `relative z-10` div so it sits above the glow orb
- Removed the `lg:pb-4` duplicate

- [ ] **Step 2: Verify dev server compiles without errors**

Run: `cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs && npx vite build --mode development 2>&1 | tail -5`
Expected: build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/landingPage/hero-section.tsx
git commit -m "feat(hero): replace static mockups with toast notifications"
```

---

### Task 3: Visual verification across breakpoints

**Files:** None (visual QA only)

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs && npx vite --port 5173`
Open: `http://localhost:5173`

- [ ] **Step 2: Verify desktop layout (lg breakpoint, ≥1024px)**

Check:
- Left column text + CTA is unchanged
- Right column shows 4 toast cards in staggered diagonal layout
- Toast 1 (Nubank) has green border and action buttons
- Toasts fade progressively (100% → 80% → 50% → 25%)
- Company logos load from S3 URLs
- Glow orb pulses behind toasts
- Staggered slide-in animation plays on page load
- Mockup disclaimer text appears below toasts

- [ ] **Step 3: Verify tablet layout (md breakpoint, ~768px)**

Check:
- Toasts scale down to 85%
- No horizontal overflow
- Layout still readable

- [ ] **Step 4: Verify mobile layout (<768px)**

Check:
- Toasts scale to 75% and center
- No content overflows the viewport
- Left column stacks above right column
- CTA button is still accessible

- [ ] **Step 5: Fix any visual issues found**

If adjustments needed, update the component and commit:
```bash
git add -u
git commit -m "fix(hero): adjust toast notification responsive layout"
```
