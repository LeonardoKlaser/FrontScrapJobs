import { test, expect } from '@playwright/test'

test.describe('landing page', () => {
  test.beforeEach(async ({ page }) => {
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

  test('hero CTA scrolls to pricing and trial routes to /signup', async ({ page }) => {
    await page.goto('/')
    // 'Começar grátis' aparece no hero e no CTA final — o hero é o primeiro no DOM.
    await page
      .getByRole('button', { name: /Começar grátis/ })
      .first()
      .click()
    await expect(page.locator('#pricing')).toBeInViewport()
    // seleciona pelo id estável (#cta-plan-trial), não pelo texto
    await page.locator('#cta-plan-trial').click()
    await expect(page).toHaveURL(/\/signup/)
  })
})
