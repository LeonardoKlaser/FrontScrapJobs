# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use the `frontend-design` skill for all component implementation tasks (Tasks 3-8).

**Goal:** Redesign the 4 sections below the hero to improve conversion — new ProblemSection, ValueFeaturesSection (zig-zag with UI snippets), rewritten HowItWorksSection, and repositioned SocialProofSection.

**Architecture:** Replace 3 old components (problem-promise, features-section, product-visualization-section) with 2 new ones (problem-section, value-features-section) + 3 UI snippet sub-components. Rewrite how-it-works-section. Edit social-proof-section. Update Landing.tsx section order and i18n files. All scroll animations use Framer Motion `whileInView`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion (new), i18next, Lucide icons, Sora/Inter fonts.

**Spec:** `docs/superpowers/specs/2026-04-14-landing-page-redesign.md`

---

## File Structure

```
src/components/landingPage/
├── problem-section.tsx            (NEW — dark bg, provocative copy, stats, transition line)
├── value-features-section.tsx     (NEW — zig-zag layout orchestrating 3 UI snippets)
├── how-it-works-section.tsx       (REWRITE — 3 horizontal steps with connectors + CTA)
├── social-proof-section.tsx       (EDIT — add title + subtitle)
├── ui-snippets/                   (NEW directory)
│   ├── radar-notifications.tsx    (notification card stack for Block 1)
│   ├── ats-analysis-card.tsx      (score/keywords/gaps card for Block 2)
│   └── pdf-preview-card.tsx       (document preview + checklist for Block 3)
└── ...existing (untouched)

src/pages/Landing.tsx              (MODIFY — new imports, new section order)
src/i18n/locales/pt-BR/landing.json (MODIFY — new keys for all sections)
src/i18n/locales/en-US/landing.json (MODIFY — translated keys)
```

**Files to delete (final task):**
- `src/components/landingPage/problem-promise.tsx`
- `src/components/landingPage/features-section.tsx`
- `src/components/landingPage/product-visualization-section.tsx`

---

### Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install framer-motion**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm install framer-motion
```

Expected: Package installed, `package.json` updated with `framer-motion` in dependencies.

- [ ] **Step 2: Verify install**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
node -e "require('framer-motion'); console.log('OK')"
```

Expected: `OK` printed.

