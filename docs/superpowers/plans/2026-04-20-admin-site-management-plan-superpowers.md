# Admin Site Management Improvements — TDD Plan

**Spec**: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/docs/superpowers/specs/2026-04-20-admin-site-management-design.md`
**Date**: 2026-04-20
**Repos**: `ScrapJobs/` (Go backend) + `FrontScrapJobs/` (React frontend)

## Goal

Close three gaps in the admin site-management flow surfaced by the Netflix incident:
1. Block logo-less site creation from the UI.
2. Let admins edit any field of `site_scraping_config` (including logo) without DB access, and reactivate inactive sites.
3. Give users a stable, persistent ordering on `/app/empresas`.

## Architecture

- **Backend (Go / hexagonal)**: extend `infra/s3` uploader with `DeleteFile`, add 3 repo + usecase + controller methods (`GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer`), wire under the existing `adminRoutes` group. Add `created_at` to the public listing DTO. No migrations — columns already exist.
- **Frontend (React 19 + Vite 7)**: characterization-test the existing create page BEFORE refactor, extract `<SiteConfigForm>`, add `AdminSitesListPage` + `EditSitePage`, sort dropdown on companies list with `localStorage` persistence + `Intl.Collator('pt')`.
- **Sequencing (from spec)**: Phases A (backend) and B (FE test harness) can run in parallel. Phase C ships standalone as a hotfix. D, E, F depend on A+B.

## Tech Stack

- Go 1.24, `database/sql`, `gin`, `aws-sdk-go-v2/s3`, `ory/dockertest` (integration), mocks in `repository/mocks/`.
- React 19, TS, Vite 7, `@tanstack/react-query`, `axios`, shadcn/ui, `react-i18next`, Vitest + Testing Library, Playwright.

## Conventions (from CLAUDE.md)

- Backend: Portuguese log/comment strings, typed sentinel errors, `TRUSTED_PROXIES` preserved, NoOp-based graceful degradation.
- Frontend: no semicolons, single quotes, max-len 100, `PATHS.app.*` over hardcoded URLs, services never imported directly from components — go through hooks.

---

# Phase A — Backend foundation (`ScrapJobs/`)

Run from `/Users/erickschaedler/Documents/Scrap/ScrapJobs`. All test commands use `-race -count=1 -timeout=120s` to match CI.

## - [ ] Task A1: Extend `UploaderInterface` with `DeleteFile` + defensive URL parsing

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/infra/s3/s3_uploader.go`
- Create: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/infra/s3/s3_uploader_test.go`

**TDD**

1. Write `infra/s3/s3_uploader_test.go` covering all five spec cases. Because `Uploader` uses `*s3.Client` (concrete), the real S3 SDK path cannot be unit-tested without abstracting the SDK; instead, cover only the pre-SDK guards (empty URL, malformed URL, wrong bucket) plus `NoOpUploader.DeleteFile`. Add a small helper `parseBucketKey(url string) (bucket, key string, ok bool)` and unit-test it directly:

```go
package s3

import (
	"context"
	"testing"
)

func TestParseBucketKey(t *testing.T) {
	cases := []struct {
		name, url, bucket, key string
		ok                     bool
	}{
		{"valid", "https://my-bucket.s3.amazonaws.com/logos/abc.png", "my-bucket", "logos/abc.png", true},
		{"empty", "", "", "", false},
		{"missing host", "https://", "", "", false},
		{"no suffix", "https://my-bucket.example.com/logos/abc.png", "", "", false},
		{"no key", "https://my-bucket.s3.amazonaws.com/", "", "", false},
		{"malformed", "not-a-url", "", "", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			b, k, ok := parseBucketKey(tc.url)
			if ok != tc.ok || b != tc.bucket || k != tc.key {
				t.Fatalf("got (%q,%q,%v), want (%q,%q,%v)", b, k, ok, tc.bucket, tc.key, tc.ok)
			}
		})
	}
}

func TestUploader_DeleteFile_EmptyURL(t *testing.T) {
	u := &Uploader{BucketName: "my-bucket"}
	if err := u.DeleteFile(context.Background(), ""); err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
}

func TestUploader_DeleteFile_WrongBucket(t *testing.T) {
	u := &Uploader{BucketName: "my-bucket"}
	err := u.DeleteFile(context.Background(), "https://other.s3.amazonaws.com/logos/x.png")
	if err != nil {
		t.Fatalf("expected nil on wrong bucket, got %v", err)
	}
}

func TestUploader_DeleteFile_Malformed(t *testing.T) {
	u := &Uploader{BucketName: "my-bucket"}
	if err := u.DeleteFile(context.Background(), "not-a-url"); err != nil {
		t.Fatalf("expected nil on malformed, got %v", err)
	}
}

