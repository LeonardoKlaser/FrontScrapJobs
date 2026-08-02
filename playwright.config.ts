import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    env: {
      ...(process.env as Record<string, string>),
      // Sem isso o dev server do e2e sobe com VITE_NORTE_WA_NUMBER vazio (só
      // existe em .env.example, não em .env real) e os links wa.me ficam sem
      // destinatário — mesmo buraco silencioso do Dockerfile em prod
      // (ver ScrapJobs Task 9, fix round 2). Segue o padrão já usado no e2e
      // pra env de teste (ex.: E2E_ADMIN_EMAIL em admin-campaigns.spec.ts).
      VITE_NORTE_WA_NUMBER: process.env.VITE_NORTE_WA_NUMBER ?? '5551999999999'
    }
  }
})
