import { test, expect } from './fixtures/api-mocks'

test.describe('Autenticacao', () => {
  test('login com credenciais validas redireciona para /app', async ({ page, mockAPI }) => {
    // Start unauthenticated
    await mockAPI({ authenticated: false })

    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()

    await page.fill('#email', 'joao@test.com')
    await page.fill('#password', 'Senha123')

    // Before clicking submit, override /api/me to return authenticated user
    // so the redirect after login succeeds
    await page.unrouteAll({ behavior: 'ignoreErrors' })
    await mockAPI({ authenticated: true })

    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/app')
  })

  test('login com credenciais invalidas mostra erro', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })

    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()

    await page.fill('#email', 'wrong@test.com')
    await page.fill('#password', 'WrongPass1')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.locator('text=E-mail ou senha')).toBeVisible()
  })

  test('logout redireciona para /login', async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app')
    await page.waitForURL('/app')

    // Click "Sair" button in the header
    await page.getByRole('button', { name: /Sair/i }).click()

    await expect(page).toHaveURL('/login')
  })

  test('acesso a rota protegida sem auth redireciona para /login?from=', async ({
    page,
    mockAPI
  }) => {
    await mockAPI({ authenticated: false })
    await page.goto('/app/curriculum')

    await expect(page).toHaveURL(/\/login\?from=/)
  })
})
