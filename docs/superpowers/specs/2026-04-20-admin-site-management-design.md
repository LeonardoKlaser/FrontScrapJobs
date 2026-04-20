# Admin Site Management Improvements

**Date**: 2026-04-20
**Status**: Design
**Repos affected**: `ScrapJobs` (backend) + `FrontScrapJobs` (frontend)

## Context

The admin area around `site_scraping_config` has three gaps surfaced by a real incident: Netflix was added via the "Adicionar Site" page without a logo, the admin had no way to fix it from the UI, and the public listing in `/app/empresas` had no stable ordering.

This spec bundles three related changes that share surface area (the site form, the sites listing, admin navigation).

### Current state

- `pages/addNewSite.tsx` treats logo as optional — only `site_name` and `base_url` are required. Both frontend service (`siteCareerService.ts:44-46`) and backend (`controller/site_career_controller.go:106-110`, `usecase/site_career_usecase.go:27`) silently accept missing logo.
- No update endpoint exists. `cmd/api/main.go` registers only `GetAllSites`, `InsertNewSiteCareer`, `SandboxScrape` under `/siteCareer`.
- `repository/site_career_repository.go:69-74` has no `ORDER BY` clause. Frontend `ListSites.tsx:47-55` doesn't sort either.

### Netflix incident

Site id 57 (Netflix Careers, API type) was inserted 2026-04-20 with `logo_url = NULL`, `is_active = true`. It surfaces in the authenticated `/app/empresas` page with a `Building2` placeholder icon, but is hidden from the public landing `SocialProofSection` (filtered by `logo_url IS NOT NULL` in `GetPublicSiteLogos`). This spec gives admins a path to fix it from the UI.

## Goals

1. Prevent logo-less sites from being created by accident.
2. Let admins edit every configurable field of a site (metadata, logo, scraping type, selectors, API config, is_active) without database access.
3. Give users a stable, user-controlled ordering of the companies list.

## Non-goals

- Hard-delete (`DELETE /siteCareer/:id`). Soft-delete via `is_active=false` is enough for v1. Hard-delete would cascade to `user_site` subscriptions, jobs history, and S3 logos — reserve for when there's a real need.
- Backend validation for logo presence. The `NoOpUploader` fallback (dev without S3) depends on the logo being optional at the API layer. The hotfix is frontend-only.
- Pagination of the sites list. At ~60 sites, a sorted client-side list is fine.
- Hierarchical sidebar menu with a "Gerenciar Sites" dropdown parent. A single nav item pointing to the admin list page (with a prominent "+ Novo Site" button) avoids reworking the header component.

## Feature 1 — Logo required in create form

### Scope
One file in the frontend.

### Changes

**`src/pages/addNewSite.tsx`**:
- `handleSubmit` validates `!logoFile` alongside `!site_name` / `!base_url`. Sets `validationError` and returns early.
- Logo section label gains the same `<span className="text-destructive">*</span>` marker used for required fields.

**`src/i18n/locales/{pt-BR,en-US}/admin.json`**:
- `addSite.logo.titleRequired` — e.g. "Logo *".
- `addSite.logoRequiredError` — e.g. "Selecione um logo para a empresa.".

### Why not backend

The backend tolerance for missing logo is deliberate: `NoOpUploader` is substituted when `S3_BUCKET_NAME` is unset (dev and fallback environments). Adding a hard check in the controller would break those cases. The frontend validation is the right layer — all admin creation goes through this single form.

## Feature 2 — Edit site

### Scope
Backend: 2 new endpoints, 1 interface change in S3 layer, new repo/usecase/controller methods. Frontend: form extraction refactor, 2 new pages, 1 new nav item, new service + hooks.

### Backend (`ScrapJobs/`)

**S3 uploader — `infra/s3/s3_uploader.go`**

Add `DeleteFile(ctx context.Context, url string) error` to `UploaderInterface`:
- `Uploader` (concrete): parse the S3 object key from the full URL, call `s3.DeleteObject`.
- `NoOpUploader`: return `nil` (idempotent fallback for dev).

