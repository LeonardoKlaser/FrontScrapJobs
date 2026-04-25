import { test, expect } from './fixtures/api-mocks'

test.describe('Checkout — fluxo de 3 steps', () => {
  test.beforeEach(async ({ mockAPI, page }) => {
    await mockAPI({ authenticated: false })
    // Mocks específicos do checkout (lead + validate-checkout não são cobertos pelo fixture)
    await page.route('**/api/leads', (route) =>
      route.fulfill({ status: 200, json: { saved: true } })
    )
    await page.route('**/api/users/validate-checkout', (route) =>
      route.fulfill({ status: 200, json: { email_exists: false, tax_exists: false } })
    )
    // Evita flake em CI sem rede — useCepLookup não vai pra rede real.
    await page.route('**/viacep.com.br/**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          cep: '01001-000',
          logradouro: 'Praça da Sé',
          bairro: 'Sé',
          localidade: 'São Paulo',
          uf: 'SP'
        }
      })
    )
  })

  test('step 1 mostra 4 campos (nome, email, senha, telefone)', async ({ page }) => {
    await page.goto('/checkout/2')

    await expect(page.getByText('Finalize sua Assinatura')).toBeVisible()

    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()

    // CPF e endereço NÃO aparecem no step 1
    await expect(page.locator('#cpfCnpj')).toHaveCount(0)
    await expect(page.locator('#zipCode')).toHaveCount(0)
  })

  test('senha curta mostra erro inline', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'abc')
    await page.fill('#phone', '11987654321')

    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    await expect(page.getByText(/8 caracteres/i)).toBeVisible()
  })

  test('telefone obrigatório bloqueia avanço do step 1', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    // phone vazio

    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    await expect(page.getByText(/Telefone é obrigatório/i)).toBeVisible()
    // Continua na etapa 1 — #password só existe nesta etapa
    await expect(page.locator('#password')).toBeVisible()
  })

  test('avança pro step 2 (endereço) e dispara saveLead', async ({ page }) => {
    await page.goto('/checkout/2')

    const leadRequest = page.waitForRequest('**/api/leads')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')

    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    // Lead foi disparado fire-and-forget
    const req = await leadRequest
    const body = JSON.parse(req.postData() ?? '{}')
    expect(body.email).toBe('joao@novo.com')
    expect(body.phone).toMatch(/9876/)
    expect(body.plan_id).toBe(2)

    // Step 2 é endereço — CPF e cartão não aparecem ainda
    await expect(page.locator('#zipCode')).toBeVisible()
    await expect(page.locator('#street')).toBeVisible()
    await expect(page.locator('#cpfCnpj')).toHaveCount(0)
    await expect(page.locator('#cardNumber')).toHaveCount(0)
  })

  test('step 3 mostra CPF + cartão (sem telefone nem endereço)', async ({ page }) => {
    await page.goto('/checkout/2')

    // Step 1
    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')
    await page.fill('#phone', '11987654321')
    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    // Step 2 (endereço — preencher manual já que não vamos mockar viacep)
    await page.fill('#zipCode', '01001000')
    await page.fill('#street', 'Praca da Se')
    await page.fill('#number', '100')
    await page.fill('#neighborhood', 'Se')
    await page.fill('#city', 'Sao Paulo')
    await page.selectOption('#state', 'SP')
    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    // Step 3 — CPF + cartão visíveis
    await expect(page.locator('#cpfCnpj')).toBeVisible()
    await expect(page.locator('#cardNumber')).toBeVisible()
    await expect(page.locator('#holderName')).toHaveValue(/JOAO SILVA/i)

    // Telefone e endereço NAO aparecem mais aqui
    await expect(page.locator('#phone')).toHaveCount(0)
    await expect(page.locator('#zipCode')).toHaveCount(0)
  })

  test('plano inexistente mostra mensagem de erro', async ({ page }) => {
    await page.goto('/checkout/9999')
    await expect(page.getByText('Plano não encontrado')).toBeVisible()
  })
})
