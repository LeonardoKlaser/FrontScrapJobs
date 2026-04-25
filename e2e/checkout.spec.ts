import { test, expect } from './fixtures/api-mocks'

test.describe('Checkout — fluxo rápido', () => {
  test.beforeEach(async ({ mockAPI }) => {
    await mockAPI({ authenticated: false })
  })

  test('etapa 1 mostra apenas 3 campos (nome, email, senha)', async ({ page }) => {
    await page.goto('/checkout/2')

    await expect(page.getByText('Finalize sua Assinatura')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible()

    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()

    await expect(page.locator('#cpfCnpj')).toHaveCount(0)
    await expect(page.locator('#phone')).toHaveCount(0)
    await expect(page.locator('#confirmPassword')).toHaveCount(0)
  })

  test('senha curta mostra erro inline', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'abc')

    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    await expect(page.getByText(/8 caracteres/i)).toBeVisible()
  })

  test('etapa 2 saúda pelo nome e mostra documento + endereço + cartão', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'umaSenhaQualquer8')

    await page.getByRole('button', { name: /Ir para o Pagamento/i }).click()

    await expect(page.getByRole('heading', { name: /Falta pouco, Joao/ })).toBeVisible()

    await expect(page.locator('#cpfCnpj')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#zipCode')).toBeVisible()
    await expect(page.locator('#cardNumber')).toBeVisible()

    await expect(page.locator('#holderName')).toHaveValue(/JOAO SILVA/i)
  })

  test('plano inexistente mostra mensagem de erro', async ({ page }) => {
    await page.goto('/checkout/9999')
    await expect(page.getByText('Plano não encontrado')).toBeVisible()
  })
})