func TestNoOpUploader_DeleteFile(t *testing.T) {
	n := &NoOpUploader{}
	if err := n.DeleteFile(context.Background(), "https://anything"); err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
}
```

2. Run: `go test ./infra/s3 -race -count=1 -timeout=60s` — expect compile failure (`DeleteFile`, `parseBucketKey` undefined).

3. Implement in `s3_uploader.go`:

```go
// Add to UploaderInterface (line 18):
type UploaderInterface interface {
	UploadFile(ctx context.Context, file *multipart.FileHeader) (string, error)
	DeleteFile(ctx context.Context, url string) error
}

// Add bottom of file:
const s3HostSuffix = ".s3.amazonaws.com"

func parseBucketKey(rawURL string) (bucket, key string, ok bool) {
	if rawURL == "" {
		return "", "", false
	}
	u, err := url.Parse(rawURL)
	if err != nil || u.Host == "" || u.Path == "" || u.Path == "/" {
		return "", "", false
	}
	if !strings.HasSuffix(u.Host, s3HostSuffix) {
		return "", "", false
	}
	bucket = strings.TrimSuffix(u.Host, s3HostSuffix)
	if bucket == "" {
		return "", "", false
	}
	key = strings.TrimPrefix(u.Path, "/")
	if key == "" {
		return "", "", false
	}
	return bucket, key, true
}

func (u *Uploader) DeleteFile(ctx context.Context, rawURL string) error {
	if rawURL == "" {
		return nil
	}
	bucket, key, ok := parseBucketKey(rawURL)
	if !ok {
		logging.Logger.Warn().Str("url", rawURL).Msg("DeleteFile: URL nao parseavel, ignorando")
		return nil
	}
	if bucket != u.BucketName {
		logging.Logger.Warn().Str("bucket", bucket).Str("expected", u.BucketName).Msg("DeleteFile: bucket diferente, ignorando")
		return nil
	}
	_, err := u.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("falha ao deletar do S3: %w", err)
	}
	return nil
}

func (n *NoOpUploader) DeleteFile(ctx context.Context, url string) error { return nil }
```

Add `"net/url"` and `"web-scrapper/logging"` to imports.

4. Run: `go test ./infra/s3 -race -count=1 -timeout=60s` — expect PASS.
5. Commit: `feat(s3): adiciona DeleteFile com parsing defensivo no UploaderInterface`.

## - [ ] Task A2: Empty-string logo guard in `InsertNewSiteCareer` usecase (C5)

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/usecase/site_career_usecase.go` (lines 27-33)
- Modify/Create: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/usecase/site_career_usecase_test.go`

**TDD**

1. Add test `TestInsertNewSiteCareer_EmptyLogoURL` using mock repo + `NoOpUploader`: call `InsertNewSiteCareer` with a non-nil `*multipart.FileHeader`, assert the `site.LogoURL` passed to `repo.InsertNewSiteCareer` is `nil` (not `&""`).
2. Run: `go test ./usecase -run TestInsertNewSiteCareer -race -v` — expect FAIL (current code sets `site.LogoURL = &""`).
3. Edit `usecase/site_career_usecase.go` lines 27-33:

```
-	if file != nil {
-		logoURL, err := uc.s3Uploader.UploadFile(ctx, file)
-		if err != nil {
-			return model.SiteScrapingConfig{}, fmt.Errorf("falha no upload do logo: %w", err)
-		}
-		site.LogoURL = &logoURL
-	}
+	if file != nil {
+		logoURL, err := uc.s3Uploader.UploadFile(ctx, file)
+		if err != nil {
+			return model.SiteScrapingConfig{}, fmt.Errorf("falha no upload do logo: %w", err)
+		}
+		if logoURL != "" {
+			site.LogoURL = &logoURL
+		}
+	}
```

4. Run same test — PASS. Commit: `fix(usecase): nao grava LogoURL vazio quando NoOpUploader esta ativo`.

## - [ ] Task A3: Repo methods `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite` + `created_at` column

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/model/scrapingConfig.go` — add `CreatedAt time.Time` field (json tag `created_at`).
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/interfaces/site_career.go` — add three method signatures to `SiteCareerRepositoryInterface`.
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/repository/site_career_repository.go` — extend `GetAllSites` SELECT + Scan to include `created_at`; add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite`.
- Modify/Create: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/repository/site_career_repository_test.go` — add `TestGetAllSitesAdmin`, `TestGetSiteByID`, `TestUpdateSite` (dockertest integration).
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/repository/mocks/site_career_repository.go` — regenerate / add stubs.

**TDD**

1. Add the three integration tests to `repository/site_career_repository_test.go`. Each inserts a fixture via existing helpers (insert raw row), then exercises the new method. `TestUpdateSite` updates every column, re-fetches, asserts; `TestGetSiteByID` covers hit + `ErrNotFound`; `TestGetAllSitesAdmin` inserts one `is_active=false` row and asserts it is returned.
2. Run: `go test ./repository -run TestGetAllSitesAdmin\|TestGetSiteByID\|TestUpdateSite -race -v -timeout=180s` — expect FAIL (methods undefined).
3. Implement in `site_career_repository.go`:

```go
func (st *SiteCareerRepository) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error) {
	query := `SELECT id, site_name, base_url, is_active, scraping_type,
		job_list_item_selector, title_selector, link_selector, link_attribute,
		location_selector, next_page_selector, job_description_selector, job_requisition_id_selector,
		job_requisition_id_attribute,
		api_endpoint_template, api_method, api_headers_json, api_payload_template, json_data_mappings, logo_url,
		created_at
		FROM site_scraping_config`
	return st.scanSites(query)
}

