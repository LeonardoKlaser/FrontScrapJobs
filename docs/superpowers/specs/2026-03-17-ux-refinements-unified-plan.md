# Plano de Implementação Unificado — Refinamentos UX/UI

**Spec:** `docs/superpowers/specs/2026-03-17-ux-refinements-design.md`
**Fonte:** Síntese de 3 planos (code-architect, plan-agent, general-purpose) com os melhores elementos de cada.

---

## Dependência npm (instalar antes de iniciar)

```bash
cd FrontScrapJobs
npm install @tanstack/react-table@^8.21.3
```

Nenhum outro pacote é necessário. `lucide-react`, `react-hook-form`, `@tanstack/react-query` já estão no projecto.

---

## Grafo de Dependências

```
Fase 1 (independentes, parallelizáveis):
  1.1, 1.3, 2.1, 2.2, 2.5, 3.1, 4.1

Fase 2 (independente, toca routing):
  1.2 Guest Loader

Fase 3 (independentes, lógica frontend):
  2.4 Smart Default Tab
  4.2 Currículo na Análise IA

Fase 4 (backend primeiro, depois frontend):
  2.3 Editar Filtros   ← requer backend deployed/local

Fase 5 (maior mudança, fazer por último):
  3.2 Migração TanStack  ← depende de 3.1 estar feito
```

---

## Fase 1 — Quick Wins (7 tarefas, risco zero)

Todas independentes, podem ser feitas em qualquer ordem. Um commit no final da fase.

---

### 1.1 Logo Centrado no Mobile (Login)

**Ficheiro:** `src/pages/Login.tsx` (linhas 55-57)
**Complexidade:** S

O wrapper mobile já tem `flex items-center justify-center`. O problema pode ser que quando `showText` está activo, o Logo renderiza inline. Fix:

```tsx
// ANTES:
<div className="mb-8 flex items-center justify-center lg:hidden">
  <Logo size={80} showText />
</div>

// DEPOIS:
<div className="mb-8 flex flex-col items-center justify-center lg:hidden">
  <Logo size={80} showText />
</div>
```

**Verificação:** Dev tools → viewport 375px → logo + texto centrados horizontalmente.

---

### 1.3 Password Visibility Toggle (7 campos, 3 ficheiros)

**Complexidade:** M
**Padrão de referência:** `payment-form.tsx` linhas 58-59, 310-331

Para cada campo de password:
1. Adicionar state: `const [showX, setShowX] = useState(false)`
2. Mudar `type="password"` para `type={showX ? 'text' : 'password'}`
3. Adicionar `pr-10` ao className do Input
4. Adicionar botão toggle após o `<Input>`:

```tsx
<button
  type="button"
  onClick={() => setShowX(v => !v)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
>
  {showX ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</button>
```

**Ficheiro 1:** `src/components/forms/Auth.tsx`
- 1 campo: `password`
- Imports: adicionar `Eye, EyeOff` ao lucide-react, `useState` ao React
- **Nota:** Usa `{...register('password')}` do react-hook-form. O `type` pode ser definido separadamente depois do spread — JSX props posteriores sobrescrevem anteriores: `{...register('password')} type={showPassword ? 'text' : 'password'}`

**Ficheiro 2:** `src/pages/ResetPassword.tsx`
- 2 campos: `password`, `confirmPassword`
- 2 states: `showPassword`, `showConfirmPassword`

**Ficheiro 3:** `src/components/accountPage/security-section.tsx`
- 4 campos: `old_password`, `new_password`, `confirm_password`, `deletePassword`
- 4 states correspondentes
- Os 3 primeiros estão no form de mudança de senha, o 4º no dialog de eliminar conta (linha 191)
- Cada `<Input>` precisa ser wrappado num `<div className="relative">` se ainda não estiver

---

### 2.1 Limpar Busca (ListSites)

**Ficheiro:** `src/pages/ListSites.tsx`
**Complexidade:** S

Padrão já existe em `Home.tsx` linhas 376-387. Copiar:

