# Landing simplificada e honesta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a landing atual por uma página simples que vende a assinatura integrada do
ScrapJobs com a proposta “Receba as vagas mais recentes no seu WhatsApp”, sem prometer recursos que
o produto não entrega.

**Architecture:** A implementação permanece inteiramente no SPA `FrontScrapJobs`. Componentes da
landing ficam em `src/components/landingPage`, dados comerciais continuam vindo dos hooks/APIs
existentes e toda copy fica em `landing.json` para pt-BR e en-US. A página usa contratos
compartilhados para WhatsApp, analytics e planos, e cada seção tem teste de componente próprio.

**Tech Stack:** React 19, TypeScript 5.8, Vite 7, React Router 7, TanStack Query 5,
react-i18next, Tailwind CSS 4, Radix UI, Vitest, Testing Library e Playwright.

## Global Constraints

- Trabalhar somente em `FrontScrapJobs`; não alterar backend, matching, planos, cotas ou agente.
- pt-BR é o idioma primário e toda nova chave deve existir também em en-US.
- Não adicionar dependências nem criar imagem de compartilhamento social.
- Não alterar prompts do Norte, política de privacidade ou integração do Google Tag Manager; esses
  débitos têm escopo próprio.
- WhatsApp é a porta principal; preservar `#lp`, `#lpq` e `#lpw` nos links.
- A consulta inicial é gratuita, mas não existe trial; nenhum CTA diz “Começar grátis”.
- Não afirmar que o ScrapJobs reescreve currículo, gera PDF, garante aprovação em ATS ou entrega
  alertas simultaneamente por WhatsApp e email.
- Chips são exemplos acessíveis, não filtros nem lista exaustiva de áreas.
- Nomes, preços, `max_sites`, `max_ai_analyses` e `is_ultra` vêm da API.
- Não renderizar `plan.features`; os benefícios são localizados no frontend.
- `npm run build` funciona sem número; o `Dockerfile` falha sem `VITE_NORTE_WA_NUMBER`.
- Exceção de TDD aprovada para o `Dockerfile`: validar com um build que passa com o número e outro
  que falha sem ele, sem teste unitário artificial.
- Preservar o `AGENTS.md` não rastreado, que pertence ao usuário.
- Implementar cada tarefa em TDD e criar um commit focado após sua verificação.

## File Map

**Create:**

- `src/components/landingPage/included-features-section.tsx`
- `src/components/landingPage/__tests__/included-features-section.test.tsx`
- `src/components/landingPage/landing-plan-benefits.ts`
- `src/components/landingPage/__tests__/landing-plan-benefits.test.ts`
- `src/components/landingPage/__tests__/pricing-section.test.tsx`

**Modify:**

- `src/pages/Landing.tsx`
- `src/components/landingPage/whatsapp-cta-button.tsx`
- `src/components/landingPage/navbar.tsx`
- `src/components/landingPage/hero-norte-section.tsx`
- `src/components/landingPage/landing-wa.ts`
- `src/components/landingPage/ui-snippets/norte-chat.tsx`
- `src/components/landingPage/proof-band-section.tsx`
- `src/components/landingPage/how-it-works-strip.tsx`
- `src/components/landingPage/pricing-section.tsx`
- `src/components/landingPage/faq-section.tsx`
- `src/components/landingPage/cta-final-section.tsx`
- `src/components/landingPage/section-wrapper.tsx`
- `src/components/landingPage/__tests__/landing-wa.test.ts`
- `src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx`
- `src/components/landingPage/__tests__/hero-norte-section.test.tsx`
- `src/components/landingPage/__tests__/navbar.test.tsx`
- `src/components/landingPage/__tests__/proof-band-section.test.tsx`
- `src/components/landingPage/__tests__/how-it-works-strip.test.tsx`
- `src/components/landingPage/__tests__/faq-section.test.tsx`
- `src/components/landingPage/__tests__/cta-final-section.test.tsx`
- `src/components/landingPage/__tests__/section-wrapper.test.tsx`
- `src/components/landingPage/ui-snippets/__tests__/norte-chat.test.tsx`
- `src/lib/analytics.ts`
- `src/i18n/locales/pt-BR/landing.json`
- `src/i18n/locales/en-US/landing.json`
- `index.html`
- `Dockerfile` e `e2e/landing.spec.ts`.

**Delete after replacement:**

- `src/components/landingPage/norte-capabilities-section.tsx`
- `src/components/landingPage/multicanal-section.tsx`
- `src/components/landingPage/__tests__/norte-capabilities-section.test.tsx`
- `src/components/landingPage/__tests__/multicanal-section.test.tsx`

---

### Task 1: Harden the WhatsApp funnel and analytics contracts

**Files:**

- Modify: `src/components/landingPage/landing-wa.ts`
- Modify: `src/components/landingPage/whatsapp-cta-button.tsx`
- Modify: `src/components/landingPage/__tests__/landing-wa.test.ts`
- Modify: `src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx`
- Modify: `src/lib/analytics.ts`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`
- Modify: `Dockerfile`

**Interfaces:**

- Produces: `getWaNumber(): string` and `hasWaNumber(): boolean`.
- Changes: `buildWaLink(source: WaCtaSource): string | null`.
- Produces events: `lp_whatsapp_web_click`, `lp_plan_click`, `lp_faq_open`,
  `lp_plans_load_error`.

- [ ] **Step 1: Write failing tests for a missing WhatsApp number**

```ts
it('retorna null quando VITE_NORTE_WA_NUMBER falta', () => {
  vi.stubEnv('VITE_NORTE_WA_NUMBER', '')
  expect(getWaNumber()).toBe('')
  expect(hasWaNumber()).toBe(false)
  expect(buildWaLink('mobile')).toBeNull()
})

it('bloqueia o CTA e informa indisponibilidade quando o número falta', () => {
  vi.stubEnv('VITE_NORTE_WA_NUMBER', '')
  render(<WhatsAppCtaButton section="hero">Receber vagas no WhatsApp</WhatsAppCtaButton>)
  expect(screen.getByRole('button', { name: 'Receber vagas no WhatsApp' })).toBeDisabled()
  expect(screen.getByRole('status')).toHaveTextContent('WhatsApp temporariamente indisponível')
})
```

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/landing-wa.test.ts src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx
```