- [ ] **Step 3: Verify build still passes**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add package.json package-lock.json
git commit -m "chore: install framer-motion for landing page animations"
```

---

### Task 2: Add i18n keys for all new sections

**Files:**
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

- [ ] **Step 1: Add pt-BR keys**

Add the following new keys to `src/i18n/locales/pt-BR/landing.json`. These go alongside the existing keys — do NOT remove existing keys yet (old components still reference them until final cleanup).

Add these new top-level sections to the JSON:

```json
"problemSection": {
  "overline": "A realidade que ninguém fala",
  "headline1": "Você envia.",
  "headline2": "A Gupy rejeita.",
  "headline3": "Repita 47 vezes.",
  "subtext": "75% dos currículos são eliminados por robôs antes de um humano sequer os ver. Você não é ruim —",
  "subtextBold": "o sistema é que está quebrado.",
  "stat1Value": "4.7h",
  "stat1Label": "perdidas por semana em busca manual",
  "stat2Value": "75%",
  "stat2Label": "dos CVs eliminados pelo ATS",
  "stat3Value": "3h",
  "stat3Label": "é o tempo médio para uma vaga boa lotar",
  "transition": "E se você chegasse primeiro?"
},
"valueFeatures": {
  "radar": {
    "overline": "Monitoramento Direto",
    "headline": "Vagas direto da fonte.",
    "headlineGradient": "Antes de chegar na Gupy.",
    "body1": "Enquanto todo mundo briga por vagas recicladas no LinkedIn, o ScrapJobs monitora diretamente o site de carreiras das empresas que você escolheu. Sem intermediários. Sem filtros de terceiros.",
    "body2": "A vaga apareceu no site da Nubank às 9h.",
    "body2Bold": "Às 9h01 você já sabia.",
    "body2End": "Quem depende da Gupy só vai ver amanhã.",
    "sourceBadge": "Direto do site oficial da empresa — sem intermediários"
  },
  "ats": {
    "overline": "Análise com IA",
    "headline": "Descubra por que você",
    "headlineGradient": "está sendo rejeitado.",
    "body1": "Faça upload do seu currículo atual. Em segundos, a IA cruza o seu perfil com a vaga e entrega um diagnóstico completo: score ATS, keywords que faltam e gaps que estão a sabotar as suas candidaturas.",
    "body2": "Chega de adivinhar.",
    "body2Bold": "Agora você sabe exatamente o que corrigir.",
    "scoreLabel": "Compatibilidade ATS",
    "keywordsLabel": "Keywords encontradas",
    "gapsLabel": "Gaps identificados"
  },
  "pdf": {
    "overline": "Geração Inteligente",
    "headline": "Um currículo perfeito",
    "headlineGradient": "para cada vaga. Sem esforço.",
    "body1": "A IA pega nos gaps, sugere as palavras-chave certas e reconstrói as suas frases para passar no filtro ATS. Você escolhe o que aplicar e baixa o PDF — pronto para enviar.",
    "body2": "Sem reescrever nada do zero.",
    "body2Bold": "Um clique entre você e a candidatura perfeita.",
    "fileName": "CV_Otimizado_Nubank.pdf",
    "fileReady": "Pronto para download",
    "suggestionsLabel": "Sugestões aplicadas",
    "suggestion1": "Adicionado \"GraphQL\" na experiência",
    "suggestion2": "Reescrito \"Resumo Profissional\"",
    "suggestion3": "Adicionado métricas de impacto",
    "downloadButton": "↓ Baixar CV Otimizado"
  }
},
"howItWorksNew": {
  "overline": "Como funciona",
  "headline": "Do zero à candidatura perfeita.",
  "headlineGradient": "Em menos de 1 minuto.",
  "step1Title": "Importe seu CV",
  "step1Description": "Upload do PDF atual. Preenchimento automático dos dados.",
  "step2Title": "A IA analisa a vaga",
  "step2Description": "Score ATS, keywords e gaps identificados em segundos.",
  "step3Title": "Exporte e aplique",
  "step3Description": "Baixe o CV otimizado e candidate-se antes de todos.",
  "cta": "Começar agora →"
},
"socialProofNew": {
  "title": "Monitoramos as empresas que você ama.",
  "subtitle": "Adicionamos novas empresas toda semana. Não encontrou a sua? Nos diga."
}
```

- [ ] **Step 2: Add en-US keys**

Add the equivalent English keys to `src/i18n/locales/en-US/landing.json`:

```json
"problemSection": {
  "overline": "The reality no one talks about",
  "headline1": "You send.",
  "headline2": "Gupy rejects.",
  "headline3": "Repeat 47 times.",
  "subtext": "75% of resumes are eliminated by bots before a human even sees them. You're not bad —",
  "subtextBold": "the system is broken.",
  "stat1Value": "4.7h",
  "stat1Label": "wasted per week on manual searching",
  "stat2Value": "75%",
  "stat2Label": "of CVs eliminated by ATS",
  "stat3Value": "3h",
  "stat3Label": "average time for a good job to fill up",
  "transition": "What if you got there first?"
},
"valueFeatures": {
  "radar": {
    "overline": "Direct Monitoring",
    "headline": "Jobs straight from the source.",
    "headlineGradient": "Before they hit Gupy.",
    "body1": "While everyone fights over recycled listings on LinkedIn, ScrapJobs monitors the career sites of the companies you chose directly. No middlemen. No third-party filters.",
    "body2": "The job appeared on Nubank's site at 9am.",
    "body2Bold": "At 9:01am you already knew.",
    "body2End": "Those relying on Gupy won't see it until tomorrow.",
    "sourceBadge": "Straight from the official company site — no middlemen"
  },
  "ats": {
    "overline": "AI Analysis",
    "headline": "Find out why you're",
    "headlineGradient": "being rejected.",
    "body1": "Upload your current resume. In seconds, our AI cross-references your profile with the job and delivers a complete diagnosis: ATS score, missing keywords, and gaps that are sabotaging your applications.",
    "body2": "Stop guessing.",
    "body2Bold": "Now you know exactly what to fix.",
    "scoreLabel": "ATS Compatibility",
    "keywordsLabel": "Keywords found",
    "gapsLabel": "Gaps identified"
  },
  "pdf": {
    "overline": "Smart Generation",
    "headline": "A perfect resume",
    "headlineGradient": "for every job. Effortlessly.",
    "body1": "The AI takes the gaps, suggests the right keywords, and rebuilds your sentences to pass the ATS filter. You choose what to apply and download the PDF — ready to send.",
    "body2": "No rewriting from scratch.",
    "body2Bold": "One click between you and the perfect application.",
    "fileName": "CV_Optimized_Nubank.pdf",
    "fileReady": "Ready for download",
    "suggestionsLabel": "Suggestions applied",
    "suggestion1": "Added \"GraphQL\" to experience",
    "suggestion2": "Rewritten \"Professional Summary\"",
    "suggestion3": "Added impact metrics",
    "downloadButton": "↓ Download Optimized CV"
  }
},
"howItWorksNew": {
  "overline": "How it works",
  "headline": "From zero to perfect application.",
  "headlineGradient": "In less than 1 minute.",
  "step1Title": "Import your CV",
  "step1Description": "Upload your current PDF. Auto-fill your data.",
  "step2Title": "AI analyzes the job",
  "step2Description": "ATS score, keywords and gaps identified in seconds.",
  "step3Title": "Export and apply",
  "step3Description": "Download the optimized CV and apply before everyone else.",
  "cta": "Get started now →"
},
"socialProofNew": {
  "title": "We monitor the companies you love.",
  "subtitle": "We add new companies every week. Didn't find yours? Tell us."
}
```

- [ ] **Step 3: Verify JSON is valid**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/pt-BR/landing.json','utf8')); console.log('pt-BR OK')"
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en-US/landing.json','utf8')); console.log('en-US OK')"
```