func (st *SiteCareerRepository) GetSiteByID(id int) (model.SiteScrapingConfig, error) {
	query := `SELECT id, site_name, base_url, is_active, scraping_type,
		job_list_item_selector, title_selector, link_selector, link_attribute,
		location_selector, next_page_selector, job_description_selector, job_requisition_id_selector,
		job_requisition_id_attribute,
		api_endpoint_template, api_method, api_headers_json, api_payload_template, json_data_mappings, logo_url,
		created_at
		FROM site_scraping_config WHERE id = $1`
	var s model.SiteScrapingConfig
	err := st.connection.QueryRow(query, id).Scan(
		&s.ID, &s.SiteName, &s.BaseURL, &s.IsActive, &s.ScrapingType,
		&s.JobListItemSelector, &s.TitleSelector, &s.LinkSelector, &s.LinkAttribute,
		&s.LocationSelector, &s.NextPageSelector, &s.JobDescriptionSelector, &s.JobRequisitionIdSelector,
		&s.JobRequisitionIdAttribute,
		&s.APIEndpointTemplate, &s.APIMethod, &s.APIHeadersJSON, &s.APIPayloadTemplate, &s.JSONDataMappings, &s.LogoURL,
		&s.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.SiteScrapingConfig{}, model.ErrNotFound
		}
		return model.SiteScrapingConfig{}, err
	}
	return s, nil
}

func (st *SiteCareerRepository) UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error) {
	query := `UPDATE site_scraping_config SET
		site_name=$2, base_url=$3, is_active=$4, scraping_type=$5,
		job_list_item_selector=$6, title_selector=$7, link_selector=$8, link_attribute=$9,
		location_selector=$10, next_page_selector=$11, job_description_selector=$12, job_requisition_id_selector=$13,
		job_requisition_id_attribute=$14,
		api_endpoint_template=$15, api_method=$16, api_headers_json=$17, api_payload_template=$18, json_data_mappings=$19, logo_url=$20
		WHERE id=$1
		RETURNING id, site_name, base_url, is_active, scraping_type,
		job_list_item_selector, title_selector, link_selector, link_attribute,
		location_selector, next_page_selector, job_description_selector, job_requisition_id_selector,
		job_requisition_id_attribute,
		api_endpoint_template, api_method, api_headers_json, api_payload_template, json_data_mappings, logo_url,
		created_at`
	var s model.SiteScrapingConfig
	err := st.connection.QueryRow(query,
		site.ID, site.SiteName, site.BaseURL, site.IsActive, site.ScrapingType,
		site.JobListItemSelector, site.TitleSelector, site.LinkSelector, site.LinkAttribute,
		site.LocationSelector, site.NextPageSelector, site.JobDescriptionSelector, site.JobRequisitionIdSelector,
		site.JobRequisitionIdAttribute,
		site.APIEndpointTemplate, site.APIMethod, site.APIHeadersJSON, site.APIPayloadTemplate, site.JSONDataMappings, site.LogoURL,
	).Scan(
		&s.ID, &s.SiteName, &s.BaseURL, &s.IsActive, &s.ScrapingType,
		&s.JobListItemSelector, &s.TitleSelector, &s.LinkSelector, &s.LinkAttribute,
		&s.LocationSelector, &s.NextPageSelector, &s.JobDescriptionSelector, &s.JobRequisitionIdSelector,
		&s.JobRequisitionIdAttribute,
		&s.APIEndpointTemplate, &s.APIMethod, &s.APIHeadersJSON, &s.APIPayloadTemplate, &s.JSONDataMappings, &s.LogoURL,
		&s.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.SiteScrapingConfig{}, model.ErrNotFound
		}
		return model.SiteScrapingConfig{}, err
	}
	return s, nil
}
```

Also extract the existing `GetAllSites` scan loop into `scanSites(query string, args ...any)` returning `[]model.SiteScrapingConfig`; update both callers to use it and include `created_at` in both SELECT + Scan. Add `time` import to `model/scrapingConfig.go`.

4. Update interface + mock. In `repository/mocks/site_career_repository.go` add:
```go
func (m *MockSiteCareerRepository) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error) { ... }
func (m *MockSiteCareerRepository) GetSiteByID(id int) (model.SiteScrapingConfig, error) { ... }
func (m *MockSiteCareerRepository) UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error) { ... }
```
following the existing testify/mock or hand-rolled style in the file.

5. Run: `go test ./repository ./usecase ./controller -race -count=1 -timeout=180s` — expect PASS for the three new tests.
6. Commit: `feat(site-career): adiciona GetAllSitesAdmin, GetSiteByID, UpdateSite + created_at`.

## - [ ] Task A4: Usecase `UpdateSiteCareer` with correct ordering (C1)

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/interfaces/site_career.go` — add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer` to `SiteCareerUsecaseInterface`.
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/usecase/site_career_usecase.go`
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/usecase/site_career_usecase_test.go`

**TDD**

1. Write unit tests covering all eight scenarios from spec §Testing (NoNewLogo, NewLogo with call-order assertion, UpdateFailsAfterUpload, DeleteFails, SameLogoURL, NotFound, EmptyNewLogoURL, plus the happy path `GetSiteByID` / `GetAllSitesAdmin`). Use the existing testify-style mocks; for call order use `mock.InOrder(...)` or a sequence counter.
2. Run: `go test ./usecase -race -v` — expect FAIL.
3. Implement in `site_career_usecase.go`:

```go
func (uc *SiteCareerUsecase) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error) {
	return uc.repo.GetAllSitesAdmin()
}

