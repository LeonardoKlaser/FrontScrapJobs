import { test, expect } from './fixtures/api-mocks'

// Currículo é hoje um gerenciador de PDFs armazenados no R2 (Task 14),
// substituindo o antigo editor estruturado. Este spec cobre o fluxo completo:
// upload → vira principal automaticamente → aparece no viewer → exclusão
// (Task 16).
test.describe('Currículo', () => {
  test('estado vazio mostra CTA de upload quando não há currículos', async ({ page, mockAPI }) => {
    await mockAPI()
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')

    await expect(page.getByRole('heading', { level: 1, name: 'Currículo' })).toBeVisible()
    await expect(page.getByText('Nenhum currículo enviado ainda')).toBeVisible()
  })

  test('upload de um PDF vira principal automaticamente e aparece no viewer', async ({
    page,
    mockAPI
  }) => {
    await mockAPI()
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')

    // Estado vazio renderiza DOIS UploadCurriculumButton (header + CTA do
    // EmptyState), cada um com seu próprio <input type="file"> — escopa pro
    // do header, que é o único que sobrevive depois que a lista deixa de
    // estar vazia.
    const fileInput = page.locator('header input[type="file"]')
    await fileInput.setInputFiles({
      name: 'meu-curriculo.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 conteudo fake de teste')
    })

    await expect(page.getByText('Currículo enviado com sucesso!')).toBeVisible()

    // Primeiro upload vira principal automaticamente (fluxo web — ver
    // usecase.Upload no backend) e some o estado vazio.
    await expect(page.getByText('meu-curriculo.pdf')).toBeVisible()
    // exact: true — a descrição da página já contém "...marcado como
    // principal..." em minúsculas, e getByText faz match por substring.
    await expect(page.getByText('Principal', { exact: true })).toBeVisible()
    await expect(page.getByText('Nenhum currículo enviado ainda')).not.toBeVisible()

    // Pré-seleção automática do principal abre o viewer com o PDF enviado.
    await expect(page.locator('iframe')).toHaveAttribute('title', 'meu-curriculo.pdf')
  })

  test('excluir o currículo selecionado remove da lista e volta ao estado vazio', async ({
    page,
    mockAPI
  }) => {
    await mockAPI({
      curriculumFiles: [
        {
          id: 1,
          filename: 'cv-principal.pdf',
          size_bytes: 204800,
          is_principal: true,
          created_at: '2026-01-01T00:00:00Z'
        }
      ]
    })
    await page.goto('/app/curriculum')
    await page.waitForURL('/app/curriculum')

    // Auto-seleção do principal já mostra o viewer ao carregar a página.
    await expect(page.locator('iframe')).toHaveAttribute('title', 'cv-principal.pdf')

    await page.getByRole('button', { name: 'Excluir' }).click()

    const confirmDialog = page.getByRole('alertdialog')
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog.getByText('cv-principal.pdf')).toBeVisible()

    await confirmDialog.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByText('Currículo excluído com sucesso!')).toBeVisible()
    await expect(page.getByText('Nenhum currículo enviado ainda')).toBeVisible()
    await expect(page.locator('iframe')).not.toBeVisible()
  })
})
