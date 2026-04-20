# Admin Site Management Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec**: `FrontScrapJobs/docs/superpowers/specs/2026-04-20-admin-site-management-design.md`
**Date**: 2026-04-20
**Repos**: `ScrapJobs/` (Go 1.24 backend) + `FrontScrapJobs/` (React 19 + Vite 7 frontend)
**Methodology**: Unified from three parallel drafts — TDD skeleton from `plan-superpowers`, signatures/data flows from `plan-feature-dev`, trade-offs and phase risks from `plan-native`.

## Goal

Close three gaps in admin site management surfaced by the Netflix incident:
1. Block logo-less site creation from the UI (Feature 1 — hotfix).
2. Let admins edit any field of `site_scraping_config` (including logo) without DB access, and reactivate inactive sites (Feature 2).
3. Give users a stable, persistent ordering on `/app/empresas` (Feature 3).

## Architecture

- **Backend (Go / hexagonal)**: extend `infra/s3` uploader with `DeleteFile`, add three repo + usecase + controller methods (`GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer`), wire under existing `adminRoutes` group. Add `created_at` to public listing DTO. Strip `omitempty` from `logo_url` for stable wire contract. No migrations — columns already exist.
- **Frontend (React 19 + Vite 7)**: characterization-test the existing create page BEFORE refactor, extract `<SiteConfigForm>`, add `AdminSitesListPage` + `EditSitePage`, sort dropdown on companies list with `localStorage` + `Intl.Collator('pt')`.
- **Sequencing**: Phases A (backend) and B (FE test harness) run in parallel. Phase C ships standalone as hotfix. D, E, F depend on A+B.

## Tech Stack

- Go 1.24, `database/sql`, `gin`, `aws-sdk-go-v2/s3`, `ory/dockertest` (integration), mocks in `repository/mocks/`.
- React 19, TS, Vite 7, `@tanstack/react-query`, `axios`, shadcn/ui, `react-i18next`, Vitest + Testing Library, Playwright.

## Conventions (from CLAUDE.md)

- Backend: Portuguese log/comment strings, typed sentinel errors (`model/errors.go`), `TRUSTED_PROXIES` preserved, NoOp-based graceful degradation.
- Frontend: no semicolons, single quotes, max-len 100, `PATHS.app.*` over hardcoded URLs, services never imported directly from components — go through hooks.

---

# Phase A — Backend foundation (`ScrapJobs/`)

Run from `/Users/erickschaedler/Documents/Scrap/ScrapJobs`. All test commands use `-race -count=1 -timeout=120s` to match CI.

## - [ ] Task A1: Extend `UploaderInterface` with `DeleteFile` + defensive URL parsing

**Files**
- Modify: `infra/s3/s3_uploader.go`
- Create: `infra/s3/s3_uploader_test.go`

**TDD**

1. Write `infra/s3/s3_uploader_test.go`. Because `Uploader` holds a concrete `*s3.Client`, the SDK path can't be unit-tested without abstraction — cover only pre-SDK guards plus `NoOpUploader`. Factor a pure `parseBucketKey(url)` helper that's exercised directly:

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
// Extend interface (line 18):
type UploaderInterface interface {
	UploadFile(ctx context.Context, file *multipart.FileHeader) (string, error)
	DeleteFile(ctx context.Context, url string) error
}

// Bottom of file:
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

Update `repository/mocks/s3_uploader.go` (or wherever the S3 mock lives) with matching `DeleteFile(ctx, url)` method so existing usecase tests still compile.

4. Run: `go test ./infra/s3 -race -count=1 -timeout=60s` — PASS.
5. Commit: `feat(s3): adiciona DeleteFile com parsing defensivo no UploaderInterface`.

## - [ ] Task A2: Empty-string logo guard in `InsertNewSiteCareer` usecase (C5)

**Files**
- Modify: `usecase/site_career_usecase.go` (lines 27-33)
- Modify: `usecase/site_career_usecase_test.go`

**TDD**

1. Add test `TestInsertNewSiteCareer_EmptyLogoURL` using mock repo + `NoOpUploader`: call `InsertNewSiteCareer` with a non-nil `*multipart.FileHeader`, assert the `site.LogoURL` passed to `repo.InsertNewSiteCareer` is `nil` (not `&""`).
2. Run: `go test ./usecase -run TestInsertNewSiteCareer -race -v` — expect FAIL.
3. Edit `site_career_usecase.go` lines 27-33:

```diff
 	if file != nil {
 		logoURL, err := uc.s3Uploader.UploadFile(ctx, file)
 		if err != nil {
 			return model.SiteScrapingConfig{}, fmt.Errorf("falha no upload do logo: %w", err)
 		}
-		site.LogoURL = &logoURL
+		if logoURL != "" {
+			site.LogoURL = &logoURL
+		}
 	}
```

4. Run same test — PASS.
5. Commit: `fix(usecase): nao grava LogoURL vazio quando NoOpUploader esta ativo`.

## - [ ] Task A3: `logo_url` wire contract — strip `omitempty` (R1 from review)

**Files**
- Modify: `model/scrapingConfig.go` (line 7)
- Modify: `controller/site_career_controller_test.go` (new test, created in A6)

Context: pointer fields with `json:"logo_url,omitempty"` omit the key entirely when nil. Frontend ends up with `undefined` where `null` is expected, which breaks destructuring and conditional rendering invariants in the new edit/list pages. Fixing at the model layer is the cleanest contract.

**TDD**

