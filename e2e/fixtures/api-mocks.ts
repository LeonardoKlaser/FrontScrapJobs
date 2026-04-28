import { test as base, type Page } from '@playwright/test'

// ── Mock data ──────────────────────────────────────────────

export const mockUser = {
  id: '1',
  user_name: 'Joao Silva',
  email: 'joao@test.com',
  is_admin: false,
  // Paid subscriber — TrialBanner hides early when payment_method is set,
  // so this is the field that actually suppresses both the active-trial and
  // paywall variants. Other trial fields kept consistent for completeness.
  expires_at: '2099-12-31T00:00:00Z',
  payment_method: 'credit_card' as const,
  is_trial_active: false,
  subscription_canceled: false,
  plan: {
    id: 1,
    name: 'Profissional',
    price: 29.9,
    max_sites: 15,
    max_ai_analyses: 100,
    features: ['15 sites', '100 analises/mes']
  }
}

export const mockAdminUser = {
  ...mockUser,
  id: '2',
  user_name: 'Admin Silva',
  email: 'admin@test.com',
  is_admin: true
}

// Admin-facing SiteConfig (full shape) for GET /siteCareer responses.
export const mockAdminSites = [
  {
    id: 57,
    site_name: 'Netflix Careers',
    base_url: 'https://jobs.netflix.com/search',
    logo_url: null,
    is_active: true,
    scraping_type: 'API',
    job_list_item_selector: null,
    title_selector: null,
    link_selector: null,
    link_attribute: null,
    location_selector: null,
    next_page_selector: null,
    job_description_selector: null,
    job_requisition_id_selector: null,
    job_requisition_id_attribute: null,
    api_endpoint_template: 'https://jobs.netflix.com/api/search',
    api_method: 'GET',
    api_headers_json: null,
    api_payload_template: null,
    json_data_mappings: null,
    created_at: '2026-04-20T00:00:00Z'
  }
]

export const mockPlans = [
  {
    id: 1,
    name: 'Iniciante',
    price: 0,
    max_sites: 3,
    max_ai_analyses: 10,
    features: ['3 sites', '10 analises/mes']
  },
  {
    id: 2,
    name: 'Profissional',
    price: 29.9,
    max_sites: 15,
    max_ai_analyses: 100,
    features: ['15 sites', '100 analises/mes']
  },
  {
    id: 3,
    name: 'Premium',
    price: 79.9,
    max_sites: 50,
    max_ai_analyses: -1,
    features: ['50 sites', 'Analises ilimitadas']
  }
]

export const mockSites = [
  {
    site_id: 1,
    site_name: 'Google',
    base_url: 'https://careers.google.com',
    logo_url: '',
    is_subscribed: true
  },
  {
    site_id: 2,
    site_name: 'Microsoft',
    base_url: 'https://careers.microsoft.com',
    logo_url: '',
    is_subscribed: false
  },
  {
    site_id: 3,
    site_name: 'Apple',
    base_url: 'https://jobs.apple.com',
    logo_url: '',
    is_subscribed: false
  },
  {
    site_id: 4,
    site_name: 'Amazon',
    base_url: 'https://amazon.jobs',
    logo_url: '',
    is_subscribed: true
  }
]

export const mockCurriculums = [
  {
    id: 1,
    title: 'Curriculo Frontend',
    is_active: true,
    summary: 'Desenvolvedor frontend com 5 anos de experiencia',
    skills: 'React, TypeScript, CSS',
    languages: 'Portugues, Ingles',
    experiences: [
      {
        id: '1',
        company: 'Empresa X',
        title: 'Dev Frontend',
        description: 'Desenvolvimento de interfaces'
      }
    ],
    educations: [{ id: '1', institution: 'USP', degree: 'Ciencia da Computacao', year: '2020' }]
  },
  {
    id: 2,
    title: 'Curriculo Backend',
    is_active: false,
    summary: 'Desenvolvedor backend Go',
    skills: 'Go, PostgreSQL, Redis',
    languages: 'Portugues',
    experiences: [
      { id: '2', company: 'Empresa Y', title: 'Dev Backend', description: 'APIs REST' }
    ],
    educations: [{ id: '2', institution: 'UNICAMP', degree: 'Engenharia', year: '2019' }]
  }
]

