# Plano Unificado — Correcao de 34 Issues do Code Review Completo

**Fonte:** Sintese de 3 planos (code-architect, plan-agent, general-purpose)
**Estimativa total:** 14-20 horas

---

## Grafo de Dependencias

```
Fase 1 (Criticos) — sem deps, parallelizaveis
  -> Fase 2 (Seguranca) — independente da Fase 1
  -> Fase 3 (Backend Quality) — #16 interfaces prerequisito para #30 testes
  -> Fase 4 (Frontend) — parallelizavel com Fase 3
  -> Fase 5 (i18n) — independente
  -> Fase 6 (Testes) — depende de #16 e #31
```

---

## Fase 1 — Criticos (Backend) [~2h]

### 1.1 `/metrics` auth bypass quando METRICS_TOKEN nao esta definido
**Ficheiro:** `ScrapJobs/cmd/api/main.go:401-411`
**Complexidade:** S

Inverter a logica: quando `metricsToken == ""`, retornar 403 (fail-closed).

```go
server.GET("/metrics", func(c *gin.Context) {
    if metricsToken == "" {
        c.AbortWithStatus(http.StatusForbidden)
        return
    }
    auth := c.GetHeader("Authorization")
    if auth != "Bearer "+metricsToken {
        c.AbortWithStatus(http.StatusForbidden)
        return
    }
    gin.WrapH(promhttp.Handler())(c)
})
```

**Gotcha:** Se Prometheus esta deployado sem `METRICS_TOKEN`, vai comecar a falhar. Configurar a env var primeiro.

---

### 1.2 `UpdateEmailConfig` — wrong context key + type assertion
**Ficheiro:** `ScrapJobs/controller/email_config_controller.go:41,75`
**Complexidade:** S

```go
// Linha 41: ctx.Get("userId") -> ctx.Get("user")
userInterface, exists := ctx.Get("user")
if !exists {
    ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario nao autenticado"})
    return
}
user, ok := userInterface.(model.User)
if !ok {
    ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Tipo de usuario invalido"})
    return
}

// Linha 75: userID.(int) -> user.Id
uid := user.Id
```

---

### 1.3 `GetUserById` — sem tratamento de `sql.ErrNoRows`
**Ficheiro:** `ScrapJobs/repository/user_repository.go:163`
**Complexidade:** S

```go
if err != nil {
    if errors.Is(err, sql.ErrNoRows) {
        return model.User{}, nil
    }
    return model.User{}, fmt.Errorf("error to get user from database: %w", err)
}
```

Adicionar `"errors"` ao import se nao existir.

---

### 1.4 Digest email antes de marcar status — emails duplicados
**Ficheiro:** `ScrapJobs/usecase/notifications_usecase.go:122-128`
**Complexidade:** M

Marcar como SENT primeiro, enviar email, reverter se falhar:

```go
if err := s.notificationRepository.BulkUpdateNotificationStatus(userID, jobIDs, "SENT"); err != nil {
    return fmt.Errorf("error marking notifications as SENT for user %d: %w", userID, err)
}
if err := s.emailService.SendNewJobsEmail(ctx, userEmail, userName, jobs); err != nil {
    if rbErr := s.notificationRepository.BulkUpdateNotificationStatus(userID, jobIDs, "PENDING"); rbErr != nil {
        logging.Logger.Error().Err(rbErr).Int("user_id", userID).Msg("Failed to rollback notification status")
    }
    return fmt.Errorf("error sending digest email for user %d: %w", userID, err)
}
```

### 1.5 Webhook secret — comparacao non-constant-time
**Ficheiro:** `ScrapJobs/utils/webhook_utils.go:27`
**Complexidade:** S

```go
// ANTES: if webhookSecret != expectedSecret {
// DEPOIS:
if !hmac.Equal([]byte(webhookSecret), []byte(expectedSecret)) {
```

### Checkpoint Fase 1
- `go build ./...`
- `go test ./...`
- curl `/metrics` sem token -> 403
- PUT `/api/admin/email-config` como admin -> 200

---

## Fase 2 — Seguranca (Backend) [~2h]

### 2.1 Erros internos vazados em responses de API
**Ficheiros:** Multiplos controllers
**Complexidade:** M

Pattern para cada controller: substituir `err.Error()` por mensagem generica + log server-side:

```go
logging.Logger.Error().Err(err).Msg("contexto do erro")
ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Mensagem generica em portugues"})
```

