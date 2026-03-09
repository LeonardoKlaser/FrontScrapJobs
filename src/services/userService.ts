import { api } from './api'

export const userService = {
  updatePreferences: async (prefs: { weekdays_only?: boolean }): Promise<void> => {
    await api.patch('/api/user/preferences', prefs)
  }
}
