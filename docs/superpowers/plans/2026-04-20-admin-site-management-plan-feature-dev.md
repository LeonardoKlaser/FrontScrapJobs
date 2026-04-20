# Admin Site Management — Implementation Blueprint (feature-dev)

**Date**: 2026-04-20
**Repos**: `ScrapJobs/` (Go 1.24) + `FrontScrapJobs/` (React 19 + Vite 7 + TS)

---

## 1. Files Inventory

### ScrapJobs/ (Backend)

| Action | Path | Responsibility |
|---|---|---|
| Modify | `ScrapJobs/infra/s3/s3_uploader.go` | Add `DeleteFile` method to `UploaderInterface` + `Uploader` concrete impl + `NoOpUploader` stub |
| Modify | `ScrapJobs/interfaces/site_career_interface.go` | Add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite` to `SiteCareerRepositoryInterface` |
| Modify | `ScrapJobs/interfaces/site_career_usecase_interface.go` | Add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer` to `SiteCareerUsecaseInterface` |
| Modify | `ScrapJobs/model/scrapingConfig.go` | Add `CreatedAt time.Time` field |
| Modify | `ScrapJobs/repository/site_career_repository.go` | Add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite` methods; add `created_at` to `GetAllSites` SELECT |
| Modify | `ScrapJobs/usecase/site_career_usecase.go` | Fix empty-string guard in `InsertNewSiteCareer`; add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer` |
| Modify | `ScrapJobs/controller/site_career_controller.go` | Add `parseSiteMultipart`, `parseIDParam` helpers; add three new handlers; extend `GetAllSites` DTO with `created_at` |
| Modify | `ScrapJobs/cmd/api/main.go` | Register three new admin routes |
| Modify | `ScrapJobs/repository/mocks/site_career_repository.go` | Add mock methods for three new repository methods |
| Modify | `ScrapJobs/repository/mocks/s3_uploader.go` | Add `DeleteFile` mock method |
| Modify | `ScrapJobs/usecase/site_career_usecase_test.go` | Add eight new test cases for update/delete flow |
| Create | `ScrapJobs/controller/site_career_controller_test.go` | Controller-layer unit tests for all five handlers |
| Modify | `ScrapJobs/repository/repository_test.go` | Add `TestGetAllSitesAdmin`, `TestGetSiteByID`, `TestUpdateSite` integration tests |
| Create | `ScrapJobs/infra/s3/s3_uploader_test.go` | Unit tests for `DeleteFile` on `Uploader` and `NoOpUploader` |

### FrontScrapJobs/ (Frontend)