func (uc *SiteCareerUsecase) GetSiteByID(id int) (model.SiteScrapingConfig, error) {
	return uc.repo.GetSiteByID(id)
}

func (uc *SiteCareerUsecase) UpdateSiteCareer(
	ctx context.Context, id int, site model.SiteScrapingConfig, file *multipart.FileHeader,
) (model.SiteScrapingConfig, error) {
	current, err := uc.repo.GetSiteByID(id)
	if err != nil {
		return model.SiteScrapingConfig{}, err
	}

	var newLogoURL string
	if file != nil {
		newLogoURL, err = uc.s3Uploader.UploadFile(ctx, file)
		if err != nil {
			return model.SiteScrapingConfig{}, fmt.Errorf("falha no upload do logo: %w", err)
		}
	}

	if newLogoURL != "" {
		site.LogoURL = &newLogoURL
	} else {
		site.LogoURL = current.LogoURL
	}
	site.ID = id

	updated, err := uc.repo.UpdateSite(site)
	if err != nil {
		return model.SiteScrapingConfig{}, err
	}

	if newLogoURL != "" &&
		current.LogoURL != nil && *current.LogoURL != "" &&
		*current.LogoURL != newLogoURL {
		if derr := uc.s3Uploader.DeleteFile(ctx, *current.LogoURL); derr != nil {
			logging.Logger.Warn().Err(derr).Str("url", *current.LogoURL).Msg("falha ao deletar logo antigo")
		}
	}
	return updated, nil
}
```

Add `"web-scrapper/logging"` to imports.

4. Run tests — PASS.
5. Commit: `feat(usecase): UpdateSiteCareer com ordenacao upload->update->delete`.

## - [ ] Task A5: Controller handlers + `parseSiteMultipart` / `parseIDParam` helpers

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/controller/site_career_controller.go`
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/controller/site_career_controller_test.go`

**TDD**

1. Add tests `TestGetAllSitesAdmin`, `TestGetSiteByID` (200 + 404), `TestGetSiteByID_InvalidID` (400), `TestUpdateSiteCareer` (happy + 400 bad JSON + 400 bad id + 404 + 500) using httptest + mocked usecase.
2. Run: `go test ./controller -run TestGetAllSitesAdmin\|TestGetSiteByID\|TestUpdateSiteCareer -race -v` — FAIL.
3. Refactor `InsertNewSiteCareer` to use a new `parseSiteMultipart(ctx) (model.SiteScrapingConfig, *multipart.FileHeader, bool)` helper that factors out `ParseMultipartForm(2<<20)`, `FormFile("logo")` (tolerant of `http.ErrMissingFile`), `FormValue("siteData")` unmarshal, and the double-unescape blocks for `APIHeadersJSON` / `JSONDataMappings`. On any failure the helper writes the appropriate 400 and returns `ok=false` so callers can `return`.
4. Add `parseIDParam(ctx) (int, bool)`:

```go
func parseIDParam(ctx *gin.Context) (int, bool) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil || id <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID invalido"})
		return 0, false
	}
	return id, true
}
```

5. Add handlers:

```go
func (sc *SiteCareerController) GetAllSitesAdmin(ctx *gin.Context) {
	sites, err := sc.usecase.GetAllSitesAdmin()
	if err != nil {
		logging.Logger.Error().Err(err).Msg("Erro ao listar sites admin")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar sites"})
		return
	}
	ctx.JSON(http.StatusOK, sites)
}

func (sc *SiteCareerController) GetSiteByID(ctx *gin.Context) {
	id, ok := parseIDParam(ctx)
	if !ok {
		return
	}
	site, err := sc.usecase.GetSiteByID(id)
	if err != nil {
		if errors.Is(err, model.ErrNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Site nao encontrado"})
			return
		}
		logging.Logger.Error().Err(err).Int("id", id).Msg("Erro ao buscar site")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar site"})
		return
	}
	ctx.JSON(http.StatusOK, site)
}

