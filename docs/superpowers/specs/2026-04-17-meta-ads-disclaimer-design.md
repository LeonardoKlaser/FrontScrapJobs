# Disclaimer Legal de Marcas na LP — Resposta ao Aviso da Meta Ads

**Data:** 2026-04-17
**Status:** Aprovado
**Escopo:** Adicionar disclaimer de uso nominativo de marcas na landing page pública

---

## Problema

A Meta Ads pausou anúncios do ScrapJobs alegando:

1. **Uso não autorizado de propriedade intelectual** — logos e nomes de empresas (Nubank, Mercado Livre, Itaú, Gupy, iFood etc.) aparecem na LP e nos vídeos de anúncio.
2. **Promoção de produtos de origem duvidosa** — falso positivo clássico para SaaS: o bot da Meta cruzou "logos de marcas grandes + oferta de baixo valor (R$ 9,90)" e classificou como falsificação/fraude.

A conta não foi restrita (apenas os anúncios foram rejeitados e pausados). Há prazo de **48h para contestação** a partir do recebimento (2026-04-17).

O ScrapJobs é uma ferramenta SaaS que monitora páginas públicas de carreiras — o uso dos nomes/logos é **nominativo** (identificação factual), não sugere afiliação. Porém, a LP atual não deixa isso explícito em lugar algum.

## Objetivo

Adicionar disclaimer jurídico claro e contextual em 3 pontos da LP pública para:

1. Fornecer base defensiva para a contestação à Meta.
2. Sinalizar ao bot automatizado da Meta (que escaneia DOM + frames de vídeo) que a presença de marcas é de natureza identificadora, não promocional.
3. Proteger a marca ScrapJobs contra acusações futuras de uso indevido de IP.

Fora de escopo: edição dos vídeos de anúncio (responsabilidade do editor); Plano B (substituição de marcas reais por fictícias) — só se a contestação for negada.

## Decisões de Design

### Abordagem: inline direto nos 3 componentes

- Sem componente compartilhado `<LegalDisclaimer>` — abstração prematura para 3 usos de textos diferentes em contextos visuais distintos.
- Padrão consistente com o resto da LP: `useTranslation('landing')` + `t(key)` inline em JSX.
- 3 chaves i18n novas, traduzidas em PT-BR e EN-US.

### Placement: rodapé + inline

Rodapé sozinho não basta: o bot da Meta pode ler frames/DOM de uma seção isolada sem cruzar com o rodapé. Disclaimer inline próximo das marcas garante contexto semântico imediato.

### Cópias (3 variantes por contexto)

| Local | Texto PT-BR | Função |
|---|---|---|
| `footer.disclaimer` | "As marcas, logotipos e nomes de empresas exibidos pertencem aos seus respectivos proprietários e são usados apenas para identificação. O ScrapJobs não possui afiliação, patrocínio ou endosso dessas empresas." | Cobertura jurídica completa, visível em todas as páginas que usam o Footer da LP |
| `trust.disclaimer` | "Logos exibidos são marcas registradas de seus respectivos proprietários. Monitoramos páginas públicas de carreiras — sem afiliação oficial." | Contextualiza o carrossel de logos: esclarece que são alvos de monitoramento, não parceiros |
| `valueFeatures.radar.mockDisclaimer` | "Exemplos ilustrativos. Marcas pertencem a seus proprietários." | Sinaliza explicitamente que os cards de notificação são mockups — bloqueia a leitura do bot como "oferta real de produto" |

Versões EN-US equivalentes serão traduzidas mantendo a mesma semântica.

## Arquitetura

Zero mudança estrutural. Apenas 3 adições de JSX com `t()` + 6 chaves de i18n (3 por locale).

## Componentes Tocados

### 1. `src/components/landingPage/footer.tsx`

Adicionar bloco de disclaimer abaixo da linha atual (Logo + Termos/Privacidade + Copyright).

- Tipografia: `text-xs text-zinc-400`
- Layout: centralizado, `max-w-3xl mx-auto`
- Separador visual: `mt-6 pt-4 border-t border-zinc-100`
- Wrapping: flexível, leading relaxado (`leading-relaxed`)

### 2. `src/components/landingPage/trust-section.tsx`

Adicionar `<p>` de caption dentro do bloco `{hasLogos && (...)}`, logo após o carrossel de logos (antes dos stats).

- Tipografia: `text-xs text-zinc-500 text-center`
- Spacing: `mt-4`
- Visível mas sem competir com o `trust.overline` acima ou os stats abaixo.

### 3. `src/components/landingPage/ui-snippets/radar-notifications.tsx`

Adicionar `<p>` pequeno, dentro do bloco `{!compact && (...)}`, **como último filho** (após o source badge "Fonte verificada"). Essa ordem cria uma progressão visual: cards-mock → badge de fonte → nota de que os exemplos são ilustrativos.

- Tipografia: `text-[0.65rem] text-zinc-400 italic text-center`
- Spacing: `mt-1`
- Modo `compact`: não renderizar (cards vêm cortados em compact mode — consistente com o source badge que também só aparece quando `!compact`).
- **Acessibilidade**: o container externo já tem `aria-hidden="true"` (decorativo). A nota visível permanece dentro desse container — ela é para usuários visuais e para o scanner da Meta que lê renders/screenshots, não para screen readers (que corretamente ignoram o bloco inteiro como decorativo).

## i18n

Adicionar 3 chaves em cada um dos 2 locales:

**`src/i18n/locales/pt-BR/landing.json`**
- `footer.disclaimer`: conforme tabela acima
- `trust.disclaimer`: conforme tabela acima
- `valueFeatures.radar.mockDisclaimer`: conforme tabela acima

**`src/i18n/locales/en-US/landing.json`**
- `footer.disclaimer`: "The brands, logos, and company names displayed belong to their respective owners and are used for identification purposes only. ScrapJobs has no affiliation, sponsorship, or endorsement from these companies."
- `trust.disclaimer`: "Logos displayed are registered trademarks of their respective owners. We monitor public career pages — no official affiliation."
- `valueFeatures.radar.mockDisclaimer`: "Illustrative examples. Trademarks belong to their owners."

## Testes

- Sem mudança estrutural no comportamento → testes existentes (E2E Playwright, Storybook) não quebram.
- Adicionar teste E2E de presença do disclaimer é **opcional** e fora de escopo deste PR (YAGNI). Se a Meta pedir prova de permanência do disclaimer no futuro, adicionamos.
- Stories de Storybook: `footer` não tem story dedicado; `trust-section` e `radar-notifications` não são expostos diretamente em stories atualmente — nenhum ajuste necessário.

## Rollback

Trivial: reverter o commit (remove 3 adições JSX + 6 chaves i18n). Sem dependências externas.

## Riscos

1. **O disclaimer pode não ser suficiente para a Meta aprovar a contestação.**
   Mitigação: manter Plano B pronto (substituir Nubank/iFood/Mercado Livre por marcas fictícias na `radar-notifications.tsx`). Decidir só se a contestação for negada.

2. **Logos da `trust-section` vêm da API (`usePublicSiteLogos`).**
   Se amanhã a API retornar uma lista diferente, o disclaimer continua válido (é genérico — "logos exibidos"). Sem acoplamento.

3. **A Meta pode flagar de novo mesmo com o disclaimer.**
   A defesa principal é legal (nominative fair use) + textual na contestação. O disclaimer reforça, não substitui a justificativa técnica enviada no formulário de revisão.

## Plano de Execução

Passar para `superpowers:writing-plans` após aprovação deste spec pelo usuário.
