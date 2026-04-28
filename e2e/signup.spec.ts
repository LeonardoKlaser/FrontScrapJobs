import { test, expect } from './fixtures/api-mocks'

test.describe('Signup', () => {
  test('happy path: cria trial com 5 campos e redireciona pra /app', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })

    await page.goto('/signup')

    // Wait for the 5 field inputs to render
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#tax')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()

    // Fill the form
    await page.fill('#name', 'E2E Tester')
    await page.fill('#email', 'e2e-trial@test.com')
    await page.fill('#phone', '11912345678')
    await page.fill('#tax', '52998224725')
    await page.fill('#password', 'senha12345')

    // Before clicking, override /api/me to return authenticated user
    // (so the post-signup redirect to /app loads correctly).
    await page.unrouteAll({ behavior: 'ignoreErrors' })
    await mockAPI({ authenticated: true })

    await page.getByRole('button', { name: /Criar conta grátis/i }).click()

    // After signup, the form's hook should auto-login + navigate to /app
    await expect(page).toHaveURL(/\/app/)
  })

  test('bloqueia submit quando email já cadastrado', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })

    // Override validate-checkout to return email_exists: true for this email
    await page.route('http://localhost:8080/api/users/validate-checkout', async (route) => {
      const body = route.request().postDataJSON()
      if (body?.email === 'taken@test.com') {
        return route.fulfill({ status: 200, json: { email_exists: true, tax_exists: false } })
      }
      return route.fulfill({ status: 200, json: { email_exists: false, tax_exists: false } })
    })

    await page.goto('/signup')
    await page.fill('#email', 'taken@test.com')
    // Blur the email by focusing another field
    await page.locator('#name').click()

    // Wait for the blocking error to render
    await expect(page.getByText(/Este e-mail já tem conta/)).toBeVisible()

    // Submit button should be disabled
    await expect(page.getByRole('button', { name: /Criar conta grátis/i })).toBeDisabled()
  })

  test('bloqueia submit quando CPF já cadastrado', async ({ page, mockAPI }) => {
    await mockAPI({ authenticated: false })

    await page.route('http://localhost:8080/api/users/validate-checkout', async (route) => {
      const body = route.request().postDataJSON()
      if (body?.tax === '52998224725') {
        return route.fulfill({ status: 200, json: { email_exists: false, tax_exists: true } })
      }
      return route.fulfill({ status: 200, json: { email_exists: false, tax_exists: false } })
    })

    await page.goto('/signup')
    // Email needs to be filled first because validateTax sends `{ email, tax }`
    await page.fill('#email', 'novo@test.com')
    await page.fill('#tax', '52998224725')
    // Blur the CPF input
    await page.locator('#name').click()

    await expect(page.getByText(/Este CPF já tem conta/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Criar conta grátis/i })).toBeDisabled()
  })
})