func (sc *SiteCareerController) UpdateSiteCareer(ctx *gin.Context) {
	id, ok := parseIDParam(ctx)
	if !ok {
		return
	}
	body, file, ok := parseSiteMultipart(ctx)
	if !ok {
		return
	}
	updated, err := sc.usecase.UpdateSiteCareer(ctx, id, body, file)
	if err != nil {
		if errors.Is(err, model.ErrNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Site nao encontrado"})
			return
		}
		logging.Logger.Error().Err(err).Int("id", id).Msg("Erro ao atualizar site")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar site"})
		return
	}
	ctx.JSON(http.StatusOK, updated)
}
```

Add `"errors"`, `"strconv"`, `"web-scrapper/model"` imports as needed.

6. Run: `go test ./controller -race -count=1` — PASS.
7. Commit: `feat(controller): handlers admin para GET/PUT siteCareer + helpers`.

## - [ ] Task A6: Extend public listing DTO with `created_at`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/controller/site_career_controller.go` — `siteDTO` inside `GetAllSites`.
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/controller/site_career_controller_test.go` — assert new field.

**TDD**

1. Update existing `TestGetAllSites` (or add `TestGetAllSites_IncludesCreatedAt`) to expect `created_at` in each DTO.
2. Run — FAIL.
3. Edit `siteDTO` struct (line 39):
```
+	CreatedAt    time.Time `json:"created_at"`
```
and assign `newResponse.CreatedAt = site.CreatedAt` in the loop. Add `"time"` import.
4. Run — PASS.
5. Commit: `feat(site-career): expoe created_at no DTO publico`.

## - [ ] Task A7: Wire admin routes in `cmd/api/main.go`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/ScrapJobs/cmd/api/main.go` (line 425 region).

**TDD**

1. Integration: write a smoke test that boots the router with mocked controllers, calls `/siteCareer` (GET) with admin auth, expects 200. Or simply verify via existing `go test ./... -race` that the addition doesn't break startup. Because existing `main.go` tests are limited, rely on `go build ./...` + `go vet ./...`.
2. Edit `adminRoutes` group (around line 425):

```
 adminRoutes.POST("/siteCareer", siteCareerController.InsertNewSiteCareer)
+adminRoutes.GET("/siteCareer", siteCareerController.GetAllSitesAdmin)
+adminRoutes.GET("/siteCareer/:id", siteCareerController.GetSiteByID)
+adminRoutes.PUT("/siteCareer/:id", siteCareerController.UpdateSiteCareer)
 adminRoutes.POST("/scrape-sandbox", siteCareerController.SandboxScrape)
```

3. Run: `go build ./... && go vet ./... && go test ./... -race -count=1 -timeout=180s` — full suite PASS.
4. Commit: `feat(api): monta rotas admin GET/PUT siteCareer`.

## - [ ] Task A8: Pre-merge ops check + ship backend PR

**Non-code gate** (fold into commit message / PR description, do NOT block on it):
- Verify production IAM has `s3:DeleteObject` on `logos/*`.
- Run `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` on prod — expected 0 (but safe either way per spec).

Open backend PR. Phase A done.

---

# Phase B — Frontend characterization tests (`FrontScrapJobs/`)

Run from `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs`. Tests via `npx vitest run <path>`.

## - [ ] Task B1: Create `src/pages/__tests__/` and land `addNewSite.test.tsx` green against current code

**Files**
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/__tests__/addNewSite.test.tsx`

**TDD** — characterization suite must pass BEFORE any refactor (C4).

Test cases (each is one `it` block):

- Happy path: render under `QueryClientProvider` + `MemoryRouter`, fill `site_name` + `base_url`, attach a PNG via `fireEvent.change`, submit, assert `addSiteConfig` (service spy via `axios-mock-adapter`) was called with multipart containing expected fields, assert success toast invocation.
- Scraping type switcher renders CSS selectors vs API config vs headless section when `scraping_type` changes.
- Validation: no name → alert shown, mutation spy not called.
- Validation: no base_url → alert shown.
- Sandbox button: empty url → toast error; with url → calls `/scrape-sandbox`, renders results.
- Mutation error path renders error toast and does not redirect.

Use `axios-mock-adapter` on the shared `api` instance from `src/services/api.ts` (same pattern as other service tests). Mock `sonner` via `vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))`.

Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx` — expect all PASS.

Commit: `test(pages): caracterizacao de addNewSite antes do refactor`.

---

# Phase C — Frontend hotfix: logo required + size guard + accept (Feature 1)

Can ship standalone (cherry-pick candidate) before Phase D.

## - [ ] Task C1: Add logo-required validation, 2MB guard, MIME alignment to `addNewSite.tsx`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/addNewSite.tsx`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/i18n/locales/pt-BR/admin.json`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/i18n/locales/en-US/admin.json`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/__tests__/addNewSite.test.tsx`

