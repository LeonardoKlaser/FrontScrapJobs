# UX/UI Refinements — Design Spec

## Overview

A set of 13 targeted UX/UI improvements across authentication, sites management, dashboard, and modals. All changes are in the React frontend (`FrontScrapJobs/`), with two small backend adjustments needed.

---

## Part 1: Authentication

### 1.1 Logo Centering on Mobile (Login)

**Problem:** Logo not centered on mobile screens in the Login page.

**File:** `src/pages/Login.tsx`

**Fix:** The `<Logo>` component in the left panel is `hidden` on mobile. The right panel (which is visible on mobile) needs the logo centered with `mx-auto` or `flex justify-center` on its container.

### 1.2 Guest Loader for Public Routes

**Problem:** `useUser()` hook in Login.tsx calls `GET /api/me` on mount, generating a 401 error when there's no session.

**Files:**
- New: `src/router/loaders/guestLoader.ts`
- Modified: `src/router/routes.tsx`, `src/pages/Login.tsx`

**Design:**
1. Create `guestLoader` — attempts `queryClient.fetchQuery(['user'])` with `staleTime: 5min`. On success, `redirect('/app')`. On failure, `return null`.
2. Apply `guestLoader` to public auth routes: `/login`, `/forgot-password`, `/reset-password`. (Note: `/register` does not exist — registration goes through `/checkout/:planId`.)
3. Remove `useUser()` and the redirect `useEffect` from `Login.tsx`.

### 1.3 Password Visibility Toggle (All Password Fields)

**Problem:** No Eye/EyeOff toggle on password fields except in checkout.

**Files to modify:**
- `src/components/forms/Auth.tsx` — 1 field (`password`)
- `src/pages/ResetPassword.tsx` — 2 fields (`password`, `confirmPassword`)
- `src/components/accountPage/security-section.tsx` — 4 fields (`old_password`, `new_password`, `confirm_password`, `deletePassword`)

**Pattern:** Similar to `payment-form.tsx`, but note that `Auth.tsx` uses `react-hook-form`'s `{...register('password')}` spread (not controlled `value`/`onChange`). The `type` prop can be changed while keeping `register` intact.
- State: `const [showPassword, setShowPassword] = useState(false)`
- Input: `type={showPassword ? 'text' : 'password'}`
- Button: Absolutely positioned inside the input container, toggles between `<Eye>` and `<EyeOff>` from lucide-react
- Padding: `pr-10` on the input to avoid text under the icon

Total: 7 password fields across 3 files.

---

## Part 2: Sites / Companies Tab

### 2.1 Clear Search Button

**Problem:** No X button to clear search input in `ListSites.tsx`.

**File:** `src/pages/ListSites.tsx`

**Fix:** Add an `<X>` icon button inside the search input (conditionally rendered when `searchTerm` is not empty) that calls `setSearchTerm('')`.

### 2.2 Slots Text Change

**Problem:** "Slots livres" / "Slots de empresas disponíveis" is unclear to users.

**Files:**
- `src/i18n/locales/pt-BR/sites.json` — change translation keys `stats.freeSlots` and `popup.slotsAvailable`
- Any hardcoded occurrences in components

**New text:** "Monitoramentos disponíveis"

### 2.3 View/Edit Filters for Subscribed Sites

**Problem:** Users can't view or edit keywords for sites they already monitor. The modal shows only an unsubscribe option.

**Backend dependency:**
- `PATCH /userSite/{siteId}` already exists (accepts `{ target_words: string[] }`)
- `GET /api/getSites` currently returns `is_subscribed: boolean` but NOT the current `target_words`

**Backend change needed:** Modify `GetAllSites` in `site_career_controller.go` to include `target_words: string[]` in the response for subscribed sites. The `GetSubscribedSiteIDs` method needs to be replaced with a method that also returns the filters (or a new method).

**Frontend changes:**

1. **Model** (`src/models/siteCareer.ts`): Add `target_words?: string[]` to `SiteCareer` interface.

2. **Service** (`src/services/siteCareerService.ts`): Add `updateUserSiteFilters(siteId: number, targetWords: string[])` calling `PATCH /userSite/{siteId}`.

3. **Hook**: Create `useUpdateUserSiteFilters` mutation hook.

4. **Modal** (`src/components/companyPopup.tsx`): When `isAlreadyRegistered`:
   - Pre-populate keywords from `company.target_words`
   - Show current keywords as removable badges (click X on badge to remove)
   - Show input field to add new keywords
   - "Salvar alterações" button calls the PATCH endpoint
   - Keep "Desvincular" button below (destructive variant)

