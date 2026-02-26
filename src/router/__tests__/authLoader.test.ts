import { QueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { authLoader } from '@/router/loaders/authLoader'
import type { User } from '@/models/user'

vi.mock('@/services/authService', () => ({
  authService: {
    getMe: vi.fn()
  }
}))

describe('authLoader', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('returns user data on success', async () => {
    const mockUser: User = {
      id: '1',
      user_name: 'Test',
      email: 'test@email.com',
      plan: undefined
    }
    vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const loader = authLoader(queryClient)
    const result = await loader({ request: new Request('http://localhost/app') })

    expect(result).toEqual(mockUser)
  })

  it('redirects to /login with from param on auth failure', async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error('Unauthorized'))

    const loader = authLoader(queryClient)
    const result = await loader({
      request: new Request('http://localhost/app/curriculum')
    })

    expect(result).toBeDefined()
    // redirect() returns a Response with status 302 and Location header
    const response = result as Response
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login?from=/app/curriculum')
  })

  it('uses staleTime of 5 minutes', async () => {
    const mockUser: User = {
      id: '1',
      user_name: 'Test',
      email: 'test@email.com',
      plan: undefined
    }
    vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const loader = authLoader(queryClient)

    // First call — fetches
    await loader({ request: new Request('http://localhost/app') })

    // Second call — should use cache (staleTime = 5min)
    await loader({ request: new Request('http://localhost/app') })

    // getMe should only have been called once due to staleTime
    expect(authService.getMe).toHaveBeenCalledTimes(1)
  })
})
