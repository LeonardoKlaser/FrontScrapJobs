# Admin Site Management — Implementation Plan (native Plan agent)

## 1. Critical Files

### Backend (`/Users/erickschaedler/Documents/Scrap/ScrapJobs/`)

- **`infra/s3/s3_uploader.go`** — Logo lifecycle gate. Adds `DeleteFile(ctx, url)` to `UploaderInterface` with defensive URL parsing, plus a `NoOpUploader` no-op implementation. All edit-path logo replacement goes through this. Risk concentrates here because a buggy delete can destroy the only copy of a production logo.
- **`usecase/site_career_usecase.go`** — Business logic anchor. Hosts the correctly-ordered `UpdateSiteCareer` (upload → update → delete old) plus the empty-string guard applied to both create and update so `NoOpUploader` never writes `&""` into `LogoURL`. Adds `GetAllSitesAdmin` and `GetSiteByID` pass-throughs.
- **`repository/site_career_repository.go`** — Data access. Adds `GetAllSitesAdmin` (no `is_active` filter), `GetSiteByID` (returns `model.ErrNotFound` on `sql.ErrNoRows`), `UpdateSite` (UPDATE … RETURNING every column), and adds `created_at` to every SELECT. Backbone of Features 2 and 3.
- **`controller/site_career_controller.go`** — HTTP surface. New `parseSiteMultipart` / `parseIDParam` helpers reused by create + update, three new handlers (`GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer`), and the `GetAllSites` DTO gets `CreatedAt` for Feature 3. Status codes: 200/201/400/404/500 with error shape `{"error": "..."}` matching existing handlers.
- **`cmd/api/main.go`** — Composition root. Three new routes wired into the existing `adminRoutes` group (lines 425-437) so they automatically inherit `csrfMiddleware` + `RequireAuth` + `RequireAdmin`.

### Frontend (`/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/`)

- **`src/components/sites/site-config-form.tsx`** (new) — 500+ line form extracted from `addNewSite.tsx`. Single source of truth for create + edit UX. `mode` prop gates logo-required marker and preview rendering. Every regression risk of this spec funnels through this file.
- **`src/services/siteCareerService.ts`** — HTTP contract holder. Adds `getAllSitesAdmin`, `getSiteById`, `updateSiteConfig` (multipart PUT). Existing `addSiteConfig` unchanged so refactor doesn't change wire format.
- **`src/hooks/useSiteCareer.ts`** — Query key ownership. Adds `useAdminSites`, `useSite(id)`, `useUpdateSiteConfig`. `onSuccess` invalidation set (`['adminSites']`, `['siteCareerList']`, `['site', id]`, `['public-site-logos']`) is load-bearing for Netflix remediation UX.
- **`src/pages/ListSites.tsx`** — Feature 3 host. Adds sort dropdown, localStorage persistence, `Intl.Collator('pt')`. Extends existing `useMemo` filter chain.
- **`src/router/routes.tsx`** + **`src/router/paths.ts`** — Two new admin-guarded lazy routes (`/app/admin-sites`, `/app/admin-sites/:id/edit`) and the `adminSites` + `editSite(id)` path constants.

---

## 2. Ordered Steps

### Phase A — Backend foundation (ScrapJobs)

**A1. Extend `UploaderInterface` with `DeleteFile`**
- File: `infra/s3/s3_uploader.go`. Add method to interface + concrete `Uploader` + `NoOpUploader`.
- Concrete impl parses URL, matches expected format `https://<BucketName>.s3.amazonaws.com/<key>`, extracts key, calls `s3.DeleteObject`. Empty URL = no-op + nil. Parse failure or wrong bucket = warn log + nil (no cross-bucket delete). Uses existing `logging.Logger`.
- Update mock at `repository/mocks/s3_uploader.go` with matching `DeleteFile(ctx, url)` method so existing usecase tests still compile.
- Test: new `infra/s3/s3_uploader_test.go`:
  - `TestDeleteFile_EmptyURL` — nil, no call
  - `TestDeleteFile_MalformedURL` — nil + warn
  - `TestDeleteFile_WrongBucket` — nil on different-bucket URL
  - `TestNoOpUploader_DeleteFile` — nil
  - `TestDeleteFile_Success` — valid URL → DeleteObject called (requires small refactor of `Uploader` to take narrower S3 client interface, OR skip and exercise via integration tests)
