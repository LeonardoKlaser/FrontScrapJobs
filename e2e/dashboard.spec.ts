import { test, expect, mockDashboard, mockJobsPage1 } from './fixtures/api-mocks'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app')
    await page.waitForURL('/app')
  })

  test('exibe os 3 stats cards com valores corretos', async ({ page }) => {
    // Stats cards: each card has a title (p.text-sm) and a value (p.font-display.text-3xl)
    const statsSection = page.locator('.grid').first()
    await expect(statsSection.getByText('URLs monitoradas')).toBeVisible()
    await expect(statsSection.getByText('Vagas novas (24h)')).toBeVisible()
    await expect(statsSection.getByText('Alertas enviados')).toBeVisible()

    // Check values inside the stats cards using the bold text selector
    const boldValues = statsSection.locator('p.font-display')
    await expect(boldValues.nth(0)).toHaveText(String(mockDashboard.monitored_urls_count))
    await expect(boldValues.nth(1)).toHaveText(String(mockDashboard.new_jobs_today_count))
    await expect(boldValues.nth(2)).toHaveText(String(mockDashboard.alerts_sent_count))
  })

  test('tabela de vagas renderiza com dados', async ({ page }) => {
    await expect(page.getByText('Últimas vagas')).toBeVisible()

    // Table headers
    await expect(page.locator('th').filter({ hasText: 'Título' }).first()).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Empresa' }).first()).toBeVisible()

    // First job from mock
    await expect(page.locator('td').filter({ hasText: 'Vaga 1' }).first()).toBeVisible()
    await expect(page.locator('td').filter({ hasText: 'Empresa 1' }).first()).toBeVisible()

    // Total count
    await expect(page.getByText(`${mockJobsPage1.total_count} vaga(s) encontrada(s)`)).toBeVisible()
  })

  test('paginacao navega entre paginas', async ({ page }) => {
    // Page indicator visible
    await expect(page.locator('text=/ 2')).toBeVisible()

    // Click next button
    const nextBtn = page.locator('button').filter({ hasText: /Próximo/ })
    await nextBtn.click()

    // Should show page 2 jobs
    await expect(page.locator('td').filter({ hasText: 'Vaga 11' })).toBeVisible()
  })

  test('URLs monitoradas exibem na tabela', async ({ page }) => {
    await expect(page.getByText('Suas URLs monitoradas')).toBeVisible()

    // Use role-based selectors to avoid strict mode violations
    await expect(page.getByRole('cell', { name: 'Google', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /careers\.google\.com/ })).toBeVisible()
  })
})