```tsx
// Adicionar X ao import de lucide-react
// Adicionar pr-9 ao className do Input de pesquisa
// Após o </Input>, adicionar:
{searchTerm && (
  <button
    type="button"
    onClick={() => setSearchTerm('')}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    <X className="h-4 w-4" />
  </button>
)}
```

---

### 2.2 Texto de Slots

**Ficheiros:** `src/i18n/locales/pt-BR/sites.json`, `src/i18n/locales/en-US/sites.json`
**Complexidade:** S

```json
// pt-BR:
"freeSlots": "Monitoramentos disponíveis"  // era "Slots livres"
"slotsAvailable": "Monitoramentos disponíveis"  // era "Slots de empresas disponíveis"

// en-US:
"freeSlots": "Available monitors"
"slotsAvailable": "Available monitors"
```

---

### 2.5 Remover Botão Fechar do Footer do Modal

**Ficheiro:** `src/components/companyPopup.tsx`
**Complexidade:** S

- Remover o `<Button variant="outline">Fechar</Button>` no branch `isAlreadyRegistered` (linha ~146)
- Remover o `<Button variant="ghost">Cancelar</Button>` no branch `!isAlreadyRegistered` (linhas ~168-175)
- Manter apenas o X do Radix `DialogContent` no canto superior direito

---

### 3.1 Ordenação em 3 Estados

**Ficheiro:** `src/pages/Home.tsx`
**Complexidade:** S

```typescript
// Mudar tipo (linha ~95):
type SortDir = 'asc' | 'desc' | null

// Estado inicial (linha ~148):
const [sortDir, setSortDir] = useState<SortDir>(null)
const [sortField, setSortField] = useState<SortField | null>(null)

// handleSort (linhas 307-315):
const handleSort = (field: SortField) => {
  if (sortField !== field) {
    setSortField(field)
    setSortDir('asc')
  } else if (sortDir === 'asc') {
    setSortDir('desc')
  } else {
    setSortField(null)
    setSortDir(null)
  }
  setPage(1)
}

// sortedJobs useMemo — já tem guard `if (!sortField)` que cobre o caso null
// SortIcon — já retorna ArrowUpDown quando sortField !== field, o que cobre o estado limpo
```

---

### 4.1 Padding no Título do Drawer

**Ficheiro:** `src/components/applications/application-drawer.tsx` (linha 72)
**Complexidade:** S

```tsx
// ANTES:
<SheetTitle className="text-lg leading-tight">

// DEPOIS:
<SheetTitle className="text-lg leading-tight pr-8">
```

---

### Checkpoint Fase 1

- [ ] `npm run build` passa sem erros TS
- [ ] `npm run lint` passa
- [ ] Mobile (375px): logo centrado no Login
- [ ] 7 campos de password mostram toggle Eye/EyeOff
- [ ] ListSites: X aparece no input com texto, limpa ao clicar
- [ ] Texto "Monitoramentos disponíveis" nos stats e popup
- [ ] Popup da empresa: sem botão Fechar/Cancelar no footer
- [ ] Sorting do dashboard: asc → desc → limpo (ArrowUpDown)
- [ ] Drawer: título longo não sobrepõe o X

---

## Fase 2 — Guest Loader (risco baixo)

**Complexidade:** M

### 1.2 Guest Loader para Rotas Públicas

**Ficheiro novo:** `src/router/loaders/guestLoader.ts`

```typescript
import { redirect } from 'react-router'
import type { QueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'

export function guestLoader(queryClient: QueryClient) {
  return async () => {
    try {
      await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000
      })
      return redirect('/app')
    } catch {
      return null
    }
  }
}
```

**Ficheiro:** `src/router/routes.tsx`
- Import: `import { guestLoader } from './loaders/guestLoader'`
- Adicionar `loader: guestLoader(queryClient)` às rotas: `/login`, `forgot-password`, `reset-password`
- **NÃO** aplicar a `/checkout/:planId` (checkout deve ser acessível mesmo autenticado)