- Run: `go test ./infra/s3/... -race -count=1`
- Expected: new tests green, `go vet` clean, existing usecase tests still compile.

**A2. Empty-string guard in existing create usecase**
- File: `usecase/site_career_usecase.go`. Wrap `site.LogoURL = &logoURL` at line 32 with `if logoURL != ""`.
- Test: `usecase/site_career_usecase_test.go` — add `TestInsertNewSiteCareer_EmptyLogoURL`: mock uploader returns `"", nil`; assert site passed to `repo.InsertNewSiteCareer` has `LogoURL == nil`.
- Run: `go test ./usecase -run TestSiteCareerUsecase -race -v`
- Expected: new test green, existing cases still green.

**A3. Extend repository interface and add three new methods**
- File: `interfaces/site_career.go` — add method signatures.
- File: `repository/site_career_repository.go` — implement. `GetSiteByID` returns `model.ErrNotFound` (`model/errors.go:10`) on `sql.ErrNoRows`. `UpdateSite` is `UPDATE site_scraping_config SET <all columns>, updated_at=NOW() WHERE id=$N RETURNING <all columns incl. created_at>`. Also add `created_at` to existing `GetAllSites` SELECT.
- File: `model/scrapingConfig.go` — add `CreatedAt time.Time` with `db:"created_at" json:"created_at"` (migration 028 already created the column).
- File: `repository/mocks/site_career_repository.go` — add three mock methods.
- Test: new `site_career_repository_test.go` alongside `repository_test.go`:
  - `TestUpdateSite` — insert fixture, UpdateSite with all columns changed, re-fetch via GetSiteByID, assert equality
  - `TestGetSiteByID_Hit` / `_Miss` (returns `ErrNotFound`)
  - `TestGetAllSitesAdmin` — insert active + inactive, both appear
  - `TestGetAllSites_SkipsInactive` — regression protection while adding `created_at`
- Run: `go test ./repository/... -race -count=1 -timeout=120s` (dockertest, requires Docker)
- Expected: new tests green, existing green.

**A4. New `UpdateSiteCareer` usecase with correct ordering**
- File: `interfaces/site_career_usecase_interface.go` — add `UpdateSiteCareer`, `GetAllSitesAdmin`, `GetSiteByID`.
- File: `usecase/site_career_usecase.go` — implement per spec's 7-step ordering (lines 125-137). Invariants:
  - Upload before update (update-failure leaves old logo in DB)
  - Delete AFTER update succeeds, only when four gates pass (`newLogoURL != ""`, `current.LogoURL != nil`, `*current.LogoURL != ""`, `*current.LogoURL != newLogoURL`)
  - DeleteFile errors → warn and return success (orphan acceptable)
- Test: `site_career_usecase_test.go` — eight cases from spec §Testing/Backend. Use `mock.Anything` for context and `testify/mock` ordering assertions (`mock.Calls` inspection) in `_NewLogo`.
- Run: `go test ./usecase -run TestSiteCareerUsecase -race -v`
- Expected: all eight green, prior cases green.

**A5. Controller helpers + three new handlers**
- File: `controller/site_career_controller.go`:
  - Extract `parseSiteMultipart(ctx) (model.SiteScrapingConfig, *multipart.FileHeader, error)` — mirrors lines 100-131. Both header/mappings double-unescape logic inside.
  - `parseIDParam(ctx) (int, bool)` — `strconv.Atoi(ctx.Param("id"))`, on error responds 400, returns `(0, false)`.
  - Rewrite `InsertNewSiteCareer` to use `parseSiteMultipart`.
  - `GetAllSitesAdmin(ctx)` — usecase call, 200 + array.
  - `GetSiteByID(ctx)` — parses id, usecase, 404 on `errors.Is(err, model.ErrNotFound)`, 200 otherwise.
  - `UpdateSiteCareer(ctx)` — parses id + multipart, usecase, 404/500/200.
  - Add `CreatedAt time.Time \`json:"created_at"\`` to existing `GetAllSites siteDTO` (line 39-46) and copy in loop at line 68-80.