**TDD**

1. Add three new cases to `addNewSite.test.tsx`:
   - Submit without logo → alert `addSite.logoRequiredError` shown, mutation not called.
   - Select a 3MB file → error `addSite.logoTooLargeError` shown, `logoFile` state not set (submit remains disabled/errors).
   - Input `accept` attribute is exactly `image/png, image/jpeg, image/webp`.
2. Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx` — FAIL on the three new cases.
3. In `addNewSite.tsx`:
   - Update `handleSubmit` to early-return with `validationError` when `!logoFile`.
   - Add `<span className='text-destructive'>*</span>` to the Logo card title.
   - In `handleFileChange`: `if (file.size > 2 * 1024 * 1024) { setValidationError(t('addSite.logoTooLargeError')); return }`.
   - Change the `<input type='file' accept=...>` to `accept='image/png, image/jpeg, image/webp'`.
4. Add i18n keys `addSite.logo.titleRequired`, `addSite.logoRequiredError`, `addSite.logoTooLargeError` to both locales.
5. Run tests — PASS. Run `npm run lint` — PASS.
6. Commit: `feat(addNewSite): logo obrigatorio + guarda 2MB + MIME alinhado com backend`.

---

# Phase D — Frontend refactor + edit surface (Feature 2)

Prereq: characterization suite from Phase B green.

## - [ ] Task D1: Add `SiteConfig` type + extend `SiteCareer`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/models/siteCareer.ts`

**Edits** (no test-first — type-only):

```ts
export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_subscribed: boolean
  target_words?: string[]
  created_at: string
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

Export a `SiteConfigFormData = Omit<SiteConfig, 'id' | 'logo_url' | 'created_at'>` helper if the form state type needs it.

Run `npm run build` — PASS.
Commit: `feat(models): adiciona SiteConfig e created_at em SiteCareer`.

## - [ ] Task D2: Service methods `getAllSitesAdmin`, `getSiteById`, `updateSiteConfig`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/services/siteCareerService.ts`
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/services/__tests__/siteCareerService.test.ts`

**TDD**

1. Write `siteCareerService.test.ts` using `axios-mock-adapter`:
   - `getAllSitesAdmin` issues `GET /siteCareer`, returns array.
   - `getSiteById(3)` issues `GET /siteCareer/3`.
   - `updateSiteConfig(3, data, file)` issues `PUT /siteCareer/3` with `multipart/form-data` containing `siteData` JSON with empty strings nulled, and `logo` when file provided; no `logo` field when null.
2. Run: `npx vitest run src/services/__tests__/siteCareerService.test.ts` — FAIL.
3. Append to `siteCareerService.ts` the three functions per spec §Service. Keep existing exports.
4. Run — PASS. Lint.
5. Commit: `feat(service): metodos admin getAllSitesAdmin, getSiteById, updateSiteConfig`.

## - [ ] Task D3: Hooks `useAdminSites`, `useSite`, `useUpdateSiteConfig`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/hooks/useSiteCareer.ts`
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/hooks/__tests__/useSiteCareer.test.ts`

**TDD**

1. Tests with `renderHook` + `QueryClientProvider`:
   - `useAdminSites` uses `['adminSites']`.
   - `useSite(NaN)` stays `disabled` (no fetch), `useSite(3)` fetches and caches under `['site', 3]`.
   - `useUpdateSiteConfig.mutateAsync` on success calls `queryClient.invalidateQueries` for each of `['adminSites']`, `['siteCareerList']`, `['site', id]`, `['public-site-logos']`. Spy on `queryClient.invalidateQueries`.
2. Run: `npx vitest run src/hooks/__tests__/useSiteCareer.test.ts` — FAIL.
3. Implement:

```ts
export const useAdminSites = () => useQuery({
  queryKey: ['adminSites'],
  queryFn: siteCareerService.getAllSitesAdmin
})

export const useSite = (id: number) => useQuery({
  queryKey: ['site', id],
  queryFn: () => siteCareerService.getSiteById(id),
  enabled: !Number.isNaN(id) && id > 0
})

