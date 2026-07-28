import { test, expect } from './fixtures/api-mocks'

// PaymentForm (checkout/:planId) foi reduzido de 3 etapas (dados → endereço →
// cartão) pra 2: dados pessoais (agora incluindo CPF) → escolha de método de
// pagamento (cartão = redirect pro checkout hospedado AbacatePay; PIX = QR
// code inline). Não há mais campos de endereço nem de número de cartão nesta
// tela — ver personal-data-step.tsx e payment-form.tsx.
test.describe('Checkout — dados pessoais + escolha de pagamento', () => {
  test.beforeEach(async ({ mockAPI, page }) => {
    await mockAPI({ authenticated: false })
    // Lead capture (fire-and-forget) não é coberto pelo fixture.
    await page.route('**/api/leads', (route) =>
      route.fulfill({ status: 200, json: { saved: true } })
    )
  })

  test('step 1 mostra nome, email, senha, telefone e CPF', async ({ page }) => {
    await page.goto('/checkout/2')

    await expect(page.getByText('Finalize sua Assinatura')).toBeVisible()

    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#tax')).toBeVisible()

    // Endereço e número de cartão nunca aparecem nesta tela — cartão redireciona
    // pro checkout hospedado do AbacatePay, PIX é QR inline.
    await expect(page.locator('#cpfCnpj')).toHaveCount(0)
    await expect(page.locator('#zipCode')).toHaveCount(0)
    await expect(page.locator('#cardNumber')).toHaveCount(0)
  })

  test('senha curta mostra erro inline', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'abc')
    await page.fill('#phone', '11987654321')

    await page.getByRole('button', { name: /^Próximo$/i }).click()

    await expect(page.getByText(/8 caracteres/i)).toBeVisible()
  })

  test('telefone obrigatório bloqueia avanço do step 1', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    // phone vazio

    await page.getByRole('button', { name: /^Próximo$/i }).click()

    await expect(page.getByText(/Telefone é obrigatório/i)).toBeVisible()
    // Continua na etapa 1 — #password só existe nesta etapa
    await expect(page.locator('#password')).toBeVisible()
  })

  test('CPF obrigatório bloqueia avanço do step 1', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')
    // tax vazio

    await page.getByRole('button', { name: /^Próximo$/i }).click()

    await expect(page.getByText(/CPF inválido/i)).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('avança pra escolha de pagamento e dispara saveLead', async ({ page }) => {
    await page.goto('/checkout/2')

    const leadRequest = page.waitForRequest('**/api/leads')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')
    await page.fill('#tax', '52998224725')

    await page.getByRole('button', { name: /^Próximo$/i }).click()

    // Lead foi disparado fire-and-forget (não inclui CPF — ver payment-form.tsx)
    const req = await leadRequest
    const body = JSON.parse(req.postData() ?? '{}')
    expect(body.email).toBe('joao@novo.com')
    expect(body.phone).toMatch(/9876/)
    expect(body.plan_id).toBe(2)

    // Step 2 é escolha de método de pagamento — campos da step 1 somem
    await expect(page.getByText('Como você prefere pagar?')).toBeVisible()
    await expect(page.locator('#tax')).toHaveCount(0)
    await expect(page.locator('#password')).toHaveCount(0)
  })

  test('cartão redireciona pro checkout hospedado do AbacatePay', async ({ page }) => {
    await page.route('https://pay.example.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>mock</body></html>'
      })
    )

    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')
    await page.fill('#tax', '52998224725')
    await page.getByRole('button', { name: /^Próximo$/i }).click()

    await expect(page.getByText('Como você prefere pagar?')).toBeVisible()

    // Cartão é o método padrão selecionado
    const subscribeRequest = page.waitForRequest('**/api/payments/subscribe-card/*')
    await page.getByRole('button', { name: /Ir para pagamento/i }).click()

    const req = await subscribeRequest
    const body = JSON.parse(req.postData() ?? '{}')
    expect(body.tax).toBe('52998224725')
    expect(body.cellphone).toMatch(/9876/)

    // Redirect real (window.location.href) pro checkout hospedado mockado acima.
    await page.waitForURL(/pay\.example\.com/)
  })

  test('PIX exibe QR code inline sem redirecionar', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')
    await page.fill('#tax', '52998224725')
    await page.getByRole('button', { name: /^Próximo$/i }).click()

    await page.getByText('Pagar com PIX').click()
    await page.getByRole('button', { name: /Gerar QR Code PIX/i }).click()

    // getByText sozinho bateria em 2 elementos (título + subtítulo repete a
    // frase) — escopa pro heading.
    await expect(page.getByRole('heading', { name: 'Escaneie o QR Code' })).toBeVisible()
    await expect(page.getByAltText('PIX QR Code')).toBeVisible()
    // Sem redirect — continua na mesma página aguardando confirmação do polling.
    await expect(page).toHaveURL(/\/checkout\/2/)
  })

  test('plano inexistente mostra mensagem de erro', async ({ page }) => {
    await page.goto('/checkout/9999')
    await expect(page.getByText('Plano não encontrado')).toBeVisible()
  })
})