export const mockDashboard = {
  monitored_urls_count: 2,
  new_jobs_today_count: 5,
  alerts_sent_count: 12,
  latest_jobs: [],
  user_monitored_urls: [
    { site_name: 'Google', base_url: 'https://careers.google.com' },
    { site_name: 'Amazon', base_url: 'https://amazon.jobs' }
  ]
}

function makeJobs(count: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i + 1,
    title: `Vaga ${offset + i + 1}`,
    location: 'Remoto',
    company: `Empresa ${offset + i + 1}`,
    job_link: `https://example.com/job/${offset + i + 1}`
  }))
}

// Dashboard now paginates client-side, so a single response carries all jobs.
// Total of 15 jobs exercises pagination (LIMIT=10 → 2 pages).
export const mockJobsPage1 = {
  jobs: makeJobs(15),
  total_count: 15,
  page: 1,
  limit: 15
}

export const mockJobsPage2 = {
  jobs: makeJobs(5, 10),
  total_count: 15,
  page: 2,
  limit: 10
}

// ── Fixture ────────────────────────────────────────────────

type MockAPIOptions = {
  authenticated?: boolean
  admin?: boolean
}

async function setupMocks(page: Page, opts: MockAPIOptions = {}) {
  const { authenticated = true, admin = false } = opts
  const apiBase = 'http://localhost:8080'
  const currentUser = admin ? mockAdminUser : mockUser

  // Auth: GET /api/me
  await page.route(`${apiBase}/api/me`, (route) => {
    if (authenticated) {
      return route.fulfill({ status: 200, json: currentUser })
    }
    return route.fulfill({ status: 401, json: { error: 'Unauthorized' } })
  })

  // Login: POST /login
  await page.route(`${apiBase}/login`, async (route) => {
    const body = route.request().postDataJSON()
    if (body?.email === 'joao@test.com' && body?.password === 'Senha123') {
      return route.fulfill({ status: 200, json: mockUser })
    }
    return route.fulfill({ status: 401, json: { error: 'E-mail ou senha invalidos' } })
  })

  // Signup: POST /signup
  await page.route(`${apiBase}/signup`, async (route) => {
    const body = route.request().postDataJSON()
    // Validate the 5 expected fields are present
    if (!body?.email || !body?.password || !body?.user_name || !body?.phone || !body?.tax) {
      return route.fulfill({ status: 400, json: { error: 'Campos obrigatórios faltando' } })
    }
    if (body.email === 'taken@test.com') {
      return route.fulfill({
        status: 409,
        json: { error: 'Email ou CPF já cadastrado' }
      })
    }
    return route.fulfill({
      status: 201,
      headers: { 'Set-Cookie': 'Authorization=fake-jwt-cookie; Path=/; HttpOnly' },
      json: { ...mockUser, email: body.email, user_name: body.user_name }
    })
  })

  // Logout: POST /api/logout
  await page.route(`${apiBase}/api/logout`, (route) =>
    route.fulfill({ status: 200, json: { message: 'ok' } })
  )

  // Dashboard: GET /api/dashboard
  await page.route(`${apiBase}/api/dashboard`, (route) =>
    route.fulfill({ status: 200, json: mockDashboard })
  )

  // Jobs: GET /api/dashboard/jobs
  await page.route(`${apiBase}/api/dashboard/jobs*`, (route) => {
    const url = new URL(route.request().url())
    const page = parseInt(url.searchParams.get('page') || '1')
    const search = url.searchParams.get('search') || ''
    const days = parseInt(url.searchParams.get('days') || '0')

    if (search) {
      const filtered = mockJobsPage1.jobs.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase())
      )
      return route.fulfill({
        status: 200,
        json: { jobs: filtered, total_count: filtered.length, page: 1, limit: 10 }
      })
    }
    // 24h-only window: smaller subset, used by the dashboard "new jobs (24h)" stat.
    if (days === 1) {
      const recent = mockJobsPage1.jobs.slice(0, mockDashboard.new_jobs_today_count)
      return route.fulfill({
        status: 200,
        json: { jobs: recent, total_count: recent.length, page: 1, limit: 10 }
      })
    }
    return route.fulfill({ status: 200, json: page === 2 ? mockJobsPage2 : mockJobsPage1 })
  })

  // Sites: GET /api/getSites
  await page.route(`${apiBase}/api/getSites`, (route) =>
    route.fulfill({ status: 200, json: mockSites })
  )

  // Admin sites list: GET /siteCareer
  await page.route(`${apiBase}/siteCareer`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, json: mockAdminSites })
    }
    return route.fallback()
  })

  // Admin site single / update: GET|PUT /siteCareer/:id
  await page.route(`${apiBase}/siteCareer/*`, (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      return route.fulfill({ status: 200, json: mockAdminSites[0] })
    }
    if (method === 'PUT') {
      // Devolver site atualizado com logo preenchido
      return route.fulfill({
        status: 200,
        json: {
          ...mockAdminSites[0],
          logo_url: 'https://bucket.s3.amazonaws.com/logos/netflix-test.png'
        }
      })
    }
    return route.fallback()
  })

  // Register to site: POST /userSite
  await page.route(`${apiBase}/userSite`, (route) =>
    route.fulfill({ status: 201, json: { message: 'ok' } })
  )

  // Unregister from site: DELETE /userSite/*
  await page.route(`${apiBase}/userSite/**`, (route) => {
    if (route.request().method() === 'DELETE') {
      return route.fulfill({ status: 200, json: { message: 'ok' } })
    }
    return route.fallback()
  })

  // Request site: POST /api/request-site
  await page.route(`${apiBase}/api/request-site`, (route) =>
    route.fulfill({ status: 201, json: { message: 'ok' } })
  )

  // Curriculum: GET /curriculum
  await page.route(`${apiBase}/curriculum`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, json: mockCurriculums })
    }
    // POST /curriculum (create)
    return route.fulfill({ status: 201, json: { id: 3, ...route.request().postDataJSON() } })
  })

  // Curriculum: PUT /curriculum/*
  await page.route(`${apiBase}/curriculum/*`, (route) => {
    if (route.request().method() === 'PUT') {
      return route.fulfill({ status: 200, json: route.request().postDataJSON() })
    }
    // PATCH /curriculum/*/active
    if (route.request().method() === 'PATCH') {
      return route.fulfill({ status: 200, json: { message: 'ok' } })
    }
    return route.fallback()
  })

  // Plans: GET /api/plans
  await page.route(`${apiBase}/api/plans`, (route) =>
    route.fulfill({ status: 200, json: mockPlans })
  )

  // Validate checkout: POST /api/users/validate-checkout
  await page.route(`${apiBase}/api/users/validate-checkout`, (route) =>
    route.fulfill({ status: 200, json: { email_exists: false, tax_exists: false } })
  )

  // Create payment: POST /api/payments/create/*
  await page.route(`${apiBase}/api/payments/create/*`, (route) =>
    route.fulfill({ status: 200, json: { url: 'https://pay.example.com/checkout' } })
  )
}

// ── Export test fixture ────────────────────────────────────

export const test = base.extend<{ mockAPI: (opts?: MockAPIOptions) => Promise<void> }>({
  mockAPI: async ({ page }, use) => {
    await use((opts) => setupMocks(page, opts))
  }
})

export { expect } from '@playwright/test'
