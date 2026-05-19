import { test, expect } from './fixtures/api-mocks'

test.describe('Curriculo', () => {
  test.beforeEach(async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')
  })

  test('lista de curriculos carrega com curriculos existentes', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Currículo' })).toBeVisible()

    // Frontend is auto-selected; switcher trigger shows "Editando: Curriculo Frontend"
    await expect(page.getByText('Editando: Curriculo Frontend')).toBeVisible()

    // Open the switcher dropdown — both options should be inside
    await page.getByRole('button', { name: /Selecionar currículo/ }).click()
    await expect(page.getByRole('menuitem', { name: /Curriculo Frontend/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Curriculo Backend/ })).toBeVisible()

    // "Novo Currículo" header action
    await expect(page.getByRole('button', { name: /Novo Currículo/ })).toBeVisible()
  })

  test('criar novo curriculo preenche e salva', async ({ page }) => {
    // Click "Novo Currículo" to ensure we're in create mode
    await page.getByRole('button', { name: /Novo Currículo/ }).click()

    // Switcher trigger shows the unsaved-new label
    await expect(page.getByText(/Novo currículo \(não salvo\)/)).toBeVisible()

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
    // Frontend is auto-selected on load; open the switcher and pick Backend
    // to exercise the selection flow.
    await page.getByRole('button', { name: /Selecionar currículo/ }).click()
    await page.getByRole('menuitem', { name: /Curriculo Backend/ }).click()

    // Switcher trigger should now reflect Backend selection
    await expect(page.getByText('Editando: Curriculo Backend')).toBeVisible()

    // Fields should be pre-filled with the Backend curriculum data
    await expect(page.locator('#name')).toHaveValue('Curriculo Backend')
    await expect(page.locator('#summary')).toHaveValue('Desenvolvedor backend Go')
  })
})
