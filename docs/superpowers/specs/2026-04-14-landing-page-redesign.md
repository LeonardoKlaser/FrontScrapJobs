# Landing Page Redesign — Below Hero Section

**Date:** 2026-04-14
**Status:** Approved
**Goal:** Redesign the 4 sections below the hero to improve conversion (currently 0 conversions with 68 active users, 38s avg session).

---

## Scope

### New/Replaced Sections
| # | Section | Replaces | Status |
|---|---------|----------|--------|
| 1 | **ProblemSection** (A Dor) | ProblemPromiseSection | New component |
| 2 | **ValueFeaturesSection** (Killer Features Zig-Zag) | FeaturesSection + ProductVisualizationSection | New component (merges two) |
| 3 | **HowItWorksSection** (Fluxo 1 Minuto) | HowItWorksSection | Rewrite |
| 4 | **SocialProofSection** (Carrossel) | SocialProofSection | Edit title + reposition |

### Untouched Sections
StatsCounter, SavingsCalculator, Pricing, FAQ, CTAFinal, Footer — remain as-is.

### Files to Delete After Migration
- `src/components/landingPage/problem-promise.tsx`
- `src/components/landingPage/features-section.tsx`
- `src/components/landingPage/product-visualization-section.tsx`

---

## New Dependency

**Framer Motion** — install `framer-motion` for scroll-triggered animations (`whileInView`, `staggerChildren`, parallax on UI snippets). Replaces manual CSS `IntersectionObserver` patterns.

---

## Page Flow (Top → Bottom)

```
Hero (untouched)
  ↓
1. ProblemSection (A Dor) — dark bg, full-width
  ↓
2. ValueFeaturesSection (Zig-Zag) — white bg, 3 blocks alternating
  ↓
3. HowItWorksSection (Fluxo 1 Min) — white bg, 3 horizontal steps
  ↓
4. SocialProofSection (Carrossel) — new title, repositioned
  ↓
StatsCounter → SavingsCalculator → Pricing → FAQ → CTAFinal → Footer (untouched)
```

---

## Section 1: ProblemSection (A Dor)

### Purpose
Attack the user's pain before showing the solution. Emotional tension first, emerald release at the end.

### Visual Design
- **Background:** Dark (`#0a0a0b`)
- **Layout:** Full-width, vertically centered, ~80vh on desktop
- **Color logic:** Pain lives in monochrome (zinc scale). Emerald only appears at the transition line.
- **Animations:** `whileInView` fade-in-up on headline, staggered count-up on stats

### Copy (pt-BR)

**Overline:** `A realidade que ninguém fala` (monospace, `#71717a`, uppercase)

**Headline:**
```
Você envia.
A Gupy rejeita.
Repita 47 vezes.
```
- Line 1: `#fafafa` (white)
- Line 2: `#a1a1aa` (zinc-400)
- Line 3: `#52525b` (zinc-600, smaller font)

**Subtext:**
```
75% dos currículos são eliminados por robôs antes de um humano sequer os ver.
Você não é ruim — **o sistema é que está quebrado.**
```
- Body: `#a1a1aa`
- Bold phrase: `#fafafa` + `font-weight:600`

**Stats Row** (separated by `border-top: 1px solid #27272a`):
| Stat | Label |
|------|-------|
| **4.7h** | perdidas por semana em busca manual |
| **75%** | dos CVs eliminados pelo ATS |
| **3h** | é o tempo médio para uma vaga boa lotar |
- Numbers: `#fafafa`, Sora, font-weight:800, ~1.8rem
- Labels: `#71717a`, 0.7rem

**Transition Line:**
```
E se você chegasse primeiro?
```
- Color: `#10b981` (emerald), Sora, font-weight:600
- This is the emotional bridge from dark pain to bright features

### Responsive
- Mobile: stack stats vertically (1 column), reduce headline to `text-2xl`
- Padding: `py-20 px-6` mobile, `py-28 px-8` desktop

---