export const useUpdateSiteConfig = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData, logoFile }: {
      id: number
      formData: SiteConfigFormData
      logoFile: File | null
    }) => siteCareerService.updateSiteConfig(id, formData, logoFile),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['adminSites'] })
      qc.invalidateQueries({ queryKey: ['siteCareerList'] })
      qc.invalidateQueries({ queryKey: ['site', vars.id] })
      qc.invalidateQueries({ queryKey: ['public-site-logos'] })
    }
  })
}
```

4. PASS. Commit: `feat(hooks): useAdminSites, useSite, useUpdateSiteConfig com invalidacao 4 chaves`.

## - [ ] Task D4: Extract `<SiteConfigForm>` component

**Files**
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/components/sites/site-config-form.tsx`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/addNewSite.tsx` — slim to wrapper.

**TDD**

1. Re-run the full characterization suite from Phase B: `npx vitest run src/pages/__tests__/addNewSite.test.tsx` — still PASS pre-refactor.
2. Create `SiteConfigForm` with props per spec §Refactor. Move all state (`formData`, `logoFile`, `paginationDelayMs`, `validationError`, `useButtonState`, `useSandboxScrape`) and all JSX cards (Basic Info / Strategy / CSS Selectors / API Config / Logo) into the component. Required-marker on logo keyed off `mode === 'create'`. Add edit-mode preview: if `mode === 'edit' && initialData?.logo_url && !logoFile`, render `<img src={initialData.logo_url} />` labelled "Logo atual"; otherwise `<Button>Escolher imagem</Button>`, label "Substituir" in edit mode.
3. Rewrite `pages/addNewSite.tsx` to:

```tsx
export default function AddNewSite() {
  const { mutateAsync } = useAddSiteConfig()
  const handleSubmit = async (data: SiteConfigFormData, logo: File | null) => {
    await mutateAsync({ formData: data, logoFile: logo })
  }
  return (
    <PageContainer>
      <PageHeader title={t('addSite.pageTitle')} />
      <SiteConfigForm
        mode='create'
        submitLabel={t('addSite.submit')}
        onSubmit={handleSubmit}
        onSubmitSuccess={() => window.scrollTo(0, 0)}
      />
    </PageContainer>
  )
}
```

4. Run the characterization suite again — must stay PASS. Run `npm run build` to catch type issues.
5. Commit: `refactor(sites): extrai SiteConfigForm compartilhado entre criar e editar`.

## - [ ] Task D5: Admin list page `AdminSitesListPage`

**Files**
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/adminSitesList.tsx`
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/__tests__/adminSitesList.test.tsx`

**TDD**

1. Test file:
   - Renders table rows for a fixture mixing `is_active=true` and `is_active=false`; asserts inactive row is present (distinguishing it from the public listing).
   - Clicking "+ Novo Site" navigates to `PATHS.app.addNewSite` (assert via mocked `useNavigate`).
   - Clicking "Editar" on row id=3 navigates to `PATHS.app.editSite(3)`.
   - Search input filters by `site_name` (case-insensitive).
2. Run `npx vitest run src/pages/__tests__/adminSitesList.test.tsx` — FAIL.
3. Implement page per spec §Pages. Table columns: logo thumb or `Building2`, name, `scraping_type` badge, green/grey active dot, `created_at` (date via `Intl.DateTimeFormat('pt-BR')`), Edit button. Uses `useAdminSites()`. Top-right "+ Novo Site" button.
4. PASS. Commit: `feat(pages): AdminSitesListPage com tabela de sites ativos+inativos`.

## - [ ] Task D6: Edit page `EditSitePage`

**Files**
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/editSite.tsx`
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/__tests__/editSite.test.tsx`

**TDD**

1. Tests:
   - Pending `useSite` renders skeleton.
   - 404 renders "Site nao encontrado" with back link.
   - Data arrives → form populates (assert logo preview + a selector input's value).
   - Submit triggers `useUpdateSiteConfig.mutateAsync` with `(id, formData, logoFile)`.
   - On success, `useNavigate` called with `PATHS.app.adminSites`.
2. Run `npx vitest run src/pages/__tests__/editSite.test.tsx` — FAIL.
3. Implement per spec §Pages with `useParams<{id:string}>()`, guard on `isNaN`, branches for loading / error / data.
4. PASS. Commit: `feat(pages): EditSitePage com SiteConfigForm mode=edit`.

## - [ ] Task D7: Router + paths + nav rename

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/router/paths.ts`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/router/routes.tsx`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/components/common/app-header/index.tsx`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/i18n/locales/pt-BR/common.json` + `en-US/common.json` — add `nav.manageSites`.

**Edits**

- `paths.ts`: add `adminSites: '/app/admin-sites'` and `editSite: (id: number) => '/app/admin-sites/' + id + '/edit'`.
- `routes.tsx`: two lazy routes under `MainLayout` wrapped by `AdminGuard`, following existing pattern.
- `app-header/index.tsx`: replace the nav item pointing to `PATHS.app.addNewSite` with one pointing to `PATHS.app.adminSites`, label `t('nav.manageSites')`.

**Verification**

- `npm run build` — typecheck PASS.
- Re-run all page tests (`npx vitest run src/pages`) — PASS.
- Commit: `feat(router): rotas admin-sites + editSite e renomeia nav admin`.

---

# Phase E — Sorted companies list (Feature 3)

## - [ ] Task E1: Sort dropdown + localStorage + collator in `ListSites.tsx`

**Files**
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/ListSites.tsx`
- Modify: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/i18n/locales/pt-BR/sites.json` + `en-US/sites.json`
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/src/pages/__tests__/ListSites.test.tsx`

**TDD**