| Action | Path | Responsibility |
|---|---|---|
| Modify | `FrontScrapJobs/src/models/siteCareer.ts` | Add `SiteConfig` full-shape interface; add `created_at` to `SiteCareer` |
| Modify | `FrontScrapJobs/src/services/siteCareerService.ts` | Add `getAllSitesAdmin`, `getSiteById`, `updateSiteConfig`; expose `SiteConfigFormData` for consumers |
| Modify | `FrontScrapJobs/src/hooks/useSiteCareer.ts` | Add `useAdminSites`, `useSite` queries |
| Create | `FrontScrapJobs/src/hooks/useUpdateSiteConfig.ts` | `useUpdateSiteConfig` mutation with four-key invalidation |
| Modify | `FrontScrapJobs/src/router/paths.ts` | Add `adminSites` and `editSite(id)` to `PATHS.app`; preserve `addNewSite` |
| Modify | `FrontScrapJobs/src/router/routes.tsx` | Add two lazy routes under `AdminGuard` |
| Modify | `FrontScrapJobs/src/components/common/app-header/index.tsx` | Rename `nav.addSite` item to `nav.manageSites` |
| Create | `FrontScrapJobs/src/components/sites/site-config-form.tsx` | Shared form component for create + edit, controlled by `mode` prop |
| Modify | `FrontScrapJobs/src/pages/addNewSite.tsx` | Thin wrapper around `<SiteConfigForm mode="create" .../>` |
| Create | `FrontScrapJobs/src/pages/adminSitesList.tsx` | Admin list page with table, search, "+ Novo Site" button |
| Create | `FrontScrapJobs/src/pages/editSite.tsx` | Edit page: loads site by id, renders `<SiteConfigForm mode="edit" .../>` |
| Modify | `FrontScrapJobs/src/pages/ListSites.tsx` | Add sort dropdown + `Intl.Collator` logic + localStorage persistence |
| Modify | `FrontScrapJobs/src/i18n/locales/pt-BR/admin.json` | Add logo/nav/admin list/edit copy keys |
| Modify | `FrontScrapJobs/src/i18n/locales/en-US/admin.json` | Same keys in English |
| Modify | `FrontScrapJobs/src/i18n/locales/pt-BR/common.json` | Change `nav.addSite` → `nav.manageSites` ("Gerenciar Sites") |
| Modify | `FrontScrapJobs/src/i18n/locales/en-US/common.json` | Same in English |
| Modify | `FrontScrapJobs/src/i18n/locales/pt-BR/sites.json` | Add `sort.*` keys |
| Modify | `FrontScrapJobs/src/i18n/locales/en-US/sites.json` | Same in English |
| Create | `FrontScrapJobs/src/pages/__tests__/addNewSite.test.tsx` | Characterization suite (pre-refactor gate) |
| Create | `FrontScrapJobs/src/pages/__tests__/editSite.test.tsx` | Unit tests for edit page |
| Create | `FrontScrapJobs/src/pages/__tests__/adminSitesList.test.tsx` | Unit tests for admin list |
| Create | `FrontScrapJobs/src/pages/__tests__/ListSites.test.tsx` | Unit tests for sort |
| Modify | `FrontScrapJobs/src/services/__tests__/siteCareerService.test.ts` | Add cases for three new service methods |
| Modify | `FrontScrapJobs/src/hooks/__tests__/useSiteCareer.test.ts` | Add coverage for `useAdminSites`, `useSite`, `useUpdateSiteConfig` |
| Create | `FrontScrapJobs/e2e/admin-sites.spec.ts` | Playwright: Netflix repair flow |
| Modify | `FrontScrapJobs/e2e/fixtures/api-mocks.ts` | Add admin site endpoint mocks + admin user variant |

---

## 2. Component Designs

### Backend Go Signatures

**`infra/s3/s3_uploader.go`**

```go
type UploaderInterface interface {
    UploadFile(ctx context.Context, file *multipart.FileHeader) (string, error)
    DeleteFile(ctx context.Context, url string) error
}

func (u *Uploader) DeleteFile(ctx context.Context, url string) error
// nil on empty url or bucket-mismatch. Error only on confirmed SDK
// failure for a valid same-bucket URL.

func (n *NoOpUploader) DeleteFile(ctx context.Context, url string) error
// Always nil.
```

**`interfaces/site_career_interface.go`**

```go
type SiteCareerRepositoryInterface interface {
    InsertNewSiteCareer(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error)
    GetAllSites() ([]model.SiteScrapingConfig, error)
    GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)
    GetSiteByID(id int) (model.SiteScrapingConfig, error)
    UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error)
}
```

**`interfaces/site_career_usecase_interface.go`**

```go
type SiteCareerUsecaseInterface interface {
    InsertNewSiteCareer(ctx context.Context, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)
    SandboxScrape(ctx context.Context, config model.SiteScrapingConfig) ([]*model.Job, error)
    GetAllSites() ([]model.SiteScrapingConfig, error)
    GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)
    GetSiteByID(id int) (model.SiteScrapingConfig, error)
    UpdateSiteCareer(ctx context.Context, id int, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)
}
```

**`model/scrapingConfig.go`**

```go
type SiteScrapingConfig struct {
    // ... existing fields ...
    CreatedAt time.Time `db:"created_at" json:"created_at"`
}
```

**`repository/site_career_repository.go`**

```go
// Modified: SELECT adds created_at; Scan adds &site.CreatedAt
func (st *SiteCareerRepository) GetAllSites() ([]model.SiteScrapingConfig, error)

// Same SELECT as GetAllSites + created_at, NO WHERE is_active filter
func (st *SiteCareerRepository) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)

// SELECT all columns (incl. created_at) WHERE id = $1
// Returns model.ErrNotFound on sql.ErrNoRows
func (st *SiteCareerRepository) GetSiteByID(id int) (model.SiteScrapingConfig, error)

// UPDATE site_scraping_config SET <all columns>, updated_at=NOW()
// WHERE id=$N RETURNING <all columns incl. created_at>
// Returns model.ErrNotFound on sql.ErrNoRows
func (st *SiteCareerRepository) UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error)
```