5. **ListSites.tsx**: Pass `target_words` from company data to the modal.

### 2.4 Smart Default Tab

**Problem:** Default tab is always "Todas" even if user has subscribed sites.

**File:** `src/pages/ListSites.tsx`

**Fix:** Initialize `filter` state based on data:
```
const [filter, setFilter] = useState(() =>
  companies?.some(c => c.is_subscribed) ? 'subscribed' : 'all'
)
```
Since data loads async, use a `useEffect` that sets the filter to `'subscribed'` on first data load if there are subscribed companies (only once, don't override user selection).

### 2.5 Remove Close Button from Modal Footer

**Problem:** Modal has both footer "Fechar"/"Cancelar" button and header X icon.

**File:** `src/components/companyPopup.tsx`

**Fix:** Remove the `variant="outline"` "Fechar" and "Cancelar" buttons from the modal footer. Keep only the X in the top-right corner (already present via Dialog's close mechanism).

---

## Part 3: Dashboard Table

### 3.1 Three-State Sort Cycle

**Problem:** `handleSort` in `Home.tsx` toggles between `asc` and `desc` only.

**File:** `src/pages/Home.tsx`

**Fix:** Change `handleSort` to cycle through 3 states:
- Click 1: `asc`
- Click 2: `desc`
- Click 3: `null` (clear sort, return to default order)

When `sortField` is `null`, no `sort()` is applied to the data (original API order). Update `SortIcon` component to show `ArrowUpDown` when sort is cleared.

### 3.2 Migrate to @tanstack/react-table with Resizable Columns

**Problem:** Columns are fixed-width and not resizable. Current table is a plain shadcn/ui `<Table>`.

**File:** `src/pages/Home.tsx`

**Approach:** Migrate to `@tanstack/react-table` using shadcn's DataTable pattern.

**Requirements — preserve all existing functionality:**
- Column sorting (now 3-state as per 3.1)
- Search/filter by text
- Pagination
- Mobile card layout vs desktop table layout
- All existing columns: Title, Company, Location, Link, Actions
- Status badges, drawer interactions, AI analysis dialog triggers

**New functionality:**
- `columnResizing: true` in table options
- Drag handles on column borders
- Session-only state (no persistence needed)

**Risk mitigation:** This is the largest change. Must verify all existing interactions (sorting, filtering, pagination, row click actions, mobile layout) still work after migration.

---

## Part 4: Modals & General

### 4.1 Drawer Title Padding (Applications)

**Problem:** Close X icon overlaps with long job titles in the application drawer.

**File:** `src/components/applications/application-drawer.tsx`

**Fix:** Add `pr-8` to `SheetTitle` to reserve space for the absolutely-positioned close button.

### 4.2 Curriculum Name in AI Analysis

**Problem:** The AI analysis popup doesn't show which curriculum was used for the match.

**Backend status:** `GET /api/analyze-job/history?job_id={jobId}` returns `curriculum_id` (integer) but not the curriculum name.

**Approach:** The frontend already has curriculum data available via `useCurriculums()` hook. When displaying analysis results, look up the curriculum name from the cached curriculum list using the `curriculum_id` returned by the history endpoint.

**Files:**
- `src/components/analysis/analysis-dialog.tsx` — add curriculum name label in `AnalysisResult` component
- Pass `curriculum_id` into `AnalysisResult`: from `historyData.curriculum_id` (history path) or `selectedCvId` (new analysis path)

**Display:** Simple label at the top of the result: "Currículo utilizado: [nome]"

---

## Backend Changes Summary

| Change | File | Description |
|--------|------|-------------|
| Include `target_words` in getSites response | `controller/site_career_controller.go` | For subscribed sites, include the user's target_words in the DTO |
| New repository method | `repository/user_site_repository.go` | Method to get subscribed site IDs WITH their filters (not just boolean map) |

No backend changes needed for curriculum display (frontend can resolve from cached data).

---

## Implementation Order

1. **Quick wins first** (no dependencies): 1.1, 1.3, 2.1, 2.2, 2.5, 3.1, 4.1
2. **Guest loader** (1.2): Isolated routing change
3. **Smart default tab** (2.4): Small logic change
4. **Curriculum in analysis** (4.2): Frontend-only lookup
5. **Edit filters** (2.3): Requires backend change first, then frontend
6. **Table migration** (3.2): Largest change, do last to avoid conflicts