**Ficheiros a alterar:**
- `user_controller.go:53,91` — "Erro ao processar requisicao"
- `site_career_controller.go:62,67,142` — "Erro ao buscar/cadastrar sites"
- `notification_controller.go:55` — "Erro ao buscar notificacoes"
- `dashboardDataController.go:47,87` — "Erro ao buscar dados"
- `admin_dashboard_controller.go:32` — "Erro ao buscar dados administrativos"
- `user_site_controller.go:98,153` — "Erro ao processar inscricao"

---

### 2.2 File upload — validacao de content-type por MIME sniffing
**Ficheiro:** `ScrapJobs/infra/s3/s3_uploader.go:41-45`
**Complexidade:** S

Apos abrir o ficheiro, ler os primeiros 512 bytes e usar `http.DetectContentType`:

```go
buf := make([]byte, 512)
n, _ := src.Read(buf)
detectedType := http.DetectContentType(buf[:n])
allowedMIMEs := map[string]bool{
    "image/png": true, "image/jpeg": true, "image/webp": true,
}
if !allowedMIMEs[detectedType] {
    return "", fmt.Errorf("tipo de conteudo nao permitido: %s", detectedType)
}
// Reset reader
if seeker, ok := src.(io.ReadSeeker); ok {
    seeker.Seek(0, io.SeekStart)
}
```

**Nota:** Considerar bloquear SVG uploads (vector XSS).

---

### 2.3 Rate limiter — logging quando Redis indisponivel
**Ficheiro:** `ScrapJobs/middleware/redis_rate_limiter.go:40-44`
**Complexidade:** S

Manter fail-open (decisao architectural) mas adicionar log:

```go
if err != nil {
    logging.Logger.Warn().Err(err).Str("limiter", limiterName).Msg("Redis rate limiter unavailable")
    c.Next()
    return
}
```

---

### 2.4 JWT cookie — SameSite=Strict
**Ficheiro:** `ScrapJobs/controller/user_controller.go:130,152`
**Complexidade:** S

```go
ctx.SetSameSite(http.SameSiteStrictMode)
```

Alterar nos dois locais (SignIn e Logout).

**Gotcha:** Links de email para o app vao requerer re-login. `authLoader` trata isto com redirect.

### Checkpoint Fase 2
- `go build ./...` && `go test ./...`
- Login com credenciais erradas -> response sem detalhes Postgres
- Upload de ficheiro `.png` com conteudo texto -> rejeitado

---

## Fase 3 — Backend Quality [~2h]

### 3.1 `GetAllSites` retorna 400 para erros de DB
**Ficheiro:** `ScrapJobs/controller/site_career_controller.go:62,67`
**Complexidade:** S

Mudar `http.StatusBadRequest` para `http.StatusInternalServerError` + remover `err.Error()`.

---

### 3.2 `InsertUserSite` — diferenciar erros de plano vs DB
**Ficheiro:** `ScrapJobs/controller/user_site_controller.go:55-59`
**Complexidade:** S

```go
if err != nil {
    if strings.Contains(err.Error(), "limite") || strings.Contains(err.Error(), "max sites") {
        ctx.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
        return
    }
    logging.Logger.Error().Err(err).Msg("Erro ao inscrever usuario no site")
    ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao inscrever usuario no site"})
    return
}
```

---

### 3.3 Controllers com tipos concretos -> interfaces
**Ficheiros:** `controller/site_career_controller.go:18`, `controller/admin_dashboard_controller.go:10`
**Complexidade:** M

1. Criar `interfaces/dashboard_interface.go` se nao existir
2. Mudar `*repository.UserSiteRepository` para `interfaces.UserSiteRepositoryInterface`
3. Mudar `*repository.DashboardRepository` para interface
4. Actualizar construtores em `main.go`

---

### 3.4 Worker pool — override parcial
**Ficheiro:** `ScrapJobs/cmd/worker/main.go:71-77`
**Complexidade:** S

Adicionar `dbConnection.SetConnMaxLifetime(5 * time.Minute)` apos a linha 77.

---

### 3.5 Password min length — unificar para 8
**Ficheiro:** `ScrapJobs/model/dto.go:32`
**Complexidade:** S

Mudar `min=6` para `min=8` em `SignUpRequest.Password`.

---

### 3.6 ResumeAnalysis camelCase — NAO ALTERAR, documentar
**Ficheiro:** `ScrapJobs/model/matchAnalysis.go`
**Complexidade:** S

Adicionar comentario explicativo. O camelCase e intencional porque corresponde ao formato do OpenAI. Frontend ja usa estes nomes. Alterar quebraria ambos.