## Section 2: ValueFeaturesSection (Killer Features Zig-Zag)

### Purpose
Present the 3 killer features with persuasive copy + interactive UI snippets. Replace the old 2x2 features grid and product visualization.

### Visual Design
- **Background:** White (`#ffffff`)
- **Layout:** 3 blocks, alternating text/UI sides (zig-zag pattern):
  - Block 1: Text LEFT, UI RIGHT
  - Block 2: UI LEFT, Text RIGHT
  - Block 3: Text LEFT, UI RIGHT
- **Grid:** `grid-cols-2` with `gap-12` on desktop, stack on mobile
- **UI Snippet cards:** Green gradient background (`linear-gradient(160deg, #ecfdf5, #f0fdf4, #ffffff)`), border `#a7f3d0`, `box-shadow: 0 8px 32px rgba(16,185,129,0.08)`
- **Animations:** Each block fades in with `whileInView`. UI snippets have subtle float or parallax on scroll.

### Block 1: O Radar (Scraping + Alerts)

**Overline:** `Monitoramento Direto` (monospace, emerald, uppercase)

**Headline:**
```
Vagas direto da fonte.
Antes de chegar na Gupy.  ← gradient text (emerald→cyan)
```

**Body:**
```
Enquanto todo mundo briga por vagas recicladas no LinkedIn, o ScrapJobs monitora
diretamente o site de carreiras das empresas que você escolheu. Sem intermediários.
Sem filtros de terceiros.

A vaga apareceu no site da Nubank às 9h. **Às 9h01 você já sabia.**
Quem depende da Gupy só vai ver amanhã.
```

**UI Snippet:** Stack of 3 notification cards
- Card 1 (highlighted): Green gradient bg, bell icon, "Senior Frontend Developer" — `Nubank · careers.nubank.com · há 1 min` — badge "NOVO"
- Card 2 (neutral): `#f9fafb` bg, "Product Designer Pleno" — `iFood · carreiras.ifood.com.br · há 12 min` — badge "98% match"
- Card 3 (faded, opacity 0.5): "Data Engineer Senior" — `Mercado Livre · carreiras.mercadolivre.com · há 38 min`
- Bottom badge: Shield icon + "Direto do site oficial da empresa — sem intermediários"

**CRITICAL:** Sources always show company career page URLs (careers.nubank.com, etc.), NEVER third-party platforms (Gupy, Greenhouse, LinkedIn). ScrapJobs monitors company sites directly.

### Block 2: A Análise ATS

**Overline:** `Análise com IA` (monospace, emerald, uppercase)

**Headline:**
```
Descubra por que você
está sendo rejeitado.  ← gradient text
```

**Body:**
```
Faça upload do seu currículo atual. Em segundos, a IA cruza o seu perfil com a vaga
e entrega um diagnóstico completo: score ATS, keywords que faltam e gaps que estão
a sabotar as suas candidaturas.

Chega de adivinhar. **Agora você sabe exatamente o que corrigir.**
```

**UI Snippet:** ATS analysis card with green gradient bg
- Score header: "Compatibilidade ATS" label + large "92%" number + circular progress (conic-gradient)
- Progress bar: `linear-gradient(90deg, #10b981, #06b6d4)` at 92%
- Keywords found: Green tags (React, TypeScript, CI/CD, Agile) — bg `#d1fae5`, text `#065f46`
- Gaps identified: Yellow/amber dashed tags (GraphQL, AWS) — bg `#fef3c7`, text `#92400e`, border dashed `#fbbf24`

### Block 3: A Vantagem Injusta (PDF Generation)

**Overline:** `Geração Inteligente` (monospace, emerald, uppercase)

**Headline:**
```
Um currículo perfeito
para cada vaga. Sem esforço.  ← gradient text
```

**Body:**
```
A IA pega nos gaps, sugere as palavras-chave certas e reconstrói as suas frases para
passar no filtro ATS. Você escolhe o que aplicar e baixa o PDF — pronto para enviar.

Sem reescrever nada do zero. **Um clique entre você e a candidatura perfeita.**
```

