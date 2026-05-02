import { test, expect } from '@playwright/test'

// Os 3 cenários abaixo (send-now, schedule+cancel, edit-rules read-only)
// estão SKIPPED por design — exigem fixture de admin login + seed data
// (template ativo no banco) que não existe no harness atual.
//
// Mesmo motivo do admin-emails.spec.ts:
//   1. Falta fixture `loginAs('admin')` que injeta cookie httponly via API
//   2. Falta seed determinístico (template ativo) no docker-compose.test.yml
//   3. Falta mailbox de staging (Mailpit ou similar) consultável via API
//      para asserir que a campanha de fato chegou em algum inbox.
//
// Pre-merge checklist do plano marca esses 3 como manual smoke até lá —
// ver `ScrapJobs/docs/superpowers/plans/2026-05-02-email-campaigns-smoke-checklist.md`.
//
// O smoke de redirect (sem auth, no fim do arquivo) RODA e bloqueia merge se
// a rota `/app/admin-emails/campaigns` sumir do router ou perder o AdminGuard.

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@local.test'
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? 'admin123'

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', ADMIN_EMAIL)
  await page.fill('input[name="password"]', ADMIN_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/app(\/|$)/)
}

test.describe.skip('Admin campaigns — manual smoke (requires admin login + seed data)', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: substituir por fixture de admin login que injeta cookie via API
    // (sem passar pela tela de /login). Pré-condição: existir 1 user com
    // is_admin=true e ao menos 1 email_template com is_active=true.
    await loginAsAdmin(page)
  })

  test('admin envia campanha "Enviar Agora" e vê draft → sending → sent', async ({ page }) => {
    // Cenário 1: send-now end-to-end.
    // Pre-condição: backend (api+worker+scheduler) + Postgres + Redis rodando,
    // user admin pré-criado, ao menos 1 template ativo.
    await page.goto('/app/admin-emails/campaigns')
    await page.click('a:has-text("Nova campanha")')

    await page.fill('input[name="name"]', `e2e-${Date.now()}`)
    // Selecionar primeiro template ativo (assume haver pelo menos 1 no seed)
    await page.click('[role="combobox"]')
    await page.click('[role="option"] >> nth=0')

    await page.click('button:has-text("Salvar rascunho")')
    await expect(page.locator('text=/Rascunho/i')).toBeVisible()

    await page.click('button:has-text("Enviar agora")')

    // Polling 5s do useEmailCampaign deve mostrar "Enviando" e depois "Enviada".
    // Timeout amplo porque worker faz fan-out 10-wide + heartbeat + flush.
    await expect(page.locator('text=/Enviando|Enviada/').first()).toBeVisible({
      timeout: 30_000
    })
    await expect(page.locator('text=/Enviada/i')).toBeVisible({ timeout: 60_000 })

    // TODO: opcional — checar que progress bar mostra sent_count > 0
    // TODO: opcional — abrir LogsViewer com filtro campaign_id e asserir
    //                  que existem entries para a campanha
  })

  test('admin agenda campanha +5min e cancela antes do disparo', async ({ page }) => {
    // Cenário 2: schedule + cancel.
    await page.goto('/app/admin-emails/campaigns/new')

    await page.fill('input[name="name"]', `e2e-sch-${Date.now()}`)
    await page.click('[role="combobox"]')
    await page.click('[role="option"] >> nth=0')
    await page.click('button:has-text("Salvar rascunho")')

    // Agendar +5min (datetime-local format: YYYY-MM-DDTHH:mm)
    const future = new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)
    await page.fill('input[type="datetime-local"]', future)
    await page.click('button:has-text("Agendar")')
    await expect(page.locator('text=/Agendada/i')).toBeVisible()

    await page.click('button:has-text("Cancelar")')
    await expect(page.locator('text=/Cancelada/i')).toBeVisible()
  })

  test('admin tenta editar template em scheduled e UI bloqueia (read-only)', async ({ page }) => {
    // Cenário 3: edit rules — em scheduled o Select de template fica disabled.
    // Backend retornaria 409 not_editable se request chegasse, mas a UI
    // poliforme do CampaignEditor previne essa request.
    await page.goto('/app/admin-emails/campaigns/new')

    await page.fill('input[name="name"]', `e2e-edit-${Date.now()}`)
    await page.click('[role="combobox"]')
    await page.click('[role="option"] >> nth=0')
    await page.click('button:has-text("Salvar rascunho")')

    const future = new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)
    await page.fill('input[type="datetime-local"]', future)
    await page.click('button:has-text("Agendar")')

    // Em scheduled, template Select deve estar disabled.
    const tplCombo = page.locator('[role="combobox"]').first()
    await expect(tplCombo).toBeDisabled()
  })
})

// Smoke test sem auth — RODA em CI. Valida que a rota está wired e o
// AdminGuard está aplicado (redirect pra /login quando não autenticado).
test('campaigns admin route redireciona pra login sem auth', async ({ page }) => {
  await page.goto('/app/admin-emails/campaigns')
  await expect(page).toHaveURL(/\/login/)
})
