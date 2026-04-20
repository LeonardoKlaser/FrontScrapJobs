# Admin Site Management Improvements

**Date**: 2026-04-20
**Status**: Design (revised after internal review)
**Repos affected**: `ScrapJobs` (backend) + `FrontScrapJobs` (frontend)

## Context

The admin area around `site_scraping_config` has three gaps surfaced by a real incident: Netflix was added via the "Adicionar Site" page without a logo, the admin had no way to fix it from the UI, and the public listing in `/app/empresas` had no stable ordering.

This spec bundles three related changes that share surface area (the site form, the sites listing, admin navigation).

### Current state

- `pages/addNewSite.tsx` treats logo as optional — only `site_name` and `base_url` are required. Both frontend service (`siteCareerService.ts:44-46`) and backend (`controller/site_career_controller.go:106-110`, `usecase/site_career_usecase.go:27`) silently accept missing logo.
- No update endpoint exists. `cmd/api/main.go:435-436` registers only `POST /siteCareer`, `POST /scrape-sandbox` under admin routes, plus `GET /api/getSites` (public subscriber endpoint filtered to `is_active = TRUE`).
- `repository/site_career_repository.go:69-74` has no `ORDER BY` clause. Frontend `ListSites.tsx:47-55` doesn't sort either.
- `src/pages/__tests__/` does not exist — no page-level unit tests for `addNewSite.tsx` or any other page.
- Frontend file input accepts `png, jpeg, svg+xml`; backend `s3_uploader.go:47` allows `png, jpg, jpeg, webp`. SVG submits get a cryptic backend error; WebP is blocked client-side.

### Netflix incident

Site id 57 (Netflix Careers, API type) was inserted 2026-04-20 with `logo_url = NULL`, `is_active = true`. It surfaces in the authenticated `/app/empresas` page with a `Building2` placeholder icon, but is hidden from the public landing `SocialProofSection` (filtered by `logo_url IS NOT NULL` in `GetPublicSiteLogos`). This spec gives admins a path to fix it from the UI.

## Goals

1. Prevent logo-less sites from being created by accident.
2. Let admins edit every configurable field of a site (metadata, logo, scraping type, selectors, API config, is_active) without database access.
3. Let admins see and reactivate inactive sites (soft-deleted ones).
4. Give users a stable, user-controlled ordering of the companies list.

## Non-goals

- Hard-delete (`DELETE /siteCareer/:id`). Soft-delete via `is_active=false` is enough for v1. Hard-delete would cascade to `user_site` subscriptions, jobs history, and S3 logos — reserve for when there's a real need.
- Backend validation for logo presence. The `NoOpUploader` fallback (dev without S3) depends on the logo being optional at the API layer. The hotfix is frontend-only.
- Pagination of the sites list. At ~60 sites, a sorted client-side list is fine.
- Hierarchical sidebar menu with a "Gerenciar Sites" dropdown parent. A single nav item pointing to the admin list page (with a prominent "+ Novo Site" button) avoids reworking the header component.
- Optimistic locking / concurrent edit protection. Two admins editing the same site simultaneously is last-write-wins with no warning. Acceptable given the small admin pool; revisit if multi-admin editing becomes common.
- Cleaning stale fields on `scraping_type` switch (e.g. zeroing CSS selectors when admin changes to API). Pre-existing behavior in the create flow; not worth changing in edit either since the scraper picks fields based on `scraping_type` at runtime.
- Animation polish when the sort order changes (the existing staggered fade-in in `ListSites.tsx:164` may look jumpy on re-sort). Acceptable artifact.

## Feature 1 — Logo required in create form

### Scope
Frontend only. Ships inside the extracted `<SiteConfigForm>` (see Feature 2 refactor) since create and edit share the same form component.

### Changes

**`src/components/sites/site-config-form.tsx`** (new, see Feature 2):
- When `mode === 'create'`, `handleSubmit` validates `!logoFile` alongside `!site_name` / `!base_url`. Sets `validationError` and returns early.
- Logo section label gains `<span className="text-destructive">*</span>` conditionally on `mode === 'create'`.
- Client-side file size guard (`handleFileChange`): if `file.size > 2 * 1024 * 1024`, set error "Logo excede 2MB" and don't set `logoFile`. Matches the backend limit in `s3_uploader.go:38-41`.
- File input `accept` attribute aligned with backend: `accept="image/png, image/jpeg, image/webp"` (drop SVG, add WebP). See G5 resolution.

