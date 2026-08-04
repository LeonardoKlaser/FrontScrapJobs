import { expect, test } from '@playwright/test'

const guidePath = '/guides/guia-pratico-para-melhorar-seu-curriculo.pdf'

test('serves the free CV guide as a real PDF', async ({ request }) => {
  const response = await request.get(guidePath)

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')

  const body = await response.body()
  expect(body.subarray(0, 5).toString('ascii')).toBe('%PDF-')
  expect(body.byteLength).toBeGreaterThan(5_000)
})
