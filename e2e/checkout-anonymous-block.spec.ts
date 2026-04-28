import { test, expect } from './fixtures/api-mocks'

test.describe('Checkout anonymous block', () => {
  test.beforeEach(async ({ page }) => {
    // Lead capture is fire-and-forget; mock it so it doesn't 404.
    await page.route('**/api/leads', (route) =>
      route.fulfill({ status: 200, json: { saved: true } })
    )
  })

  test('bloqueia submit quando email já cadastrado em checkout anônimo', async ({
    page,
    mockAPI
  }) => {
    await mockAPI({ authenticated: false })

    // Override validate-checkout to flag the email as already registered
    await page.route('http://localhost:8080/api/users/validate-checkout', async (route) => {
      const body = route.request().postDataJSON()
      if (body?.email === 'existing@test.com') {
        return route.fulfill({ status: 200, json: { email_exists: true, tax_exists: false } })
      }
      return route.fulfill({ status: 200, json: { email_exists: false, tax_exists: false } })
    })

    // Navigate to checkout for plan 2 (paid plan)
    await page.goto('/checkout/2')

    // Fill required fields in step 1 (PersonalDataStep)
    await page.fill('#name', 'Anonymous User')
    await page.fill('#email', 'existing@test.com')
    await page.fill('#password', 'senha12345')
    await page.fill('#phone', '11912345678')

    // Trigger blur on email by clicking another field
    await page.locator('#name').click()

    // Wait for blocking error to render
    await expect(page.getByText(/Este e-mail já tem conta/)).toBeVisible()

    // The login link inside the error message should be visible
    await expect(page.getByRole('link', { name: /Fazer login pra continuar/i })).toBeVisible()

    // Click "Próximo" — should NOT advance to step 2 (address)
    await page.getByRole('button', { name: /^Próximo$/i }).click()

    // We should still be on step 1 — verify by checking that step 2 fields aren't visible.
    // Step 2 has #zipCode (CEP) which doesn't exist on step 1.
    await expect(page.locator('#zipCode')).toHaveCount(0)
    // And step 1 still shows #password (only present on step 1).
    await expect(page.locator('#password')).toBeVisible()
  })
})