1. Test cases (all in one file):
   - Fixture with `['Azure', 'Ácme', 'beta', 'zeta']` sorted alphabetical → `['Ácme', 'Azure', 'beta', 'zeta']` (collator pt).
   - Fixture with varied `created_at` → 'newest' order is descending timestamp.
   - `subscribed_first`: mix of subscribed/unsubscribed → subscribed group first, then alphabetical inside each group.
   - Malformed `created_at='not-a-date'` does not throw; falls back to epoch 0.
   - Selection persisted: change dropdown → `localStorage.sitesSortBy` set; remount page → dropdown hydrates.
2. Run — FAIL.
3. Implement per spec §Frontend. Add `type SortKey`, `sortFn` record, `useState`/`useEffect` for persistence, `Select` in the JSX next to `FilterPills`, and apply `.sort(sortFn[sortBy])` as the last step of the existing `useMemo` (line 47–55) with `[searchTerm, data, filter, sortBy]` deps.
4. Add four i18n keys under `sort`.
5. PASS. Commit: `feat(companies): ordenacao alfabetica/recentes/inscritos com persistencia local`.

---

# Phase F — E2E + ship

## - [ ] Task F1: Playwright spec `e2e/admin-sites.spec.ts`

**Files**
- Create: `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs/e2e/admin-sites.spec.ts`

**TDD**

Test flow (single `test(...)`), against seeded admin + Netflix fixture on a dev backend:
1. Login as admin.
2. Navigate to `/app/admin-sites`.
3. Expect row `Netflix Careers` present with a placeholder logo.
4. Click `Editar` → URL contains `/edit`.
5. Upload a PNG via `setInputFiles`.
6. Submit.
7. Expect redirect to `/app/admin-sites` + success toast.
8. Assert Netflix row now shows the logo thumb.
9. Navigate to `/app/empresas`, filter `Todas` → Netflix card renders the logo (proves `['public-site-logos']` + `['siteCareerList']` invalidation).

Run: `npx playwright test e2e/admin-sites.spec.ts` — PASS.
Commit: `test(e2e): fluxo Netflix-repair de cadastro de logo via edit`.

## - [ ] Task F2: Final lint + build + ship frontend PR

Run in order (single commit if anything auto-formats):
- `npm run lint`
- `npm run build`
- `npx vitest run`
- `npx playwright test`

Open frontend PR. Link to backend PR from Task A8. Done.

---

# Self-Review

**Spec coverage**: all three features covered — Feature 1 (Phase C), Feature 2 (Phases A + D), Feature 3 (Phase E + A6). All spec §Testing items mapped to a specific task. All §Sequencing steps 1–20 mapped:
- A1–A2 ↔ steps 1–2; A3 ↔ step 3; A4 ↔ step 4; A5 ↔ step 5; A6 ↔ step 6; A7 ↔ step 7; A8 ↔ step 8 + step 19 ops checks.
- B1 ↔ step 9. C1 ↔ step 10. D1–D7 ↔ steps 11–16. E1 ↔ step 17. F1 ↔ step 18. F2 ↔ step 20.

**Ambiguities resolved**

1. **Unit-testing `Uploader.DeleteFile` without abstracting the concrete `*s3.Client`.** The spec lists four unit tests for `Uploader.DeleteFile` but the current `Uploader` struct holds a concrete `*s3.Client` — those tests cannot touch the SDK path without a mock. I factored out a pure `parseBucketKey` helper that unit tests exercise directly, and limited the `DeleteFile` unit tests to cases where the function returns before calling the SDK (empty URL, malformed, wrong bucket). The real `DeleteObject` call is covered indirectly by the Playwright Netflix-repair flow (F1) against a staging bucket.
2. **Repo `scan` reuse and `time` import.** Spec implies copy-paste of the existing SELECT+Scan for each new method. I compressed to a single `scanSites(query, args...)` helper shared between `GetAllSites` and `GetAllSitesAdmin` — DRY, one place to touch when columns change. `GetSiteByID` and `UpdateSite` stay as `QueryRow` callers since their Scan targets differ in handling of `ErrNotFound`.

**Scope compressions** (grouped TDD cycles)
- A3 bundles model field + interface + three repo methods + mock update into one test-run cycle because they must land together for the package to compile.
- A5 bundles three controller handlers + both helpers (`parseSiteMultipart`, `parseIDParam`) in one cycle — they share the test file.
- D7 bundles router + paths + nav rename + i18n — all type-checked by a single `npm run build`.
- E1 bundles sort logic, i18n, and tests into one cycle since all changes live in one page.
- `golangci-lint run` / `npm run lint` / `go vet` are folded into the commit step of each task instead of standalone tasks.

**Placeholder scan**: no `TBD`, `TODO`, `<placeholder>`, or empty code blocks in the plan file. All code samples are directly actionable.

**Task count**: 16 tasks across 6 phases (A:8, B:1, C:1, D:7 *listed as D1-D7*, E:1, F:2).