Expected: FAIL because the two availability helpers do not exist and the old function returns an
invalid `wa.me` URL.

- [ ] **Step 3: Implement explicit, nullable link construction**

```ts
const WA_SOURCE_SUFFIX = { mobile: '#lp', qr: '#lpq', web: '#lpw' } as const

export type WaCtaSource = keyof typeof WA_SOURCE_SUFFIX

export function getWaNumber(): string {
  return (import.meta.env.VITE_NORTE_WA_NUMBER || '').trim()
}

export function hasWaNumber(): boolean {
  return getWaNumber().length > 0
}

export function buildWaLink(source: WaCtaSource): string | null {
  const number = getWaNumber()
  if (!number) return null
  const text = encodeURIComponent(`Oi Norte! Quero ver vagas pra mim ${WA_SOURCE_SUFFIX[source]}`)
  return `https://wa.me/${number}?text=${text}`
}
```

Keep `isMobileDevice()` unchanged.

- [ ] **Step 4: Guard the shared CTA and split the WhatsApp Web event**

Calculate `available = hasWaNumber()`. Generate QR only for a non-null QR link and navigate only
for a non-null mobile link. Merge caller and configuration disabled states:

```tsx
const unavailableId = `wa-unavailable-${section}`

<Button
  {...buttonProps}
  disabled={buttonProps.disabled || !available}
  aria-describedby={!available ? unavailableId : undefined}
  onClick={onClick}
>
  {children}
</Button>
{!available && (
  <span id={unavailableId} role="status" className="mt-2 block text-xs text-destructive">
    {t('waUnavailable')}
  </span>
)}
```

The primary CTA emits `lp_whatsapp_click` once with `method: direct | modal`. The modal link emits:

```ts
trackLanding('lp_whatsapp_web_click', { section })
```

Add `waUnavailable` as `WhatsApp temporariamente indisponível. Tente novamente mais tarde.` and
`WhatsApp is temporarily unavailable. Please try again later.` to the two locale files.

- [ ] **Step 5: Extend the exact landing event union**

```ts
export type LandingEvent =
  | 'lp_cta_click'
  | 'lp_whatsapp_click'
  | 'lp_whatsapp_web_click'
  | 'lp_plan_click'
  | 'lp_faq_open'
  | 'lp_plans_load_error'
```

Update the Web-link test to expect `lp_whatsapp_web_click` with `{ section: 'final' }`.

- [ ] **Step 6: Make the production image fail fast**

Add immediately after the WhatsApp `ARG`/`ENV` pair:

```dockerfile
RUN test -n "$VITE_NORTE_WA_NUMBER" || \
    (echo "VITE_NORTE_WA_NUMBER is required for production builds" >&2; exit 1)
```

Do not add this validation to Vite.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run src/components/landingPage/__tests__/landing-wa.test.ts src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx
npm run build
docker build --build-arg VITE_NORTE_WA_NUMBER=5551999999999 -t frontscrapjobs:landing-wa .
docker build -t frontscrapjobs:landing-wa-missing .
```

Expected: Vitest and local build PASS; configured Docker build PASS; missing-number Docker build
FAIL with the new message.

```bash
git add Dockerfile src/lib/analytics.ts src/components/landingPage/landing-wa.ts src/components/landingPage/whatsapp-cta-button.tsx src/components/landingPage/__tests__/landing-wa.test.ts src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "fix(landing): protege funil do WhatsApp"
```

### Task 2: Replace the hero with the truthful vacancy-delivery proposition

**Files:**

- Modify: `src/components/landingPage/hero-norte-section.tsx`
- Modify: `src/components/landingPage/ui-snippets/norte-chat.tsx`
- Modify: `src/components/landingPage/proof-band-section.tsx`
- Modify: `src/components/landingPage/navbar.tsx`
- Modify: `src/components/landingPage/__tests__/hero-norte-section.test.tsx`
- Modify: `src/components/landingPage/__tests__/navbar.test.tsx`
- Modify: `src/components/landingPage/__tests__/proof-band-section.test.tsx`
- Modify: `src/components/landingPage/ui-snippets/__tests__/norte-chat.test.tsx`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

**Interfaces:**

- Changes: `NorteChatProps` gains `headerSubtitle?: ReactNode`.
- Preserves: dynamic stats/logos and WhatsApp CTA section names `hero` and `navbar`.

- [ ] **Step 1: Write failing hero, navbar and proof assertions**

```ts
it('renderiza a proposta principal e um digest real', () => {
  renderHero()
  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Receba as vagas mais recentes no seu WhatsApp.'
    })
  ).toBeInTheDocument()
  expect(screen.getByText('Vagas em áreas como')).toBeInTheDocument()
  expect(screen.getByText('Tecnologia')).toBeInTheDocument()
  expect(screen.getByText('Finanças')).toBeInTheDocument()
  expect(screen.getByText(/8 vagas novas hoje/)).toBeInTheDocument()
  expect(screen.getByText('demonstração')).toBeInTheDocument()
  expect(screen.queryByText(/CV_Nubank\.pdf|CV otimizado|92% match/i)).not.toBeInTheDocument()
  expect(screen.queryByText('online')).not.toBeInTheDocument()
})
```

