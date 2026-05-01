# Dashboard & Kanban UX Improvements

**Date**: 2026-04-30
**Status**: Approved
**Origin**: Feedback da equipe de marketing

## Problema

1. Botao "Apliquei" no dashboard confunde users — parecem achar que o sistema fez a candidatura automaticamente.
2. Popup de "numero da entrevista" no kanban e ambiguo — users nao entendem se e um codigo, protocolo ou etapa.

## Mudancas

### 1. Botao "Apliquei" → "Me candidatei"

**Motivacao**: "Apliquei" em primeira pessoa sem contexto pode soar como acao automatica do sistema. "Me candidatei" deixa claro que e um registro manual feito pelo user.

**Escopo**:
- Label pt-BR: "Me candidatei" (i18n key: `applications:dashboard.applied`)
- Label en-US: "I applied" (sem mudanca)
- Icone: manter `ClipboardCheck`
- Comportamento: sem mudanca (registra candidatura manual)

**Arquivos impactados**:
- `src/i18n/locales/pt-BR/applications.json` — alterar valor de `dashboard.applied`

### 2. Botao "Ver vaga" — sem mudanca

O marketing sugeriu "Candidate-se" mas isso causaria o mesmo problema de confusao com automacao. "Ver vaga" e preciso: abre o link externo.

### 3. Popup de entrevista no Kanban → Seletor visual de etapa

**Motivacao**: "Qual e o numero da entrevista?" e ambiguo. Pode ser interpretado como protocolo, telefone, ou codigo. O que queremos saber e: 1a, 2a, ou 3a rodada?

**Design do novo dialog**:
- Titulo: "Em qual etapa voce esta?" (pt-BR) / "Which stage are you at?" (en-US)
- Conteudo: 4 botoes de selecao (radio-style) em grid 2x2:
  - "1a Entrevista"
  - "2a Entrevista"
  - "3a Entrevista"
  - "4a+ Entrevista" — ao selecionar, mostra input numerico para especificar (4, 5, 6...)
- Botao "Confirmar": habilitado apos selecionar uma opcao
- Botao "Cancelar": volta o card para a coluna anterior

**i18n strings novas/alteradas**:
```json
// pt-BR/applications.json
"kanban": {
  "interviewPrompt": "Em qual etapa voce esta?",
  "interviewStage1": "1a Entrevista",
  "interviewStage2": "2a Entrevista",
  "interviewStage3": "3a Entrevista",
  "interviewStage4Plus": "4a+ Entrevista",
  "interviewRoundPlaceholder": "Ex: 4, 5, 6..."
}

// en-US/applications.json
"kanban": {
  "interviewPrompt": "Which stage are you at?",
  "interviewStage1": "1st Interview",
  "interviewStage2": "2nd Interview",
  "interviewStage3": "3rd Interview",
  "interviewStage4Plus": "4th+ Interview",
  "interviewRoundPlaceholder": "E.g.: 4, 5, 6..."
}
```

**Componente impactado**: `src/components/applications/interview-round-dialog.tsx`
- Substituir `<input type="number">` por grid de botoes
- Manter logica de `applyStatusUpdate(appId, 'interview', round)`
- Output continua sendo um inteiro (1, 2, 3, N)

**Tambem impactado**: `src/components/common/application-status-dropdown.tsx`
- Mesmo dropdown inline que mostra input de round quando user seleciona "Entrevista"
- Aplicar mesma mudanca (seletor de etapa ao inves de input numerico)

## Fora de escopo

- Mudancas no backend (o campo `interview_round` continua como integer)
- Mudancas no botao "Ver vaga"
- Mudancas no layout do kanban/colunas

## Criterios de sucesso

- User entende imediatamente que "Me candidatei" e um registro manual
- User escolhe etapa de entrevista sem hesitar (1 clique vs digitar numero)
- Nenhuma regressao em funcionalidade existente