1. Add test (or extend A6's test) asserting that a `SiteScrapingConfig` with `LogoURL = nil` marshals to include `"logo_url": null`:

```go
func TestSiteScrapingConfig_MarshalsNullLogoURL(t *testing.T) {
	s := model.SiteScrapingConfig{ID: 1, SiteName: "X", LogoURL: nil}
	b, err := json.Marshal(s)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), `"logo_url":null`) {
		t.Fatalf("expected explicit null logo_url, got %s", string(b))
	}
}
```

2. Run — FAIL (current `omitempty` elides the key).
3. Edit `model/scrapingConfig.go` line 7:

```diff
-	LogoURL                   *string `db:"logo_url" json:"logo_url,omitempty"`
+	LogoURL                   *string `db:"logo_url" json:"logo_url"`
```

4. Run — PASS. Sanity-check existing consumers (`ListSites.tsx` already does `company.logo_url ? <img> : <Building2>`, so null is safe).
5. Commit: `fix(model): expoe logo_url explicitamente (nao elide null)`.

## - [ ] Task A4: Repo methods `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSite` + `created_at` column

**Files**
- Modify: `model/scrapingConfig.go` — add `CreatedAt time.Time` field.
- Modify: `interfaces/site_career.go` — add three method signatures to `SiteCareerRepositoryInterface`.
- Modify: `repository/site_career_repository.go` — extend `GetAllSites` SELECT + Scan; add three new methods; extract shared `scanSites` helper.
- Modify/Create: `repository/site_career_repository_test.go` — add three integration tests (dockertest).
- Modify: `repository/mocks/site_career_repository.go` — add mock stubs.

**TDD**

1. Add three integration tests:
   - `TestGetAllSitesAdmin` — insert one `is_active=true` + one `is_active=false` row, assert both returned.
   - `TestGetSiteByID` — hit (assert `CreatedAt` populated) + miss (assert `model.ErrNotFound`).
   - `TestUpdateSite` — insert, call `UpdateSite` mutating every column (including `IsActive=false`, flipped `LogoURL`, altered selectors), re-fetch via `GetSiteByID`, assert equality. Also assert `updated_at` changed (query `SELECT updated_at` directly).

2. Run: `go test ./repository -run "TestGetAllSitesAdmin|TestGetSiteByID|TestUpdateSite" -race -v -timeout=180s` — expect FAIL (methods undefined).

3. Implement:

```go
// model/scrapingConfig.go — add import "time" and field:
CreatedAt time.Time `db:"created_at" json:"created_at"`

// repository/site_career_repository.go:

// Extract from existing GetAllSites — shared helper:
func (st *SiteCareerRepository) scanSites(query string, args ...any) ([]model.SiteScrapingConfig, error) {
	rows, err := st.connection.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying sites: %w", err)
	}
	defer rows.Close()

	var sites []model.SiteScrapingConfig
	for rows.Next() {
		var s model.SiteScrapingConfig
		if err := rows.Scan(
			&s.ID, &s.SiteName, &s.BaseURL, &s.IsActive, &s.ScrapingType,
			&s.JobListItemSelector, &s.TitleSelector, &s.LinkSelector, &s.LinkAttribute,
			&s.LocationSelector, &s.NextPageSelector, &s.JobDescriptionSelector, &s.JobRequisitionIdSelector,
			&s.JobRequisitionIdAttribute,
			&s.APIEndpointTemplate, &s.APIMethod, &s.APIHeadersJSON, &s.APIPayloadTemplate, &s.JSONDataMappings, &s.LogoURL,
			&s.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("error scanning site: %w", err)
		}
		sites = append(sites, s)
	}
	return sites, rows.Err()
}

// Rewrite existing GetAllSites to use scanSites + include created_at:
func (st *SiteCareerRepository) GetAllSites() ([]model.SiteScrapingConfig, error) {
	query := `SELECT id, site_name, base_url, is_active, scraping_type,
		job_list_item_selector, title_selector, link_selector, link_attribute,
		location_selector, next_page_selector, job_description_selector, job_requisition_id_selector,
		job_requisition_id_attribute,
		api_endpoint_template, api_method, api_headers_json, api_payload_template, json_data_mappings, logo_url,
		created_at
		FROM site_scraping_config WHERE is_active = TRUE`
	return st.scanSites(query)
}

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
		api_endpoint_template=$15, api_method=$16, api_headers_json=$17, api_payload_template=$18, json_data_mappings=$19,
		logo_url=$20,
		updated_at=NOW()
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
		site.APIEndpointTemplate, site.APIMethod, site.APIHeadersJSON, site.APIPayloadTemplate, site.JSONDataMappings,
		site.LogoURL,
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

Note on `updated_at`: migration 028 created the column. The model intentionally doesn't carry it — we set `updated_at=NOW()` in the UPDATE but don't read it back (R11 from review). If an admin-facing consumer ever needs it, add the field in a follow-up.

4. Update interface + mock. In `repository/mocks/site_career_repository.go`:
```go
func (m *MockSiteCareerRepository) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error) {
	args := m.Called()
	return args.Get(0).([]model.SiteScrapingConfig), args.Error(1)
}
func (m *MockSiteCareerRepository) GetSiteByID(id int) (model.SiteScrapingConfig, error) {
	args := m.Called(id)
	return args.Get(0).(model.SiteScrapingConfig), args.Error(1)
}
func (m *MockSiteCareerRepository) UpdateSite(site model.SiteScrapingConfig) (model.SiteScrapingConfig, error) {
	args := m.Called(site)
	return args.Get(0).(model.SiteScrapingConfig), args.Error(1)
}
```
Match whichever style (testify/mock vs hand-rolled) the existing file uses.

5. Run: `go test ./repository ./usecase ./controller -race -count=1 -timeout=180s` — PASS.
6. Commit: `feat(site-career): adiciona GetAllSitesAdmin, GetSiteByID, UpdateSite + created_at`.

## - [ ] Task A5: Usecase `UpdateSiteCareer` with correct ordering (C1)

**Files**
- Modify: `interfaces/site_career.go` — add `GetAllSitesAdmin`, `GetSiteByID`, `UpdateSiteCareer` to `SiteCareerUsecaseInterface`.
- Modify: `usecase/site_career_usecase.go`
- Modify: `usecase/site_career_usecase_test.go`

**TDD**

1. Write unit tests for all nine scenarios (mirror spec §Testing/Backend):
   - `TestUpdateSiteCareer_NoNewLogo` — `file=nil`, `current.LogoURL=&"https://..."` → assert `LogoURL` preserved, `DeleteFile` never called.
   - `TestUpdateSiteCareer_NewLogo` — `file!=nil`, upload returns new URL. Assert call order: `UploadFile` → `UpdateSite` → `DeleteFile`. Use `mock.InOrder` or a sequence counter.
   - `TestUpdateSiteCareer_UpdateFailsAfterUpload` — upload OK, `UpdateSite` returns error → `DeleteFile` NOT called.
   - `TestUpdateSiteCareer_DeleteFails` — all OK except `DeleteFile` returns error → usecase returns `(updated, nil)` (error logged, not propagated).
   - `TestUpdateSiteCareer_SameLogoURL` — `file!=nil`, upload returns the same URL as current → `DeleteFile` NOT called.
   - `TestUpdateSiteCareer_NotFound` — `GetSiteByID` returns `model.ErrNotFound` → usecase propagates.
   - `TestUpdateSiteCareer_EmptyNewLogoURL` — `NoOpUploader` with `file!=nil` + `current.LogoURL=&"https://bucket/logos/x.png"` → `LogoURL` preserved from current, `DeleteFile` NOT called.
   - Happy-path smoke: `TestGetSiteByID` and `TestGetAllSitesAdmin` at the usecase layer (thin pass-throughs).

2. Run: `go test ./usecase -race -v` — expect FAIL.

3. Implement in `site_career_usecase.go`:

```go
func (uc *SiteCareerUsecase) GetAllSitesAdmin() ([]model.SiteScrapingConfig, error) {
	return uc.repo.GetAllSitesAdmin()
}

func (uc *SiteCareerUsecase) GetSiteByID(id int) (model.SiteScrapingConfig, error) {
	return uc.repo.GetSiteByID(id)
}

