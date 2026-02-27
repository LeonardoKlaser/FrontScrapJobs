import { test, expect } from './fixtures/api-mocks'

test.describe('Sites / Empresas', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app/sites')
    await page.waitForURL('/app/sites')
  })

  test('lista de empresas carrega corretamente', async ({ page }) => {
    await expect(page.getByText('Empresas Monitoradas')).toBeVisible()

    // All 4 mock companies should appear
    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('Microsoft')).toBeVisible()
    await expect(page.getByText('Apple')).toBeVisible()
    await expect(page.getByText('Amazon')).toBeVisible()

    // Stats row — use exact role to avoid strict mode
    await expect(page.getByRole('paragraph').filter({ hasText: 'Inscritas' })).toBeVisible()
  })

  test('filtro por nome funciona', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar empresa...')
    await searchInput.fill('Google')

    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('Microsoft')).not.toBeVisible()
    await expect(page.getByText('Apple')).not.toBeVisible()
  })

  test('filtro por inscricao funciona', async ({ page }) => {
    // Click "Inscritas" filter pill
    await page.getByRole('tab', { name: 'Inscritas' }).click()

    // Only subscribed companies should show (Google, Amazon)
    await expect(page.getByText('Google')).toBeVisible()
    await expect(page.getByText('Amazon')).toBeVisible()
    await expect(page.getByText('Microsoft')).not.toBeVisible()
    await expect(page.getByText('Apple')).not.toBeVisible()

    // Click "Disponíveis" filter pill
    await page.getByRole('tab', { name: 'Disponíveis' }).click()

    await expect(page.getByText('Microsoft')).toBeVisible()
    await expect(page.getByText('Apple')).toBeVisible()
    await expect(page.getByText('Google')).not.toBeVisible()
  })

  test('clicar em empresa abre modal de inscricao', async ({ page }) => {
    // Click on Microsoft (not subscribed)
    await page.getByText('Microsoft').click()

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