- Test: create `controller/site_career_controller_test.go` (doesn't exist). Follow `curriculum_controller_test.go` pattern: `gin.SetMode(gin.TestMode)` in `init()`, `httptest.NewRecorder` + `gin.CreateTestContext`, mocks injected. Cases: `GetAllSitesAdmin` (active+inactive), `GetSiteByID_Hit`, `GetSiteByID_404`, `GetSiteByID_InvalidID_400`, `UpdateSiteCareer_Happy`, `_BadJSON_400`, `_InvalidID_400`, `_NotFound_404`, `_UsecaseError_500`.
- Run: `go test ./controller/... -race -count=1`
- Expected: all green.

**A6. Wire routes in `main.go`**
- File: `cmd/api/main.go`, inside `adminRoutes` block (lines 425-437):
  - `adminRoutes.GET("/siteCareer", siteCareerController.GetAllSitesAdmin)`
  - `adminRoutes.GET("/siteCareer/:id", siteCareerController.GetSiteByID)`
  - `adminRoutes.PUT("/siteCareer/:id", siteCareerController.UpdateSiteCareer)`
- Test: `go build ./...` compiles, `go vet ./...` passes. End-to-end via Playwright in Phase F.
- Run: `go test ./... -race -count=1 -timeout=120s && go vet ./... && golangci-lint run`
- Expected: all green. Backend PR mergeable here.

### Phase B — Frontend characterization tests (prerequisite for refactor)

**B1. Land `addNewSite.test.tsx` against existing page**
- Create dir: `src/pages/__tests__/`.
- Create file: `src/pages/__tests__/addNewSite.test.tsx`. Mock `useAddSiteConfig` + `useSandboxScrape` (both in `src/hooks/useAddSiteConfig.ts`), mock `useTranslation`. Follow `src/hooks/__tests__/useAddSiteConfig.test.ts` pattern for `QueryClientProvider` wrapping.
- Cases (mirror spec §Testing/Frontend):
  1. Happy CSS submit → `addSite` called with expected payload, success toast, form resets
  2. Scraping type switch → default CSS shows CSS card; click API → API card; click HEADLESS → CSS card stays (line 367 shares)
  3. Missing name/URL → validation alert, mutation not called
  4. Test button no URL → `toast.error`, mutation not called
  5. Test button with URL → `testScrape` called, results table renders
  6. `addSite` error path → error toast, button resets
- Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx`
- Expected: six cases green against current (unchanged) `addNewSite.tsx`.

### Phase C — Optional Feature 1 hotfix (direct to current page)

**C1. Apply logo-required + size + accept fix directly to `addNewSite.tsx`**
- File: `src/pages/addNewSite.tsx`:
  - `handleSubmit`: after name/URL check, add `if (!logoFile) { setValidationError(t('addSite.logoRequiredError')); return }`
  - `handleFileChange`: guard `file.size > 2 * 1024 * 1024` → `setValidationError(t('addSite.logoTooLargeError'))` and don't set state
  - Line 656: change `accept="image/png, image/jpeg, image/svg+xml"` → `accept="image/png, image/jpeg, image/webp"`
  - Line 648: add `<span className="text-destructive">*</span>` after "Logo da Empresa"
- Files: both admin.json locales — add `logoRequiredError`, `logoTooLargeError`, `logo.titleRequired` keys
- Test: extend `addNewSite.test.tsx` with: (a) submit without logo in create → error shown, mutation not called; (b) 3MB file → error shown, file not set
- Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx`
- Expected: eight total cases green. Independent PR candidate.

### Phase D — Frontend refactor and edit flow

**D1. Add `SiteConfig` type + `created_at` to `SiteCareer`**
- File: `src/models/siteCareer.ts` — add `created_at: string` to `SiteCareer` and new `SiteConfig` interface per spec (lines 175-198).
- Test: `npm run build` typecheck. No dedicated unit test.
- Expected: build green (modulo hook signatures to follow).

**D2. Extend `siteCareerService` with admin methods**
- File: `src/services/siteCareerService.ts` — `getAllSitesAdmin`, `getSiteById`, `updateSiteConfig` (multipart PUT).
- Test: extend `src/services/__tests__/siteCareerService.test.ts`:
  - `getAllSitesAdmin` → `GET /siteCareer`
  - `getSiteById` → `GET /siteCareer/${id}`
  - `updateSiteConfig` → `FormData` with `siteData` JSON + optional `logo`, `PUT /siteCareer/${id}`
- Run: `npx vitest run src/services/__tests__/siteCareerService.test.ts`
- Expected: old + new green.

**D3. Extend hooks in `useSiteCareer.ts`**
- File: `src/hooks/useSiteCareer.ts`:
  - `useAdminSites()` — `useQuery({ queryKey: ['adminSites'], queryFn: siteCareerService.getAllSitesAdmin })`
  - `useSite(id: number)` — `useQuery({ queryKey: ['site', id], queryFn: () => siteCareerService.getSiteById(id), enabled: !isNaN(id) && id > 0 })`
  - `useUpdateSiteConfig()` — `useMutation` with four-key invalidation in `onSuccess`
- Test: extend `src/hooks/__tests__/useSiteCareer.test.ts`:
  - `useAdminSites` uses `['adminSites']` key and calls `getAllSitesAdmin`
  - `useSite` disabled for NaN id; enabled for positive; caches by `['site', id]`
  - `useUpdateSiteConfig` on success invalidates all four keys (spy on `queryClient.invalidateQueries`)
- Run: `npx vitest run src/hooks/__tests__/useSiteCareer.test.ts`
- Expected: all green.

**D4. Extract `<SiteConfigForm>`**
- Create: `src/components/sites/site-config-form.tsx`. API: `{ mode, initialData, onSubmit, submitLabel, onSubmitSuccess }`. Moves every stateful piece out of `addNewSite.tsx` except `useAddSiteConfig` mutation hook (stays in page — form ignorant of transport). Form calls `onSubmit(formData, logoFile)` returning promise; caller wires mutation and calls `onSubmitSuccess` in its `onSuccess`.
- Edit mode: `<img>` thumbnail when `initialData.logo_url` set and no new `logoFile`; button flips to "Substituir"; logo-required marker suppressed.
- Rewrite `src/pages/addNewSite.tsx` as 40-line wrapper that pumps `useAddSiteConfig` into `onSubmit`, `onSubmitSuccess` = form reset.
- Test: `src/pages/__tests__/addNewSite.test.tsx` — Phase B+C suite must stay green. Refactor safety net.
- Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx && npm run build`
- Expected: eight cases from B/C stay green.

**D5. Add routes + nav item**
- File: `src/router/paths.ts` — add `adminSites: '/app/admin-sites'` and `editSite: (id: number) => '/app/admin-sites/${id}/edit'`. Keep `addNewSite: '/app/add-new-site'`.
- File: `src/router/routes.tsx` — add two lazy imports (`AdminSitesListPage`, `EditSitePage`) under MainLayout with `<AdminGuard>` mirroring lines 86-104. Wrap in `<Suspense>` like `AdminDashboard`.
- File: `src/components/common/app-header/index.tsx` — line 35: `nav.addSite` → `nav.manageSites` with `href: PATHS.app.adminSites`.
- Files: common.json locales — add `nav.manageSites: "Gerenciar Sites"` / `"Manage Sites"`.
- Test: `npm run build` (typos + typing).
- Expected: build passes.

**D6. Build `adminSitesList.tsx`**
- Create: `src/pages/adminSitesList.tsx`. `useAdminSites()`. Table with shadcn primitives or ad-hoc `<table>` like sandbox. Columns: logo thumb (`<img>` or `Building2` fallback), site_name, scraping_type Badge, is_active indicator, created_at, Edit button. Search mirrors `ListSites.tsx:132-152`. Top-right "+ Novo Site" via `useNavigate()` + `PATHS.app.addNewSite`. Empty state via `<EmptyState>`.
- Test: `src/pages/__tests__/adminSitesList.test.tsx`: renders all sites including `is_active=false`, "+ Novo Site" navigates, "Editar" navigates with id, search filters.
- Run: `npx vitest run src/pages/__tests__/adminSitesList.test.tsx`
- Expected: all green.

**D7. Build `editSite.tsx`**
- Create: `src/pages/editSite.tsx`. `useParams<{ id: string }>()` → `parseInt`. NaN or ≤0 → `<Navigate to={PATHS.app.adminSites} replace />`. `useSite(id)`: loading → `<LoadingSection>`, 404 → empty state + back link, other error → toast + back. Success → `<SiteConfigForm mode="edit" initialData={data} onSubmit={...} onSubmitSuccess={() => navigate(PATHS.app.adminSites)} />` with submit wired to `useUpdateSiteConfig`.
- Test: `src/pages/__tests__/editSite.test.tsx`: loading, 404, data populates (selector value, scraping_type badge, logo preview `<img>` src), submit calls `updateSiteConfig(id, formData, logoFile)`, success → navigate `/app/admin-sites`.
- Run: `npx vitest run src/pages/__tests__/editSite.test.tsx`
- Expected: all green.

### Phase E — Frontend sort

**E1. Add sort dropdown to `ListSites.tsx`**
- File: `src/pages/ListSites.tsx`:
  - Import `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `@/components/ui/select`
  - Add `SortKey` type, `collator`, `sortFn` record per spec
  - `sortBy` state with localStorage hydrate/persist effect (key `'sitesSortBy'`)
  - Extend `useMemo` (lines 47-55): append `.sort(sortFn[sortBy])` before return; add `sortBy` to deps
  - Render `<Select>` next to `<FilterPills>` at line 154
- Files: both sites.json locales — add `sort` block: `label`, `alphabetical`, `newest`, `subscribedFirst`
- Test: `src/pages/__tests__/ListSites.test.tsx`:
  - Alphabetical: "Ácme" before "Azure" with `sensitivity: 'base'`
  - Newest: fixture with dates, newest first
  - Subscribed first: subscribed before non-subscribed
  - Malformed `created_at` → epoch fallback, no throw
  - Selecting persists; remount restores
- Run: `npx vitest run src/pages/__tests__/ListSites.test.tsx`
- Expected: all green.

### Phase F — E2E + preflight

**F1. Playwright spec: Netflix remediation flow**
- Create: `e2e/admin-sites.spec.ts`. Reuse `e2e/fixtures/api-mocks.ts` — add admin fixture or parameter on `setupMocks` to switch `mockUser.is_admin = true`. Add routes: GET /siteCareer (admin, Netflix with logo_url=null), GET /siteCareer/57, PUT /siteCareer/57 (returns updated config), refreshed GET /api/getSites.
- Flow:
  1. Log in as admin
  2. `await page.goto('/app/admin-sites')` → Netflix row with placeholder
  3. Click "Editar" → URL `/app/admin-sites/57/edit`
  4. Upload PNG via `fileChooser`, submit
  5. Navigate back to `/app/admin-sites`, logo `<img>` appears
  6. Navigate to `/app/sites`, Netflix card logo renders (proves `['public-site-logos']` + `['siteCareerList']` invalidation)
- Run: `npx playwright test e2e/admin-sites.spec.ts`
- Expected: green.

**F2. Preflight checks before production**
- Backend PR description: verify IAM role has `s3:DeleteObject` on `logos/*`. Run `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` — if > 0, decide whether to null those rows first.
- Full suite: `go test ./... -race -count=1 -timeout=120s && go vet ./... && golangci-lint run` (ScrapJobs) + `npm run test && npx playwright test && npm run lint && npm run build` (FrontScrapJobs).
- Expected: all green.

---

## 3. Architectural Trade-offs

**T1. Single `<SiteConfigForm>` vs. fragment-level extraction**
- Chosen: one shared component with `mode` prop.
- Alternative: extract only repetitive fragments (`<CSSSelectorFields>`, `<APIConfigFields>`) and let each page own its `<form>` + state.
- Why: spec explicitly calls for this refactor; create/edit share ~95% of state/validation/layout. Fragment-level would leave duplicated submit/validation in two pages — exactly the shape that drifted into the Netflix bug.
- Revisit if: a third caller needs materially different layout (inline edit), or if optimistic-locking adds version field — then surface grows and fragment-level may win.

**T2. PUT full replacement vs. PATCH partial body**
- Chosen: `PUT /siteCareer/:id` with every field on every submit.
- Alternative: PATCH + diff client-side.
- Why: form always renders and sends every field; backend has no "optional field" semantics — `UPDATE ... SET <every column>` simpler and matches UI. PATCH would require per-field null-vs-omitted handling that existing JSON tags don't distinguish cleanly (Go's `encoding/json` can't tell null from absent on `*string`).
- Revisit if: fields that require intentional "no change" distinct from "clear" (e.g., secret where `null`="don't touch" and `""`="clear"). Then move to RFC 7396 merge patch or sub-endpoints.

**T3. Frontend-only logo-required validation (Feature 1)**
- Chosen: keep backend tolerant of missing logo to preserve `NoOpUploader` dev path.
- Alternative: controller-level check requiring file when `S3_BUCKET_NAME` is set (env-conditional).
- Why: env-conditional required fields create dev/prod divergence hard to exercise in tests. Single admin form is only source of create traffic in practice; spec documents this reasoning.
- Revisit if: second client (CLI, scheduled import, mobile) gains create ability — then move guard backend-side and substitute deterministic "placeholder logo" uploader for dev.

**T4. Delete-old-logo AFTER UpdateSite succeeds vs. transactional**
- Chosen: three separate calls (`Upload → UpdateSite → DeleteFile`), best-effort, not transactional.
- Alternative: two-phase commit or SQL-side reference counting.
- Why: S3 has no transactional semantics with Postgres. Spec's ordering trades "orphaned S3 object on DeleteFile failure" (negligible — KBs per edit, rare) for "never lose the only copy of a referenced logo" (catastrophic — user-facing broken image). Four-gate check (`newLogoURL != ""` AND `current.LogoURL != nil` AND `*current.LogoURL != ""` AND `*current.LogoURL != newLogoURL`) prevents NoOp-uploader trap and same-URL trap.
- Revisit if: S3 storage cost becomes material (unlikely at this scale) or a background orphan-sweeper is built for other reasons — piggyback on it.

**T5. Sorting on the frontend instead of `ORDER BY` on backend**
- Chosen: frontend sort via `useMemo` and `Intl.Collator`.
- Alternative: `?sort=` query param with server-side ORDER BY.
- Why: at ~60 sites, sort-on-client is instant and keeps subscribed-first option (depends on per-user subscription state) possible without joins in list endpoint. `Intl.Collator` gives locale-correct alphabetical in JS that `lower(site_name) COLLATE "pt_BR"` approximates but requires DB locale setup. Spec notes this explicitly.
- Revisit if: list grows past ~500 entries — then pagination + server-side sort is cheaper.

**T6. Characterization tests land in dedicated commit BEFORE refactor**
- Chosen: commit 1 = tests green against current code; commit 2 = extract `<SiteConfigForm>`, tests still green.
- Alternative: bundle test + refactor in one PR.
- Why: two commits let you bisect the refactor if behavior changes. Spec §Sequencing Phase B calls this out.
- Revisit if: team decides overhead isn't worth it for single-hand change — but with 800-line file + form validation semantics, split is cheap insurance.

---

## 4. Testing Strategy Per Step

Baked into each step above. Summary of proof-of-done:

- **A1**: `go test ./infra/s3/...` green, mock compiles
- **A2**: `TestInsertNewSiteCareer_EmptyLogoURL` green
- **A3**: dockertest integration tests green
- **A4**: nine usecase tests green incl. call-ordering assertions
- **A5**: controller tests green across all status codes (200/201/400/404/500)
- **A6**: full `go test ./...` green, backend PR-mergeable
- **B1**: characterization suite green against unchanged `addNewSite.tsx`
- **C1**: two added validation cases green; ship as hotfix PR if desired
- **D1-D3**: `npm run build` + service/hook tests green
- **D4**: characterization suite stays green after extraction
- **D5-D7**: `adminSitesList.test.tsx` + `editSite.test.tsx` green; build green
- **E1**: `ListSites.test.tsx` green with accent, subscription, newest + localStorage
- **F1**: Playwright `e2e/admin-sites.spec.ts` green
- **F2**: full suite green both repos

---

## 5. Integration Points

All admin endpoints inherit `csrfMiddleware + RequireAuth + RequireAdmin` from `adminRoutes` group (`cmd/api/main.go:425-437`). Frontend always sends `withCredentials: true` via shared `api` axios (`src/services/api.ts`).

### GET /siteCareer (admin list)
- Request: `Cookie: Authorization=<jwt>`, no body
- Response 200: `[]model.SiteScrapingConfig` JSON array. Includes `created_at`, `is_active` (active + inactive)
- Errors: 401 (no cookie) — caught by global 401 interceptor, redirects to login. 403 (not admin) — `<AdminGuard>` should prevent this; any 403 shown as error toast

### GET /siteCareer/:id (admin detail)
- Request: id in path (positive int)
- Response 200: `model.SiteScrapingConfig` object
- Response 404: `{"error": "Site não encontrado"}` when usecase returns `model.ErrNotFound`
- Response 400: invalid id. Frontend's `useSite(id)` guards with `enabled: !isNaN(id) && id > 0`, so 400 is belt-and-suspenders

### PUT /siteCareer/:id (admin update)
- Request: `Content-Type: multipart/form-data`
  - Part `siteData`: JSON string of full `SiteScrapingConfig` body (every field present, nullables as `null`, empty strings normalized to `null` client-side via `Object.fromEntries(...)` pattern from `siteCareerService.ts:39`)
  - Part `logo`: optional file. When absent, backend preserves existing `LogoURL` via usecase's current/new diff logic
- Response 200: `model.SiteScrapingConfig` object with persisted row (backend returns via `UPDATE ... RETURNING`)
- Response 400: malformed JSON, invalid id, or bad multipart
- Response 404: id doesn't exist
- Response 500: upload or DB failure (old logo untouched per ordering invariant)
- Headers: CSRF not sent manually — cookie-based same-origin works in prod; dev handled by CORS + Origin match in middleware

### Invariant: on successful PUT, frontend invalidates four query keys
- `['adminSites']` — list refreshes on back-nav
- `['siteCareerList']` — `/app/sites` shows updated logo
- `['site', id]` — returning to same edit page shows new data
- `['public-site-logos']` — landing carousel updates inside 10-min stale window (spec G1)

### Existing endpoints unchanged
- `POST /siteCareer` — create, now with empty-string guard, same wire shape, 201
- `POST /scrape-sandbox` — sandbox test, unchanged
- `GET /api/getSites` — public subscriber list, now includes `created_at` in DTO (Feature 3). Frontend `SiteCareer` gains `created_at: string`. Non-breaking addition.

---

## 6. Risks and Mitigations Per Phase

### Phase A (Backend)
- **Risk**: `UpdateSite` RETURNING omits a column, persisted row diverges from response. **Detect**: `TestUpdateSite` asserts each column round-trips. **Recover**: add missing column to SET and RETURNING.
- **Risk**: `DeleteFile` URL parsing edge case (query string, escaped chars, path-style vs virtual-host). **Detect**: `TestDeleteFile_WrongBucket` + `_MalformedURL` cover it; "warn + nil" worst case is S3 orphan. **Recover**: refine parser, add test, follow-up ship. Never cascade-delete.
- **Risk**: IAM lacks `s3:DeleteObject`. **Detect**: every edit logs warn. **Recover**: spec accepts tradeoff — orphans accumulate slowly. Add IAM permission in AWS console.
- **Risk**: `NoOpUploader` returned `""`, old usecase wrote `&""` (pre-fix). **Detect**: pre-PR `SELECT COUNT(*) ... WHERE logo_url = ''`. **Recover**: `UPDATE ... SET logo_url = NULL WHERE logo_url = ''` once if count > 0.

### Phase B (Characterization)
- **Risk**: Tests brittle when i18n keys change. **Detect**: run suite in CI pre-extraction. **Recover**: prefer `data-testid` or role selectors over text-match.
- **Risk**: Hidden dependency on `document.getElementById('logo_upload')` for "Escolher imagem" click (line 663). **Detect**: test renders into jsdom body supporting lookup. **Recover**: replace with ref in refactor, not before tests green.

### Phase C (Feature 1 hotfix)
- **Risk**: `accept` change svg→webp breaks admin who picks SVG. **Detect**: spec notes SVG was already silently rejected backend-side. **Recover**: none needed; UI matches backend reality.
- **Risk**: i18n key missing in one locale. **Detect**: add to both pt-BR and en-US simultaneously.

### Phase D (Refactor + edit)
- **Risk**: `<SiteConfigForm>` extraction drops state or changes focus behavior. **Detect**: Phase B+C characterization is safety net. **Recover**: commit-by-commit with tests between stages.
- **Risk**: `initialData` doesn't fully hydrate (e.g., `api_method` defaults `'GET'` in create but edit site has null). **Detect**: `editSite.test.tsx` asserts each field populated. **Recover**: `useEffect(() => { if (mode === 'edit' && initialData) setFormData({ ...defaults, ...nullsToEmpty(initialData) }) }, [initialData])` converts nulls back to empty for controlled inputs.
- **Risk**: Invalidation keys drift from reality. **Detect**: test asserts all four; grep confirms producers (`'public-site-logos'` at `usePublicStats.ts:15`, `'siteCareerList'` at `useSiteCareer.ts:6`). **Recover**: fix divergence.
- **Risk**: Nav rename confuses admins with `/app/add-new-site` bookmark. **Detect**: URL stays; only label changes. "+ Novo Site" button on admin list visible/labeled.

### Phase E (Sort)
- **Risk**: `new Date(invalidString).getTime()` returns `NaN`, poisoning `Array.sort`. **Detect**: `|| 0` fallback in spec; test covers malformed case. **Recover**: verified by `TestListSites` with bad `created_at`.
- **Risk**: `Intl.Collator` behavior differs between Node (jsdom) and browsers. **Detect**: v8-based envs give consistent output for common cases. Fixtures in well-specified range. **Recover**: if divergence, assert relative order of two test strings, not precise index.

### Phase F (E2E + preflight)
- **Risk**: Playwright `mockAPI` doesn't stub new PUT, test hangs on real call. **Detect**: network tab in headed mode. **Recover**: always `await mockAPI()` in `beforeEach`, add route before `page.goto`.
- **Risk**: Cache invalidation timing in jsdom/Playwright. **Detect**: assert Netflix logo `<img>` on `/app/sites` only AFTER `await page.waitForResponse(...)`. **Recover**: `waitFor` on visible `<img>` src, not arbitrary delay.

---

### Critical Files for Implementation

- `/Users/erickschaedler/Documents/Scrap/ScrapJobs/usecase/site_career_usecase.go`
- `/Users/erickschaedler/Documents/Scrap/ScrapJobs/controller/site_career_controller.go`
- `/Users/erickschaedler/Documents/Scrap/ScrapJobs/infra/s3/s3_uploader.go`
- `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/components/sites/site-config-form.tsx`
- `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/hooks/useSiteCareer.ts`