**`src/i18n/locales/{pt-BR,en-US}/admin.json`**:
- `addSite.logo.titleRequired` — e.g. "Logo *".
- `addSite.logoRequiredError` — e.g. "Selecione um logo para a empresa.".
- `addSite.logoTooLargeError` — e.g. "Logo excede 2MB.".

### Why not backend

The backend tolerance for missing logo is deliberate: `NoOpUploader` is substituted when `S3_BUCKET_NAME` is unset (dev and fallback environments). Adding a hard check in the controller would break those cases. The frontend validation is the right layer — all admin creation goes through this single form.

## Feature 2 — Edit site

### Scope
Backend: 3 new endpoints, 1 interface extension in S3 layer, new repo/usecase/controller methods, empty-string guard in the existing create flow. Frontend: characterization tests for existing create page, form extraction refactor, 2 new pages, 1 new nav item, new type, new service + hooks.

### Backend (`ScrapJobs/`)

**S3 uploader — `infra/s3/s3_uploader.go`**

Add `DeleteFile(ctx context.Context, url string) error` to `UploaderInterface`:
- `Uploader` (concrete): defensive URL parsing (G7):
  - If `url == ""`, return `nil` (no-op).
  - Expected format: `https://<bucket>.s3.amazonaws.com/<key>` (matches what `UploadFile` produces at line 87).
  - If parse fails OR host's bucket prefix ≠ `u.BucketName`, log warn and return `nil` (don't cross-bucket delete).
  - Otherwise, call `s3.DeleteObject` with extracted key. Return error on SDK failure.
- `NoOpUploader`: return `nil` unconditionally.

**Empty-string guard in existing create usecase** (C5)

`usecase/site_career_usecase.go:27-33` currently does:
```go
if file != nil {
    logoURL, err := uc.s3Uploader.UploadFile(ctx, file)
    if err != nil { ... }
    site.LogoURL = &logoURL   // ← writes &"" when NoOpUploader is active
}
```

Change to:
```go
if file != nil {
    logoURL, err := uc.s3Uploader.UploadFile(ctx, file)
    if err != nil { ... }
    if logoURL != "" {
        site.LogoURL = &logoURL
    }
}
```

Same guard applied in the new update path (below). Effect: when S3 is unconfigured, `LogoURL` stays `nil` instead of `&""`, so the DB gets `NULL` consistently.

**Interface — `interfaces/site_career.go`**

Add to `SiteCareerRepositoryInterface`:
- `GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)` — returns all sites, no `is_active` filter.
- `GetSiteByID(id int) (model.SiteScrapingConfig, error)` — returns `model.ErrNotFound` on `sql.ErrNoRows`.
- `UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error)`

Add to `SiteCareerUsecaseInterface`:
- `GetAllSitesAdmin() ([]model.SiteScrapingConfig, error)`
- `GetSiteByID(id int) (model.SiteScrapingConfig, error)`
- `UpdateSiteCareer(ctx, id int, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)`

**Repository — `repository/site_career_repository.go`**

- `GetAllSitesAdmin()` — same `SELECT` as `GetAllSites` but without `WHERE is_active = TRUE`. Includes `created_at` (see Feature 3).
- `GetSiteByID(id)` — `SELECT` of all columns with `WHERE id = $1`. Returns `model.ErrNotFound` on `sql.ErrNoRows`.
- `UpdateSite(site)` — `UPDATE site_scraping_config SET <every column> WHERE id = $1` RETURNING the row. Use `RETURNING` to return the persisted row in one roundtrip.

**Usecase — `usecase/site_career_usecase.go`**

`UpdateSiteCareer(ctx, id, site, file)` — correct ordering (C1):
1. `current, err := uc.repo.GetSiteByID(id)` — propagate `ErrNotFound`.
2. `newLogoURL := ""` (local var).
3. If `file != nil`:
   - `newLogoURL, err = uc.s3Uploader.UploadFile(ctx, file)` — abort on error (nothing persisted yet, safe).