**`usecase/site_career_usecase.go`**

```go
// Modified (empty-string guard)
func (uc *SiteCareerUsecase) InsertNewSiteCareer(ctx context.Context, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)

// New
func (uc *SiteCareerUsecase) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)
func (uc *SiteCareerUsecase) GetSiteByID(id int) (model.SiteScrapingConfig, error)

// Ordering: GetSiteByID → UploadFile (if file!=nil) → UpdateSite → DeleteFile (if replaced)
// DeleteFile failure is warn-logged only; updated config still returned.
func (uc *SiteCareerUsecase) UpdateSiteCareer(ctx context.Context, id int, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)
```

**`controller/site_career_controller.go`**

```go
// Private helpers
func parseSiteMultipart(ctx *gin.Context) (model.SiteScrapingConfig, *multipart.FileHeader, error)
// ParseMultipartForm(2<<20), FormFile("logo") (tolerant of ErrMissingFile),
// FormValue("siteData") unmarshal, double-unescape of APIHeadersJSON/JSONDataMappings.

func parseIDParam(ctx *gin.Context) (int, bool)
// strconv.Atoi(ctx.Param("id")); on failure, ctx.JSON(400,...) and return (0, false).

// New handlers
func (sc *SiteCareerController) GetAllSitesAdmin(ctx *gin.Context)
func (sc *SiteCareerController) GetSiteByID(ctx *gin.Context)
func (sc *SiteCareerController) UpdateSiteCareer(ctx *gin.Context)

// Modified: siteDTO gains CreatedAt time.Time `json:"created_at"`
func (sc *SiteCareerController) GetAllSites(ctx *gin.Context)
```

### Frontend TypeScript Signatures

**`src/models/siteCareer.ts`**

```ts
export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_subscribed: boolean
  target_words?: string[]
  created_at: string  // NEW
}

export interface SiteConfig {
  id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_active: boolean
  scraping_type: 'CSS' | 'API' | 'HEADLESS'
  job_list_item_selector: string | null
  title_selector: string | null
  link_selector: string | null
  link_attribute: string | null
  location_selector: string | null
  next_page_selector: string | null
  job_description_selector: string | null
  job_requisition_id_selector: string | null
  job_requisition_id_attribute: string | null
  api_endpoint_template: string | null
  api_method: string | null
  api_headers_json: string | null
  api_payload_template: string | null
  json_data_mappings: string | null
  created_at: string
}
```

**`src/services/siteCareerService.ts`** — additions:

```ts
getAllSitesAdmin: async (): Promise<SiteConfig[]>
// GET /siteCareer

getSiteById: async (id: number): Promise<SiteConfig>
// GET /siteCareer/${id}

updateSiteConfig: async (
  id: number, formData: SiteConfigFormData, logoFile: File | null
): Promise<SiteConfig>
// PUT /siteCareer/${id} multipart/form-data
// 'siteData' JSON (empty→null cleaned) + optional 'logo' file
```

**`src/hooks/useSiteCareer.ts`** — additions:

```ts
export function useAdminSites(): UseQueryResult<SiteConfig[]>
// queryKey: ['adminSites']

export function useSite(id: number): UseQueryResult<SiteConfig>
// queryKey: ['site', id], enabled: !isNaN(id) && id > 0
```

**`src/hooks/useUpdateSiteConfig.ts`**

```ts
export function useUpdateSiteConfig(): UseMutationResult<
  SiteConfig, Error,
  { id: number; formData: SiteConfigFormData; logoFile: File | null }
>
// onSuccess invalidates: ['adminSites'], ['siteCareerList'],
// ['site', variables.id], ['public-site-logos']
```

**`src/components/sites/site-config-form.tsx`**

