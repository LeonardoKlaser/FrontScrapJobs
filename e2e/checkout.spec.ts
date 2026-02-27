import { test, expect } from './fixtures/api-mocks'

test.describe('Checkout', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })
  })

  test('pagina de checkout carrega com resumo do plano', async ({ page }) => {
    await page.goto('/checkout/2')

    await expect(page.getByText('Finalize sua Assinatura')).toBeVisible()
    await expect(page.getByText('Criar Conta', { exact: true })).toBeVisible()

    // Plan name should be visible in summary
    await expect(page.getByText('Profissional').first()).toBeVisible()

    // Price should be visible
    await expect(page.getByText('29.90')).toBeVisible()
  })

  test('validacao de senha fraca', async ({ page }) => {
    await page.goto('/checkout/2')

    // Fill all required fields to pass native HTML validation
    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'abc')
    await page.fill('#confirmPassword', 'abc')
    await page.fill('#cpfCnpj', '123.456.789-00')
    await page.fill('#phone', '(11) 99999-9999')

    // Select payment method
    await page.getByText('PIX').click()

    await page.getByRole('button', { name: /Criar Conta e Pagar/i }).click()

    await expect(page.getByText('Senha deve ter no minimo 8 caracteres')).toBeVisible()
  })

  test('validacao de senhas diferentes', async ({ page }) => {
    await page.goto('/checkout/2')

    await page.fill('#name', 'Joao Silva')
    await page.fill('#email', 'joao@novo.com')
    await page.fill('#password', 'Senha123Forte')
    await page.fill('#confirmPassword', 'Senha456Diferente')
    await page.fill('#cpfCnpj', '123.456.789-00')
    await page.fill('#phone', '(11) 99999-9999')
    await page.getByText('PIX').click()

    await page.getByRole('button', { name: /Criar Conta e Pagar/i }).click()

    await expect(page.getByText('Senhas nao conferem')).toBeVisible()
  })

  test('plano inexistente mostra mensagem de erro', async ({ page }) => {
    await page.goto('/checkout/999')

    await expect(page.getByText('Plano não encontrado')).toBeVisible()
  })
})
