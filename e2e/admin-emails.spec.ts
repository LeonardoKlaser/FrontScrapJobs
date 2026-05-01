import { test, expect } from '@playwright/test'

// Pre-condicao: admin user logado. Usa cookie/session do setup global ou
// faz login manual nesta spec se um fixture existir.
//
// Estes 3 cenarios sao scaffold — alguns passos sao placeholder (TODO)
// porque dependem de seed data especifico (template ID, lifecycle ID) que
// varia por env. Adapte conforme staging tem dados reais.

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

// Smoke test sem auth pra confirmar que routes estao wired e redirects funcionam
test('admin-emails routes redireciona pra login sem auth', async ({ page }) => {
  await page.goto('/app/admin-emails')
  await expect(page).toHaveURL(/\/login/)
})
