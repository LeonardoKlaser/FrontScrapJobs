# LP Rollback: feat/merge-lps com ProblemSection da main

## Objetivo

Reverter o design da Landing Page para a versão de `feat/merge-lps`, mantendo apenas a ProblemSection ("A realidade de quem busca emprego hoje") como está na `main` — cards vermelhos com contadores animados (85%, 6h, 72%).

## Estrutura final da página

| # | Seção | Origem | Notas |
|---|-------|--------|-------|
| 1 | Navbar | **main** | Manter como está |
| 2 | HeroSection | feat/merge-lps | Shield icon, login prompt, CSS animations |
| 3 | **ProblemSection** | **main** | Cards vermelhos (85%/6h/72%), useCountUp, envolvida em SectionWrapper |
| 4 | ValueFeaturesSection | feat/merge-lps | Alternating layout com FeatureBlock, full mockups |
| 5 | HowItWorksSection | feat/merge-lps | 3 passos com conectores SVG |
| 6 | SocialProofSection | feat/merge-lps | Carrossel infinito de logos |
| 7 | StatsCounterSection | feat/merge-lps | Dark background, 2 métricas (sites monitorados + vagas) |
| 8 | SavingsCalculatorSection | feat/merge-lps | Calculadora interativa com input de salário |
| 9 | PricingSection | feat/merge-lps | Dentro de SectionWrapper |
| 10 | FaqSection | feat/merge-lps | 4 accordions em grid 2-col |
| 11 | CtaFinalSection | feat/merge-lps | CTA final com fundo emerald |
| 12 | Footer | feat/merge-lps | Com link de email de contato |

## O que sai da main atual

- **StickyCtaBar** — removida (feat/merge-lps não usa; CtaFinalSection cumpre papel de conversão)
- **TrustSection** — substituída por SocialProofSection (logos) + StatsCounterSection (métricas)

## Integração da ProblemSection da main

A ProblemSection da main precisa de adaptações mínimas para funcionar na estrutura de feat/merge-lps:

1. **Envolver em SectionWrapper** — adicionar o wrapper para manter sidebars decorativas e padding consistente com as demais seções
2. **Preservar useCountUp hook** — o arquivo `src/hooks/useCountUp.ts` precisa ser mantido no resultado final
3. **Manter lógica de animação** — framer-motion com useInView e stagger delays nos cards

## Estratégia de i18n

- Usar o `landing.json` de `feat/merge-lps` como base para ambos os locales (pt-BR e en-US)
- Preservar as chaves `problem.headline`, `problem.subheading`, `problem.pain1`, `problem.pain2`, `problem.pain3` da main
- Remover as chaves `problemSection.*` de feat/merge-lps (não serão mais usadas)
- Todas as novas chaves das seções adicionais (howItWorks, socialProof, statsCounter, savingsCalculator, faq, ctaFinal) vêm de feat/merge-lps

## Abordagem técnica: checkout seletivo

1. Trazer a `Landing.tsx` de feat/merge-lps (com as 12 seções)
2. Trazer todos os componentes novos e atualizados de feat/merge-lps:
   - `section-wrapper.tsx` (novo)
   - `hero-section.tsx` (atualizado)
   - `value-features-section.tsx` (atualizado)
   - `how-it-works-section.tsx` (novo)
   - `social-proof-section.tsx` (novo)
   - `stats-counter-section.tsx` (novo)
   - `savings-calculator-section.tsx` (novo)
   - `pricing-section.tsx` (atualizado)
   - `faq-section.tsx` (novo)
   - `cta-final-section.tsx` (novo)
   - `footer.tsx` (atualizado)
   - UI snippets atualizados (radar-notifications, ats-analysis-card, pdf-preview-card)
3. **NÃO** trazer `navbar.tsx` nem `problem-section.tsx` de feat/merge-lps — manter as versões da main
4. Adaptar a ProblemSection da main para usar SectionWrapper
5. Mesclar arquivos i18n conforme estratégia acima
6. Manter `useCountUp.ts` hook
7. Remover `sticky-cta-bar.tsx` e `trust-section.tsx` (não usados na estrutura final)

## O que NÃO muda

- Nenhuma funcionalidade nova será adicionada além do que existe em feat/merge-lps
- Nenhum componente será refatorado além do mínimo necessário para integração
- O hook useCountUp permanece como está
- Background color geral da LP segue o padrão de feat/merge-lps (`bg-emerald-100/30`)

## Riscos e mitigações

- **Conflitos de i18n**: mitigado usando feat/merge-lps como base e adicionando apenas as chaves `problem.*` da main
- **useCountUp ausente em feat/merge-lps**: mitigado mantendo explicitamente o arquivo do hook
- **SectionWrapper incompatível com ProblemSection**: adaptação simples — envolver o JSX existente no wrapper
