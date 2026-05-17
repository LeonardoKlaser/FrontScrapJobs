import { test, expect, mockDashboard, mockJobsPage1 } from './fixtures/api-mocks'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app')
    await page.waitForURL('/app')
  })

  test('exibe a stats strip com valores corretos', async ({ page }) => {
    // Stats are an inline flex row with pluralized strings (post-redesign).
    const monitored = mockDashboard.monitored_urls_count
    const newJobs = mockDashboard.new_jobs_today_count
    const alerts = mockDashboard.alerts_sent_count

    const monitoredText =
      monitored === 1 ? `${monitored} empresa monitorada` : `${monitored} empresas monitoradas`
    const newJobsText = newJobs === 1 ? `${newJobs} nova em 24h` : `${newJobs} novas em 24h`
    const alertsText = alerts === 1 ? `${alerts} alerta` : `${alerts} alertas`

    await expect(page.getByText(monitoredText)).toBeVisible()
    await expect(page.getByText(newJobsText)).toBeVisible()
    await expect(page.getByText(alertsText)).toBeVisible()
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

  test('URLs monitoradas exibem como chips', async ({ page }) => {
    // SectionHeader renders an <h2>; the stats strip also contains the substring,
    // so disambiguate via role.
    await expect(page.getByRole('heading', { name: 'Empresas monitoradas' })).toBeVisible()

    // Post-redesign monitored companies render as Badge chips, not a table.
    await expect(page.getByText('Google', { exact: true })).toBeVisible()
    await expect(page.getByText('Amazon', { exact: true })).toBeVisible()
  })
})
