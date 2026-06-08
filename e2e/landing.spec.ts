import { test, expect } from '@playwright/test'

test.describe('landing page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock area-aware: o titulo muda conforme ?area= pra provar que o chip
    // dispara um refetch (e nao so re-renderiza os mesmos dados iniciais).
    await page.route('**/api/public/jobs/recent**', (route) => {
      const area = new URL(route.request().url()).searchParams.get('area') ?? 'dev'
      const prefix = area === 'produto' ? 'PROD' : 'DEV'
      route.fulfill({
        json: {
          jobs: [
            { title: `Eng ${prefix} A`, company: 'Nubank', logo_url: '', posted_hours_ago: 2 },
            { title: `Eng ${prefix} B`, company: 'iFood', logo_url: '', posted_hours_ago: 4 }
          ],
          today_count: 23
        }
      })
    })
    // PricingSection renderiza um skeleton enquanto usePlans carrega — sem este
    // mock o card de trial (#cta-plan-trial) nunca aparece e o último teste falha.
    // O card de trial só é renderizado para um plano com is_trial: true.
    await page.route('**/api/plans', (route) =>
      route.fulfill({
        json: [
          {
            id: 1,
            name: 'Trial',
            price: 0,
            max_sites: 5,
            max_ai_analyses: 3,
            max_pdf_extractions: 3,
            max_suggestion_applies: 3,
            max_pdf_generations: 3,
            is_trial: true,
            features: ['radar', 'ats', 'pdf']
          },
          {
            id: 2,
            name: 'Mensal',
            price: 4990,
            max_sites: 10,
            max_ai_analyses: 10,
            max_pdf_extractions: 10,
            max_suggestion_applies: 10,
            max_pdf_generations: 10,
            is_trial: false,
            features: ['radar', 'ats', 'pdf']
          }
        ]
      })
    )
  })

  test('navbar anchors scroll to their sections and the navbar CTA reaches pricing', async ({
    page
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Como funciona' }).click()
    await expect(page.locator('#howItWorks')).toBeInViewport()

    await page.getByRole('button', { name: 'Planos' }).click()
    await expect(page.locator('#pricing')).toBeInViewport()

    await page.getByRole('button', { name: 'FAQ' }).click()
    await expect(page.locator('#faq')).toBeInViewport()

    // 'Começar agora' aparece em mais de um lugar — escopa a navbar.
    await page.getByRole('navigation').getByRole('button', { name: 'Começar agora' }).click()
    await expect(page.locator('#pricing')).toBeInViewport()
  })

  test('clicking a chip refetches jobs for the new area', async ({ page }) => {
    await page.goto('/')
    // Estado inicial (area=dev).
    await expect(page.getByText('Eng DEV A')).toBeVisible()

    // O refetch precisa disparar quando o chip muda a area.
    const recent = page.waitForRequest('**/api/public/jobs/recent**area=produto*')
    await page.getByRole('button', { name: 'Produto' }).click()
    await recent

    // O titulo da nova area aparece e o da area antiga some — prova o refetch.
    await expect(page.getByText('Eng PROD A')).toBeVisible()
    await expect(page.getByText('Eng DEV A')).toHaveCount(0)
  })

  test('hero CTA scrolls to pricing and trial routes to /signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Quero meu radar/ }).click()
    await expect(page.locator('#pricing')).toBeInViewport()
    // seleciona pelo id estável (#cta-plan-trial), não pelo texto
    await page.locator('#cta-plan-trial').click()
    await expect(page).toHaveURL(/\/signup/)
  })
})