```ts
interface SiteConfigFormProps {
  mode: 'create' | 'edit'
  initialData?: SiteConfig
  onSubmit: (formData: SiteConfigFormData, logoFile: File | null) => Promise<void>
  submitLabel: string
  isSubmitting?: boolean
  onSubmitSuccess?: () => void
}

export default function SiteConfigForm(props: SiteConfigFormProps): JSX.Element
```

**`src/pages/adminSitesList.tsx`**

```ts
// Internal: useAdminSites(), useNavigate()
// Renders PageHeader + search + table (logo, site_name, scraping_type Badge,
//   is_active indicator, created_at, Edit button) + EmptyState
// "+ Novo Site" → navigate(PATHS.app.addNewSite)
// "Editar" → navigate(PATHS.app.editSite(site.id))
export default function AdminSitesListPage(): JSX.Element
```

**`src/pages/editSite.tsx`**

```ts
// Internal:
// const { id } = useParams<{ id: string }>()
// const siteId = parseInt(id ?? '', 10)
// const { data, isLoading, error } = useSite(siteId)
// const { mutateAsync } = useUpdateSiteConfig()
// Handles: invalid id → <Navigate>, loading → <LoadingSection>,
//   404 → <EmptyState>, success → <SiteConfigForm mode="edit" ...>
export default function EditSitePage(): JSX.Element
```

**`src/pages/ListSites.tsx`** — additions:

```ts
type SortKey = 'alphabetical' | 'newest' | 'subscribed_first'

const [sortBy, setSortBy] = useState<SortKey>(() => {
  const stored = localStorage.getItem('sitesSortBy')
  return (stored as SortKey) ?? 'alphabetical'
})
// effect persists; filteredCompanies useMemo gains .sort(sortFn[sortBy])
// JSX: Select next to FilterPills
```

---

## 3. Data Flows

### `GET /siteCareer` (admin list)

```
Request: GET /siteCareer, Cookie: Authorization=<jwt>
Middleware: GinMiddleware → Prometheus → CSRF → RequireAuth → RequireAdmin
Controller.GetAllSitesAdmin → usecase.GetAllSitesAdmin → repo.GetAllSitesAdmin
  SQL: SELECT ... FROM site_scraping_config (no WHERE is_active)
Response: 200 []SiteScrapingConfig (full model, active + inactive, incl. created_at)
Errors: 500 on repo failure
```

### `GET /siteCareer/:id`

```
Request: GET /siteCareer/57
Controller: parseIDParam(57) → usecase.GetSiteByID(57) → repo.GetSiteByID
  SQL: SELECT ... WHERE id = $1
  Returns model.ErrNotFound on sql.ErrNoRows
Response: 200 | 400 (bad id) | 404 (not found) | 500 (repo error)
```

### `PUT /siteCareer/:id`

```
Request: PUT /siteCareer/57
  Content-Type: multipart/form-data
  - siteData: JSON of SiteConfigFormData (empty→null on frontend)
  - logo (optional): image/png|jpeg|webp, max 2MB

Controller.UpdateSiteCareer:
  1. parseIDParam → id=57
  2. parseSiteMultipart:
     - ParseMultipartForm(2<<20)
     - FormFile("logo") [tolerant of ErrMissingFile]
     - FormValue("siteData") → json.Unmarshal → model.SiteScrapingConfig
     - double-unescape APIHeadersJSON / JSONDataMappings
  3. usecase.UpdateSiteCareer(ctx, 57, body, file):
     a. repo.GetSiteByID(57) → current
     b. file != nil: s3.UploadFile → newLogoURL
     c. Determine site.LogoURL:
        - newLogoURL != "" → site.LogoURL = &newLogoURL
        - else → site.LogoURL = current.LogoURL (preserves)
     d. site.ID = 57
     e. repo.UpdateSite(site) → updated
     f. if newLogoURL != "" AND current.LogoURL != nil AND
          *current.LogoURL != "" AND *current.LogoURL != newLogoURL:
          s3.DeleteFile(*current.LogoURL)  [warn on fail, don't propagate]
     g. return updated

Response: 200 SiteScrapingConfig | 400 | 404 | 500
```

### Frontend `AdminSitesListPage`

```
Mount → useAdminSites() fires GET /siteCareer
  Cache key: ['adminSites'], staleTime: 60s
Search input: client-side filter on site_name (no refetch)
"Editar" → navigate('/app/admin-sites/:id/edit')
```