Update navbar tests to require CTA `Receber vagas` and navigation name `Navegação principal`.
Update proof tests to require `empresas monitoradas` and `vagas disponíveis`.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/hero-norte-section.test.tsx src/components/landingPage/__tests__/navbar.test.tsx src/components/landingPage/__tests__/proof-band-section.test.tsx src/components/landingPage/ui-snippets/__tests__/norte-chat.test.tsx
```

Expected: FAIL on the old H1, CTA, proof labels and `online` subtitle.

- [ ] **Step 3: Remove the false presence state from `NorteChat`**

Add `headerSubtitle?: ReactNode` to the props and replace the hardcoded status with:

```tsx
{headerSubtitle && <p className="text-[10px] opacity-80">{headerSubtitle}</p>}
```

Update its test to pass `headerSubtitle="demonstração"`, require that value and reject `online`.

- [ ] **Step 4: Implement exact hero copy in both locales**

Use this pt-BR object:

```json
"hero": {
  "eyebrow": "Vagas direto das empresas",
  "headingLead": "Receba as vagas mais recentes no seu",
  "headingHighlight": "WhatsApp.",
  "subheading": "O ScrapJobs monitora páginas de carreira, encontra oportunidades compatíveis com o seu perfil e envia as novidades diretamente para você.",
  "areasLabel": "Vagas em áreas como",
  "areas": {
    "technology": "Tecnologia",
    "marketing": "Marketing",
    "sales": "Vendas",
    "hr": "RH",
    "finance": "Finanças",
    "design": "Design",
    "data": "Dados"
  },
  "cta": "Receber vagas no WhatsApp",
  "microcopy": "Responda 3 perguntas e descubra quantas vagas encontramos para você.",
  "loginPrompt": "Já é assinante?",
  "loginLink": "Entrar",
  "chatSubtitle": "demonstração",
  "chatDigest": "8 vagas novas hoje — Empresa A, Empresa B. Abre: scrapjobs.com.br/d/..."
}
```

Use the same keys in en-US with: `Jobs straight from employers`, `Get the latest jobs on your`,
`WhatsApp.`, `Jobs in fields such as`, `Technology`, `Marketing`, `Sales`, `HR`, `Finance`,
`Design`, `Data`, `Get jobs on WhatsApp`, `Answer 3 questions and see how many jobs we found for
you.`, `Already a subscriber?`, `Sign in`, `demo`, and
`8 new jobs today — Company A, Company B. Open: scrapjobs.com.br/d/...`. Set the subtitle to:
`ScrapJobs monitors company career pages, finds opportunities that match your profile, and sends
new jobs directly to you.`

Render `areasLabel` visibly and chips as a semantic `ul`/`li`, without `aria-hidden`. Pass one Norte
message containing `hero.chatDigest` and `headerSubtitle={t('hero.chatSubtitle')}`.

- [ ] **Step 5: Update navbar and proof without changing their data sources**

Add `aria-label={t('navbar.ariaLabel')}` and set the CTA to `Receber vagas` / `Get jobs`. Set
`navbar.ariaLabel` to `Navegação principal` / `Main navigation`.

Set proof labels to:

```json
"proofBand": {
  "sites": "empresas monitoradas",
  "jobs": "vagas disponíveis"
}
```

Use `monitored companies` and `available jobs` in en-US.

Keep visual logo copies but expose each source company once:

```tsx
const isVisualDuplicate = index >= (logos?.length ?? 0)

<img
  src={logo.logo_url}
  alt={isVisualDuplicate ? '' : logo.site_name}
  aria-hidden={isVisualDuplicate}