Expected: Both print OK.

- [ ] **Step 4: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(i18n): add translation keys for landing page redesign"
```

---

### Task 3: Create ProblemSection component

> **Use `frontend-design` skill for this task.**

**Files:**
- Create: `src/components/landingPage/problem-section.tsx`

**Spec reference:** Section 1 in `docs/superpowers/specs/2026-04-14-landing-page-redesign.md`

- [ ] **Step 1: Create the ProblemSection component**

Create `src/components/landingPage/problem-section.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { SectionWrapper } from './section-wrapper'

function CountUp({ target, duration = 2 }: { target: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  const isPercentage = target.endsWith('%')
  const isHours = target.endsWith('h')
  const numericValue = parseFloat(target)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      const current = numericValue * eased

      if (isPercentage) {
        setDisplay(`${Math.round(current)}%`)
      } else if (isHours) {
        setDisplay(`${current.toFixed(1)}h`)
      } else {
        setDisplay(`${Math.round(current)}`)
      }

      if (elapsed < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, numericValue, duration, isPercentage, isHours])

  return <span ref={ref}>{display}</span>
}

export function ProblemSection() {
  const { t } = useTranslation('landing')

  const stats = [
    { value: t('problemSection.stat1Value'), label: t('problemSection.stat1Label'), ariaLabel: '4.7 horas perdidas por semana' },
    { value: t('problemSection.stat2Value'), label: t('problemSection.stat2Label'), ariaLabel: '75 por cento dos CVs eliminados' },
    { value: t('problemSection.stat3Value'), label: t('problemSection.stat3Label'), ariaLabel: '3 horas para uma vaga lotar' },
  ]

  return (
    <SectionWrapper variant="dark">
      <div className="py-20 px-6 lg:py-28 lg:px-8 min-h-[80vh] flex items-center">
        <div className="max-w-3xl mx-auto lg:mx-0 lg:ml-16">
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs tracking-[0.15em] uppercase text-zinc-500 mb-6"
          >
            {t('problemSection.overline')}
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display font-extrabold leading-[1.15] mb-6"
          >
            <span className="text-2xl lg:text-[2.75rem] text-white block">
              {t('problemSection.headline1')}
            </span>
            <span className="text-2xl lg:text-[2.75rem] text-zinc-400 block">
              {t('problemSection.headline2')}
            </span>
            <span className="text-xl lg:text-[2rem] text-zinc-600 block">
              {t('problemSection.headline3')}
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-zinc-400 text-[0.95rem] leading-[1.7] max-w-lg"
          >
            {t('problemSection.subtext')}{' '}
            <span className="text-white font-semibold">{t('problemSection.subtextBold')}</span>
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-8 mt-8 pt-6 border-t border-zinc-800"
          >
            {stats.map((stat) => (
              <div key={stat.label} aria-label={stat.ariaLabel}>
                <span className="text-white font-display font-extrabold text-3xl block">
                  <CountUp target={stat.value} />
                </span>
                <p className="text-zinc-500 text-[0.7rem] mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Transition Line */}
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-emerald-500 font-display font-semibold text-lg mt-8"
          >
            {t('problemSection.transition')}
          </motion.p>
        </div>
      </div>
    </SectionWrapper>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to `problem-section.tsx`.

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/problem-section.tsx
git commit -m "feat: add ProblemSection component (dark bg, provocative copy, animated stats)"
```

---

### Task 4: Create UI snippet — RadarNotifications

> **Use `frontend-design` skill for this task.**

**Files:**
- Create: `src/components/landingPage/ui-snippets/radar-notifications.tsx`

**Spec reference:** Section 2, Block 1 UI Snippet in spec.

- [ ] **Step 1: Create the ui-snippets directory and RadarNotifications component**

Create `src/components/landingPage/ui-snippets/radar-notifications.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Bell, Shield } from 'lucide-react'

const notifications = [
  {
    title: 'Senior Frontend Developer',
    company: 'Nubank',
    source: 'careers.nubank.com',
    time: 'há 1 min',
    timeEn: '1 min ago',
    badge: 'new' as const,
    highlighted: true,
  },
  {
    title: 'Product Designer Pleno',
    company: 'iFood',
    source: 'carreiras.ifood.com.br',
    time: 'há 12 min',
    timeEn: '12 min ago',
    badge: 'match' as const,
    highlighted: false,
  },
  {
    title: 'Data Engineer Senior',
    company: 'Mercado Livre',
    source: 'carreiras.mercadolivre.com',
    time: 'há 38 min',
    timeEn: '38 min ago',
    badge: null,
    highlighted: false,
  },
]

export function RadarNotifications() {
  const { t, i18n } = useTranslation('landing')
  const isPtBR = i18n.language.startsWith('pt')

  return (
    <div className="flex flex-col gap-3" aria-hidden="true" role="presentation">
      {notifications.map((n, i) => (
        <motion.div
          key={n.company}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className={`rounded-xl p-4 flex items-center gap-3 border ${
            n.highlighted
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 shadow-[0_4px_16px_rgba(16,185,129,0.1)]'
              : 'bg-zinc-50 border-zinc-200'
          } ${i === 2 ? 'opacity-50' : ''}`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              n.highlighted ? 'bg-emerald-500' : 'bg-zinc-200'
            }`}
          >
            <Bell className={`w-[18px] h-[18px] ${n.highlighted ? 'text-white' : 'text-zinc-500'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${i === 2 ? 'text-zinc-400' : 'text-zinc-900'}`}>
              {n.title}
            </p>
            <p className={`text-xs ${i === 2 ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {n.company} · <span className={n.highlighted ? 'text-emerald-500 font-semibold' : ''}>{n.source}</span> · {isPtBR ? n.time : n.timeEn}
            </p>
          </div>

          {n.badge === 'new' && (
            <span className="bg-emerald-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full">
              NOVO
            </span>
          )}
          {n.badge === 'match' && (
            <span className="bg-zinc-100 text-zinc-500 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full">
              98% match
            </span>
          )}
        </motion.div>
      ))}

      {/* Source badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-lg"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[0.7rem] text-emerald-800 font-semibold">
          {t('valueFeatures.radar.sourceBadge')}
        </span>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/ui-snippets/radar-notifications.tsx
git commit -m "feat: add RadarNotifications UI snippet (notification card stack)"
```

---

### Task 5: Create UI snippet — AtsAnalysisCard

> **Use `frontend-design` skill for this task.**

**Files:**
- Create: `src/components/landingPage/ui-snippets/ats-analysis-card.tsx`

**Spec reference:** Section 2, Block 2 UI Snippet in spec.

- [ ] **Step 1: Create AtsAnalysisCard component**

Create `src/components/landingPage/ui-snippets/ats-analysis-card.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Check } from 'lucide-react'

function AnimatedScore({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1500
    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setValue(Math.round(target * eased))
      if (elapsed < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, target])

  return <>{value}</>
}

function AnimatedProgressBar({ width, inView }: { width: number; inView: boolean }) {
  return (
    <div className="bg-zinc-200 rounded-full h-1.5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${width}%` } : { width: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
      />
    </div>
  )
}

const keywords = ['React', 'TypeScript', 'CI/CD', 'Agile']
const gaps = ['GraphQL', 'AWS']

export function AtsAnalysisCard() {
  const { t } = useTranslation('landing')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const score = 92
  const degrees = Math.round((score / 100) * 360)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Score header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[0.7rem] text-zinc-500 uppercase tracking-wider">
            {t('valueFeatures.ats.scoreLabel')}
          </p>
          <p className="text-[2rem] font-extrabold font-display text-zinc-900 leading-none mt-1">
            <AnimatedScore target={score} inView={isInView} />
            <span className="text-base text-emerald-500">%</span>
          </p>
        </div>
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
          style={{
            background: isInView
              ? `conic-gradient(#10b981 0deg ${degrees}deg, #e4e4e7 ${degrees}deg 360deg)`
              : '#e4e4e7',
            transition: 'background 1.5s ease-out',
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Check className="w-[18px] h-[18px] text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <AnimatedProgressBar width={score} inView={isInView} />

      {/* Keywords */}
      <div className="mt-5">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.ats.keywordsLabel')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="bg-emerald-100 text-emerald-800 text-[0.65rem] px-2 py-0.5 rounded-md font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="mt-4">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.ats.gapsLabel')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {gaps.map((g) => (
            <span
              key={g}
              className="bg-amber-50 text-amber-800 text-[0.65rem] px-2 py-0.5 rounded-md font-medium border border-dashed border-amber-400"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/ui-snippets/ats-analysis-card.tsx
git commit -m "feat: add AtsAnalysisCard UI snippet (score, progress, keywords, gaps)"
```

---

### Task 6: Create UI snippet — PdfPreviewCard

> **Use `frontend-design` skill for this task.**

**Files:**
- Create: `src/components/landingPage/ui-snippets/pdf-preview-card.tsx`

**Spec reference:** Section 2, Block 3 UI Snippet in spec.

- [ ] **Step 1: Create PdfPreviewCard component**

Create `src/components/landingPage/ui-snippets/pdf-preview-card.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Check } from 'lucide-react'

export function PdfPreviewCard() {
  const { t } = useTranslation('landing')

  const suggestions = [
    t('valueFeatures.pdf.suggestion1'),
    t('valueFeatures.pdf.suggestion2'),
    t('valueFeatures.pdf.suggestion3'),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 border border-emerald-300 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)' }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Document header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-200">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
        >
          <FileText className="w-[18px] h-[18px] text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{t('valueFeatures.pdf.fileName')}</p>
          <p className="text-[0.65rem] text-emerald-500 font-semibold">{t('valueFeatures.pdf.fileReady')}</p>
        </div>
      </div>

      {/* Suggestions checklist */}
      <div className="mb-4">
        <p className="text-[0.7rem] font-semibold text-zinc-900 mb-2">
          {t('valueFeatures.pdf.suggestionsLabel')}
        </p>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[0.7rem] text-zinc-900">{s}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA button */}
      <button
        className="w-full text-white border-0 rounded-xl py-3 text-sm font-bold font-display cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        tabIndex={-1}
      >
        {t('valueFeatures.pdf.downloadButton')}
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/ui-snippets/pdf-preview-card.tsx
git commit -m "feat: add PdfPreviewCard UI snippet (document preview with checklist)"
```

---

### Task 7: Create ValueFeaturesSection (Zig-Zag layout)

> **Use `frontend-design` skill for this task.**

**Files:**
- Create: `src/components/landingPage/value-features-section.tsx`

**Spec reference:** Section 2 in spec — zig-zag layout orchestrating 3 blocks.

- [ ] **Step 1: Create the ValueFeaturesSection component**

Create `src/components/landingPage/value-features-section.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SectionWrapper } from './section-wrapper'
import { RadarNotifications } from './ui-snippets/radar-notifications'
import { AtsAnalysisCard } from './ui-snippets/ats-analysis-card'
import { PdfPreviewCard } from './ui-snippets/pdf-preview-card'

interface FeatureBlockProps {
  overline: string
  headline: string
  headlineGradient: string
  body: React.ReactNode
  snippet: React.ReactNode
  reverse?: boolean
}

function FeatureBlock({ overline, headline, headlineGradient, body, snippet, reverse }: FeatureBlockProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20 ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className={reverse ? 'lg:[direction:ltr]' : ''}
      >
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 font-semibold">
          {overline}
        </span>
        <h3 className="font-display text-xl lg:text-[1.8rem] font-extrabold text-zinc-900 leading-[1.2] mt-3">
          {headline}
          <br />
          <span className="text-gradient-primary">{headlineGradient}</span>
        </h3>
        <div className="mt-4 space-y-3">{body}</div>
      </motion.div>

      {/* UI snippet side */}
      <div className={`max-w-sm mx-auto lg:max-w-none ${reverse ? 'lg:[direction:ltr]' : ''}`}>
        {snippet}
      </div>
    </div>
  )
}

export function ValueFeaturesSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="features">
      <div className="px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Block 1: O Radar — Text LEFT, UI RIGHT */}
          <FeatureBlock
            overline={t('valueFeatures.radar.overline')}
            headline={t('valueFeatures.radar.headline')}
            headlineGradient={t('valueFeatures.radar.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.radar.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.radar.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">{t('valueFeatures.radar.body2Bold')}</span>{' '}
                  {t('valueFeatures.radar.body2End')}
                </p>
              </>
            }
            snippet={<RadarNotifications />}
          />

          {/* Block 2: A Análise ATS — UI LEFT, Text RIGHT */}
          <FeatureBlock
            reverse
            overline={t('valueFeatures.ats.overline')}
            headline={t('valueFeatures.ats.headline')}
            headlineGradient={t('valueFeatures.ats.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.ats.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.ats.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">{t('valueFeatures.ats.body2Bold')}</span>
                </p>
              </>
            }
            snippet={<AtsAnalysisCard />}
          />

          {/* Block 3: A Vantagem Injusta — Text LEFT, UI RIGHT */}
          <FeatureBlock
            overline={t('valueFeatures.pdf.overline')}
            headline={t('valueFeatures.pdf.headline')}
            headlineGradient={t('valueFeatures.pdf.headlineGradient')}
            body={
              <>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.pdf.body1')}
                </p>
                <p className="text-zinc-500 text-[0.95rem] leading-[1.7]">
                  {t('valueFeatures.pdf.body2')}{' '}
                  <span className="text-zinc-900 font-semibold">{t('valueFeatures.pdf.body2Bold')}</span>
                </p>
              </>
            }
            snippet={<PdfPreviewCard />}
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/value-features-section.tsx
git commit -m "feat: add ValueFeaturesSection with zig-zag layout and UI snippets"
```

---

### Task 8: Rewrite HowItWorksSection

> **Use `frontend-design` skill for this task.**

**Files:**
- Modify: `src/components/landingPage/how-it-works-section.tsx`

**Spec reference:** Section 3 in spec — 3 horizontal steps with connectors + CTA.

- [ ] **Step 1: Rewrite how-it-works-section.tsx**

Replace the entire contents of `src/components/landingPage/how-it-works-section.tsx` with:

```tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, PenLine, Download } from 'lucide-react'
import { SectionWrapper } from './section-wrapper'

const steps = [
  {
    number: '01',
    icon: FileText,
    titleKey: 'howItWorksNew.step1Title',
    descKey: 'howItWorksNew.step1Description',
    gradient: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-300',
    iconColor: 'text-emerald-500',
    numberColor: 'text-emerald-500',
  },
  {
    number: '02',
    icon: PenLine,
    titleKey: 'howItWorksNew.step2Title',
    descKey: 'howItWorksNew.step2Description',
    gradient: 'from-emerald-100 to-emerald-200',
    border: 'border-emerald-400',
    iconColor: 'text-emerald-600',
    numberColor: 'text-emerald-500',
  },
  {
    number: '03',
    icon: Download,
    titleKey: 'howItWorksNew.step3Title',
    descKey: 'howItWorksNew.step3Description',
    gradient: '',
    border: '',
    iconColor: 'text-white',
    numberColor: 'text-cyan-500',
    solid: true,
  },
]

function Connector({ variant }: { variant: 1 | 2 }) {
  const from = variant === 1 ? '#a7f3d0' : '#10b981'
  const to = variant === 1 ? '#10b981' : '#06b6d4'

  return (
    <div className="hidden lg:flex items-center shrink-0" style={{ paddingTop: '1.5rem' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.4 + variant * 0.2 }}
        className="w-10 h-px origin-left"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
      />
      <svg width="8" height="8" viewBox="0 0 8 8" fill={to}>
        <polygon points="0,0 8,4 0,8" />
      </svg>
    </div>
  )
}

export function HowItWorksSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="howItWorks">
      <div className="py-16 px-6 lg:py-24 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 font-semibold">
              {t('howItWorksNew.overline')}
            </span>
            <h2 className="font-display text-2xl lg:text-[1.8rem] font-extrabold text-zinc-900 mt-3 leading-[1.2]">
              {t('howItWorksNew.headline')}
              <br />
              <span className="text-gradient-primary">{t('howItWorksNew.headlineGradient')}</span>
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 lg:gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="flex flex-col items-center text-center flex-1 max-w-[200px] mx-auto lg:mx-0"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      step.solid
                        ? 'shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                        : `bg-gradient-to-br ${step.gradient} ${step.border} border shadow-[0_4px_12px_rgba(16,185,129,0.1)]`
                    }`}
                    style={step.solid ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)' } : undefined}
                  >
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <span className={`text-[0.7rem] font-bold font-mono ${step.numberColor}`}>
                    {step.number}
                  </span>
                  <h3 className="font-display text-sm font-bold text-zinc-900 mt-1.5">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    {t(step.descKey)}
                  </p>
                </motion.div>
                {i < steps.length - 1 && <Connector variant={(i + 1) as 1 | 2} />}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-center mt-12"
          >
            <a
              href="#pricing"
              className="inline-block text-white border-0 rounded-xl py-3 px-8 text-sm font-bold font-display shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {t('howItWorksNew.cta')}
            </a>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/how-it-works-section.tsx
git commit -m "feat: rewrite HowItWorksSection with horizontal steps, connectors, and CTA"
```

---

### Task 9: Edit SocialProofSection (add title + subtitle)

**Files:**
- Modify: `src/components/landingPage/social-proof-section.tsx`

- [ ] **Step 1: Add title and subtitle to SocialProofSection**

Edit `src/components/landingPage/social-proof-section.tsx`. Add the `useTranslation` import and a header block above the carousel.

The file currently starts with:
```tsx
import { usePublicSiteLogos } from '@/hooks/usePublicStats'
import { SectionWrapper } from './section-wrapper'
```

Replace the entire file with:

```tsx
import { useTranslation } from 'react-i18next'
import { usePublicSiteLogos } from '@/hooks/usePublicStats'
import { SectionWrapper } from './section-wrapper'

export function SocialProofSection() {
  const { t } = useTranslation('landing')
  const { data: logos } = usePublicSiteLogos()

  if (!logos || logos.length === 0) return null

  const duplicated =
    logos.length < 3 ? [...logos, ...logos, ...logos, ...logos] : [...logos, ...logos]

  return (
    <SectionWrapper>
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* New title + subtitle */}
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-zinc-900">
              {t('socialProofNew.title')}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {t('socialProofNew.subtitle')}
            </p>
          </div>

          {/* Existing carousel */}
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
              className="flex w-max animate-logo-scroll hover:[animation-play-state:paused] will-change-transform"
              style={{ animationDuration: `${Math.max(logos.length * 3, 15)}s` }}
            >
              {duplicated.map((logo, index) => (
                <img
                  key={`${logo.site_name}-${index}`}
                  src={logo.logo_url}
                  alt={logo.site_name}
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain rounded-lg opacity-70 hover:opacity-100 transition-all duration-300 mx-4 sm:mx-6 md:mx-8 shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/components/landingPage/social-proof-section.tsx
git commit -m "feat: add title and subtitle to SocialProofSection"
```

---

### Task 10: Update Landing.tsx (section order + imports)

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Replace Landing.tsx contents**

Replace the entire file `src/pages/Landing.tsx` with:

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

Note: Old imports for `ProblemPromiseSection`, `FeaturesSection`, and `ProductVisualizationSection` are removed. New imports for `ProblemSection` and `ValueFeaturesSection` are added.

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm run build
```

Expected: Build succeeds. The old components still exist on disk but are no longer imported.

- [ ] **Step 3: Commit**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add src/pages/Landing.tsx
git commit -m "feat: update Landing.tsx with new section order and imports"
```

---

### Task 11: Visual QA — run dev server and verify

**Files:** None (read-only verification)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm run dev
```

- [ ] **Step 2: Verify in browser**

Open the landing page URL and verify each section:

1. **ProblemSection**: Dark background, white/zinc headline, 3 animated stats, emerald transition line
2. **ValueFeaturesSection**: 3 zig-zag blocks with correct alternating layout, UI snippets render correctly
3. **HowItWorksSection**: 3 horizontal steps with gradient connectors, CTA links to `#pricing`
4. **SocialProofSection**: Has new title "Monitoramos as empresas que você ama." + subtitle above carousel
5. **Responsive**: Check mobile breakpoint — sections stack correctly, text above UI snippets

- [ ] **Step 3: Check animations fire correctly**

Scroll through the page and verify:
- Stats count up on first view
- Zig-zag blocks fade in per block
- Steps stagger in
- Connector lines draw left-to-right
- Animations only fire once (`viewport.once: true`)

- [ ] **Step 4: Check both languages**

Switch between pt-BR and en-US (if language switcher exists) and verify all text renders correctly in both languages.

---

### Task 12: Delete old components + cleanup

**Files:**
- Delete: `src/components/landingPage/problem-promise.tsx`
- Delete: `src/components/landingPage/features-section.tsx`
- Delete: `src/components/landingPage/product-visualization-section.tsx`

- [ ] **Step 1: Verify no other files import the old components**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
grep -r "problem-promise\|ProblemPromise\|features-section\|FeaturesSection\|product-visualization\|ProductVisualization" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: No files should reference these anymore (Landing.tsx was updated in Task 10).

- [ ] **Step 2: Delete old component files**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
rm src/components/landingPage/problem-promise.tsx
rm src/components/landingPage/features-section.tsx
rm src/components/landingPage/product-visualization-section.tsx
```

- [ ] **Step 3: Remove old i18n keys that are no longer used**

The following top-level keys in both `landing.json` files can be cleaned up since they are no longer referenced by any component:
- `problem` (replaced by `problemSection`)
- `productVisualization` (replaced by `valueFeatures`)

The `features` and `howItWorks` keys should be kept if the navbar references them (check `labels.features` and `labels.howItWorks` — these are used by the navbar and should remain).

- [ ] **Step 4: Verify build still passes after cleanup**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit cleanup**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git add -A
git commit -m "chore: remove old landing page components replaced by redesign"
```

---

### Task 13: Final build verification

- [ ] **Step 1: Full build**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
npm run build
```

Expected: Build succeeds.

- [ ] **Step 2: Check bundle for framer-motion chunk**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
ls -la dist/assets/ | grep -i motion
```

Expected: Framer Motion is tree-shaken into the bundle.

- [ ] **Step 3: Final commit if any remaining changes**

```bash
cd /Users/I768258/Desktop/ScrapJobs_project/front-scrap-jobs
git status
```

If clean, nothing to do. If there are uncommitted changes, commit them.
