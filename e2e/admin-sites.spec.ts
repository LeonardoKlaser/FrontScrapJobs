import { test, expect } from './fixtures/api-mocks'

test.describe('Admin Sites — Netflix repair flow', () => {
  test.beforeEach(async ({ mockAPI }) => {
    await mockAPI({ admin: true })
  })

  test('admin abre lista, edita Netflix, faz upload de logo, salva', async ({ page }) => {
    // 1. Lista admin de sites
    await page.goto('/app/admin-sites')
    await page.waitForURL('/app/admin-sites')

    // Netflix aparece na tabela (mesmo sem logo — placeholder Building2)
    await expect(page.getByText('Netflix Careers')).toBeVisible()
    await expect(page.getByText('Ativo')).toBeVisible()

    // 2. Clica "Editar" → URL da rota de edit
    await page.getByRole('button', { name: /Editar Netflix/i }).click()
    await page.waitForURL(/\/app\/admin-sites\/57\/edit$/)

    // Form populado com dados atuais
    await expect(page.getByLabel(/Nome do Site/i)).toHaveValue('Netflix Careers')

    // 3. Upload de logo via input hidden
    const fileInput = page.locator('input[type="file"]#logo_upload')
    await fileInput.setInputFiles({
      name: 'netflix-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fakepngbytes')
    })

    // 4. Submit
    await page.getByRole('button', { name: /Salvar Alterações/i }).click()

    // 5. Redireciona de volta pra lista + logo novo aparece
    // (o mock PUT retorna logo_url preenchido — mas GET /siteCareer continua
    // no fixture. Playwright reutiliza a primeira resposta; a validacao de
    // invalidation + refetch fica coberta pelos testes unitarios.)
    await page.waitForURL('/app/admin-sites')
    await expect(page.getByText('Netflix Careers')).toBeVisible()
  })
})