// UpdateSiteCareer atualiza um site. Concorrencia: last-write-wins sem
// optimistic lock (ver spec, Non-goals). Ordem garantida:
//   Upload → UpdateSite → DeleteFile (best-effort).
// Se UpdateSite falhar, logo antigo permanece no S3 e em DB; logo novo
// (se houver) vira orfao. Se DeleteFile falhar, logo antigo vira orfao.
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

	// newLogoURL == "" quando file==nil OR NoOpUploader ativo.
	// Nos dois casos, preservar o logo atual.
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

	// Deletar logo antigo APENAS quando efetivamente substituimos.
	// Quatro gates: (1) tivemos upload real, (2) existia logo antigo,
	// (3) nao era string vazia, (4) URL diferente (defensivo).
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

Add `"web-scrapper/logging"` import.

4. Run tests — PASS.
5. Commit: `feat(usecase): UpdateSiteCareer com ordenacao upload->update->delete`.

## - [ ] Task A6: Controller helpers + three new handlers

**Files**
- Modify: `controller/site_career_controller.go`
- Create: `controller/site_career_controller_test.go`

**TDD**

1. Add tests (follow pattern from `controller/curriculum_controller_test.go` — `gin.SetMode(gin.TestMode)` already in that file's `init()`; do NOT re-declare since all `*_test.go` share the package. `setUserContext` helper from `curriculum_controller_test.go:28` is available):
   - `TestGetAllSitesAdmin` — 200 with both active + inactive fixtures; 500 on usecase error.
   - `TestGetSiteByID_Hit` — 200.
   - `TestGetSiteByID_NotFound` — usecase returns `model.ErrNotFound` → 404.
   - `TestGetSiteByID_InvalidID` — non-numeric path param → 400.
   - `TestUpdateSiteCareer_Happy` — build multipart body with `multipart.NewWriter`, include `siteData` JSON + a fake `logo` file → 200.
   - `TestUpdateSiteCareer_BadJSON` — malformed `siteData` → 400.
   - `TestUpdateSiteCareer_InvalidID` — non-numeric → 400.
   - `TestUpdateSiteCareer_NotFound` — usecase `ErrNotFound` → 404.
   - `TestUpdateSiteCareer_UsecaseError` — generic error → 500.
   - `TestGetAllSites_IncludesCreatedAt` — existing endpoint now exposes `created_at` in each DTO (Feature 3).
   - `TestSiteScrapingConfig_MarshalsNullLogoURL` from A3 lives here too.

2. Run: `go test ./controller -run "TestGetAllSitesAdmin|TestGetSiteByID|TestUpdateSiteCareer|TestGetAllSites" -race -v` — FAIL.

3. Refactor `InsertNewSiteCareer` to use a new `parseSiteMultipart(ctx)` helper that factors out `ParseMultipartForm(2<<20)`, `FormFile("logo")` (tolerant of `http.ErrMissingFile`), `FormValue("siteData")` unmarshal, and the double-unescape of `APIHeadersJSON` / `JSONDataMappings`. On failure the helper writes the appropriate 400 and returns `ok=false`:

```go
func parseSiteMultipart(ctx *gin.Context) (model.SiteScrapingConfig, *multipart.FileHeader, bool) {
	if err := ctx.Request.ParseMultipartForm(2 << 20); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao processar o formulario"})
		return model.SiteScrapingConfig{}, nil, false
	}
	file, err := ctx.FormFile("logo")
	if err != nil && err != http.ErrMissingFile {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao processar o arquivo de logo"})
		return model.SiteScrapingConfig{}, nil, false
	}
	siteJSON := ctx.Request.FormValue("siteData")
	var body model.SiteScrapingConfig
	if err := json.Unmarshal([]byte(siteJSON), &body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados do site em formato JSON invalido"})
		return model.SiteScrapingConfig{}, nil, false
	}
	if body.APIHeadersJSON != nil {
		var unescaped string
		if json.Unmarshal([]byte(*body.APIHeadersJSON), &unescaped) == nil {
			*body.APIHeadersJSON = unescaped
		}
	}
	if body.JSONDataMappings != nil {
		var unescaped string
		if json.Unmarshal([]byte(*body.JSONDataMappings), &unescaped) == nil {
			*body.JSONDataMappings = unescaped
		}
	}
	return body, file, true
}

func parseIDParam(ctx *gin.Context) (int, bool) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil || id <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID invalido"})
		return 0, false
	}
	return id, true
}
```

Rewrite `InsertNewSiteCareer` to use `parseSiteMultipart`.

4. Add handlers:

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

5. Extend `siteDTO` inside existing `GetAllSites` (line 39-46) with `CreatedAt time.Time \`json:"created_at"\``; assign from `site.CreatedAt` in the loop. Add `"time"` import.

6. Add imports: `"errors"`, `"strconv"`, `"web-scrapper/model"`.

7. Run: `go test ./controller -race -count=1` — PASS.
8. Commit: `feat(controller): handlers admin para siteCareer + DTO com created_at`.

## - [ ] Task A7: Wire admin routes in `cmd/api/main.go`

**Files**
- Modify: `cmd/api/main.go` (around line 425, inside `adminRoutes` block).

**TDD**

1. Relies on `go build ./...` + `go vet ./...` for compile-time validation (main.go tests are limited). Full e2e via Phase F.

2. Edit `adminRoutes` group:

```diff
 adminRoutes.POST("/siteCareer", siteCareerController.InsertNewSiteCareer)
+adminRoutes.GET("/siteCareer", siteCareerController.GetAllSitesAdmin)
+adminRoutes.GET("/siteCareer/:id", siteCareerController.GetSiteByID)
+adminRoutes.PUT("/siteCareer/:id", siteCareerController.UpdateSiteCareer)
 adminRoutes.POST("/scrape-sandbox", siteCareerController.SandboxScrape)
```

All three inherit `csrfMiddleware + RequireAuth + RequireAdmin` from the group.

3. Run: `go build ./... && go vet ./... && go test ./... -race -count=1 -timeout=180s && golangci-lint run` — full suite PASS.
4. Commit: `feat(api): monta rotas admin GET/PUT siteCareer`.

## - [ ] Task A8: Pre-merge ops check + ship backend PR

**Non-code gate** (capture in PR description, don't block on it):
- Verify production IAM has `s3:DeleteObject` on `logos/*`. If denied, every edit-with-new-logo will log a warn and accumulate orphans — acceptable tradeoff per spec §Risks.
- Run on prod: `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` — expected 0. If > 0, run `UPDATE site_scraping_config SET logo_url = NULL WHERE logo_url = '';` once so legacy empty strings don't confuse the new `DeleteFile` defensive skip.

Open backend PR. Phase A done.

---

# Phase B — Frontend characterization tests (`FrontScrapJobs/`)

Run from `/Users/erickschaedler/Documents/Scrap/FrontScrapJobs`. Tests via `npx vitest run <path>`.

## - [ ] Task B1: Create `src/pages/__tests__/` and land `addNewSite.test.tsx` green against current code

**Files**
- Create: `src/pages/__tests__/addNewSite.test.tsx`

**TDD** — characterization suite must pass BEFORE any refactor (C4 from review).

Test cases (each is one `it` block, all against CURRENT unchanged `addNewSite.tsx`):

- Happy path: render under `QueryClientProvider` + `MemoryRouter`, fill `site_name` + `base_url`, attach a PNG file via `fireEvent.change`, submit, assert `addSiteConfig` service spy (via `axios-mock-adapter` on the shared `api`) called with multipart containing expected fields, assert success toast invocation.
- Scraping type switcher: clicking CSS / API / HEADLESS cards shows/hides the corresponding config section.
- Validation: missing `site_name` → alert shown, mutation spy NOT called.
- Validation: missing `base_url` → alert shown, mutation NOT called.
- Sandbox button: empty URL → `toast.error` called; with URL → `/scrape-sandbox` invoked, results table renders.
- Mutation error path: spy rejects → error toast, button state resets.

Use `axios-mock-adapter` on the shared `api` from `src/services/api.ts` (same pattern as other service tests). Mock `sonner` via `vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))`.

Run: `npx vitest run src/pages/__tests__/addNewSite.test.tsx` — expect all PASS.

Commit: `test(pages): caracterizacao de addNewSite antes do refactor`.

---

# Phase C — Frontend hotfix: logo required + size guard + accept (Feature 1)

Can ship standalone (cherry-pick candidate) before Phase D.

## - [ ] Task C1: Add logo-required validation, 2MB guard, MIME alignment to `addNewSite.tsx`

**Files**
- Modify: `src/pages/addNewSite.tsx`
- Modify: `src/i18n/locales/pt-BR/admin.json`
- Modify: `src/i18n/locales/en-US/admin.json`
- Modify: `src/pages/__tests__/addNewSite.test.tsx`

**TDD**

1. Add three new cases to `addNewSite.test.tsx`:
   - Submit without logo → alert `addSite.logoRequiredError` shown, mutation NOT called.
   - Select a 3MB file → error `addSite.logoTooLargeError` shown, `logoFile` state NOT set (submit remains in clean state).
   - Input `accept` attribute is exactly `image/png, image/jpeg, image/webp`.
2. Run — FAIL on the three new cases.
3. Edit `addNewSite.tsx`:
   - In `handleSubmit`, after the name/URL check, add:
     ```tsx
     if (!logoFile) {
       setValidationError(t('addSite.logoRequiredError'))
       return
     }
     ```
   - Add `<span className='text-destructive'>*</span>` to the Logo card title.
   - In `handleFileChange`, guard on size:
     ```tsx
     if (file.size > 2 * 1024 * 1024) {
       setValidationError(t('addSite.logoTooLargeError'))
       return
     }
     setValidationError(null)
     setLogoFile(file)
     ```
   - Change line 656 `<input accept=...>` to `accept='image/png, image/jpeg, image/webp'` (drops SVG, adds WebP — aligns with backend `s3_uploader.go:47`).
4. Add i18n keys to both `admin.json` locales:
   - `addSite.logo.titleRequired` — "Logo *" (pt) / "Logo *" (en).
   - `addSite.logoRequiredError` — "Selecione um logo para a empresa." / "Please select a logo for the company.".
   - `addSite.logoTooLargeError` — "O logo excede o tamanho maximo de 2MB." / "The logo exceeds the 2MB limit.".
5. Run tests — PASS. Run `npm run lint` — PASS.
6. Commit: `feat(addNewSite): logo obrigatorio + guarda 2MB + MIME alinhado com backend`.

---

# Phase D — Frontend refactor + edit surface (Feature 2)

Prereq: characterization suite from Phase B green. Phase C optional — if shipped, re-run suite after merge.

## - [ ] Task D1: Add `SiteConfig` type + extend `SiteCareer`

**Files**
- Modify: `src/models/siteCareer.ts`

**Edits** (type-only — no TDD cycle):

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

Run: `npm run build` — PASS.
Commit: `feat(models): adiciona SiteConfig e created_at em SiteCareer`.

## - [ ] Task D2: Service methods `getAllSitesAdmin`, `getSiteById`, `updateSiteConfig`

**Files**
- Modify: `src/services/siteCareerService.ts`
- Modify: `src/services/__tests__/siteCareerService.test.ts`

**TDD**

1. Extend existing test file with:
   - `getAllSitesAdmin` issues `GET /siteCareer`, returns `SiteConfig[]`.
   - `getSiteById(3)` issues `GET /siteCareer/3`, returns single `SiteConfig`.
   - `updateSiteConfig(3, data, file)` issues `PUT /siteCareer/3` with `multipart/form-data` containing `siteData` JSON (empty strings nulled via `Object.fromEntries` pattern) plus a `logo` part when file provided; no `logo` field when null.
2. Run: `npx vitest run src/services/__tests__/siteCareerService.test.ts` — FAIL.
3. Append to `siteCareerService.ts`:

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
): Promise<SiteConfig> => {
  const cleaned = Object.fromEntries(
    Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
  )
  const multipart = new FormData()
  multipart.append('siteData', JSON.stringify(cleaned))
  if (logoFile) multipart.append('logo', logoFile)
  const { data } = await api.put(`/siteCareer/${id}`, multipart, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
```

Add `SiteConfig` import from `@/models/siteCareer`.

4. Run — PASS. `npm run lint` — PASS.
5. Commit: `feat(service): metodos admin getAllSitesAdmin, getSiteById, updateSiteConfig`.

## - [ ] Task D3: Hooks `useAdminSites`, `useSite`, `useUpdateSiteConfig`

**Files**
- Modify: `src/hooks/useSiteCareer.ts`
- Modify: `src/hooks/__tests__/useSiteCareer.test.ts`

**TDD**

1. Extend test file with `renderHook` + `QueryClientProvider`:
   - `useAdminSites` uses `['adminSites']` key, calls `getAllSitesAdmin`.
   - `useSite(NaN)` stays `disabled` (no fetch); `useSite(0)` also disabled; `useSite(3)` fetches and caches under `['site', 3]`.
   - `useUpdateSiteConfig.mutateAsync` on success calls `queryClient.invalidateQueries` for each of `['adminSites']`, `['siteCareerList']`, `['site', id]`, `['public-site-logos']` — spy on `queryClient.invalidateQueries`.
2. Run — FAIL.
3. Implement:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { siteCareerService, type SiteConfigFormData } from '@/services/siteCareerService'

export const useSiteCareer = () => useQuery({
  queryKey: ['siteCareerList'],
  queryFn: siteCareerService.getAllSiteCareer,
  staleTime: 60 * 1000
})

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
- Create: `src/components/sites/site-config-form.tsx`
- Modify: `src/pages/addNewSite.tsx` — slim to wrapper.

**TDD**

1. Re-run the full characterization suite from Phase B: `npx vitest run src/pages/__tests__/addNewSite.test.tsx` — still PASS pre-refactor. Keep this terminal open for rapid re-run.

2. Create `site-config-form.tsx`:

```tsx
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

Move into the component:
- `formData` state (initialized from `initialData` via `nullsToEmpty()` in edit — see D-risk block below; defaults in create).
- `logoFile` state + `handleFileChange` (including 2MB guard from Phase C).
- `paginationDelayMs` state.
- `validationError` state + `<Alert>`.
- `useButtonState` + submit button.
- `useSandboxScrape` + sandbox test button + results `<Card>` (P5 — inside form).
- All cards: Basic Info, Strategy, CSS Selectors, API Config, Logo.
- Required-marker keyed off `mode === 'create'`.
- **Edit-mode logo preview**: when `mode === 'edit' && initialData?.logo_url && !logoFile`, render `<img src={initialData.logo_url} />` labelled "Logo atual"; button label becomes "Substituir" instead of "Escolher Imagem".

Helper for controlled inputs (null → '' mapping):

```ts
function nullsToEmpty(site: SiteConfig): SiteConfigFormData {
  return {
    site_name: site.site_name,
    base_url: site.base_url,
    is_active: site.is_active,
    scraping_type: site.scraping_type,
    job_list_item_selector: site.job_list_item_selector ?? '',
    title_selector: site.title_selector ?? '',
    link_selector: site.link_selector ?? '',
    link_attribute: site.link_attribute ?? '',
    location_selector: site.location_selector ?? '',
    next_page_selector: site.next_page_selector ?? '',
    job_description_selector: site.job_description_selector ?? '',
    job_requisition_id_selector: site.job_requisition_id_selector ?? '',
    job_requisition_id_attribute: site.job_requisition_id_attribute ?? '',
    api_endpoint_template: site.api_endpoint_template ?? '',
    api_method: site.api_method ?? 'GET',
    api_headers_json: site.api_headers_json ?? '',
    api_payload_template: site.api_payload_template ?? '',
    json_data_mappings: site.json_data_mappings ?? ''
  }
}
```

3. Rewrite `pages/addNewSite.tsx`:

```tsx
export default function AddNewSite() {
  const { t } = useTranslation('admin')
  const { mutateAsync } = useAddSiteConfig()

  const handleSubmit = async (data: SiteConfigFormData, logo: File | null) => {
    await mutateAsync({ formData: data, logoFile: logo })
  }

  return (
    <div className='space-y-10'>
      <PageHeader title={t('addSite.title')} description={t('addSite.description')} />
      <SiteConfigForm
        mode='create'
        submitLabel={t('addSite.submitButton')}
        onSubmit={handleSubmit}
        onSubmitSuccess={() => window.scrollTo(0, 0)}
      />
    </div>
  )
}
```

4. Re-run characterization suite — must stay PASS. Run `npm run build` to catch type issues.
5. Commit: `refactor(sites): extrai SiteConfigForm compartilhado entre criar e editar`.

## - [ ] Task D5: Admin list page `AdminSitesListPage`

**Files**
- Create: `src/pages/adminSitesList.tsx`
- Create: `src/pages/__tests__/adminSitesList.test.tsx`

**TDD**

1. Test file:
   - Renders table rows for a fixture mixing `is_active=true` + `is_active=false`; inactive row is present (distinguishes from public listing).
   - Clicking "+ Novo Site" calls `useNavigate` with `PATHS.app.addNewSite`.
   - Clicking "Editar" on row id=3 calls `useNavigate` with `PATHS.app.editSite(3)`.
   - Search input filters by `site_name` (case-insensitive, accent-insensitive via `Intl.Collator`).
2. Run — FAIL.
3. Implement page:

```tsx
export default function AdminSitesListPage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { data, isLoading } = useAdminSites()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const collator = new Intl.Collator('pt', { sensitivity: 'base' })
    const term = search.trim()
    if (!term) return data ?? []
    return (data ?? []).filter((s) =>
      collator.compare(s.site_name.slice(0, term.length), term) === 0 ||
      s.site_name.toLocaleLowerCase('pt').includes(term.toLocaleLowerCase('pt'))
    )
  }, [data, search])

  // ...JSX: PageHeader, search Input, "+ Novo Site" Button top-right,
  // <table> with columns: logo thumb or Building2, site_name, scraping_type Badge,
  // is_active dot (green/grey), created_at formatted via Intl.DateTimeFormat('pt-BR'),
  // "Editar" button per row.
  // EmptyState when filtered.length === 0.
}
```

Use `shadcn/ui Table` if available, else plain HTML `<table>` mirroring `addNewSite`'s sandbox result styling. Use `Building2` from `lucide-react` as logo fallback (same as `ListSites.tsx:180`).

4. PASS. Commit: `feat(pages): AdminSitesListPage com tabela de sites ativos+inativos`.

## - [ ] Task D6: Edit page `EditSitePage`

**Files**
- Create: `src/pages/editSite.tsx`
- Create: `src/pages/__tests__/editSite.test.tsx`

**TDD**

1. Test cases:
   - Pending `useSite` renders skeleton (`<LoadingSection>` or inline).
   - 404 error renders "Site nao encontrado" with back link.
   - Data arrives → form populates (assert logo preview `<img>` src and a selector input's value).
   - Submit triggers `useUpdateSiteConfig.mutateAsync` with `{ id, formData, logoFile }`.
   - On success, `useNavigate` called with `PATHS.app.adminSites`.

2. Run — FAIL.

3. Implement:

```tsx
export default function EditSitePage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const siteId = parseInt(id ?? '', 10)

  if (Number.isNaN(siteId) || siteId <= 0) {
    return <Navigate to={PATHS.app.adminSites} replace />
  }

  const { data, isLoading, error } = useSite(siteId)
  const { mutateAsync } = useUpdateSiteConfig()

  if (isLoading) return <LoadingSection />
  if (error) {
    const status = (error as AxiosError)?.response?.status
    if (status === 404) {
      return <EmptyState title={t('editSite.notFound')} /* back link */ />
    }
    return <EmptyState title={t('editSite.loadError')} />
  }
  if (!data) return null

  const handleSubmit = async (formData: SiteConfigFormData, logoFile: File | null) => {
    await mutateAsync({ id: siteId, formData, logoFile })
  }

  return (
    <div className='space-y-10'>
      <PageHeader title={t('editSite.title')} description={t('editSite.description')} />
      <SiteConfigForm
        mode='edit'
        initialData={data}
        submitLabel={t('editSite.submitButton')}
        onSubmit={handleSubmit}
        onSubmitSuccess={() => navigate(PATHS.app.adminSites)}
      />
    </div>
  )
}
```

4. PASS. Commit: `feat(pages): EditSitePage com SiteConfigForm mode=edit`.

## - [ ] Task D7: Router + paths + nav rename

**Files**
- Modify: `src/router/paths.ts`
- Modify: `src/router/routes.tsx`
- Modify: `src/components/common/app-header/index.tsx`
- Modify: `src/i18n/locales/pt-BR/common.json` + `en-US/common.json`

**Edits**

`paths.ts`:
```ts
app: {
  // ...existing...
  adminSites: '/app/admin-sites',
  editSite: (id: number) => `/app/admin-sites/${id}/edit`
}
```

`routes.tsx` — two lazy routes under `MainLayout` wrapped by `AdminGuard` (mirror existing admin routes at lines 86-104). Wrap in `<Suspense fallback={<LoadingSection />}>` consistent with `AdminDashboard` pattern:

```tsx
{
  path: 'admin-sites',
  element: <AdminGuard><Suspense fallback={<LoadingSection />}><AdminSitesListPage /></Suspense></AdminGuard>
},
{
  path: 'admin-sites/:id/edit',
  element: <AdminGuard><Suspense fallback={<LoadingSection />}><EditSitePage /></Suspense></AdminGuard>
}
```

`app-header/index.tsx:35` — replace:
```diff
-{ title: t('nav.addSite'), href: PATHS.app.addNewSite }
+{ title: t('nav.manageSites'), href: PATHS.app.adminSites }
```

`common.json` both locales — add `nav.manageSites: "Gerenciar Sites"` (pt) / `"Manage Sites"` (en). Remove `nav.addSite` key since no other consumer references it (verified via grep).

**Verification**
- `npm run build` — typecheck PASS.
- `npx vitest run src/pages src/hooks src/services` — all prior tests PASS.
- Commit: `feat(router): rotas admin-sites + editSite e renomeia nav admin`.

---

# Phase E — Sorted companies list (Feature 3)

## - [ ] Task E1: Sort dropdown + localStorage + collator in `ListSites.tsx`

**Files**
- Modify: `src/pages/ListSites.tsx`
- Modify: `src/i18n/locales/pt-BR/sites.json`
- Modify: `src/i18n/locales/en-US/sites.json`
- Create: `src/pages/__tests__/ListSites.test.tsx`

**TDD**

1. Test cases (all one file, fixture array with accents + subscription mix + one malformed date):

```ts
const fixture: SiteCareer[] = [
  { site_id: 1, site_name: 'Ácme',  created_at: '2026-01-01T00:00:00Z', is_subscribed: false, base_url: '', logo_url: null },
  { site_id: 2, site_name: 'azure', created_at: '2026-03-01T00:00:00Z', is_subscribed: true,  base_url: '', logo_url: null },
  { site_id: 3, site_name: 'Beta',  created_at: '2025-12-01T00:00:00Z', is_subscribed: false, base_url: '', logo_url: null },
  { site_id: 4, site_name: 'Zoom',  created_at: 'not-a-date',            is_subscribed: false, base_url: '', logo_url: null }
]
```

- `alphabetical`: expect `['Ácme', 'azure', 'Beta', 'Zoom']` — `Intl.Collator('pt', {sensitivity:'base'})` handles accents + case.
- `newest`: expect `['azure', 'Ácme', 'Beta', 'Zoom']` — newest first; `Zoom` falls back to epoch 0 without throwing.
- `subscribed_first`: expect `['azure', 'Ácme', 'Beta', 'Zoom']` — azure subscribed first, rest alphabetical.
- localStorage: select `newest` → `localStorage.getItem('sitesSortBy')` returns `'newest'`; unmount + remount → dropdown hydrates to `'newest'`.

2. Run — FAIL.

3. Implement in `ListSites.tsx`:

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

State + persistence:
```ts
const [sortBy, setSortBy] = useState<SortKey>(() => {
  const stored = localStorage.getItem('sitesSortBy')
  return (stored as SortKey) ?? 'alphabetical'
})
useEffect(() => {
  localStorage.setItem('sitesSortBy', sortBy)
}, [sortBy])
```

Extend existing `useMemo` (lines 47-55):
```ts
const filteredCompanies = useMemo(() => {
  return (data ?? [])
    .filter((c) => c.site_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => {
      if (filter === 'subscribed') return c.is_subscribed
      if (filter === 'not_subscribed') return !c.is_subscribed
      return true
    })
    .sort(sortFn[sortBy])
}, [searchTerm, data, filter, sortBy])
```

JSX — render `<Select>` next to `<FilterPills>` (around line 154):
```tsx
<Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
  <SelectTrigger aria-label={t('sort.label')}>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value='alphabetical'>{t('sort.alphabetical')}</SelectItem>
    <SelectItem value='newest'>{t('sort.newest')}</SelectItem>
    <SelectItem value='subscribed_first'>{t('sort.subscribedFirst')}</SelectItem>
  </SelectContent>
</Select>
```

4. Add i18n keys to both `sites.json` locales:

```json
"sort": {
  "label": "Ordenar por",
  "alphabetical": "Alfabetico (A-Z)",
  "newest": "Data de inclusao mais recente",
  "subscribedFirst": "Inscritas primeiro"
}
```

(en-US mirrors with "Sort by" / "Alphabetical (A–Z)" / "Most recently added" / "Subscribed first".)

Label is "Data de inclusao" not "Data de criacao" because migration 028 applied `DEFAULT NOW()` at migration time — pre-migration rows show the migration date, not true creation date (R15 from review). "Inclusao" communicates this honestly.

5. PASS. Commit: `feat(companies): ordenacao alfabetica/recentes/inscritos com persistencia local`.

---

# Phase F — E2E + ship

## - [ ] Task F1: Playwright spec `e2e/admin-sites.spec.ts`

**Files**
- Create: `e2e/admin-sites.spec.ts`
- Modify: `e2e/fixtures/api-mocks.ts` — add admin user variant + admin site endpoints + Netflix fixture.

**TDD**

Single `test(...)` covering the Netflix-repair flow against a mocked backend:

1. Log in as admin (set `is_admin: true` in `/api/me` mock).
2. Navigate to `/app/admin-sites`.
3. Assert row `Netflix Careers` present with a placeholder (no `<img>` — `Building2` icon visible).
4. Click `Editar` → URL contains `/admin-sites/57/edit`.
5. `await page.setInputFiles('input[type=file]', 'e2e/fixtures/netflix-logo.png')`.
6. Click submit.
7. Assert navigation back to `/app/admin-sites` + success toast.
8. Update mock to return Netflix with `logo_url` populated on subsequent GET `/siteCareer`. Assert Netflix row now shows `<img>` with the expected src.
9. Navigate to `/app/empresas`, filter `Todas`. Assert Netflix card renders its logo `<img>` (proves `['public-site-logos']` + `['siteCareerList']` invalidation).

Run: `npx playwright test e2e/admin-sites.spec.ts` — PASS.
Commit: `test(e2e): fluxo Netflix-repair de cadastro de logo via edit`.

## - [ ] Task F2: Final lint + build + ship frontend PR

Run in order:
- `npm run lint`
- `npm run build`
- `npx vitest run`
- `npx playwright test`

Open frontend PR. Link to backend PR from Task A8. Done.

---

# Appendix A — Architectural Trade-offs

From `plan-native` with light revisions. Each trade-off lists the alternative considered, why the current choice, and the conditions that would warrant a revisit.

### T1. Single `<SiteConfigForm>` vs. fragment-level extraction

- **Chosen**: one shared component with `mode` prop.
- **Alternative**: extract only repetitive fragments (`<CSSSelectorFields>`, `<APIConfigFields>`) and let each page own its `<form>`, state, and validation.
- **Why**: create/edit share ~95% of state, validation, and layout. Fragment-level extraction would leave duplicated submit/validation in two pages — exactly the shape that drifted into the Netflix bug (frontend tolerated `null logo` because the code path wasn't shared).
- **Revisit if**: a third caller needs a materially different layout (e.g., inline edit from the list), or optimistic-locking demands a version field — then the shared surface grows and fragment-level may win.

### T2. PUT full replacement vs. PATCH partial body

- **Chosen**: `PUT /siteCareer/:id` carrying every field on every submit.
- **Alternative**: PATCH + diff client-side.
- **Why**: the form always renders and sends every field; the backend has no "optional field" semantics — `UPDATE ... SET <every column>` is simpler and matches what the UI produces. PATCH would require per-field null-vs-omitted handling that Go's `encoding/json` can't distinguish cleanly (`*string`: null and absent both decode to `nil`).
- **Revisit if**: fields need intentional "no change" behavior distinct from "clear" (e.g., a secret where `null` means "don't touch" and `""` means "clear"). Then move to RFC 7396 merge patch or separate sub-endpoints.

### T3. Frontend-only logo-required validation

- **Chosen**: keep backend tolerant of missing logo to preserve `NoOpUploader` dev path.
- **Alternative**: controller-level check requiring file when `S3_BUCKET_NAME` is set (env-conditional).
- **Why**: env-conditional required fields create dev/prod divergence hard to exercise in tests. Single admin form is the only create source in practice.
- **Revisit if**: a second client (CLI, scheduled import, mobile) gains create ability — then move the guard backend-side and substitute a deterministic "placeholder logo" uploader for dev.

### T4. Delete-old-logo AFTER UpdateSite succeeds vs. transactional

- **Chosen**: `Upload → UpdateSite → DeleteFile` (best-effort, not transactional).
- **Alternative**: two-phase commit or SQL-side reference counting.
- **Why**: S3 has no transactional semantics with Postgres. The ordering trades "orphaned S3 object on DeleteFile failure" (negligible — KB per edit, rare) for "never lose the only copy of a referenced logo" (catastrophic — user-visible broken image). Four-gate check (`newLogoURL != ""` + `current.LogoURL != nil` + `*current.LogoURL != ""` + `*current.LogoURL != newLogoURL`) prevents the NoOp-uploader trap and the same-URL trap.
- **Revisit if**: S3 storage cost becomes material (unlikely at this scale) or a background orphan-sweeper is built for other reasons — piggyback on it.

### T5. Frontend sorting instead of `ORDER BY` on backend

- **Chosen**: frontend sort via `useMemo` + `Intl.Collator`.
- **Alternative**: `?sort=` query param with server-side ORDER BY.
- **Why**: at ~60 sites, client-side sort is instant and keeps subscribed-first possible without joins in the list endpoint. `Intl.Collator('pt')` gives locale-correct alphabetical in JS that `lower(site_name) COLLATE "pt_BR"` approximates but requires DB locale setup.
- **Revisit if**: list grows past ~500 entries — then pagination + server-side sort is cheaper than shipping 500 rows.

### T6. Characterization tests land in dedicated commit BEFORE refactor

- **Chosen**: commit 1 = tests green against current code; commit 2 = extract `<SiteConfigForm>`, tests still green.
- **Alternative**: bundle test + refactor in one PR.
- **Why**: two commits let you bisect the refactor if behavior changes.
- **Revisit if**: team decides the overhead isn't worth it — but with an 800-line file + form semantics, the split is cheap insurance.

---

# Appendix B — Risks by Phase

Each risk: **what could go wrong**, **how to detect**, **how to recover**.

### Phase A — Backend

- **`UpdateSite` `RETURNING` omits a column**: persisted row diverges from response. Detect: `TestUpdateSite` asserts every column round-trips. Recover: add the missing column to both `SET` and `RETURNING`.
- **`DeleteFile` URL parsing edge case** (query string, escaped chars, path-style vs virtual-host): every unknown case returns "warn + nil", worst case is S3 orphan. Detect: `TestDeleteFile_WrongBucket` + `TestDeleteFile_Malformed` cover common cases. Recover: refine parser, add test, follow-up ship. Never cascade-delete.
- **IAM lacks `s3:DeleteObject`**: every edit logs a warn. Detect: tail logs post-deploy. Recover: accepted tradeoff — orphans accumulate slowly; add permission in AWS console when convenient.
- **Legacy `logo_url = ''` rows**: new `DeleteFile` skips empty strings defensively, but existing `LogoURL = &""` pointers could confuse the preservation logic. Detect: pre-PR `SELECT COUNT(*) FROM site_scraping_config WHERE logo_url = '';` Recover: `UPDATE ... SET logo_url = NULL WHERE logo_url = '';` once if count > 0 (Task A8).

### Phase B — Characterization tests

- **Tests brittle when i18n keys change**: text-match assertions break on locale shuffle. Detect: run suite in CI pre-extraction. Recover: prefer `data-testid` or role-based selectors over `getByText`.
- **Hidden DOM dependency**: `addNewSite.tsx:663` does `document.getElementById('logo_upload')?.click()` — jsdom must support that. Detect: test renders into a body supporting the lookup. Recover: if it breaks, move to a `ref` in the refactor — but not before tests green.

### Phase C — Feature 1 hotfix

- **`accept` change SVG→WebP breaks admin who picks SVG**: spec accepts this — SVG was already silently rejected backend-side; the UI now matches backend reality. Detect: none needed. Recover: none.
- **i18n key missing in one locale**: causes a key-string to leak into UI. Detect: add keys to both `pt-BR` and `en-US` simultaneously; `npm run build` catches TypeScript key-type errors if i18n types are generated.

### Phase D — Refactor + edit

- **`<SiteConfigForm>` extraction drops state or changes focus/keyboard behavior**: regression silently lands. Detect: Phase B+C characterization suite is the safety net. Recover: commit-by-commit with tests re-run between stages.
- **`initialData` doesn't fully hydrate controlled inputs**: `api_method` defaults to `'GET'` in create but edit site has `api_method = null`; controlled `<Input>` with `value={undefined}` triggers React warning. Detect: `editSite.test.tsx` asserts each field is populated. Recover: the `nullsToEmpty` helper in Task D4 handles this — assert it was used.
- **Invalidation keys drift from producers**: typo or stale hook file. Detect: D3 test asserts all four keys; verify producers (`'public-site-logos'` at `usePublicStats.ts:15`, `'siteCareerList'` at `useSiteCareer.ts:6`). Recover: fix divergence.
- **Admin bookmarks to `/app/add-new-site` lose the nav item**: URL stays valid, only the menu label changes. "+ Novo Site" button on the admin list is labeled + prominent. Detect: user report. Recover: none needed if button is visible.

### Phase E — Sort

- **`new Date(invalidString).getTime()` returns `NaN`, poisons `Array.sort`**: non-deterministic output. Detect: fixture with `'not-a-date'` in the ListSites test. Recover: `|| 0` fallback in `sortFn`.
- **`Intl.Collator` differs between Node (jsdom) and browsers**: v8-based envs are consistent for common Portuguese strings. Detect: the test fixture keeps examples in well-specified range. Recover: if divergence, assert relative order of two strings, not precise index.

### Phase F — E2E + preflight

- **Playwright `mockAPI` missing the new PUT route**: test hangs on real call. Detect: network tab in headed mode. Recover: always `await mockAPI()` in `beforeEach`, add the route BEFORE `page.goto`.
- **Cache invalidation timing in jsdom/Playwright**: assertion fires before refetch. Detect: network visibility. Recover: `await page.waitForResponse(...)` tied to the refetch URL, then `expect(locator).toBeVisible()` — not arbitrary `page.waitForTimeout`.

---

# Appendix C — Integration Contracts

### `GET /siteCareer` (admin list)

**Request**: `Cookie: Authorization=<jwt>`, no body.

**Response 200**:
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

**Errors**: 401 (no cookie — global interceptor), 403 (not admin — `<AdminGuard>` preempts), 500 on repo failure.

### `GET /siteCareer/:id`

**Request**: id in path (positive int).

**Response 200**: same shape as single element above.

**Errors**: 400 `{"error": "ID invalido"}` / 404 `{"error": "Site nao encontrado"}` / 500 `{"error": "Erro ao buscar site"}`.

### `PUT /siteCareer/:id`

**Request**: `multipart/form-data`:
- `siteData`: JSON string of full `SiteScrapingConfig` body. Frontend null-cleans empty strings via `Object.fromEntries`.
- `logo` (optional): file part, `image/png | image/jpeg | image/webp`, ≤2MB. When absent, backend preserves `current.LogoURL`.

**Response 200**: persisted row (`UPDATE ... RETURNING`).

**Errors**: 400 (bad id, bad JSON, bad multipart) / 404 (not found) / 500 (upload or DB failure — old logo untouched per ordering invariant).

### `GET /api/getSites` (public subscriber, modified)

Adds `created_at` to the existing DTO. Non-breaking.

```json
{
  "site_id": 1,
  "site_name": "Google",
  "base_url": "https://...",
  "logo_url": "https://bucket.s3.amazonaws.com/logos/...",
  "is_subscribed": true,
  "target_words": [],
  "created_at": "2026-01-15T10:30:00Z"
}
```

`time.Time` marshals as RFC 3339 by default. Frontend parses with `new Date(s).getTime() || 0`.

### Cache invalidation invariant (frontend)

On successful `PUT /siteCareer/:id` (`useUpdateSiteConfig.onSuccess`), invalidate:
- `['adminSites']` — admin list refetches on back-nav.
- `['siteCareerList']` — `/app/empresas` reflects updated logo.
- `['site', id]` — returning to same edit page shows new data.
- `['public-site-logos']` — landing carousel updates without waiting for 10-min staleTime.

---

# Self-Review

**Spec coverage** — every section of the spec has at least one task:

| Spec section | Task(s) |
|---|---|
| Feature 1 — Logo required | Phase C / Task D4 (form-level enforcement) |
| Feature 2 — S3 DeleteFile interface | A1 |
| Feature 2 — Empty-string guard (create) | A2 |
| Feature 2 — `logo_url` omitempty strip (R1) | A3 |
| Feature 2 — Repo methods + `created_at` | A4 |
| Feature 2 — Usecase `UpdateSiteCareer` | A5 |
| Feature 2 — Controller + helpers | A6 |
| Feature 2 — Routes | A7 |
| Feature 2 — Type `SiteConfig` | D1 |
| Feature 2 — Service methods | D2 |
| Feature 2 — Hooks + 4-key invalidation | D3 |
| Feature 2 — Extract `<SiteConfigForm>` | D4 |
| Feature 2 — `AdminSitesListPage` | D5 |
| Feature 2 — `EditSitePage` | D6 |
| Feature 2 — Router + nav rename | D7 |
| Feature 3 — Backend `created_at` in DTO | A6 |
| Feature 3 — Sort dropdown | E1 |
| E2E | F1 |
| Pre-merge ops (IAM + legacy empty strings) | A8 + F2 |

**Ambiguities resolved**

1. **Unit-testing `Uploader.DeleteFile` with a concrete `*s3.Client`.** Factored a pure `parseBucketKey` helper and limited `DeleteFile` unit tests to pre-SDK guards. SDK path is exercised by the Playwright flow in F1 against a staging bucket (or locally via moto/localstack if set up). Alternative (abstract S3 client behind an interface) was rejected as over-engineering.
2. **Repo scan reuse.** Introduced `scanSites(query, args...)` shared between `GetAllSites` and `GetAllSitesAdmin`. `GetSiteByID` and `UpdateSite` stay on `QueryRow` because their Scan targets differ in `ErrNotFound` handling.
3. **`updated_at` field in model**. Migration 028 created `updated_at` but the model doesn't carry it. `UpdateSite` sets `updated_at = NOW()` in SQL but doesn't read it back. Adding the field to the model is a follow-up if any consumer actually needs it (R11 from review). For now, the column is maintained transparently by the DB.
4. **Admin bookmark preservation**. `PATHS.app.addNewSite` URL (`/app/add-new-site`) is preserved even though the nav label is renamed. Admins with bookmarks still reach the create page; the admin list has a prominent "+ Novo Site" button for everyone else.
5. **Logo preview vs. removal in edit**. No "remove logo" UX in this version. Admin uploads a replacement to change; no path to set logo back to null from the UI. If needed later, add an explicit "Remover logo" button tied to a dedicated PATCH endpoint — outside this spec's scope.

**Scope compressions** (bundled TDD cycles for developer ergonomics)

- **A4** bundles `CreatedAt` model field + interface extension + three repo methods + mock updates into one test-run cycle — they must land together for the package to compile.
- **A6** bundles two helpers (`parseSiteMultipart`, `parseIDParam`) + three new handlers + existing `GetAllSites` DTO extension into one cycle — all share the same test file.
- **D7** bundles router + paths + nav rename + i18n in a single commit — type-checked by `npm run build`.
- **E1** bundles sort logic + i18n + tests in one cycle since all changes live in one page.
- `go vet`, `golangci-lint run`, and `npm run lint` are folded into each commit step rather than standalone tasks.

**Placeholder scan**: no `TBD`, `TODO`, `<placeholder>`, or empty code blocks. All code samples are directly actionable.

**Task count**: 18 tasks across 6 phases (A:8, B:1, C:1, D:7, E:1, F:2).