/>
```

Update tests to count all visual images with `container.querySelectorAll('img')` but only one
accessible image per original company with `getAllByAltText`.

- [ ] **Step 6: Verify and commit**

Run the four Vitest files from Step 2. Expected: PASS and no old CV/PDF promise in the hero.

```bash
git add src/components/landingPage/hero-norte-section.tsx src/components/landingPage/ui-snippets/norte-chat.tsx src/components/landingPage/proof-band-section.tsx src/components/landingPage/navbar.tsx src/components/landingPage/__tests__/hero-norte-section.test.tsx src/components/landingPage/__tests__/navbar.test.tsx src/components/landingPage/__tests__/proof-band-section.test.tsx src/components/landingPage/ui-snippets/__tests__/norte-chat.test.tsx src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(landing): refaz hero para alertas de vagas"
```

### Task 3: Explain the real three-question WhatsApp entry flow

**Files:**

- Modify: `src/components/landingPage/how-it-works-strip.tsx`
- Modify: `src/components/landingPage/__tests__/how-it-works-strip.test.tsx`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

**Interfaces:**

- Preserves anchor: `id="howItWorks"`.
- Produces stable step keys: `profile`, `result`, `plan`.

- [ ] **Step 1: Write the failing three-step test**

```ts
it('explica as três perguntas, o resultado e a assinatura', () => {
  render(<HowItWorksStrip />)
  expect(screen.getByText('Comece pelo WhatsApp')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Veja suas oportunidades em 3 perguntas' }))
    .toBeInTheDocument()
  expect(screen.getByText('Conte o que você procura')).toBeInTheDocument()
  expect(screen.getByText('Veja o resultado')).toBeInTheDocument()
  expect(screen.getByText('Escolha seu plano')).toBeInTheDocument()
  expect(screen.getByText(/consulta inicial são gratuitas/i)).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
```

- [ ] **Step 2: Run focused test and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/how-it-works-strip.test.tsx
```

Expected: FAIL because the old component describes four post-signup steps and optimized CV.

- [ ] **Step 3: Implement a semantic ordered list**

```ts
const STEPS = [
  { key: 'profile', icon: UserRoundSearch },
  { key: 'result', icon: ListChecks },
  { key: 'plan', icon: CreditCard }
] as const
```

Each `li` renders position, icon, `howItWorks.steps.<key>.title`, and body. Render the transparency
note after the list. Use `SectionWrapper id="howItWorks"` so Task 7 can centralize anchor offset.

Use this pt-BR content:

```json
"howItWorks": {
  "overline": "Comece pelo WhatsApp",
  "title": "Veja suas oportunidades em 3 perguntas",
  "description": "A conversa inicial identifica o que você procura e mostra o volume de vagas antes de você escolher um plano.",
  "steps": {
    "profile": { "title": "Conte o que você procura", "body": "Informe sua área, seu nível de experiência e as regiões de interesse." },
    "result": { "title": "Veja o resultado", "body": "O ScrapJobs consulta as vagas disponíveis e mostra quantas combinam com o perfil." },
    "plan": { "title": "Escolha seu plano", "body": "Assine para acessar as oportunidades encontradas e receber as próximas automaticamente." }
  },
  "note": "A conversa e a consulta inicial são gratuitas. O acesso às vagas e o monitoramento contínuo fazem parte da assinatura."
}
```

Use this en-US content:

```json
"howItWorks": {
  "overline": "Start on WhatsApp",
  "title": "See your opportunities in 3 questions",
  "description": "The initial conversation identifies what you are looking for and shows the number of jobs before you choose a plan.",
  "steps": {
    "profile": { "title": "Tell us what you want", "body": "Share your field, experience level, and preferred locations." },
    "result": { "title": "See the result", "body": "ScrapJobs checks available jobs and shows how many match your profile." },
    "plan": { "title": "Choose your plan", "body": "Subscribe to access the opportunities and receive the next matching jobs automatically." }
  },
  "note": "The conversation and initial search are free. Job access and continuous monitoring are included with a subscription."
}
```

Remove `howItWorksNew` from both locales.

- [ ] **Step 4: Verify and commit**

Run the focused test. Expected: PASS with exactly three list items and no optimized-CV wording.

```bash
git add src/components/landingPage/how-it-works-strip.tsx src/components/landingPage/__tests__/how-it-works-strip.test.tsx src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(landing): explica entrada pelo WhatsApp"
```

### Task 4: Consolidate the product into one included-resources section

**Files:**

- Create: `src/components/landingPage/included-features-section.tsx`
- Create: `src/components/landingPage/__tests__/included-features-section.test.tsx`
- Modify: `src/pages/Landing.tsx`
- Modify: `src/components/landingPage/navbar.tsx`
- Modify: `src/components/landingPage/__tests__/navbar.test.tsx`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`
- Delete: `src/components/landingPage/norte-capabilities-section.tsx`
- Delete: `src/components/landingPage/multicanal-section.tsx`
- Delete: `src/components/landingPage/__tests__/norte-capabilities-section.test.tsx`
- Delete: `src/components/landingPage/__tests__/multicanal-section.test.tsx`

**Interfaces:**

- Produces: `IncludedFeaturesSection()` and anchor `id="included"`.
- Replaces `NorteCapabilitiesSection` and `MulticanalSection` in `Landing`.

- [ ] **Step 1: Write the failing integrated-resource test**

```ts
it('apresenta cinco recursos, duas interfaces e a limitação do prompt', () => {
  render(<IncludedFeaturesSection />)
  expect(screen.getByRole('heading', { name: 'Da descoberta à candidatura' }))
    .toBeInTheDocument()
  expect(screen.getByText('Radar de vagas')).toBeInTheDocument()
  expect(screen.getByText('Seleção personalizada')).toBeInTheDocument()
  expect(screen.getByText('Alertas de vagas')).toBeInTheDocument()
  expect(screen.getByText('Análise de compatibilidade')).toBeInTheDocument()
  expect(screen.getByText('Prompt de otimização')).toBeInTheDocument()
  expect(screen.getByText('Norte no WhatsApp')).toBeInTheDocument()
  expect(screen.getByText('Painel ScrapJobs')).toBeInTheDocument()
  expect(screen.getByText(/não reescreve nem gera um novo currículo/i)).toBeInTheDocument()
  expect(screen.getAllByTestId('journey-feature')).toHaveLength(5)
})
```

- [ ] **Step 2: Run the new test and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/included-features-section.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the focused component**

```ts
const FEATURES = [
  { key: 'radar', icon: Radar },
  { key: 'selection', icon: SlidersHorizontal },
  { key: 'alerts', icon: Bell },
  { key: 'analysis', icon: ScanSearch },
  { key: 'prompt', icon: WandSparkles }
] as const

const INTERFACES = [
  { key: 'norte', icon: MessageCircle },
  { key: 'dashboard', icon: LayoutDashboard }
] as const
```

Render inside `<SectionWrapper id="included">`. Features form an ordered list and each item has
`data-testid="journey-feature"`. Interfaces form a separate two-column list. Render the mandatory
prompt note after the feature list.

Use this pt-BR copy:

```json
"included": {
  "overline": "Uma assinatura, todo o sistema",
  "title": "Da descoberta à candidatura",
  "description": "Cada recurso resolve uma parte da busca por emprego. Juntos, eles reduzem o trabalho repetitivo e ajudam você a decidir onde vale a pena aplicar.",
  "features": {
    "radar": { "title": "Radar de vagas", "body": "Monitora páginas de carreira das empresas várias vezes ao dia." },
    "selection": { "title": "Seleção personalizada", "body": "Filtra vagas de acordo com seu perfil e suas preferências." },
    "alerts": { "title": "Alertas de vagas", "body": "Entrega oportunidades pelo canal escolhido: WhatsApp ou email." },
    "analysis": { "title": "Análise de compatibilidade", "body": "Compara vaga e currículo e aponta forças, lacunas e palavras-chave." },
    "prompt": { "title": "Prompt de otimização", "body": "Gera instruções para adaptar o currículo no ChatGPT, Claude ou Gemini." }
  },
  "promptNote": "O prompt prepara instruções personalizadas para você usar junto com seu PDF em outra IA. O ScrapJobs não reescreve nem gera um novo currículo.",
  "interfacesTitle": "Use do seu jeito",
  "interfaces": {
    "norte": { "title": "Norte no WhatsApp", "body": "Pesquise vagas, peça análises, envie currículo e altere preferências conversando." },
    "dashboard": { "title": "Painel ScrapJobs", "body": "Acompanhe vagas, empresas monitoradas, currículos e configurações." }
  }
}
```

Use this en-US copy:

```json
"included": {
  "overline": "One subscription, the whole system",
  "title": "From job discovery to application",
  "description": "Each resource solves one part of the job search. Together, they reduce repetitive work and help you decide which jobs are worth applying to.",
  "features": {
    "radar": { "title": "Job radar", "body": "Monitors company career pages several times a day." },
    "selection": { "title": "Personalized selection", "body": "Filters jobs according to your profile and preferences." },
    "alerts": { "title": "Job alerts", "body": "Delivers opportunities through your chosen channel: WhatsApp or email." },
    "analysis": { "title": "Compatibility analysis", "body": "Compares a job and your résumé, highlighting strengths, gaps, and keywords." },
    "prompt": { "title": "Optimization prompt", "body": "Generates instructions to adapt your résumé in ChatGPT, Claude, or Gemini." }
  },
  "promptNote": "The prompt prepares personalized instructions for you to use with your PDF in another AI. ScrapJobs does not rewrite your résumé or generate a new one.",
  "interfacesTitle": "Use it your way",
  "interfaces": {
    "norte": { "title": "Norte on WhatsApp", "body": "Search jobs, request analyses, send your résumé, and change preferences in a conversation." },
    "dashboard": { "title": "ScrapJobs dashboard", "body": "Track jobs, monitored companies, résumés, and settings." }
  }
}
```

- [ ] **Step 4: Integrate and delete obsolete sections**

Replace the two old imports/calls in `Landing.tsx` with:

```tsx
import { IncludedFeaturesSection } from '@/components/landingPage/included-features-section'

<HowItWorksStrip />
<IncludedFeaturesSection />
<PricingSection />
```

Delete the two component files and tests. Remove `norteDoes` and `multicanal` from both locale files.

- [ ] **Step 5: Add the resources navbar anchor**

Add `navbar.included` as `O que está incluído` / `What's included` between Como funciona and Planos.
Its button calls `scrollToId('included')`. Update the navbar test to assert the button and target.

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run src/components/landingPage/__tests__/included-features-section.test.tsx src/components/landingPage/__tests__/navbar.test.tsx
npx vitest run src/components/landingPage
```

Expected: PASS; deleted tests are gone and the integrated section has five resource cards.

```bash
git add src/pages/Landing.tsx src/components/landingPage src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(landing): consolida recursos da assinatura"
```

### Task 5: Render localized plans from structured API fields

**Files:**

- Create: `src/components/landingPage/landing-plan-benefits.ts`
- Create: `src/components/landingPage/__tests__/landing-plan-benefits.test.ts`
- Create: `src/components/landingPage/__tests__/pricing-section.test.tsx`
- Modify: `src/components/landingPage/pricing-section.tsx`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

**Interfaces:**

- Produces: `LandingPlanBenefitKey`, `LandingPlanBenefit` and
  `getLandingPlanBenefits(plan: Plan): LandingPlanBenefit[]`.
- Produces events: `lp_plan_click` and `lp_plans_load_error`.

- [ ] **Step 1: Write failing tests for structured benefits**

```ts
const profissional: Plan = {
  id: 2,
  name: 'Profissional',
  price: 19.9,
  max_sites: 40,
  max_ai_analyses: 20,
  is_trial: false,
  is_ultra: false,
  features: ['NÃO RENDERIZAR']
}

it('deriva Profissional sem consultar features', () => {
  expect(getLandingPlanBenefits(profissional)).toEqual([
    { key: 'siteLimit', values: { count: 40 } },
    { key: 'analysisLimit', values: { count: 20 } },
    { key: 'prompt' },
    { key: 'channel' },
    { key: 'dashboard' }
  ])
})

it('troca limite por cobertura total e suporte no Ultra', () => {
  expect(getLandingPlanBenefits({
    ...profissional,
    id: 3,
    name: 'Ultra',
    price: 29.9,
    max_sites: 0,
    max_ai_analyses: 50,
    is_ultra: true
  })).toEqual([
    { key: 'allSites' },
    { key: 'analysisLimit', values: { count: 50 } },
    { key: 'prompt' },
    { key: 'channel' },
    { key: 'dashboard' },
    { key: 'prioritySupport' }
  ])
})
```

- [ ] **Step 2: Run helper test and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/landing-plan-benefits.test.ts
```

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the pure mapper**

```ts
import type { Plan } from '@/models/plan'

export type LandingPlanBenefitKey =
  | 'siteLimit'
  | 'allSites'
  | 'analysisLimit'
  | 'prompt'
  | 'channel'
  | 'dashboard'
  | 'prioritySupport'

export type LandingPlanBenefit = {
  key: LandingPlanBenefitKey
  values?: { count: number }
}

export function getLandingPlanBenefits(plan: Plan): LandingPlanBenefit[] {
  const coverage: LandingPlanBenefit = plan.is_ultra
    ? { key: 'allSites' }
    : { key: 'siteLimit', values: { count: plan.max_sites } }
  const benefits: LandingPlanBenefit[] = [
    coverage,
    { key: 'analysisLimit', values: { count: plan.max_ai_analyses } },
    { key: 'prompt' },
    { key: 'channel' },
    { key: 'dashboard' }
  ]
  if (plan.is_ultra) benefits.push({ key: 'prioritySupport' })
  return benefits
}
```

- [ ] **Step 4: Write failing pricing component tests**

Mock `usePlans` and `trackLanding`. Cover these contracts:

```ts
it('renderiza dados estruturados e ignora features', () => {
  usePlansMock.mockReturnValue(successfulPlansState)
  renderPricing()
  expect(screen.getByText('R$ 19,90')).toBeInTheDocument()
  expect(screen.getByText('Até 40 empresas monitoradas')).toBeInTheDocument()
  expect(screen.getByText('20 análises de compatibilidade por mês')).toBeInTheDocument()
  expect(screen.queryByText('NÃO RENDERIZAR')).not.toBeInTheDocument()
})

it('registra posição e navega com o id do plano', () => {
  usePlansMock.mockReturnValue(successfulPlansState)
  renderPricing()
  fireEvent.click(screen.getByRole('button', { name: 'Assinar Profissional' }))
  expect(trackLanding).toHaveBeenCalledWith('lp_plan_click', {
    plan_id: 2,
    plan_name: 'Profissional',
    position: 1,
    origin: 'landing_pricing'
  })
})

it('mostra erro, mede uma vez e permite tentar novamente', () => {
  usePlansMock.mockReturnValue(failedPlansState)
  renderPricing()
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os planos')
  expect(trackLanding).toHaveBeenCalledWith('lp_plans_load_error', { attempt: 1 })
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  expect(refetch).toHaveBeenCalledTimes(1)
})
```

The success fixture contains Profissional and Ultra from Step 1 plus `refetch: vi.fn()`,
`isLoading: false`, `isError: false`, `failureCount: 0`. The failure fixture has `isError: true`,
`failureCount: 1`, `data: undefined`.

- [ ] **Step 5: Rewrite pricing data flow**

Keep `SectionWrapper`, currency formatter, paid-plan filtering, price sort, and `?plan=<id>` route.
Replace `plan.features.map` with:

```tsx
{getLandingPlanBenefits(plan).map((benefit) => (
  <li key={benefit.key} className="flex items-start gap-3">
    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" aria-hidden />
    <span className="text-muted-foreground">
      {t(`pricing.benefits.${benefit.key}`, benefit.values)}
    </span>
  </li>
))}
```

Use `isPopular = index === 0`. CTA label is `t('pricing.subscribePlan', { name: plan.name })`.
Render the overline from `pricing.overline`, replacing the old `labels.pricing` lookup.
Before navigation emit:

```ts
trackLanding('lp_plan_click', {
  plan_id: plan.id,
  plan_name: plan.name,
  position: index + 1,
  origin: 'landing_pricing'
})
```

Track errors once per failed attempt:

```ts
useEffect(() => {
  if (!isError) return
  trackLanding('lp_plans_load_error', { attempt: Math.max(failureCount, 1) })
}, [failureCount, isError])
```

For `isError`, render `role="alert"`, `pricing.loadError` and a `pricing.retry` button that calls
`void refetch()`. Remove savings-hours copy and the LGPD/encryption block.

- [ ] **Step 6: Install exact localized pricing benefits**

```json
"pricing": {
  "overline": "Planos",
  "title": "Escolha quanto você quer acompanhar",
  "subtitle": "Ambos incluem alertas, painel, Norte, análise de compatibilidade e prompt de otimização.",
  "loading": "Carregando planos...",
  "loadError": "Não foi possível carregar os planos.",
  "retry": "Tentar novamente",
  "starter": "Melhor para começar",
  "perMonth": "/mês",
  "subscribePlan": "Assinar {{name}}",
  "footer": "Cobrança mensal · sem fidelidade · cancele quando quiser pelo painel",
  "benefits": {
    "siteLimit": "Até {{count}} empresas monitoradas",
    "allSites": "Todas as empresas disponíveis no ScrapJobs",
    "analysisLimit": "{{count}} análises de compatibilidade por mês",
    "prompt": "Prompt de otimização após cada análise",
    "channel": "Canal de entrega por WhatsApp ou email",
    "dashboard": "Acesso ao painel ScrapJobs",
    "prioritySupport": "Suporte prioritário"
  }
}
```

Mirror the structure in en-US with `Plans`, `Choose how much you want to monitor`, `Best place to
start`, `Try again`, `Subscribe to {{name}}`, `Up to {{count}} monitored companies`, `Every company
available on ScrapJobs`, `{{count}} compatibility analyses per month`, `Optimization prompt after
each analysis`, `Delivery channel via WhatsApp or email`, `ScrapJobs dashboard access`, `Priority
support`. Remove the obsolete top-level `lgpd` object from both locales.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run src/components/landingPage/__tests__/landing-plan-benefits.test.ts src/components/landingPage/__tests__/pricing-section.test.tsx
```

Expected: PASS; raw `features` is absent and both analytics payloads match the spec.

```bash
git add src/components/landingPage/landing-plan-benefits.ts src/components/landingPage/pricing-section.tsx src/components/landingPage/__tests__/landing-plan-benefits.test.ts src/components/landingPage/__tests__/pricing-section.test.tsx src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(landing): alinha planos aos dados da API"
```

### Task 6: Finish with stable FAQ analytics and a transparent closing CTA

**Files:**

- Modify: `src/components/landingPage/faq-section.tsx`
- Modify: `src/components/landingPage/cta-final-section.tsx`
- Modify: `src/components/landingPage/__tests__/faq-section.test.tsx`
- Modify: `src/components/landingPage/__tests__/cta-final-section.test.tsx`
- Modify: `src/i18n/locales/pt-BR/landing.json`
- Modify: `src/i18n/locales/en-US/landing.json`

**Interfaces:**

- Produces FAQ keys: `origin`, `initialFree`, `whatsapp`, `curriculum`, `cancel`, `company`.
- Produces: `lp_faq_open` with `{ item_key, position }`.
- Preserves: `WhatsAppCtaButton section="final"`.

- [ ] **Step 1: Write failing FAQ and closing tests**

```ts
it('renderiza as seis perguntas aprovadas', () => {
  render(<FaqSection />)
  expect(screen.getAllByRole('button')).toHaveLength(6)
  expect(screen.getByText('De onde vêm as vagas?')).toBeInTheDocument()
  expect(screen.getByText('A conversa inicial é gratuita?')).toBeInTheDocument()
  expect(screen.getByText('O ScrapJobs modifica meu currículo?')).toBeInTheDocument()
})

it('mede abertura com chave estável e posição baseada em 1', () => {
  const track = vi.spyOn(analytics, 'trackLanding').mockImplementation(() => {})
  render(<FaqSection />)
  fireEvent.click(screen.getByRole('button', { name: 'De onde vêm as vagas?' }))
  expect(track).toHaveBeenCalledWith('lp_faq_open', { item_key: 'origin', position: 1 })
})
```

Update the closing test to require `Pare de procurar vaga todos os dias.`, the three-question
microcopy, and `Receber vagas no WhatsApp`.

- [ ] **Step 2: Run focused tests and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/faq-section.test.tsx src/components/landingPage/__tests__/cta-final-section.test.tsx
```

Expected: FAIL on the old five-item FAQ and free-trial closing CTA.

- [ ] **Step 3: Give FAQ items stable identity**

```ts
const FAQ_KEYS = ['origin', 'initialFree', 'whatsapp', 'curriculum', 'cancel', 'company'] as const
```

Use each key as React key and Accordion value. Track only opens:

```ts
onValueChange={(value) => {
  if (!value) return
  const position = FAQ_KEYS.indexOf(value as (typeof FAQ_KEYS)[number]) + 1
  if (position > 0) trackLanding('lp_faq_open', { item_key: value, position })
}}
```

Read copy from `faq.items.<key>.question` and `.answer`.

- [ ] **Step 4: Replace FAQ and closing copy**

Use this complete pt-BR object:

```json
"faq": {
  "overline": "FAQ",
  "title": "Perguntas frequentes",
  "items": {
    "origin": { "question": "De onde vêm as vagas?", "answer": "Das páginas de carreira das empresas monitoradas, consultadas várias vezes ao dia." },
    "initialFree": { "question": "A conversa inicial é gratuita?", "answer": "Sim. Você responde três perguntas e vê a quantidade de vagas. O acesso e o monitoramento contínuo exigem assinatura." },
    "whatsapp": { "question": "Preciso usar WhatsApp?", "answer": "O início e a verificação acontecem pelo WhatsApp. Depois, você pode trocar o canal de alertas para email e usar o painel web." },
    "curriculum": { "question": "O ScrapJobs modifica meu currículo?", "answer": "Não. Ele analisa a compatibilidade e gera um prompt para uso em outra IA junto com o PDF." },
    "cancel": { "question": "Posso cancelar quando quiser?", "answer": "Sim, sem fidelidade, diretamente pelo painel." },
    "company": { "question": "Posso pedir outra empresa?", "answer": "Sim. Envie a página de carreiras, e o time avalia se ela pode entrar no monitoramento." }
  }
}
```

Use this complete en-US object:

```json
"faq": {
  "overline": "FAQ",
  "title": "Frequently asked questions",
  "items": {
    "origin": { "question": "Where do the jobs come from?", "answer": "From the career pages of monitored companies, checked several times a day." },
    "initialFree": { "question": "Is the initial conversation free?", "answer": "Yes. You answer three questions and see the number of jobs. Access and continuous monitoring require a subscription." },
    "whatsapp": { "question": "Do I need WhatsApp?", "answer": "The initial flow and verification happen on WhatsApp. Afterwards, you can change the alert channel to email and use the web dashboard." },
    "curriculum": { "question": "Does ScrapJobs modify my résumé?", "answer": "No. It analyzes compatibility and generates a prompt to use in another AI together with your PDF." },
    "cancel": { "question": "Can I cancel at any time?", "answer": "Yes, with no lock-in, directly from the dashboard." },
    "company": { "question": "Can I request another company?", "answer": "Yes. Send the career-page URL and the team will assess whether it can be added to monitoring." }
  }
}
```

Use this closing object:

```json
"ctaFinal": {
  "title": "Pare de procurar vaga todos os dias.",
  "subtitle": "Conte o que você busca e deixe o ScrapJobs acompanhar as páginas das empresas para você.",
  "cta": "Receber vagas no WhatsApp",
  "microcopy": "Comece com 3 perguntas e veja o resultado antes de escolher um plano."
}
```

Render the FAQ overline from `faq.overline`, replacing `labels.faq`. After Task 5 moved pricing and
this task moves FAQ, delete the obsolete top-level `labels` object from both locales.

The en-US values are `Stop searching for jobs every day.`, `Tell us what you want and let ScrapJobs
monitor company career pages for you.`, `Get jobs on WhatsApp`, and `Start with 3 questions and see
the result before choosing a plan.` Render microcopy below the CTA and remove `titleHighlight`.

- [ ] **Step 5: Verify and commit**

Run the two focused Vitest files. Expected: PASS with six triggers and one event per open.

```bash
git add src/components/landingPage/faq-section.tsx src/components/landingPage/cta-final-section.tsx src/components/landingPage/__tests__/faq-section.test.tsx src/components/landingPage/__tests__/cta-final-section.test.tsx src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json
git commit -m "feat(landing): fecha copy e FAQ transparentes"
```

### Task 7: Lock SEO and accessibility requirements

**Files:**

- Modify: `index.html`
- Modify: `src/components/landingPage/section-wrapper.tsx`
- Modify: `src/components/landingPage/__tests__/section-wrapper.test.tsx`
- Modify: `src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx`

**Interfaces:**

- Preserves exactly one H1.
- Produces anchor offset through `scroll-mt-20`.
- Leaves copy coverage to rendered component tests and the bilingual E2E in Task 8.

- [ ] **Step 1: Write the failing anchor invariant**

Add a `SectionWrapper` test asserting outer `section#pricing` has `scroll-mt-20`. Copy truth is
asserted at rendered component boundaries in Tasks 2–6 and across pt-BR/en-US in Task 8; do not add
tests or validation commands that inspect locale source text directly.

- [ ] **Step 2: Run tests and confirm RED**

```bash
npx vitest run src/components/landingPage/__tests__/section-wrapper.test.tsx
```

Expected: FAIL until the anchor offset exists.

- [ ] **Step 3: Centralize fixed-navbar anchor offset**

```tsx
<section id={id} className="scroll-mt-20">
  <div className={cn('flex-1 min-w-0 bg-background', className)}>{children}</div>
</section>
```

`HowItWorksStrip` and `IncludedFeaturesSection` already use `SectionWrapper`; do not duplicate the
offset in those components.

- [ ] **Step 4: Replace misleading metadata exactly**

```html
<title>ScrapJobs — Vagas recentes no seu WhatsApp</title>
<meta name="description" content="O ScrapJobs monitora páginas de carreira, encontra vagas compatíveis com seu perfil e envia as novidades no seu WhatsApp." />
<meta property="og:title" content="ScrapJobs — Vagas recentes no seu WhatsApp" />
<meta property="og:description" content="Receba vagas das empresas monitoradas, analise a compatibilidade com seu currículo e gere instruções para adaptá-lo em outra IA." />
<meta name="twitter:title" content="ScrapJobs — Vagas recentes no seu WhatsApp" />
<meta name="twitter:description" content="Receba vagas das empresas monitoradas, analise a compatibilidade com seu currículo e gere instruções para adaptá-lo em outra IA." />
```

Keep `twitter:card="summary"`, canonical URL, theme color and favicon. Do not add `og:image`.

- [ ] **Step 5: Verify keyboard and reduced-motion behavior**

Extend the dialog test with `userEvent`: focus the CTA, press Enter, assert the dialog is visible,
press Escape, and assert it closes. Then run:

```bash
npx vitest run src/components/landingPage
rg -n "prefers-reduced-motion" src/index.css
```

Expected: Vitest PASS and reduced-motion rule found. Truthful copy is verified through the rendered
component assertions from Tasks 2–6 and the integrated browser assertions from Task 8.

- [ ] **Step 6: Commit**

```bash
git add index.html src/components/landingPage/section-wrapper.tsx src/components/landingPage/__tests__/section-wrapper.test.tsx src/components/landingPage/__tests__/whatsapp-cta-button.test.tsx
git commit -m "test(landing): trava verdade e acessibilidade da copy"
```

### Task 8: Integrate and verify the landing end to end

**Files:**

- Modify: `e2e/landing.spec.ts`
- Verify: `src/pages/Landing.tsx` and all files changed in Tasks 1–7.

**Interfaces:**

- Consumes all previous contracts.
- Produces final order: navbar, hero, proof, WhatsApp steps, included resources, plans, FAQ,
  closing CTA, footer.

- [ ] **Step 1: Replace stale E2E fixtures**

```ts
await page.route('**/api/public/stats', (route) =>
  route.fulfill({ json: { monitored_sites: 101, total_jobs: 2840 } })
)
await page.route('**/api/public/sites/logos', (route) => route.fulfill({ json: [] }))
await page.route('**/api/plans', (route) =>
  route.fulfill({
    json: [
      {
        id: 2,
        name: 'Profissional',
        price: 19.9,
        max_sites: 40,
        max_ai_analyses: 20,
        is_trial: false,
        is_ultra: false,
        features: ['NÃO DEVE APARECER']
      },
      {
        id: 3,
        name: 'Ultra',
        price: 29.9,
        max_sites: 0,
        max_ai_analyses: 50,
        is_trial: false,
        is_ultra: true,
        features: ['NÃO DEVE APARECER']
      }
    ]
  })
)
```

- [ ] **Step 2: Write the final desktop journey test**

Assert the H1, seven chips, dynamic proof values, three-step heading, included-resources anchor,
both prices, six FAQ triggers and final CTA. Exercise all four navbar anchors and assert each target
is in the viewport. Assert `NÃO DEVE APARECER` and `Começar grátis` are absent.

- [ ] **Step 3: Preserve conversion-path coverage**

On desktop, click hero CTA, assert QR dialog, assert Web link has a configured number and ends in
`%23lpw`, close with Escape, then click `Assinar Profissional` and require `/signup?plan=2`.

- [ ] **Step 4: Add mobile and en-US coverage**

At viewport `390x844`, require H1 and CTA visible and:

```ts
expect(await page.evaluate(() => document.documentElement.scrollWidth))
  .toBe(await page.evaluate(() => document.documentElement.clientWidth))
```

For en-US, run before navigation:

```ts
await page.addInitScript(() => localStorage.setItem('i18n-lng', 'en-US'))
```

Assert `Get the latest jobs on your WhatsApp.`, `What's included`,
`Choose how much you want to monitor`, and `Get jobs on WhatsApp` without Portuguese fallback.

- [ ] **Step 5: Verify metadata in the browser**

```ts
await expect(page).toHaveTitle('ScrapJobs — Vagas recentes no seu WhatsApp')
await expect(page.locator('meta[name="description"]')).toHaveAttribute(
  'content',
  'O ScrapJobs monitora páginas de carreira, encontra vagas compatíveis com seu perfil e envia as novidades no seu WhatsApp.'
)
```

- [ ] **Step 6: Run the full verification matrix**

```bash
npm run lint
npm run test
npm run build
npx playwright test e2e/landing.spec.ts --project=chromium
git diff --check
git status --short
```

Expected: lint has zero errors, Vitest PASS, build exits 0, landing Playwright PASS,
`git diff --check` is empty, and status contains only intended changes plus preserved `AGENTS.md`.

- [ ] **Step 7: Perform final visual QA**

Inspect at `390x844` and `1440x900`: no horizontal overflow, clipped CTA, orphaned error state,
unreadable card order or low-contrast focus; verify dark mode and reduced motion. Copy changes during
QA require both locales and updated tests.

- [ ] **Step 8: Commit**

```bash
git add e2e/landing.spec.ts src/pages/Landing.tsx src/components/landingPage src/i18n/locales/pt-BR/landing.json src/i18n/locales/en-US/landing.json index.html Dockerfile src/lib/analytics.ts
git commit -m "test(landing): cobre jornada simplificada"
```

## Final Acceptance Checklist

- [ ] No text or metadata promises rewritten résumé or generated PDF.
- [ ] Hero uses the approved WhatsApp proposition and seven area chips.
- [ ] Hero has no price or free-trial CTA.
- [ ] Initial consultation and subscription boundary are explicit before pricing.
- [ ] Radar, selection, alerts, analysis, prompt, Norte and dashboard form one offer.
- [ ] Profissional and Ultra use API price and quota fields.
- [ ] WhatsApp/email is a channel choice, never simultaneous delivery.
- [ ] WhatsApp, QR, Web and plan paths work with exact analytics payloads.
- [ ] Missing WhatsApp config and plan failure have visible, tested states.
- [ ] pt-BR and en-US have identical landing key structure.
- [ ] Navbar, modal, FAQ and CTAs are keyboard-usable and focus-visible.
- [ ] Fresh unit, lint, build and landing E2E verification passes.