**Ficheiro:** `src/pages/Login.tsx`
- Remover `import { useUser } from '@/hooks/useUser'`
- Remover `const { data: user } = useUser()`
- Remover o `useEffect` de redirect (linhas ~14-16)
- Remover `useNavigate` se não for usado em mais lado nenhum (confirmar — no ficheiro actual só é usado no useEffect removido)

### Checkpoint Fase 2

- [ ] Visitar `/login` COM sessão → redirect imediato para `/app`, sem 401 no network tab
- [ ] Visitar `/login` SEM sessão → form carrega normalmente
- [ ] Visitar `/forgot-password` com sessão → redirect para `/app`
- [ ] Login normal continua a funcionar (credenciais → dashboard)

---

## Fase 3 — Lógica Frontend (risco baixo)

### 2.4 Smart Default Tab

**Ficheiro:** `src/pages/ListSites.tsx`
**Complexidade:** S

```typescript
// Adicionar useRef ao import
const hasAutoSelected = useRef(false)

useEffect(() => {
  if (!hasAutoSelected.current && data && data.some(c => c.is_subscribed)) {
    setFilter('subscribed')
    hasAutoSelected.current = true
  }
}, [data])
```

O `useRef` garante que o auto-select só acontece uma vez — depois disso, o user controla livremente.

### 4.2 Currículo na Análise IA

**Ficheiro:** `src/components/analysis/analysis-dialog.tsx`
**Complexidade:** M

**Passo 1:** Adicionar `curriculumId?: number` às props de `AnalysisResult`:

```typescript
interface AnalysisResultProps {
  analysis: ResumeAnalysis
  jobId: number
  curriculumId?: number
}
```

**Passo 2:** Dentro de `AnalysisResult`, resolver o nome do cache:

```typescript
const { data: curricula } = useCurriculum({ enabled: false }) // lê do cache
const curriculumName = curricula?.find(c => c.id === curriculumId)?.title
```

**Passo 3:** Renderizar antes do score card (~linha 116):

```tsx
{curriculumName && (
  <p className="text-xs text-muted-foreground mb-2">
    {t('analysis.curriculumUsed')}: <span className="font-medium text-foreground">{curriculumName}</span>
  </p>
)}
```

**Passo 4:** Passar `curriculumId` nos dois caminhos do componente pai:
- History: `<AnalysisResult ... curriculumId={historyData?.curriculum_id} />`
- Nova análise: `<AnalysisResult ... curriculumId={selectedCvId ?? undefined} />`

**Passo 5:** i18n — adicionar `"curriculumUsed": "Currículo utilizado"` ao ficheiro de tradução (verificar se fica no namespace `analysis` ou `sites`).

**Fallback:** Se o currículo foi eliminado, `curriculumName` será `undefined` e o label não aparece. Opcionalmente mostrar `"Currículo #ID"`.

### Checkpoint Fase 3

- [ ] ListSites com empresas inscritas → abre na tab "Inscritas"
- [ ] ListSites sem inscrições → abre na tab "Todas"
- [ ] Mudar tab manualmente → não é sobrescrito pelo auto-select
- [ ] Análise IA (histórico) → mostra "Currículo utilizado: [nome]"
- [ ] Nova análise → mostra nome do CV selecionado no resultado

---

## Fase 4 — Backend + Editar Filtros (risco médio)

**Complexidade:** L
**Requer:** Deploy/run local do backend antes de testar o frontend

### 4a. Backend: Novo método no repositório

**Ficheiro:** `ScrapJobs/repository/user_site_repository.go`

**NÃO modificar** `GetSubscribedSiteIDs` — é usado pelo pipeline de tasks. Criar método novo:

```go
func (dep *UserSiteRepository) GetSubscribedSiteFilters(userId int) (map[int][]string, error) {
    query := `SELECT site_id, filters FROM user_sites WHERE user_id = $1`
    rows, err := dep.connection.Query(query, userId)
    if err != nil {
        return nil, fmt.Errorf("error querying subscribed site filters: %w", err)
    }
    defer rows.Close()

    result := make(map[int][]string)
    for rows.Next() {
        var siteId int
        var filtersJSON sql.NullString
        if err := rows.Scan(&siteId, &filtersJSON); err != nil {
            return nil, err
        }
        var words []string
        if filtersJSON.Valid && filtersJSON.String != "" {
            if err := json.Unmarshal([]byte(filtersJSON.String), &words); err != nil {
                return nil, fmt.Errorf("error unmarshalling filters for site %d: %w", siteId, err)
            }
        }
        result[siteId] = words
    }
    return result, rows.Err()
}
```

### 4b. Backend: Actualizar controller

**Ficheiro:** `ScrapJobs/controller/site_career_controller.go`

```go
// Expandir siteDTO:
type siteDTO struct {
    SiteName     string   `json:"site_name"`
    BaseURL      string   `json:"base_url"`
    SiteId       int      `json:"site_id"`
    LogoURL      *string  `json:"logo_url"`
    IsSubscribed bool     `json:"is_subscribed"`
    TargetWords  []string `json:"target_words,omitempty"`
}

// Substituir GetSubscribedSiteIDs por GetSubscribedSiteFilters:
userSiteFilters, err := usecase.userSiteRepository.GetSubscribedSiteFilters(user.Id)

// No loop de construção do response:
if filters, ok := userSiteFilters[site.ID]; ok {
    newResponse.IsSubscribed = true
    newResponse.TargetWords = filters
}
```

### 4c. Backend: Actualizar interface + mock

- `interfaces/user_site_interface.go`: adicionar `GetSubscribedSiteFilters(userId int) (map[int][]string, error)`
- `repository/mocks/user_site_repository.go`: adicionar mock correspondente

### 4d. Frontend: Model

**Ficheiro:** `src/models/siteCareer.ts`

```typescript
export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string
  is_subscribed: boolean
  target_words?: string[]  // NEW
}
```

### 4e. Frontend: Service

**Ficheiro:** `src/services/siteCareerService.ts`

```typescript
updateUserSiteFilters: async (siteId: number, targetWords: string[]): Promise<void> => {
  await api.patch(`/userSite/${siteId}`, { target_words: targetWords })
}
```

### 4f. Frontend: Hook

**Ficheiro:** `src/hooks/useRegisterUserSite.ts`

```typescript
export function useUpdateUserSiteFilters() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ siteId, targetWords }: { siteId: number; targetWords: string[] }) =>
      siteCareerService.updateUserSiteFilters(siteId, targetWords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}
```

### 4g. Frontend: Modal rework (companyPopup.tsx)

**Novas props:**
- `currentTargetWords?: string[]`
- `onUpdateFilters: (targetWords: string[]) => void`
- `isUpdatingFilters?: boolean`

**Estado interno para o modo edição:**

```typescript
const [editKeywords, setEditKeywords] = useState<string[]>([])
const [keywordInput, setKeywordInput] = useState('')

useEffect(() => {
  if (isOpen) {
    setEditKeywords(currentTargetWords ?? [])
    setKeywordInput('')
  }
}, [isOpen, currentTargetWords])
```

**UI quando `isAlreadyRegistered`:**
1. Label "Palavras-chave para alertas"
2. Keywords actuais como badges removíveis (X em cada badge remove do `editKeywords`)
3. Input + botão "Adicionar" para novas keywords
4. Botão "Salvar alterações" (primário) → chama `onUpdateFilters(editKeywords)`
5. Botão "Desvincular" (destructive) → mantém `handleUnregister`

### 4h. Frontend: ListSites.tsx

- Importar `useUpdateUserSiteFilters`
- Adicionar mutation + handler `handleUpdateFilters`
- Passar `currentTargetWords={selectedCompany?.target_words}` ao modal

### i18n (pt-BR/sites.json):

```json
"saveFilters": "Salvar alterações",
"addKeyword": "Adicionar",
"keywordsEdit": "Palavras-chave para alertas",
"removeKeyword": "Remover"
```

### Checkpoint Fase 4

