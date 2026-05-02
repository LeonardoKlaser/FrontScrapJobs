import { isAxiosError } from 'axios'
import type { CampaignApiError } from '@/models/emailCampaign'

// extractCampaignApiError lê body { error, code, current_status, field } do
// backend de campaigns. Diferente de extractApiError em @/lib/extractApiError
// (retorna so' string), este expõe os campos estruturados para a UI dispatchar
// por code (status_conflict / not_editable) sem regex em mensagens português.
export function extractCampaignApiError(e: unknown): CampaignApiError | null {
  if (isAxiosError(e)) {
    const data = e.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      return data as CampaignApiError
    }
  }
  return null
}
