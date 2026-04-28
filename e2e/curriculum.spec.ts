import { test, expect } from './fixtures/api-mocks'

test.describe('Curriculo', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')
  })

  test('lista de curriculos carrega com curriculos existentes', async ({ page }) => {
    await expect(page.getByText('Gerenciador de Currículos')).toBeVisible()

    // Both mock curricula should appear in sidebar (exact match avoids
    // collision with the form heading "Editando: Curriculo Frontend")
    await expect(page.getByText('Curriculo Frontend', { exact: true })).toBeVisible()
    await expect(page.getByText('Curriculo Backend', { exact: true })).toBeVisible()

    // "Novo Currículo" button
    await expect(page.getByRole('button', { name: /Novo Currículo/ })).toBeVisible()
  })

  test('criar novo curriculo preenche e salva', async ({ page }) => {
    // Click "Novo Currículo" to ensure we're in create mode
    await page.getByRole('button', { name: /Novo Currículo/ }).click()

    // Form should show "Criar Novo Currículo"
    await expect(page.getByText('Criar Novo Currículo')).toBeVisible()

    // Fill basic fields
    await page.fill('#name', 'Curriculo Fullstack')
    await page.fill('#summary', 'Desenvolvedor fullstack com experiencia em React e Go')

    // Add a skill via Enter key
    await page.fill('#skills', 'React')
    await page.press('#skills', 'Enter')

    // Fill experience
    await page.locator('input[placeholder="Nome da empresa"]').first().fill('Tech Corp')
    await page.locator('input[placeholder="Seu cargo"]').first().fill('Fullstack Dev')

    // Fill education
    await page.locator('input[placeholder="Nome da instituição"]').first().fill('UFMG')

    // Save button should be enabled (title is filled)
    const saveButton = page.getByRole('button', { name: /Salvar Currículo/i })
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    // Toast success
    await expect(page.getByText('Currículo criado com sucesso')).toBeVisible()
  })

  test('selecionar curriculo existente mostra dados para edicao', async ({ page }) => {
    // Click on the Backend card in the sidebar — the first card (Frontend) is
    // auto-selected on page load, so picking the second one exercises the
    // selection flow and avoids the strict-mode collision with the form heading.
    await page.getByText('Curriculo Backend', { exact: true }).click()

    // Form should show editing mode for Backend
    await expect(page.getByText('Editando: Curriculo Backend')).toBeVisible()

    // Fields should be pre-filled with the Backend curriculum data
    await expect(page.locator('#name')).toHaveValue('Curriculo Backend')
    await expect(page.locator('#summary')).toHaveValue('Desenvolvedor backend Go')
  })
})
