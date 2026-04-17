# Navbar Mobile: Fix Spacing + Scroll State

## Objetivo

Corrigir a navbar no mobile que está sobrepondo o conteúdo da hero section e implementar transição visual ao scroll: fundo verde, botão branco, logotipo ScrapJobs 01.

## Problemas atuais

1. No mobile, a navbar fixed (`fixed top-0`) fica por cima do texto da hero section — falta padding-top compensatório
2. Ao scroll, a navbar fica branca (`bg-white/80`) — deveria ficar verde (`bg-emerald-600`)
3. O botão CTA mantém `variant="glow"` ao scroll — verde sobre verde não funciona
4. O logo (favicon + texto escuro) não muda ao scroll — deveria trocar para `Logotipo ScrapJobs 01.png`

## Design

### Dois estados da navbar

**Estado 1: Topo (scrollY <= 50)**
- Fundo: transparente (como está hoje)
- Logo: `<Logo>` component (favicon + "ScrapJobs" em texto escuro)
- Botão: `variant="glow"` (verde com glow)
- Sem mudanças neste estado

**Estado 2: Scrolled (scrollY > 50)**
- Fundo: `bg-emerald-600` com `shadow-md` (verde sólido)
- Logo: asset `src/assets/Logotipo ScrapJobs 01.png` (lupa verde + "ScrapJobs" branco) — funciona sobre fundo verde
- Botão: `bg-white text-emerald-700` com `hover:bg-white/90` (branco)
- Transição suave via `transition-all duration-300` (já existe)

### Fix de espaçamento no mobile

A HeroSection precisa de padding-top extra no mobile para compensar a altura da navbar fixed (~56px). Adicionar `pt-16` (64px) no mobile ao container da HeroSection, mantendo o `pt-8 lg:pt-12` atual para desktop (que já tem espaço suficiente).

## Arquivos impactados

- `src/components/landingPage/navbar.tsx` — trocar classes e logo no estado scrolled
- `src/components/landingPage/hero-section.tsx` — adicionar padding-top no mobile

## Abordagem técnica

Usar o state `scrolled` já existente no navbar.tsx para conditional rendering:
- Classes do `<nav>`: swap de bg/shadow/border
- Logo: `{scrolled ? <img src={logotipo01} /> : <Logo ... />}`
- Botão: classes condicionais no `className` ou swap de `variant`

Nenhum hook, componente ou listener novo necessário.

## O que NÃO muda

- Comportamento do scroll listener (threshold 50px)
- Layout da navbar (flex, max-w-7xl, padding lateral)
- Funcionalidade do botão CTA (scroll to pricing)
- Navbar no desktop (mesma lógica se aplica)