### Frontend `EditSitePage`

```
Mount → useSite(id) fires GET /siteCareer/:id
  Cache key: ['site', id]
  enabled: !isNaN(id) && id > 0
Loading: <LoadingSection>
Error 404: <EmptyState> with back link
Success: <SiteConfigForm mode="edit" initialData={data}>

Submit → useUpdateSiteConfig.mutateAsync({ id, formData, logoFile })
onSuccess:
  toast.success + navigate(PATHS.app.adminSites)
onError: toast.error + setBtnError

Cache invalidation on mutation success:
  ['adminSites'], ['siteCareerList'], ['site', id], ['public-site-logos']
```

### Frontend `ListSites.tsx` sort

```
On mount:
  localStorage.getItem('sitesSortBy') → initial SortKey (fallback 'alphabetical')

filteredCompanies (useMemo, deps [searchTerm, data, filter, sortBy]):
  1. filter by searchTerm
  2. filter by subscription pill
  3. sort via sortFn[sortBy]:
     'alphabetical': Intl.Collator('pt', {sensitivity:'base'}).compare(a.site_name, b.site_name)
     'newest': (new Date(b.created_at).getTime()||0) - (new Date(a.created_at).getTime()||0)
     'subscribed_first': subscribed first, then alphabetical tiebreak
```

### `SiteConfigForm` create/edit divergence

```
mode='create':
  initialData: undefined → defaults
  Logo section: red asterisk; handleSubmit validates !logoFile
  onSubmitSuccess → parent (addNewSite) resets form

mode='edit':
  initialData: SiteConfig → formData initialized from it
  Logo section: if initialData.logo_url && !logoFile → show <img> + "Logo atual"
    button label: "Substituir"
  No logo-required validation
  handleFileChange: size guard > 2MB → error
  onSubmitSuccess → parent (editSite) navigates to adminSites
```

---

## 4. Build Sequence

**Phase A — Backend foundation** (`ScrapJobs/`) — parallel with Phase B

- A1. `infra/s3/s3_uploader.go` — `DeleteFile` on interface, Uploader, NoOpUploader
- A2. `infra/s3/s3_uploader_test.go` — five unit tests for DeleteFile
- A3. `repository/mocks/s3_uploader.go` — `DeleteFile` mock
- A4. `model/scrapingConfig.go` — `CreatedAt time.Time`
- A5. `interfaces/site_career_interface.go` + usecase interface — extend both (precedes impls)
- A6. `repository/mocks/site_career_repository.go` — three new mock methods (blocks on A5)
- A7. `usecase/site_career_usecase.go` — empty-string guard in create + three new methods (blocks on A1, A5)
- A8. `usecase/site_career_usecase_test.go` — eight new cases (blocks on A3, A6, A7)
- A9. `repository/site_career_repository.go` — created_at + three new methods (blocks on A4, A5)
- A10. `repository/repository_test.go` — three new integration tests (blocks on A9)
- A11. `controller/site_career_controller.go` — helpers + three handlers + DTO (blocks on A5, A7)
- A12. `controller/site_career_controller_test.go` — new file (blocks on A6, A11)
- A13. `cmd/api/main.go` — register three new routes (blocks on A11)
- A14. Ship backend PR

**Phase B — Frontend test harness** (`FrontScrapJobs/`) — parallel with Phase A

- B1. `src/pages/__tests__/addNewSite.test.tsx` — characterization suite
- B2. `npm run test` — all B1 tests green before proceeding

**Phase C — Frontend hotfix** — depends on B2 green; can ship independently

- C1. `addNewSite.tsx` — add logo-required validation + size guard + fix `accept` (svg→webp)
- C2. `i18n/locales/{pt-BR,en-US}/admin.json` — add `logoRequiredError`, `logoTooLargeError`
- C3. Update B1 tests with new validation cases
- C4. Confirm tests still green

**Phase D — Frontend refactor + edit** — depends on A14 + B2 green