**Interface — `interfaces/site_career.go`**

Add to `SiteCareerRepositoryInterface`:
- `GetSiteByID(id int) (model.SiteScrapingConfig, error)`
- `UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error)`

Add to `SiteCareerUsecaseInterface`:
- `GetSiteByID(id int) (model.SiteScrapingConfig, error)`
- `UpdateSiteCareer(ctx, id int, site model.SiteScrapingConfig, file *multipart.FileHeader) (model.SiteScrapingConfig, error)`

**Repository — `repository/site_career_repository.go`**

- `GetSiteByID(id)` — `SELECT` of the same columns as `GetAllSites` (including new `created_at`, see Feature 3) with `WHERE id = $1`. Returns `model.ErrNotFound` on `sql.ErrNoRows` (standard sentinel).
- `UpdateSite(site)` — `UPDATE site_scraping_config SET ... WHERE id = $1` for every column in `SiteScrapingConfig`. Returns the updated row.

**Usecase — `usecase/site_career_usecase.go`**

`UpdateSiteCareer(ctx, id, site, file)`:
1. `current, err := uc.repo.GetSiteByID(id)` — 404 if missing.
2. If `file != nil`:
   - `logoURL, err := uc.s3Uploader.UploadFile(ctx, file)` — abort on error.
   - If `current.LogoURL != nil`, call `uc.s3Uploader.DeleteFile(ctx, *current.LogoURL)`. Failure logs a `Warn` and continues — don't block the update on cleanup.
   - `site.LogoURL = &logoURL`.