4. Determine `site.LogoURL`:
   - If `newLogoURL != ""` → `site.LogoURL = &newLogoURL` (fresh upload succeeded).
   - Else → `site.LogoURL = current.LogoURL` (preserve; also covers NoOpUploader returning `""` and file==nil).
5. `site.ID = id` (URL param is authoritative).
6. `updated, err := uc.repo.UpdateSite(site)` — on error, abort. New logo (if any) is orphaned in S3 but old logo is intact in DB.
7. **Only after UpdateSite succeeds**, delete the old logo **only if we actually replaced it**. Condition (all must hold): `newLogoURL != ""` (we uploaded something new, not a NoOp) AND `current.LogoURL != nil` AND `*current.LogoURL != ""` (old was real) AND `*current.LogoURL != newLogoURL` (defensive — avoid deleting the URL we just stored). If true, call `uc.s3Uploader.DeleteFile(ctx, *current.LogoURL)`. Failure → `logging.Logger.Warn()` and continue. Return `updated`.

This ordering guarantees: UpdateSite failure → DB + existing logo untouched (new logo orphan acceptable). DeleteFile failure → update committed, old logo orphan acceptable. The `newLogoURL != ""` gate prevents the NoOp-uploader trap (upload returned "", we preserved the real current URL on the new row, must NOT delete it — we didn't actually replace anything).

**Controller — `controller/site_career_controller.go`**

- Extract private `parseSiteMultipart(ctx) (model.SiteScrapingConfig, *multipart.FileHeader, error)` — factors out the `ParseMultipartForm(2<<20)` + `FormFile("logo")` (tolerant of `http.ErrMissingFile`) + `FormValue("siteData")` unmarshal + the double-unescape of `APIHeadersJSON` / `JSONDataMappings`. Used by `InsertNewSiteCareer` and `UpdateSiteCareer`.
- `parseIDParam(ctx) (int, bool)` helper — `strconv.Atoi(ctx.Param("id"))`; on error, responds 400 and returns `(0, false)` so callers just `return` (G2).
- `GetAllSitesAdmin(ctx)` — calls usecase, returns 200 with `[]SiteScrapingConfig`.
- `GetSiteByID(ctx)` — parses id, calls usecase, returns 404 on `ErrNotFound`, 200 with config.
- `UpdateSiteCareer(ctx)` — parses id + multipart, calls usecase, returns 200 with updated config. Errors: 400 on bad JSON/id/file, 404 on not-found, 500 on usecase failure.

**Routes — `cmd/api/main.go` (in the existing `adminRoutes` group at line 425)**

```go
adminRoutes.GET("/siteCareer", siteCareerController.GetAllSitesAdmin)
adminRoutes.GET("/siteCareer/:id", siteCareerController.GetSiteByID)
adminRoutes.PUT("/siteCareer/:id", siteCareerController.UpdateSiteCareer)
```

All inherit CSRF + `RequireAuth` + `RequireAdmin` from the group.

### Frontend (`FrontScrapJobs/`)

**Characterization tests before refactor** (C4)

Create `src/pages/__tests__/` directory and `addNewSite.test.tsx`. Cover:
- Happy path submit (CSS type): fills required fields + logo file, submit calls `addSiteConfig` mutation with expected payload, success toast + form reset.
- Scraping type switch renders correct sections (CSS vs API vs HEADLESS).
- Validation: missing name/URL → error alert, mutation not called.
- Sandbox test button: no URL → toast error; with URL → calls `sandboxScrape`, renders results table.
- Handles `useAddSiteConfig` error path (mutation reject → error toast, button resets).

These tests pin the current behavior. The refactor (below) must keep them green.

**New type — `src/models/siteCareer.ts`** (C3)

Keep existing `SiteCareer` as the lightweight DTO for the public listing (`/api/getSites`). Add a new full-shape type:

```ts
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

`SiteCareer` is what the companies page consumes; `SiteConfig` is what admin list + edit pages consume. Also add `created_at: string` to `SiteCareer` (needed by Feature 3).

**Refactor — extract `<SiteConfigForm>`** (G4)

New file: `src/components/sites/site-config-form.tsx`. API:

```tsx
interface SiteConfigFormProps {
  mode: 'create' | 'edit'
  initialData?: SiteConfig
  onSubmit: (formData: SiteConfigFormData, logoFile: File | null) => Promise<void>
  submitLabel: string
  onSubmitSuccess?: () => void  // create clears form; edit navigates
}
```

Inside the form (moved out of `addNewSite.tsx`):
- `formData` state (initialized from `initialData` in edit, defaults in create).
- `logoFile` state + file input handler (with size + type validation).
- `paginationDelayMs` state.
- `validationError` state + `<Alert>`.
- `useButtonState` + submit button.
- `useSandboxScrape` + sandbox test button + results `<Card>` (P5).
- All cards (Basic Info, Strategy, CSS Selectors, API Config, Logo) with their full JSX.
- Required-marker logic keyed off `mode` (logo required only in create).
- **Edit-mode logo preview** (G3): when `mode === 'edit'` and `initialData.logo_url` exists and no new `logoFile` selected, render a thumbnail `<img>` in the Logo card with label "Logo atual" and the existing "Escolher imagem" button labeled "Substituir" instead.

Page wrappers:
- `pages/addNewSite.tsx` — thin: `<PageHeader>` + `<SiteConfigForm mode="create" submitLabel={...} onSubmit={handleAddSite} onSubmitSuccess={clearForm} />`. Uses `useAddSiteConfig`.
- `pages/editSite.tsx` (new) — `<PageHeader>` + `<SiteConfigForm mode="edit" initialData={...} submitLabel={...} onSubmit={handleUpdate} onSubmitSuccess={navigateToList} />`. Uses `useSite(id)` + `useUpdateSiteConfig`.

**Routes — `src/router/paths.ts`**

```ts
app: {
  // ...existing...
  adminSites: '/app/admin-sites',
  editSite: (id: number) => `/app/admin-sites/${id}/edit`,
}
```

`addNewSite: '/app/add-new-site'` stays — avoids a breaking URL change.

**Router — `src/router/routes.tsx`**

Two new lazy routes under `MainLayout` + `AdminGuard`:
- `/app/admin-sites` → `AdminSitesListPage`
- `/app/admin-sites/:id/edit` → `EditSitePage`

**Navigation — `src/components/common/app-header/index.tsx`**

Rename the admin nav item `t('nav.addSite') → PATHS.app.addNewSite` to `t('nav.manageSites') → PATHS.app.adminSites`. New i18n key `nav.manageSites` ("Gerenciar Sites" / "Manage Sites"). The create page stays reachable via a "+ Novo Site" button on the admin list.

**Pages**

`src/pages/adminSitesList.tsx`:
- Uses `useAdminSites()` (new, backed by `GET /siteCareer` — shows inactive too, per C2).
- Table with columns: mini logo (or `Building2` placeholder), `site_name`, `scraping_type` badge, `is_active` indicator (green check / gray dot), `created_at` (date), "Editar" button → `navigate(PATHS.app.editSite(id))`.
- Search input (reuses the pattern from `ListSites.tsx`).
- Top-right button "+ Novo Site" → `navigate(PATHS.app.addNewSite)`.
- Empty state if no sites.

`src/pages/editSite.tsx`:
- `useParams<{ id: string }>()`, parse to int; invalid → `<Navigate to={PATHS.app.adminSites} />`.
- `const { data, isLoading, error } = useSite(id)`.
- Loading → skeleton. Error 404 → "Site não encontrado" empty state with link back. Error 500 → toast + back link.
- Renders `<SiteConfigForm mode="edit" initialData={data} onSubmit={handleSubmit} onSubmitSuccess={() => navigate(PATHS.app.adminSites)} />`.

**Service — `src/services/siteCareerService.ts`**

```ts
getAllSitesAdmin: async (): Promise<SiteConfig[]> => {
  const { data } = await api.get('/siteCareer')
  return data
},
getSiteById: async (id: number): Promise<SiteConfig> => {
  const { data } = await api.get(`/siteCareer/${id}`)
  return data
},
updateSiteConfig: async (
  id: number, formData: SiteConfigFormData, logoFile: File | null
) => {
  const multipartData = new FormData()
  const cleanedData = Object.fromEntries(
    Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
  )
  multipartData.append('siteData', JSON.stringify(cleanedData))
  if (logoFile) multipartData.append('logo', logoFile)
  const { data } = await api.put(`/siteCareer/${id}`, multipartData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
```

**Hooks — `src/hooks/useSiteCareer.ts`**

```ts
useAdminSites()                // useQuery, key ['adminSites']
useSite(id: number)            // useQuery, key ['site', id], enabled: !isNaN(id)
useUpdateSiteConfig()          // useMutation, invalidates below
```

`useUpdateSiteConfig.onSuccess` invalidates **three** keys (G1):
- `['adminSites']` — admin list.
- `['siteCareerList']` — user companies page.
- `['site', id]` — the edited site's detail cache.
- `['public-site-logos']` — landing carousel; logo change must propagate without the 10-min stale window.

### Why PUT (not PATCH)

The edit form always renders and submits every field (matching the create form). The endpoint semantics are "replace the site's configuration" — PUT is the honest verb. PATCH would imply partial updates that neither the form nor the backend actually support.

## Feature 3 — Sorted companies list

### Scope
Backend: one column added to the public DTO. Frontend: one dropdown in one page, plus localStorage persistence.

### Backend

**`model/scrapingConfig.go`** — add `CreatedAt time.Time` to `SiteScrapingConfig` (column already exists from migration 028).

**`repository/site_career_repository.go:69`** — add `created_at` to the `SELECT` list of `GetAllSites` and to the `Scan` arg list. Also added to `GetAllSitesAdmin` and `GetSiteByID` (Feature 2).

**`controller/site_career_controller.go` `GetAllSites` `siteDTO`** — add `CreatedAt time.Time `json:"created_at"` field + assign it when building the response.

No new route. No `ORDER BY` in the SQL — the frontend does the sorting.

### Frontend

**Type — `src/models/siteCareer.ts`** — add `created_at: string` to `SiteCareer` (already in `SiteConfig` from Feature 2 changes).

**Page — `src/pages/ListSites.tsx`**

Add a `Select` (shadcn, `src/components/ui/select.tsx` already exists) next to `FilterPills` with three options:

```ts
type SortKey = 'alphabetical' | 'newest' | 'subscribed_first'

const collator = new Intl.Collator('pt', { sensitivity: 'base' })

const sortFn: Record<SortKey, (a: SiteCareer, b: SiteCareer) => number> = {
  alphabetical: (a, b) => collator.compare(a.site_name, b.site_name),
  newest: (a, b) => {
    const ta = new Date(a.created_at).getTime() || 0
    const tb = new Date(b.created_at).getTime() || 0
    return tb - ta
  },
  subscribed_first: (a, b) => {
    if (a.is_subscribed !== b.is_subscribed) return a.is_subscribed ? -1 : 1
    return collator.compare(a.site_name, b.site_name)
  }
}
```

- `Intl.Collator` with `'pt', { sensitivity: 'base' }` handles accents and case consistently (P2).
- `new Date(x).getTime() || 0` falls back to epoch 0 if the string fails to parse, preventing `NaN` from corrupting the sort (P1).

State:
```ts
const [sortBy, setSortBy] = useState<SortKey>(() => {
  const stored = localStorage.getItem('sitesSortBy')
  return (stored as SortKey) ?? 'alphabetical'
})
useEffect(() => { localStorage.setItem('sitesSortBy', sortBy) }, [sortBy])
```

Wire the existing `useMemo` (lines 47-55) to apply `.sort(sortFn[sortBy])` as the last step. Dependencies: `[searchTerm, data, filter, sortBy]`.

**i18n — `src/i18n/locales/{pt-BR,en-US}/sites.json`** — four new keys under `sort`: `label`, `alphabetical`, `newest`, `subscribedFirst`.

## Testing

### Backend

`controller/site_career_controller_test.go`:
- `TestGetAllSitesAdmin` — returns both active and inactive sites.
- `TestGetSiteByID` — happy path + 404.
- `TestGetSiteByID_InvalidID` — non-numeric → 400.
- `TestUpdateSiteCareer` — happy path, 400 on invalid JSON, 400 on invalid id, 404 on not-found, 500 on usecase error.

`usecase/site_career_usecase_test.go`:
- `TestInsertNewSiteCareer_EmptyLogoURL` — NoOpUploader returns `""` → `site.LogoURL` stays nil (C5).
- `TestUpdateSiteCareer_NoNewLogo` — `file == nil` preserves `LogoURL` from current record.
- `TestUpdateSiteCareer_NewLogo` — `file != nil`: `UploadFile` first, then `UpdateSite`, then `DeleteFile` with old URL (in that order — assert call order via mock).
- `TestUpdateSiteCareer_UpdateFailsAfterUpload` — upload succeeds, `UpdateSite` returns error → `DeleteFile` NOT called (old logo intact per C1).
- `TestUpdateSiteCareer_DeleteFails` — upload + update succeed, delete returns error → usecase returns the updated config, error is logged (not propagated).
- `TestUpdateSiteCareer_SameLogoURL` — `file != nil` but upload returned same URL as current → skip `DeleteFile` (would delete the new one).
- `TestUpdateSiteCareer_NotFound` — `GetSiteByID` returns `ErrNotFound` → usecase propagates.
- `TestUpdateSiteCareer_EmptyNewLogoURL` — NoOpUploader returns `""` with `file != nil` and `current.LogoURL` pointing to a real URL → `site.LogoURL` preserved from current (not overwritten with empty) AND `DeleteFile` is NOT called (would delete the still-referenced current logo).

`repository/site_career_repository_test.go` (dockertest integration):
- `TestUpdateSite` — insert, update every column, re-fetch, assert all changes.
- `TestGetSiteByID` — hit + miss (returns `ErrNotFound`).
- `TestGetAllSitesAdmin` — returns inactive sites that `GetAllSites` filters out.

`infra/s3/s3_uploader_test.go`:
- `TestDeleteFile_EmptyURL` — returns nil, no SDK call (G7).
- `TestDeleteFile_WrongBucket` — URL pointing to a different bucket → returns nil, warn logged, no SDK call.
- `TestDeleteFile_MalformedURL` — unparseable URL → returns nil, warn logged.
- `TestDeleteFile_Success` — valid URL → extracts key correctly, calls `DeleteObject`.
- `TestNoOpUploader_DeleteFile` — returns nil.

Mocks — `repository/mocks/site_career_repository.go` + S3 uploader mock: add `UpdateSite`, `GetSiteByID`, `GetAllSitesAdmin`, `DeleteFile`.

### Frontend

`src/pages/__tests__/addNewSite.test.tsx` (new, **pre-requisite to refactor** per C4):
- Characterization suite described above — must pass BEFORE the `<SiteConfigForm>` extraction.
- After refactor, same suite stays green.
- New case: submit without logo in create mode → validation error shown, `addSite` mutation not called (Feature 1).
- New case: logo file >2MB selected → error shown, file rejected.

`src/pages/__tests__/editSite.test.tsx` (new):
- Loading state renders while `useSite` pending.
- 404 error renders empty state.
- On data, form populates from `initialData` (assert a selector value, a scraping_type, the logo preview).
- Submit calls `updateSiteConfig(id, formData, logoFile)`.
- On success, navigate to admin list + toast.

`src/pages/__tests__/adminSitesList.test.tsx` (new):
- Renders table with all sites including inactive (assert an `is_active=false` fixture appears).
- "+ Novo Site" navigates to `addNewSite`.
- "Editar" button navigates to `editSite(id)`.
- Search filters by `site_name`.

`src/services/__tests__/siteCareerService.test.ts`:
- `getAllSitesAdmin` hits `/siteCareer`.
- `getSiteById` returns parsed site.
- `updateSiteConfig` sends multipart PUT to `/siteCareer/:id`.

`src/hooks/__tests__/useSiteCareer.test.ts`:
- `useSite` caches by id, `enabled` guards invalid id.
- `useAdminSites` caches with `['adminSites']` key.
- `useUpdateSiteConfig` invalidates `['adminSites']`, `['siteCareerList']`, `['site', id]`, `['public-site-logos']`.

`src/pages/__tests__/ListSites.test.tsx` (new):
- Each sort option produces the expected order against a fixture with accents + subscription mix.
- `Intl.Collator('pt')` sorts "Ácme" correctly relative to "Azure".
- Selection persists to localStorage and hydrates on remount.
- Malformed `created_at` doesn't crash (produces fallback order).

`e2e/admin-sites.spec.ts` (new Playwright):
- Admin logs in, navigates to `/app/admin-sites`, sees the Netflix row with placeholder logo.
- Clicks "Editar", uploads a PNG, saves.
- Redirects to admin list; Netflix row now shows the logo thumbnail.
- Navigates to `/app/empresas`, filter "Todas" → Netflix card shows the logo (cache invalidation proved).

## Risks

- **Form refactor regression**. 800 lines with mixed state/i18n/validation. Mitigated by the characterization test suite that lands BEFORE the extraction (C4). Run the full unit + e2e suite between the test-add commit and the extraction commit; any failure means the refactor changed behavior.
- **S3 `DeleteObject` IAM**. If the bucket policy or app IAM role denies `s3:DeleteObject`, every edit with a logo change logs a warn and leaves orphans. Verify the production role has `s3:DeleteObject` on `logos/*` before merging the backend PR; if denied, accept as tradeoff and document (orphans accumulate ~KB per edit — negligible for years).
- **Admin list page scales**. 57 sites fits in a table today. If growth accelerates past a few hundred, revisit with pagination — not in this spec.
- **Concurrent edits**. Two admins editing the same site is last-write-wins silently. Accepted limitation for v1 given admin pool size.
- **`logo_url` historical empty strings**. If any rows currently have `logo_url = ''` (from the pre-guard NoOpUploader path), they're treated as "no logo" by the new `DeleteFile` (empty-URL skip). Safe. No data migration needed, but verify with `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` before the backend PR.

## Migrations

None. `created_at` exists (migration 028). `logo_url` is already nullable (migration 013). No schema changes.

## Netflix remediation

After this ships, the admin opens `/app/admin-sites`, clicks "Editar" on Netflix, uploads a PNG (or WebP — now supported after G5 fix), and saves. No SQL needed. Until it ships, a manual `UPDATE site_scraping_config SET logo_url = 'https://<bucket>.s3.amazonaws.com/logos/<uuid>.png' WHERE id = 57` via `railway run psql` (after uploading the file directly to S3) is the workaround.

## Sequencing

When this goes to implementation, the natural order is:

**Phase A — Backend foundation** (`ScrapJobs`)
1. `DeleteFile` interface extension + concrete + NoOp impl + unit tests (defensive URL parsing).
2. Empty-string guard in existing `InsertNewSiteCareer` usecase path (C5) + test.
3. `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite` repo methods + integration tests.
4. `UpdateSiteCareer` usecase (correct ordering) + unit tests covering all failure modes.
5. `parseSiteMultipart` and `parseIDParam` helpers + 3 new controller handlers + tests.
6. `created_at` added to model + queries + DTO.
7. Routes wired in `main.go`.
8. Ship backend PR.

**Phase B — Frontend test harness** (`FrontScrapJobs`)
9. Create `src/pages/__tests__/` and land `addNewSite.test.tsx` characterization suite — green against CURRENT code.

**Phase C — Frontend hotfix option** (cherry-pick candidate)
10. Feature 1 logo-required validation + file-size guard + accept alignment (applied directly to current `addNewSite.tsx`, not yet extracted). Ships as standalone hotfix PR if wanted before Phase D.

**Phase D — Frontend refactor + edit**
11. Extract `<SiteConfigForm>` — characterization suite (Phase B) + hotfix (Phase C) must stay green.
12. Add `SiteConfig` type + service methods + hooks.
13. `AdminSitesListPage` + route + nav rename.
14. `EditSitePage` + route.
15. Logo preview + file-size guard live in the extracted form.
16. Cache invalidation covers all four query keys.

**Phase E — Frontend sort**
17. `SiteCareer` gets `created_at`, `ListSites.tsx` adds dropdown + localStorage + collator sort.

**Phase F — E2E + polish**
18. Playwright spec covering the Netflix-repair flow end-to-end.
19. Verify production IAM has `s3:DeleteObject`. Run the `logo_url = ''` count check.
20. Ship frontend PR (or split Phase C / D+E / F if preferred).

Phases A and B can proceed in parallel (different repos). Phase C can ship independently for the logo-required hotfix. Phases D–F depend on A+B.