**UI Snippet:** Document preview card with green gradient bg
- Header: Document icon (emerald→cyan gradient bg) + "CV_Otimizado_Nubank.pdf" + "Pronto para download" in emerald
- Checklist of applied suggestions (3 items with green checkmarks):
  - "Adicionado 'GraphQL' na experiência"
  - "Reescrito 'Resumo Profissional'"
  - "Adicionado métricas de impacto"
- CTA button: Full-width "↓ Baixar CV Otimizado" — `linear-gradient(135deg, #10b981, #059669)`, white text, glow shadow

### Responsive (all blocks)
- Mobile: stack to single column (`grid-cols-1`), text always on top, UI below
- Reduce headline to `text-xl`, body to `text-sm`
- UI snippets take full width with `max-w-sm mx-auto`

---

## Section 3: HowItWorksSection (Fluxo 1 Minuto)

### Purpose
Prove the "Aha! Moment" — zero to perfect application in 3 ultra-fast steps.

### Visual Design
- **Background:** White (`#ffffff`)
- **Layout:** Centered header + 3 horizontal steps with arrow connectors + CTA
- **Connectors:** Gradient lines (`#a7f3d0 → #10b981`, then `#10b981 → #06b6d4`) with arrow SVG tips
- **Step icon progression:** Each step's icon container gets progressively more saturated:
  - Step 1: `linear-gradient(#ecfdf5, #d1fae5)` — lightest
  - Step 2: `linear-gradient(#d1fae5, #a7f3d0)` — medium
  - Step 3: `linear-gradient(#10b981, #06b6d4)` — full solid (destination)
- **Animations:** Steps stagger in with `whileInView` + `staggerChildren`. Connectors draw themselves (line grows from left to right).

### Copy

**Overline:** `Como funciona` (monospace, emerald, uppercase)

**Headline:**
```
Do zero à candidatura perfeita.
Em menos de 1 minuto.  ← gradient text
```

**Steps:**
| # | Title | Description | Icon |
|---|-------|-------------|------|
| 01 | Importe seu CV | Upload do PDF atual. Preenchimento automático dos dados. | FileText |
| 02 | A IA analisa a vaga | Score ATS, keywords e gaps identificados em segundos. | PenLine |
| 03 | Exporte e aplique | Baixe o CV otimizado e candidate-se antes de todos. | Download |

**CTA Button:** "Começar agora →" — links to pricing section. Same glow style as hero CTA.

### Responsive
- Mobile: Stack steps vertically, connectors become vertical dashed lines
- Step numbers remain visible, icons shrink to 40px

---

## Section 4: SocialProofSection (Edit)

### Changes
1. **New title:** "Monitoramos as empresas que você ama."
2. **New subtitle:** "Adicionamos novas empresas toda semana. Não encontrou a sua? Nos diga."
3. **Position:** Moved to after HowItWorksSection (currently after FeaturesSection)
4. **Carousel:** Keep existing infinite scroll logo carousel unchanged

### i18n Keys
Add new keys to `landing.json` for the title and subtitle (both pt-BR and en-US).

---

## Translation Strategy

- **Primary language:** pt-BR (write copy first)
- **Secondary:** en-US (translate after pt-BR is finalized)
- All text in `src/i18n/locales/{pt-BR,en-US}/landing.json`
- New i18n namespace keys follow existing patterns (e.g., `problem.heading`, `features.radar.title`)

---

## Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#ffffff` | Page background (light mode forced) |
| Foreground | `#18181b` | Primary text |
| Primary | `#10b981` | Emerald accents, CTAs, icons |
| Accent bg | `#ecfdf5` | Light emerald backgrounds |
| Card | `#f9fafb` | Neutral card backgrounds |
| Card green gradient | `linear-gradient(160deg, #ecfdf5, #f0fdf4, #ffffff)` | UI snippet card backgrounds |
| Border | `#e4e4e7` | Neutral borders |
| Border green | `#a7f3d0` | Green card borders |
| Text gradient | `linear-gradient(135deg, #10b981, #06b6d4)` | Headline gradient (emerald→cyan) |
| Muted text | `#71717a` | Secondary body text |
| Dark bg | `#0a0a0b` | ProblemSection background |
| Dark border | `#27272a` | ProblemSection dividers |
| Glow shadow | `0 0 20px rgba(16,185,129,0.25)` | CTA buttons |
| Card shadow | `0 8px 32px rgba(16,185,129,0.08)` | UI snippet cards |
| Font display | Sora | Headings |
| Font body | Inter | Body text |
| Font mono | JetBrains Mono | Overlines, labels |

---

## CTA Strategy

All CTAs across the new sections point to the **pricing section** (`#pricing` anchor scroll).
- ProblemSection: No explicit CTA (the emerald transition line is the hook)
- ValueFeaturesSection: No explicit CTA per block (the zig-zag flow naturally leads to the next section)
- HowItWorksSection: "Começar agora →" button → scrolls to `#pricing`

---

## Component Architecture

```
src/components/landingPage/
├── problem-section.tsx          (NEW — replaces problem-promise.tsx)
├── value-features-section.tsx   (NEW — replaces features-section.tsx + product-visualization-section.tsx)
├── how-it-works-section.tsx     (REWRITE)
├── social-proof-section.tsx     (EDIT — new title + subtitle)
├── ui-snippets/                 (NEW directory for UI snippet sub-components)
│   ├── radar-notifications.tsx  (Block 1 notification cards)
│   ├── ats-analysis-card.tsx    (Block 2 score/keywords card)
│   └── pdf-preview-card.tsx     (Block 3 document preview)
└── ...existing files
```

### Why separate UI snippet components?
Each UI snippet is complex enough (~80-120 lines) to warrant its own file. This keeps the parent `value-features-section.tsx` focused on layout and copy, while snippets handle their own animations and internal state.

---

## Landing.tsx Section Order Update

```tsx
<Navbar />
<HeroSection />
<ProblemSection />           {/* NEW */}
<ValueFeaturesSection />     {/* NEW */}
<HowItWorksSection />        {/* REWRITTEN */}
<SocialProofSection />       {/* EDITED — moved here */}
<StatsCounterSection />
<SavingsCalculatorSection />
<PricingSection />
<FaqSection />
<CtaFinalSection />
<Footer />
```

---

## Animations Summary

| Element | Animation | Trigger |
|---------|-----------|---------|
| ProblemSection headline | fade-in-up | whileInView |
| ProblemSection stats | count-up (staggered) | whileInView |
| ProblemSection transition line | fade-in + slight scale | whileInView, delayed |
| Zig-zag blocks (text side) | fade-in-up | whileInView per block |
| Zig-zag blocks (UI side) | slide-in from side + subtle float | whileInView per block |
| UI snippet notification cards | stagger fade-in (100ms delay each) | whileInView |
| ATS score number | count-up from 0 to 92 | whileInView |
| ATS progress bar | width grows from 0% to 92% | whileInView |
| HowItWorks steps | stagger fade-in-up | whileInView |
| HowItWorks connectors | line draws left-to-right | whileInView, after steps |
| HowItWorks CTA | fade-in-up, delayed | whileInView |

All animations use Framer Motion's `whileInView` with `viewport={{ once: true, amount: 0.3 }}` to trigger once when 30% visible.

---

## Accessibility

- All UI snippets are decorative (`aria-hidden="true"`, `role="presentation"`)
- Stats use `aria-label` for screen readers (e.g., "4.7 horas perdidas por semana")
- Heading hierarchy: h2 for section titles, h3 for feature block titles
- Color contrast: All text meets WCAG AA on their respective backgrounds
- Motion: Respect `prefers-reduced-motion` — disable Framer Motion animations