```go
// NOTE: JSON tags use camelCase to match OpenAI structured response format.
// This is an intentional exception to the project's snake_case convention.
```

---

### 3.7 Swagger doc errado
**Ficheiro:** `ScrapJobs/controller/dashboardDataController.go:54-66`
**Complexidade:** S

Actualizar anotacoes para reflectir os params reais (`days`, `search`, `matched_only`).

### Checkpoint Fase 3
- `go build ./...` && `go test ./...`

---

## Fase 4 — Frontend [~3-4h]

### 4.1 Shared `createApplication` mutation — desabilita todos os botoes
**Ficheiro:** `FrontScrapJobs/src/pages/Home.tsx:175-180,409-411`
**Complexidade:** M

Criar sub-componente `ApplyButton` com mutation propria:

```tsx
function ApplyButton({ jobId }: { jobId: number }) {
  const { t } = useTranslation('applications')
  const createApplication = useCreateApplication()
  return (
    <Button
      size="sm" variant="outline" className="gap-1.5 text-xs h-7"
      onClick={() => createApplication.mutate(jobId, {
        onSuccess: () => toast.success(t('toast.createSuccess')),
        onError: (err) => toast.error(err.message)
      })}
      disabled={createApplication.isPending}
    >
      <ClipboardCheck className="h-3.5 w-3.5" />
      {t('dashboard.applied')}
    </Button>
  )
}
```

Substituir o botao inline no `columns` por `<ApplyButton jobId={job.id} />`. Remover `createApplication` do scope do Home e dos deps do useMemo.

---

### 4.2 `handleStatusChange` stale closure
**Ficheiro:** `FrontScrapJobs/src/pages/Home.tsx:182-198,442`
**Complexidade:** S

Wraper em `useCallback` e adicionar ao deps:

```tsx
const handleStatusChange = useCallback(
  (applicationId: number, status: ApplicationStatus, interviewRound?: number) => {
    updateApplication.mutate(...)
  },
  [updateApplication, tApp]
)
```

Actualizar deps do useMemo: `[sortField, sortDir, matchedOnly, handleSort, handleStatusChange, t, tApp]`

---

### 4.3 `SiteCareer.logo_url` nullable
**Ficheiro:** `FrontScrapJobs/src/models/siteCareer.ts:5`
**Complexidade:** S

`logo_url: string` -> `logo_url: string | null`

Verificar usos e adicionar null guards onde necessario.

---

### 4.4 `Experience`/`Education` — `id` como campo opcional
**Ficheiro:** `FrontScrapJobs/src/models/curriculum.ts:3,9`
**Complexidade:** S

Marcar como opcional (client-only React key):

```typescript
id?: string  // client-only React key, not persisted
```

---

### 4.5 401 interceptor — proteger rotas publicas
**Ficheiro:** `FrontScrapJobs/src/services/api.ts:11-16`
**Complexidade:** S

```typescript
const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/terms', '/privacy']
const isPublic = publicPaths.some((p) => path === p || path.startsWith(p))
  || path.startsWith('/checkout/')
  || path === '/payment-confirmation'
if (!isPublic) {
  window.location.href = `/login?from=${encodeURIComponent(path)}`
}
```

---

### 4.6 `newCurriculum` — criar `useCreateCurriculum` hook
**Ficheiros:** `FrontScrapJobs/src/hooks/useCurriculum.ts`, `FrontScrapJobs/src/components/curriculum/curriculum-form.tsx:93-96`
**Complexidade:** S

Adicionar hook ao `useCurriculum.ts`, substituir chamada directa no form.

---

### 4.7 `debounceTimers` — cleanup on unmount
**Ficheiro:** `FrontScrapJobs/src/components/checkout/payment-form.tsx:65`
**Complexidade:** S

```tsx
useEffect(() => {
  const timers = debounceTimers.current
  return () => { Object.values(timers).forEach(clearTimeout) }
}, [])
```

---

### 4.8 `staleTime` no dashboard
**Ficheiro:** `FrontScrapJobs/src/hooks/useDashboard.ts`
**Complexidade:** S

```typescript
// useDashboard: staleTime: 2 * 60 * 1000
// useLatestJobs: staleTime: 60 * 1000
```

---

### 4.9 `AdminGuard` — tratar `isError`
**Ficheiro:** `FrontScrapJobs/src/router/routes.tsx:39-44`
**Complexidade:** S

