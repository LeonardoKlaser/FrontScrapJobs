import { test, expect } from './fixtures/api-mocks'

// SignupWizard foi reescrito pro fluxo de OTP via WhatsApp (phone → verify →
// info+pagamento) e só é acessível com `?plan=<id>` apontando pra um plano
// comercial (id 2 ou 6, ver SignupWizard.tsx:34 — isCommercialPlan). O antigo
// formulário de 5 campos numa página só não existe mais.
test.describe('Signup', () => {
  test('happy path: telefone → código → dados, cartão redireciona pro checkout', async ({
    page,
    mockAPI
  }) => {
    await mockAPI({ authenticated: false })
    // window.location.href real pro checkout_url — mocka o destino pra não
    // tentar navegar de verdade pra um domínio externo.
    await page.route('https://pay.example.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>mock</body></html>'
      })
    )

    await page.goto('/signup?plan=2')

    // Step 1 — telefone
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await page.fill('#name', 'E2E Tester')
    await page.fill('#phone', '11912345678')
    await page.getByRole('button', { name: /Enviar código/i }).click()

    // Step 2 — código de verificação (6 inputs de 1 dígito, sem id/testid —
    // selecionados pelo atributo maxlength que é único nesta etapa)
    await expect(page.getByText(/Enviamos um código/i)).toBeVisible()
    const codeInputs = page.locator('input[maxlength="1"]')
    await expect(codeInputs).toHaveCount(6)
    for (const [i, digit] of '123456'.split('').entries()) {
      await codeInputs.nth(i).fill(digit)
    }

    // Step 3 — email/senha/CPF, depois escolha do método de pagamento
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#tax')).toBeVisible()
    await page.fill('#email', 'e2e-trial@test.com')
    await page.fill('#password', 'senha12345')
    await page.fill('#tax', '52998224725')
    await page.getByRole('button', { name: /Ir para pagamento/i }).click()

    // Cartão é o método padrão selecionado
    await expect(page.getByText('Como você prefere pagar?')).toBeVisible()
    await page.getByRole('button', { name: /Ir para pagamento/i }).click()

    await page.waitForURL(/pay\.example\.com/)
  })

  test('telefone já cadastrado redireciona pro login', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })
    await page.route('http://localhost:8080/signup/init', (route) =>
      route.fulfill({
        status: 409,
        json: {
          error: 'phone_already_registered',
          message: 'Número já cadastrado. Faça login.'
        }
      })
    )

    await page.goto('/signup?plan=2')
    await page.fill('#name', 'E2E Tester')
    await page.fill('#phone', '11912345678')
    await page.getByRole('button', { name: /Enviar código/i }).click()

    await expect(page).toHaveURL(/\/login/)
  })

  test('código incorreto mostra erro com tentativas restantes', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })
    await page.route('http://localhost:8080/signup/verify-phone', (route) =>
      route.fulfill({ status: 400, json: { error: 'invalid_code', attempts_remaining: 2 } })
    )

    await page.goto('/signup?plan=2')
    await page.fill('#name', 'E2E Tester')
    await page.fill('#phone', '11912345678')
    await page.getByRole('button', { name: /Enviar código/i }).click()

    const codeInputs = page.locator('input[maxlength="1"]')
    await expect(codeInputs).toHaveCount(6)
    for (const [i, digit] of '000000'.split('').entries()) {
      await codeInputs.nth(i).fill(digit)
    }

    await expect(page.getByText(/Código inválido\. 2 tentativas restantes\./i)).toBeVisible()
  })

  test('e-mail ou CPF já cadastrado mostra erro ao finalizar', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })
    await page.route('http://localhost:8080/signup/complete', (route) =>
      route.fulfill({ status: 409, json: { error: 'email_ou_cpf_ja_cadastrado' } })
    )

    await page.goto('/signup?plan=2')
    await page.fill('#name', 'E2E Tester')
    await page.fill('#phone', '11912345678')
    await page.getByRole('button', { name: /Enviar código/i }).click()

    const codeInputs = page.locator('input[maxlength="1"]')
    await expect(codeInputs).toHaveCount(6)
    for (const [i, digit] of '123456'.split('').entries()) {
      await codeInputs.nth(i).fill(digit)
    }

    await expect(page.locator('#email')).toBeVisible()
    await page.fill('#email', 'taken@test.com')
    await page.fill('#password', 'senha12345')
    await page.fill('#tax', '52998224725')
    await page.getByRole('button', { name: /Ir para pagamento/i }).click()

    await expect(page.getByText(/E-mail ou CPF já cadastrado/i)).toBeVisible()
  })

  test('sem ?plan= válido mostra aviso pra escolher um plano primeiro', async ({
    page,
    mockAPI
  }) => {
    await mockAPI({ authenticated: false })

    await page.goto('/signup')

    await expect(page.getByText(/Escolha um plano antes de criar sua conta/i)).toBeVisible()
    // Nenhum campo do wizard deve renderizar sem um plano comercial válido
    await expect(page.locator('#name')).toHaveCount(0)
  })
})