- D1. `src/models/siteCareer.ts` — `SiteConfig` + `created_at` on SiteCareer
- D2. `src/services/siteCareerService.ts` — three new service methods
- D3. `src/hooks/useSiteCareer.ts` — `useAdminSites`, `useSite`
- D4. `src/hooks/useUpdateSiteConfig.ts` — mutation with four-key invalidation
- D5. `src/components/sites/site-config-form.tsx` — extract form (blocks on D1)
- D6. `src/pages/addNewSite.tsx` — reduce to thin wrapper (blocks on D5; B1 tests green)
- D7. `src/router/paths.ts` — `adminSites` + `editSite(id)` (parallel with D5/D6)
- D8. `src/pages/adminSitesList.tsx` — create (blocks on D3, D7)
- D9. `src/pages/editSite.tsx` — create (blocks on D3, D4, D5, D7)
- D10. `src/router/routes.tsx` — two new lazy routes (blocks on D7, D8, D9)
- D11. `src/components/common/app-header/index.tsx` — rename nav item (blocks on D7)
- D12. `i18n/` — `nav.manageSites`, `adminSites.*`, `editSite.*`
- D13. `src/pages/__tests__/editSite.test.tsx` + `adminSitesList.test.tsx`
- D14. `src/services/__tests__/siteCareerService.test.ts` — extend
- D15. `src/hooks/__tests__/useSiteCareer.test.ts` — extend

**Phase E — Frontend sort** — depends on D1; otherwise independent

- E1. `src/pages/ListSites.tsx` — SortKey, sortFn, Select, localStorage
- E2. `i18n/locales/{pt-BR,en-US}/sites.json` — `sort.*` keys
- E3. `src/pages/__tests__/ListSites.test.tsx` — sort correctness + localStorage + malformed date

**Phase F — E2E + verification** — depends on A14 + D10 + E1

- F1. `e2e/fixtures/api-mocks.ts` — admin user mock, admin site endpoints, Netflix fixture
- F2. `e2e/admin-sites.spec.ts` — Netflix repair flow
- F3. Pre-deploy ops: `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` + verify IAM `s3:DeleteObject`
- F4. Ship frontend PR (may split as C / D+E / F)

---

## 5. Integration Contracts

### `GET /siteCareer` (admin list)

**Response 200**
```json
[{
  "id": 57,
  "site_name": "Netflix Careers",
  "base_url": "https://jobs.netflix.com/search",
  "logo_url": null,
  "is_active": true,
  "scraping_type": "API",
  "job_list_item_selector": null,
  "title_selector": null,
  "link_selector": null,
  "link_attribute": null,
  "location_selector": null,
  "next_page_selector": null,
  "job_description_selector": null,
  "job_requisition_id_selector": null,
  "job_requisition_id_attribute": null,
  "api_endpoint_template": "https://...",
  "api_method": "GET",
  "api_headers_json": null,
  "api_payload_template": null,
  "json_data_mappings": "{...}",
  "created_at": "2026-04-20T00:00:00Z"
}]
```

**Note on `omitempty`**: current model has `json:"logo_url,omitempty"` — nil pointers omit the key. Either strip `omitempty` from model (cleanest; `ListSites.tsx` already handles missing) or normalize in service (`data.logo_url ?? null`). Applies to all endpoints returning `SiteScrapingConfig`.

### `GET /siteCareer/:id`

Same shape as single element. Errors: 400 `{"error": "ID inválido"}` / 404 `{"error": "Site não encontrado"}` / 500.

### `PUT /siteCareer/:id`

**Request** — `multipart/form-data`:
- `siteData`: JSON string (frontend null-cleans empty strings)
- `logo` (optional): `image/png|jpeg|webp`, max 2MB

**Response 200** — persisted row. Errors: 400 / 404 / 500.

### `GET /api/getSites` (public subscriber) — modified

Added field `created_at`. Go marshals `time.Time` as RFC 3339. Frontend parses with `new Date(s).getTime() || 0`.

---

## 6. Test Strategy

### Backend

**`infra/s3/s3_uploader_test.go`** (unit):
- `TestDeleteFile_EmptyURL` — returns nil, DeleteObject never called
- `TestDeleteFile_WrongBucket` — different bucket URL → nil, warn, no SDK call
- `TestDeleteFile_MalformedURL` — unparseable → nil, warn
- `TestDeleteFile_Success` — valid URL → extracts key correctly, calls DeleteObject
- `TestNoOpUploader_DeleteFile` — returns nil

