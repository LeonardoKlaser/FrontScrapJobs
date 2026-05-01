import { test, expect } from '@playwright/test'

// Os 3 cenários abaixo (criar lifecycle, editar template, pausar subscriber)
// estão SKIPPED por design — exigem fixture de admin login + seed data
// (template ID, lifecycle ID, evento staging) que não existe no harness atual.
// Implementação fica como follow-up quando o teste e2e infra ganhar:
//   1. fixture `loginAs('admin')` que injeta cookie httponly
//   2. seed determinístico no docker-compose.test.yml
//   3. mailbox de staging consultável via API (Mailpit ou equivalente)
//
// Pre-merge checklist do plano marca esses 3 como manual smoke até lá.
// O smoke de redirect (sem auth, no fim do arquivo) RODA e bloqueia merge se
// a rota /app/admin-emails sumir do router ou perder o AdminGuard.

test.describe.skip('Admin emails — manual smoke (requires admin login + seed data)', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: replace with admin login fixture/setup
    await page.goto('/login')
    // ... fill admin credentials
    // ... submit
    // ... wait for redirect to /app
  })

  test('admin cria lifecycle simple_segment, executa now, ve log', async ({ page }) => {
    await page.goto('/app/admin-emails/lifecycle/new')

    await page.fill('input[name="name"]', 'Test Lifecycle E2E')
    await page.fill('input[placeholder*="0 9"]', '0 9 * * *')

    // TODO: select template via shadcn Select
    // TODO: build filter via FilterBuilder

    // AudiencePreview deve carregar
    await expect(page.getByText(/usuarios casariam/i)).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /^Salvar$/ }).click()
    await expect(page).toHaveURL(/admin-emails\/lifecycle/)

    // TODO: navegar pro editor do lifecycle recem-criado e clicar Executar agora
    // TODO: verificar log entry em /app/admin-emails/logs
  })

  test('admin edita template welcome, preview atualiza, salva, manda test-send', async ({
    page
  }) => {
    await page.goto('/app/admin-emails/templates')

    // Click no row "welcome"
    await page
      .getByRole('link', { name: /Editar/i })
      .first()
      .click()

    // TODO: change subject in Monaco editor
    // TODO: click "Atualizar" preview button
    // TODO: assert iframe content updated
    // TODO: click "Salvar e enviar teste"
    // TODO: assert toast "Test enviado pra seu email"
  })

  test('admin pausa subscriber via toggle, comportamento de nao-envio confere', async ({
    page
  }) => {
    await page.goto('/app/admin-emails/events')

    // TODO: expand event "user.signed_up"
    // TODO: click "Editar" do subscriber Welcome
    // TODO: toggle is_active off
    // TODO: confirmar
    // TODO: trigger signup user via outra aba/API
    // TODO: assertar que email NAO foi enviado (verificar email_logs ou inbox staging)
  })
})

// Smoke test sem auth — RODA em CI. Valida que /app/admin-emails está wired e
// AdminGuard está aplicado (redirect pra /login quando não autenticado).
test('admin-emails routes redireciona pra login sem auth', async ({ page }) => {
  await page.goto('/app/admin-emails')
  await expect(page).toHaveURL(/\/login/)
})