Adicionar `if (user.isError) return <Navigate to={PATHS.app.home} replace />` entre loading e admin check.

---

### 4.10 Navegacao hardcoded
**Ficheiro:** `FrontScrapJobs/src/components/checkout/pix-qrcode-step.tsx:54`
**Complexidade:** S

`navigate('/payment-confirmation')` -> `navigate(PATHS.paymentConfirmation)`

---

### 4.11 Unsafe cast em Applications
**Ficheiro:** `FrontScrapJobs/src/pages/Applications.tsx:86-87`
**Complexidade:** S

Usar tipagem propria do React Query em vez de `as unknown`:

```tsx
queryClient.setQueryData<ApplicationsResponse>(['applications'], (old) => {
  if (!old?.applications) return old
  return { ...old, applications: old.applications.map(...) }
})
```

### Checkpoint Fase 4
- `npm run build` && `npm run lint`
- Clicar Apply numa vaga -> so esse botao fica disabled
- Navegar para checkout sem sessao -> sem redirect para login

---

## Fase 5 — i18n [~30min]

### 5.1 Strings hardcoded em portugues
**Ficheiros:** `addNewSite.tsx:685-689`, `charts-section.tsx:9-27`
**Complexidade:** S

Adicionar `useTranslation` e mover strings para `i18n/locales/pt-BR/admin.json`.

### Checkpoint Fase 5
- `npm run build` && `npm run lint`

---

## Fase 6 — Testes [~4-6h]

### 6.1 Criar mock `PasswordResetRepository`
**Ficheiro novo:** `ScrapJobs/repository/mocks/password_reset_repository.go`
**Prerequisito:** Ler `interfaces/password_reset_interface.go`

### 6.2 Criar mock `JobApplicationRepository`
**Ficheiro novo:** `ScrapJobs/repository/mocks/job_application_repository.go`
**Prerequisito:** Ler `interfaces/job_application_interface.go`

### 6.3 Testes para `password_reset_controller.go`
**Ficheiro novo:** `ScrapJobs/controller/password_reset_controller_test.go`
**Prerequisito:** 6.1

Casos: ForgotPassword (user nao existe -> 200), ForgotPassword (sucesso), ResetPassword (token invalido -> 400), ResetPassword (sucesso).

### 6.4 Testes para `processor/processor.go`
**Ficheiro novo:** `ScrapJobs/processor/processor_test.go`
**Prerequisito:** 3.3 (interfaces no processor)

Casos: HandleScrapeSiteTask (sucesso/erro), HandleSendDigestTask (weekdays-only skip), HandleCompleteRegistrationTask (JSON invalido).

### 6.5 Testes para `paymentService.ts`
**Ficheiro novo:** `FrontScrapJobs/src/services/__tests__/paymentService.test.ts`

### 6.6 Testes para `usePixStatus.ts`
**Ficheiro novo:** `FrontScrapJobs/src/hooks/__tests__/usePixStatus.test.ts`

Casos: nao fetch quando pixId null, polling enquanto PENDING, para quando PAID.

### Checkpoint Fase 6
- `go test ./...` && `npm test`

---

## Mapa de Paralelizacao

```
Agente A (Backend Security):     1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4
Agente B (Backend Architecture): 1.2, 1.4, 3.1-3.7
Agente C (Frontend):             4.1-4.11, 5.1
Agente D (Testes):               6.1-6.6 (apos Fases 3-4)
```

## Estrategia de Commits

| Commit | Repo | Fase | Descricao |
|--------|------|------|-----------|
| 1 | ScrapJobs | 1 | fix: critical security and data integrity (metrics auth, email config, user lookup, digest ordering, webhook timing) |
| 2 | ScrapJobs | 2 | fix: security hardening (error leaking, upload MIME, rate limiter logging, SameSite strict) |
| 3 | ScrapJobs | 3 | refactor: backend quality (status codes, error differentiation, interfaces, pool config, password validation) |
| 4 | FrontScrapJobs | 4 | fix: frontend correctness (shared mutation, stale closure, type safety, interceptor, hooks, staleTime) |
| 5 | FrontScrapJobs | 5 | fix: extract hardcoded strings to i18n |
| 6 | ScrapJobs | 6 | test: add mocks and tests for password reset, processor, and job applications |
| 7 | FrontScrapJobs | 6 | test: add payment service and polling hook tests |

**Deploy order:** Backend primeiro (Commits 1-3), depois Frontend (Commits 4-5). Testes por ultimo (Commits 6-7).
