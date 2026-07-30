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
            is_trial: true,
            features: ['radar', 'ats', 'pdf']
          },
          {
            id: 2,
            name: 'Mensal',
            price: 4990,
            max_sites: 10,
            max_ai_analyses: 10,
            is_trial: false,
            features: ['radar', 'ats', 'pdf']
          }
        ]
      })
    )
  })

  test('navbar anchors scroll to their sections and the navbar CTA opens the WhatsApp modal', async ({
    page
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Como funciona' }).click()
    await expect(page.locator('#howItWorks')).toBeInViewport()

    await page.getByRole('button', { name: 'Planos' }).click()
    await expect(page.locator('#pricing')).toBeInViewport()

    await page.getByRole('button', { name: 'FAQ' }).click()
    await expect(page.locator('#faq')).toBeInViewport()

    // 'Começar agora' aparece em mais de um lugar — escopa a navbar. No
    // Chromium desktop (sem sessão de WhatsApp) o CTA sempre abre o modal com
    // QR — não navega mais direto pro wa.me nem rola até #pricing.
    await page.getByRole('navigation').getByRole('button', { name: 'Começar agora' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Fale com o Norte no seu WhatsApp')).toBeVisible()
    await expect(dialog.getByAltText('QR code para abrir o WhatsApp do Norte')).toBeVisible()

    // Sufixo #lpw (encodado como %23lpw na querystring) dá atribuição de
    // origem "web" pro backend — distingue de #lp (mobile) e #lpq (QR).
    const webLink = dialog.getByRole('link', { name: 'Ou abrir no WhatsApp Web' })
    await expect(webLink).toHaveAttribute('href', /^https:\/\/wa\.me\//)
    await expect(webLink).toHaveAttribute('href', /%23lpw$/)
  })

  test('hero CTA opens the WhatsApp modal and the paid plan CTA routes to /signup', async ({
    page
  }) => {
    await page.goto('/')
    // 'Começar grátis' aparece no hero e no CTA final — o hero é o primeiro no DOM.
    await page
      .getByRole('button', { name: /Começar grátis/ })
      .first()
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Fale com o Norte no seu WhatsApp')).toBeVisible()

    // Fecha o modal pra não bloquear o clique na seção de planos logo abaixo.
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // O CTA do hero não rola mais até #pricing (agora abre o WhatsApp) —
    // chega lá pela âncora da navbar, que continua com o comportamento antigo.
    await page.getByRole('navigation').getByRole('button', { name: 'Planos' }).click()
    await expect(page.locator('#pricing')).toBeInViewport()

    // PricingSection só renderiza cards pra planos pagos (is_trial: false) —
    // ver pricing-section.tsx:40. O plano trial não tem CTA nenhum na landing
    // hoje, então não há mais um #cta-plan-trial pra clicar; seleciona pelo id
    // estável do plano pago mockado acima ("Mensal" → #cta-plan-mensal).
    await page.locator('#cta-plan-mensal').click()
    await expect(page).toHaveURL(/\/signup\?plan=2/)
  })
})