For Uploader tests, inject mock s3.Client via interface wrapping DeleteObject.

**`usecase/site_career_usecase_test.go`** (unit, uses existing mocks):
- `TestInsertNewSiteCareer_EmptyLogoURL` — NoOp returns "" → LogoURL == nil
- `TestUpdateSiteCareer_NoNewLogo` — file=nil → LogoURL preserved, DeleteFile NOT called
- `TestUpdateSiteCareer_NewLogo` — file!=nil → UploadFile then UpdateSite then DeleteFile (order via mock.InOrder)
- `TestUpdateSiteCareer_UpdateFailsAfterUpload` — upload OK, update fails → DeleteFile NOT called
- `TestUpdateSiteCareer_DeleteFails` — all OK except DeleteFile → returns (updated, nil)
- `TestUpdateSiteCareer_SameLogoURL` — upload returns same URL → DeleteFile NOT called
- `TestUpdateSiteCareer_NotFound` — GetSiteByID returns ErrNotFound → propagated
- `TestUpdateSiteCareer_EmptyNewLogoURL` — NoOp with file!=nil + current has real URL → LogoURL preserved, DeleteFile NOT called

**`controller/site_career_controller_test.go`** (new; pattern from `user_site_controller_test.go`):
- `gin.SetMode(gin.TestMode)` already in `curriculum_controller_test.go` init — do NOT redeclare
- `setUserContext` helper from `curriculum_controller_test.go:28` — reuse
- Usecase wired with mock repos (pattern: `usecase.NewSiteCareerUsecase(mockRepo, mockUploader)`)
- Cases: GetAllSitesAdmin, GetSiteByID (hit/miss/bad id), UpdateSiteCareer (happy/bad-json/bad-id/not-found/usecase-error)
- Use `multipart.NewWriter` to build PUT test body

**`repository/repository_test.go`** (integration, dockertest):
- `TestGetAllSitesAdmin` — insert active + inactive → both appear
- `TestGetAllSites_SkipsInactive` — regression protection
- `TestGetSiteByID` — hit + miss (ErrNotFound)
- `TestUpdateSite` — insert, update every column, re-fetch, assert all changed

### Frontend

**`src/pages/__tests__/addNewSite.test.tsx`** (new; characterization BEFORE refactor):
- Mock `@/hooks/useAddSiteConfig` + `@/services/siteCareerService`
- Wrap with `I18nextProvider` or `vi.mock('react-i18next')` to return key strings
- Pattern: `render`, `screen`, `userEvent`
- Cases: happy path CSS, scraping type switch, missing name/URL validation, sandbox no URL, sandbox with URL, addSite error path
- After C1: logo-missing validation, file >2MB rejected

**`src/pages/__tests__/editSite.test.tsx`** (new):
- Mock `useParams` returning `{ id: '57' }`
- Mock `useSite`, `useUpdateSiteConfig`
- Cases: loading, 404, data populates form, logo preview renders, submit calls mutateAsync, success navigates

**`src/pages/__tests__/adminSitesList.test.tsx`** (new):
- Mock `useAdminSites`, `useNavigate`
- Cases: renders inactive rows, search filters, "+ Novo Site" navigation, "Editar" navigation

**`src/pages/__tests__/ListSites.test.tsx`** (new):
- Fixture: `{ site_name: 'Ácme', created_at: '2026-01-01' }`, `{ site_name: 'azure', is_subscribed: true }`, `{ site_name: 'Beta' }`, `{ site_name: 'Zoom', created_at: '' }`
- Cases: alphabetical (Intl.Collator handles accents), newest (Zoom last w/ epoch 0, no crash), subscribed first, localStorage persistence

**`src/services/__tests__/siteCareerService.test.ts`** (existing):
- `getAllSitesAdmin` → `api.get('/siteCareer')`
- `getSiteById` → `api.get('/siteCareer/57')`
- `updateSiteConfig` → `api.put` with FormData containing cleaned JSON + optional logo

**`src/hooks/__tests__/useSiteCareer.test.ts`** (existing):
- `useAdminSites` key ['adminSites']
- `useSite` enabled=false when isNaN(id)
- `useUpdateSiteConfig` onSuccess invalidates four keys (spy on invalidateQueries)

