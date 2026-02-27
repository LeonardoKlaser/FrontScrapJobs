import { test, expect } from './fixtures/api-mocks'

test.describe('Curriculo', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')
  })

  test('lista de curriculos carrega com curriculos existentes', async ({ page }) => {
    await expect(page.getByText('Gerenciador de Currículos')).toBeVisible()

    // Both mock curricula should appear in sidebar
    await expect(page.getByText('Curriculo Frontend')).toBeVisible()
    await expect(page.getByText('Curriculo Backend')).toBeVisible()

    // Active badge on first curriculum
    await expect(page.getByText('Ativo', { exact: true })).toBeVisible()

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
    // Click on "Curriculo Frontend" in the sidebar card
    await page.getByText('Curriculo Frontend').click()

    // Form should show editing mode
    await expect(page.getByText('Editando: Curriculo Frontend')).toBeVisible()

    // Fields should be pre-filled
    await expect(page.locator('#name')).toHaveValue('Curriculo Frontend')
    await expect(page.locator('#summary')).toHaveValue(
      'Desenvolvedor frontend com 5 anos de experiencia'
    )
  })

  test('definir curriculo como ativo', async ({ page }) => {
    // The second curriculum (Backend) has "Definir como ativo" button
    const activateBtn = page.getByRole('button', { name: /Definir como ativo/i })
    await expect(activateBtn).toBeVisible()
    await activateBtn.click()
  })
})