3. If `file == nil`, preserve `current.LogoURL` on `site` (frontend won't send it — the PUT payload omits it).
4. `site.ID = id` (defensive — the URL param is authoritative).
5. `return uc.repo.UpdateSite(site)`.

**Controller — `controller/site_career_controller.go`**

Extract a private `parseSiteMultipart(ctx) (model.SiteScrapingConfig, *multipart.FileHeader, error)` helper. `InsertNewSiteCareer` and the new `UpdateSiteCareer` both use it.

New handlers:
- `GetSiteByID(ctx)` — reads `:id` param, returns 404 on `model.ErrNotFound`, 200 with `SiteScrapingConfig`.
- `UpdateSiteCareer(ctx)` — parses multipart, reads `:id`, calls usecase, returns 200 with updated site.

**Routes — `cmd/api/main.go`**

Under the existing admin-guarded group:
- `adminRoutes.GET("/siteCareer/:id", siteCareerController.GetSiteByID)`
- `adminRoutes.PUT("/siteCareer/:id", siteCareerController.UpdateSiteCareer)`

### Frontend (`FrontScrapJobs/`)

**Refactor — extract `<SiteConfigForm>`**

Current `pages/addNewSite.tsx` mixes form state, submission, and the sandbox test button in one ~800-line file. Extract the form to `src/components/sites/site-config-form.tsx`:

```tsx
interface SiteConfigFormProps {
  mode: 'create' | 'edit'
  initialData?: SiteCareer
  onSubmit: (formData: SiteConfigFormData, logoFile: File | null) => Promise<void>
  submitLabel: string
  isSubmitting: boolean
}
```

- Logo field becomes required in `create` mode; in `edit` mode it's optional (keeping the existing logo if no new file is selected). The required-marker + error check are conditional on `mode`.
- Sandbox test button stays inside the form — works in both modes.
- `addNewSite.tsx` becomes a thin wrapper that provides `mode="create"` and calls `useAddSiteConfig()`.

This refactor ships **before** the edit page is wired up, with the existing add-site flow still green in tests, so create-regressions are caught early.

**Routes — `src/router/paths.ts`**

```ts
app: {
  // ...existing...
  adminSites: '/app/admin-sites',
  editSite: (id: number) => `/app/admin-sites/${id}/edit`,
}
```

`addNewSite: '/app/add-new-site'` stays — avoids a breaking URL change for any external references.

**Router — `src/router/routes.tsx`**

Two new lazy routes under `MainLayout` + `AdminGuard`:
- `/app/admin-sites` → `AdminSitesListPage`
- `/app/admin-sites/:id/edit` → `EditSitePage`

**Navigation — `src/components/common/app-header/index.tsx`**

The admin nav item currently labeled `t('nav.addSite')` pointing to `PATHS.app.addNewSite` becomes `t('nav.manageSites')` pointing to `PATHS.app.adminSites`. The create page stays reachable via a "+ Novo Site" button on the admin list.

New i18n key: `nav.manageSites` ("Gerenciar Sites" / "Manage Sites").

**Pages**

`src/pages/adminSitesList.tsx`:
- Reuses `useSiteCareer()` (already in place).
- Table or card layout with: mini logo (or placeholder), `site_name`, `scraping_type` badge, `is_active` indicator, "Editar" button → `navigate(PATHS.app.editSite(id))`.
- Search input (reuses the pattern from `ListSites.tsx`).
- Top-right button "+ Novo Site" → `navigate(PATHS.app.addNewSite)`.

`src/pages/editSite.tsx`:
- `useParams<{ id: string }>()` → number.
- `const { data, isLoading } = useSite(id)` — loader handles not-found via React Query error boundary or an inline empty state.
- Renders `<SiteConfigForm mode="edit" initialData={data} onSubmit={handleSubmit} />`.
- `handleSubmit` calls `useUpdateSiteConfig()` mutation; on success, toast + `navigate(PATHS.app.adminSites)`.

**Service — `src/services/siteCareerService.ts`**

```ts
getSiteById: async (id: number): Promise<SiteCareer> => { ... },
updateSiteConfig: async (id: number, formData: SiteConfigFormData, logoFile: File | null) => { ... },
```

`updateSiteConfig` mirrors `addSiteConfig`'s multipart shape — same `siteData` JSON envelope + optional `logo` file. The only difference is the HTTP verb (`PUT`) and the URL includes `/:id`.

**Hooks — `src/hooks/useSiteCareer.ts`**

```ts
useSite(id: number)            // useQuery, key ['site', id]
useUpdateSiteConfig()          // useMutation, invalidates ['siteCareerList'] + ['site', id]
```

### Why PUT (not PATCH)

The edit form always renders and submits every field (matching the create form). The endpoint semantics are "replace the site's configuration" — PUT is the honest verb. PATCH would imply partial updates that neither the form nor the backend actually support.

## Feature 3 — Sorted companies list

### Scope
Backend: one column added to the public DTO. Frontend: one dropdown in one page, plus localStorage persistence.

### Backend

**`model/scrapingConfig.go`** — add `CreatedAt time.Time` to `SiteScrapingConfig` (column already exists from migration 028).

**`repository/site_career_repository.go:69`** — add `created_at` to the `SELECT` list of `GetAllSites` and to the `Scan` arg list.

**`controller/site_career_controller.go` `GetAllSites` `siteDTO`** — add `CreatedAt time.Time` field + assign it when building the response.

No new route. No `ORDER BY` in the SQL — the frontend does the sorting.

### Frontend

**Type — `src/models/siteCareer.ts`** — add `created_at: string` to the `SiteCareer` interface.

**Page — `src/pages/ListSites.tsx`**

Add a `Select` (shadcn, matches existing component style) next to `FilterPills` with three options:
- `alphabetical` — default. `[...sites].sort((a, b) => a.site_name.localeCompare(b.site_name))`.
- `newest` — `sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))`.
- `subscribed_first` — subscribed entries first (already alphabetical within each group).

The sorted value derives from `filteredCompanies` inside the same `useMemo`. State lives in `useState<SortKey>()` with a lazy initializer that reads `localStorage.getItem('sitesSortBy')` (falling back to `alphabetical`), and a `useEffect` that writes on change. No library needed.

**i18n — `src/i18n/locales/{pt-BR,en-US}/sites.json`** — four new keys under `sort`: `label`, `alphabetical`, `newest`, `subscribedFirst`.

## Testing

### Backend

`controller/site_career_controller_test.go`:
- `TestGetSiteByID` — happy path + 404.
- `TestUpdateSiteCareer` — happy path, 400 on invalid JSON, 500 on usecase error.

`usecase/site_career_usecase_test.go`:
- `TestUpdateSiteCareer_NoNewLogo` — `file == nil` preserves `LogoURL` from the current record.
- `TestUpdateSiteCareer_NewLogo` — `file != nil` calls `UploadFile`, then `DeleteFile` with old URL, writes new URL.
- `TestUpdateSiteCareer_DeleteFails` — upload succeeds, delete returns error → update still completes, error is logged.
- `TestUpdateSiteCareer_NotFound` — `GetSiteByID` returns `ErrNotFound` → usecase propagates.

`repository/site_career_repository_test.go` (dockertest integration):
- `TestUpdateSite` — insert, update, re-fetch, assert changes.
- `TestGetSiteByID` — hit + miss.

Mocks — `repository/mocks/site_career_repository.go` + `infra/s3/mocks` (or inline mock): add `UpdateSite`, `GetSiteByID`, `DeleteFile`.

### Frontend

`services/__tests__/siteCareerService.test.ts`:
- `getSiteById` returns parsed site.
- `updateSiteConfig` sends multipart with correct URL, method PUT, and payload shape.

`hooks/__tests__/useSiteCareer.test.ts`:
- `useSite` caches by id.
- `useUpdateSiteConfig` invalidates both `['siteCareerList']` and `['site', id]`.

`pages/__tests__/addNewSite.test.tsx` (new):
- Submit without logo → validation error shown, `addSite` mutation not called.

`pages/__tests__/editSite.test.tsx` (new):
- Form populates with `initialData`.
- Submit calls `updateSiteConfig(id, formData, logoFile)`.
- On success, toast + navigate.

`pages/__tests__/ListSites.test.tsx`:
- Each sort option produces the expected order against a fixture of 3+ companies.
- Selection persists to localStorage and hydrates on remount.

`e2e/admin-sites.spec.ts` (new Playwright):
- Admin logs in, navigates to `/app/admin-sites`, clicks "Editar" on Netflix, uploads a logo, saves, sees the logo on the public `/app/empresas` page (filter "Todas").

## Risks

- **Form refactor regression**. 800 lines of mixed state/i18n/validation — easy to drop a field or change a label name by accident. Mitigation: refactor ships as its own commit with all existing unit + e2e tests passing before the edit page is touched.
- **S3 DeleteObject IAM**. If the bucket policy or app IAM role denies `s3:DeleteObject`, the logo cleanup logs a warn every edit. Not a hard failure, but accumulates noise + orphans. Verify the production role has delete permission before merge; if not, either grant it or accept the tradeoff and document.
- **Admin list page scales**. 57 sites fits comfortably in a table today. If growth accelerates past a few hundred, revisit with pagination (not in this spec).

## Migrations

None. `created_at` exists (migration 028). `logo_url` is already nullable (migration 013). No schema changes.

## Netflix remediation

After this ships, the admin opens `/app/admin-sites`, clicks "Editar" on Netflix, uploads a PNG/SVG, and saves. No SQL needed. Until it ships, a manual `UPDATE site_scraping_config SET logo_url = '...' WHERE id = 57` via `railway run psql` is the workaround.

## Sequencing

When this goes to implementation, the natural order is:
1. Backend: S3 `DeleteFile` interface change + `GetSiteByID` + `UpdateSite` (repo/usecase/controller/routes/tests).
2. Backend: `created_at` added to DTO.
3. Frontend: refactor `<SiteConfigForm>` extraction.
4. Frontend: logo-required validation (Feature 1) — ships first as a hotfix PR if desired.
5. Frontend: admin list page + edit page + new routes + nav rename.
6. Frontend: sort dropdown + localStorage.
7. E2E test landing the whole flow.

Steps 1–2 live in `ScrapJobs`. Steps 3–7 live in `FrontScrapJobs`. Feature 1 (step 4) can be cherry-picked to its own hotfix PR if the admin wants it deployed before the edit feature lands.
