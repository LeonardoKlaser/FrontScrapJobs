import { vi } from 'vitest'
import { api } from '@/services/api'
import { authService } from '@/services/authService'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('sends POST /login and returns data', async () => {
      const mockData = { token: 'abc123' }
      vi.mocked(api.post).mockResolvedValue({ data: mockData })

      const result = await authService.login({ email: 'test@email.com', password: '12345678' })

      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@email.com',
        password: '12345678'
      })
      expect(result).toEqual(mockData)
    })

    it('throws on failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      await expect(
        authService.login({ email: 'test@email.com', password: '12345678' })
      ).rejects.toThrow('Network error')
    })
  })

  describe('getMe', () => {
    it('sends GET /api/me and returns user', async () => {
      const mockUser = { id: 1, user_name: 'Test User', email: 'test@email.com' }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const result = await authService.getMe()

      expect(api.get).toHaveBeenCalledWith('/api/me')
      expect(result).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('sends POST /api/logout', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/api/logout')
    })
  })

  describe('updateProfile', () => {
    it('sends PATCH /api/user/profile and returns data', async () => {
      const profileData = { user_name: 'New Name', cellphone: '123456789' }
      vi.mocked(api.patch).mockResolvedValue({ data: { success: true } })

      const result = await authService.updateProfile(profileData)

      expect(api.patch).toHaveBeenCalledWith('/api/user/profile', profileData)
      expect(result).toEqual({ success: true })
    })
  })

  describe('changePassword', () => {
    it('sends POST /api/user/change-password and returns data', async () => {
      const passwordData = { old_password: 'oldpass88', new_password: 'newpass88' }
      vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

      const result = await authService.changePassword(passwordData)

      expect(api.post).toHaveBeenCalledWith('/api/user/change-password', passwordData)
      expect(result).toEqual({ success: true })
    })
  })
})
