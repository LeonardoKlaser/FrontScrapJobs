import { test, expect } from '@playwright/test'

test.describe('landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/public/stats', (route) =>
      route.fulfill({ json: { monitored_sites: 101, total_jobs: 2840 } })
    )
    await page.route('**/api/public/sites/logos', (route) => route.fulfill({ json: [] }))
    await page.route('**/api/plans', (route) =>
      route.fulfill({
        json: [
          {
            id: 2,
            name: 'Profissional',
            price: 19.9,
            max_sites: 40,
            max_ai_analyses: 20,
            is_trial: false,
            is_ultra: false,
            features: ['NÃO DEVE APARECER']
          },
          {
            id: 3,
            name: 'Ultra',
            price: 29.9,
            max_sites: 0,
            max_ai_analyses: 50,
            is_trial: false,
            is_ultra: true,
            features: ['NÃO DEVE APARECER']
          }
        ]
      })
    )
  })

  test('covers the complete desktop journey and conversion paths', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('ScrapJobs — Vagas recentes no seu WhatsApp')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'O ScrapJobs monitora páginas de carreira, encontra vagas compatíveis com seu perfil e envia as novidades no seu WhatsApp.'
    )

    const hero = page.locator('section').first()
    await expect(
      hero.getByRole('heading', {
        level: 1,
        name: 'Receba as vagas mais recentes no seu WhatsApp.'
      })
    ).toBeVisible()
    await expect(hero.locator('ul > li')).toHaveText([
      'Tecnologia',
      'Marketing',
      'Vendas',
      'RH',
      'Finanças',
      'Design',
      'Dados'
    ])

    const statsLine = page
      .locator('section')
      .filter({ hasText: 'vagas disponíveis' })
      .first()
      .locator('p')
    await statsLine.scrollIntoViewIfNeeded()
    await expect(statsLine).toContainText('101 empresas monitoradas · 2.840 vagas disponíveis')

    const navigation = page.getByRole('navigation', { name: 'Navegação principal' })
    for (const [name, target] of [
      ['Como funciona', '#howItWorks'],
      ['O que está incluído', '#included'],
      ['Planos', '#pricing'],
      ['FAQ', '#faq']
    ] as const) {
      await navigation.getByRole('button', { name }).click()
      await expect(page.locator(target)).toBeInViewport()
    }

    const howItWorks = page.locator('#howItWorks')
    await expect(
      howItWorks.getByRole('heading', {
        level: 2,
        name: 'Veja suas oportunidades em 3 perguntas'
      })
    ).toBeVisible()
    await expect(howItWorks.getByRole('heading', { level: 3 })).toHaveText([
      'Conte o que você procura',
      'Veja o resultado',
      'Escolha seu plano'
    ])

    const included = page.locator('#included')
    await expect(
      included.getByRole('heading', { level: 2, name: 'Da descoberta à candidatura' })
    ).toBeVisible()
    await expect(included.getByTestId('journey-feature')).toHaveCount(5)

    const pricing = page.locator('#pricing')
    await expect(pricing.getByText(/^R\$\s*19,90$/)).toBeVisible()
    await expect(pricing.getByText(/^R\$\s*29,90$/)).toBeVisible()

    const faq = page.locator('#faq')
    await expect(faq.getByRole('button')).toHaveText([
      'De onde vêm as vagas?',
      'A conversa inicial é gratuita?',
      'Preciso usar WhatsApp?',
      'O ScrapJobs modifica meu currículo?',
      'Posso cancelar quando quiser?',
      'Posso pedir outra empresa?'
    ])

    const closing = page
      .getByRole('heading', { level: 2, name: 'Pare de procurar vaga todos os dias.' })
      .locator('xpath=ancestor::section')
    await closing.scrollIntoViewIfNeeded()
    await expect(closing.getByRole('button', { name: 'Receber vagas no WhatsApp' })).toBeVisible()
    await expect(page.getByText('NÃO DEVE APARECER')).toHaveCount(0)
    await expect(page.getByText('Começar grátis')).toHaveCount(0)

    await hero.getByRole('button', { name: 'Receber vagas no WhatsApp' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Fale com o Norte no seu WhatsApp')).toBeVisible()
    await expect(dialog.getByAltText('QR code para abrir o WhatsApp do Norte')).toBeVisible()

    const webLink = dialog.getByRole('link', { name: 'Ou abrir no WhatsApp Web' })
    await expect(webLink).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/)
    await expect(webLink).toHaveAttribute('href', /%23lpw$/)

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    await pricing.getByRole('button', { name: 'Assinar Profissional' }).click()
    await expect(page).toHaveURL(/\/signup\?plan=2$/)
  })

  test('keeps the mobile hero visible without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const hero = page.locator('section').first()
    await expect(
      hero.getByRole('heading', {
        level: 1,
        name: 'Receba as vagas mais recentes no seu WhatsApp.'
      })
    ).toBeVisible()
    await expect(hero.getByRole('button', { name: 'Receber vagas no WhatsApp' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth)
    )
  })

  test('renders the approved English journey without Portuguese fallback', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('i18n-lng', 'en-US'))
    await page.goto('/')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Get the latest jobs on your WhatsApp.'
      })
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', {
        name: "What's included"
      })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Choose how much you want to monitor' })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Get jobs on WhatsApp' }).first()).toBeVisible()
    await expect(page.getByText('Receba as vagas mais recentes no seu WhatsApp.')).toHaveCount(0)
    await expect(page.getByText('O que está incluído')).toHaveCount(0)
  })
})