- [ ] Backend: `go test ./...` passa
- [ ] Backend: `GET /api/getSites` retorna `target_words` para sites inscritos
- [ ] Frontend: `npm run build` passa
- [ ] Clicar empresa inscrita → ver keywords como badges removíveis
- [ ] Remover badge → keyword desaparece
- [ ] Adicionar nova keyword → aparece como badge
- [ ] "Salvar alterações" → PATCH sucesso → query invalidada → modal fecha
- [ ] Empresa sem keywords → mostra estado vazio com prompt para adicionar
- [ ] "Desvincular" continua a funcionar

### Rollback

- Backend e frontend são repos separados, revert independente
- A mudança do backend é aditiva (`target_words` extra no JSON) — frontend antigo ignora o campo
- Se `GetSubscribedSiteFilters` tiver bug, reverter apenas o controller para `GetSubscribedSiteIDs` (uma linha)
- Deploy: **backend primeiro**, depois frontend

---

## Fase 5 — Migração TanStack React Table (risco alto)

**Complexidade:** XL
**Pré-requisito:** Fase 1 step 3.1 (3-state sort) deve estar feito

### Estratégia

A abordagem mais segura: TanStack é usado **apenas para rendering + resize**. Toda a lógica existente de sorting, filtering, e paginação fica no componente `Home` como está. O TanStack recebe `paginatedJobs` já filtrado/ordenado/paginado.

### 5a. Imports

```typescript
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef
} from '@tanstack/react-table'
```

### 5b. Column Definitions

Definir dentro do componente `Home` (para acesso a `t`, `handleSort`, `handleApply`, etc.):

| Coluna | size | minSize | Sortable | Resizable |
|--------|------|---------|----------|-----------|
| Title | 300 | 120 | Sim | Sim |
| Company | 160 | 80 | Sim | Sim |
| Location | 140 | 80 | Sim | Sim |
| Link | 100 | 60 | Não | Não |
| Actions | 180 | 140 | Não | Não |

Headers sortáveis usam `onClick={() => handleSort(field)}` + `SortIcon` existente.
Células preservam exactamente o JSX actual (badges, truncate, links, dropdowns).

### 5c. Table Instance

```typescript
const table = useReactTable({
  data: paginatedJobs,
  columns,
  getCoreRowModel: getCoreRowModel(),
  columnResizeMode: 'onChange',
  enableColumnResizing: true,
})
```

**NÃO usar** `getSortedRowModel` nem `getFilteredRowModel` do TanStack — a lógica manual existente é mantida.

### 5d. Desktop Table JSX

Substituir apenas o bloco `<div className="hidden sm:block ..."><Table>...</Table></div>` (linhas ~586-703):