**`e2e/admin-sites.spec.ts`** (new Playwright):
- `mockAdminUser` with `is_admin: true`
- Mock routes: GET /siteCareer, GET /siteCareer/57, PUT /siteCareer/57, refreshed GET /api/getSites
- Flow: login admin → /app/admin-sites → Netflix row with placeholder → Editar → upload PNG → submit → back to list → logo visible → /app/sites (empresas) → Netflix card shows logo

---

## 7. Risks and Gotchas

**R1 — `logo_url` omitempty in Go model**
`model/scrapingConfig.go:7` has `json:"logo_url,omitempty"`. When nil, key is omitted. Frontend receives `undefined` for null logo sites. Fix: strip `omitempty` from `logo_url` OR normalize in service (`data.logo_url ?? null`). Cleanest: strip from model.

**R2 — `parseSiteMultipart` double-unescape fragility**
Existing `InsertNewSiteCareer` does JSON-string-within-JSON-string unescape for `APIHeadersJSON` and `JSONDataMappings` (controller:119-130). Extraction must reproduce exactly. Frontend must JSON-encode as plain strings (not double-encode).

**R3 — Controller test file doesn't exist**
`controller/site_career_controller_test.go` does not exist. `init()` with `gin.SetMode(gin.TestMode)` already exists in `curriculum_controller_test.go` — do NOT redeclare or compile error.

**R4 — Route conflict risk in Gin**
New routes at `/siteCareer` root level. Methods + path params differ, no conflict. Registration order not critical but list-before-parameterized is conventional.

**R5 — `MockSiteCareerUsecase` doesn't exist**
Controller tests wire the actual usecase with mock repos (pattern from `user_site_controller_test.go`). Preserve this — do not create `MockSiteCareerUsecase`.

**R6 — `PATHS.app` is `as const`**
Adding function value `editSite: (id: number) => ...` inside `as const` is valid TypeScript. Function return type is `string` (not literal), fine.

**R7 — `AdminGuard` + Suspense**
Two new routes need `<AdminGuard>` wrapping. Existing `addNewSite` route wraps directly without `<Suspense>` fallback. New pages use `lazy()` — wrap in `<Suspense>` like `adminDashboard`.

**R8 — `useUpdateSiteConfig` hook file placement**
Spec calls out separate file (matching `useAddSiteConfig.ts` convention). Alternatively could live in `useSiteCareer.ts` alongside new queries. Either consistent.

**R9 — `useAddSiteConfig` invalidation gap**
Existing hook only invalidates `['siteCareerList']`. After Phase D, should also invalidate `['adminSites']` so new row appears in admin list. Pre-existing gap — add during Phase D.

**R10 — S3 URL format assumption**
`UploadFile` produces `https://<bucket>.s3.amazonaws.com/<key>` (s3_uploader.go:86). `DeleteFile` must parse this exact format. Strip `<bucket>.` prefix, verify remaining host is `s3.amazonaws.com`, trim leading `/` from path as key. Don't rely on `path.Base` (keys have `logos/` prefix).

**R11 — Migration 028 `updated_at` column**
Adds both `created_at` and `updated_at`. Spec only adds `CreatedAt` to model. `UpdateSite` SQL should set `updated_at = NOW()` without mapping it in struct (DB updates without read-back).

**R12 — Frontend `pages/__tests__/` doesn't exist**
Create for the first time in Phase B. `tsconfig.test.json` default includes `**/*.{test,spec}.{ts,tsx}` — no config change needed.

**R13 — i18n `nav.addSite` key rename**
Only `app-header/index.tsx:35` uses it. Safe to rename to `nav.manageSites`. `admin.json addSite.title` (page title) unaffected.

**R14 — Concurrent admin edits (last-write-wins)**
Accepted v1 limitation per spec. No optimistic locking. Document in `UpdateSiteCareer` usecase comment.

**R15 — `created_at` zero-value for pre-migration rows**
Migration 028 applies `DEFAULT NOW()` at migration time — existing rows show migration date, not true creation date. "Newest" sort clusters pre-migration sites. Data artifact. Consider i18n label "Data de inclusão estimada" for accuracy.