```tsx
<div className="hidden sm:block overflow-x-auto rounded-lg border border-border/50">
  <table className="text-sm w-full" style={{ width: table.getTotalSize() }}>
    <thead className="bg-muted/40">
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th
              key={header.id}
              className="relative font-medium px-4 py-3 text-left"
              style={{ width: header.getSize() }}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanResize() && (
                <div
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize
                             bg-border/50 opacity-0 hover:opacity-100 select-none touch-none"
                />
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id} className="group/row hover:bg-muted/30 border-t border-border/20">
          {row.getVisibleCells().map(cell => (
            <td
              key={cell.id}
              className="px-4 py-2.5"
              style={{ width: cell.column.getSize() }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 5e. O que NÃO mudar

- Layout mobile (cards) — `sm:hidden` block intocado
- `sortField`, `sortDir`, `handleSort`, `SortIcon` — mantidos como estão
- `searchInput`, `debouncedSearch`, `days`, `matchedOnly`, filtros — intocados
- Paginação — intocada, continua a operar sobre `paginatedJobs`
- `AnalysisDialog`, `ApplicationStatusDropdown`, drawer — mantidos como estão
- Remover `max-w-0` das células TanStack (o width vem do column size)

### Checkpoint Fase 5

- [ ] `npm run build` passa
- [ ] `npm run lint` passa
- [ ] Desktop: tabela renderiza com 5 colunas correctas
- [ ] Arrastar bordas de colunas → resize funciona
- [ ] Sort: 3 estados em Title, Company, Location
- [ ] Busca, filtro por período, localização, empresa — todos funcionam
- [ ] Paginação funciona
- [ ] "Analyser" → dialog abre, análise funciona
- [ ] "Me candidatei" → cria candidatura
- [ ] Status dropdown → muda estado
- [ ] Link externo → abre em nova tab
- [ ] Mobile (375px) → layout de cards, sem tabela visível
- [ ] Resize window mobile↔desktop → transição correcta

### Rollback

Se algo não funcionar, reverter este único commit. Todos os outros 12 improvements permanecem intactos.

---

## Resumo de Ficheiros

### Criar (2 ficheiros)

| Ficheiro | Fase | Propósito |
|----------|------|-----------|
| `FrontScrapJobs/src/router/loaders/guestLoader.ts` | 2 | Redirect autenticados das rotas públicas |

### Modificar — Frontend (14 ficheiros)

| Ficheiro | Fases | Mudanças |
|----------|-------|---------|
| `src/pages/Login.tsx` | 1, 2 | Logo centering, remover useUser/useEffect |
| `src/components/forms/Auth.tsx` | 1 | Password toggle (1 campo) |
| `src/pages/ResetPassword.tsx` | 1 | Password toggle (2 campos) |
| `src/components/accountPage/security-section.tsx` | 1 | Password toggle (4 campos) |
| `src/pages/ListSites.tsx` | 1, 3, 4 | Clear search, smart tab, wire update filters |
| `src/components/companyPopup.tsx` | 1, 4 | Remove footer buttons, add edit-filters UI |
| `src/pages/Home.tsx` | 1, 5 | 3-state sort, TanStack table migration |
| `src/components/analysis/analysis-dialog.tsx` | 3 | Curriculum name display |
| `src/components/applications/application-drawer.tsx` | 1 | SheetTitle pr-8 |
| `src/router/routes.tsx` | 2 | Apply guestLoader |
| `src/models/siteCareer.ts` | 4 | Add target_words field |
| `src/services/siteCareerService.ts` | 4 | Add updateUserSiteFilters method |
| `src/hooks/useRegisterUserSite.ts` | 4 | Add useUpdateUserSiteFilters hook |
| `src/i18n/locales/pt-BR/sites.json` | 1, 3, 4 | Text changes + new keys |
| `src/i18n/locales/en-US/sites.json` | 1, 3, 4 | Mirror pt-BR |

### Modificar — Backend (3 ficheiros)

| Ficheiro | Fase | Mudanças |
|----------|------|---------|
| `ScrapJobs/repository/user_site_repository.go` | 4 | Add GetSubscribedSiteFilters method |
| `ScrapJobs/controller/site_career_controller.go` | 4 | Expand siteDTO, use new method |
| `ScrapJobs/interfaces/user_site_interface.go` | 4 | Add method to interface |

---

## Notas Críticas

1. **Prettier:** Sem semicolons, aspas simples, sem trailing commas, indent 2 espaços, 100 chars. Correr `npm run lint:fix` antes de commitar.

2. **UI text em Português.** Nunca hardcodar strings — usar `t()` e adicionar ao `pt-BR/*.json`.

3. **`react-hook-form` + type override.** `{...register('password')} type={showX ? 'text' : 'password'}` funciona porque JSX props posteriores sobrescrevem anteriores.

4. **`type="button"` nos toggles.** Essencial para evitar submit do form ao clicar no olhinho.

5. **`GetSubscribedSiteIDs` NÃO modificar.** É usado pelo pipeline de tasks. Criar método novo `GetSubscribedSiteFilters`.

6. **TanStack sorting manual.** NÃO usar `column.toggleSorting()` do TanStack. Manter o `handleSort` customizado com ciclo de 3 estados.

7. **Deploy order para Fase 4:** Backend primeiro, depois frontend. A mudança backend é aditiva (campo extra no JSON).
