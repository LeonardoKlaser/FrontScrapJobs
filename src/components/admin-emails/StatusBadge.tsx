import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { CampaignStatus } from '@/models/emailCampaign'

const VARIANT: Record<CampaignStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  scheduled: 'secondary',
  sending: 'default',
  sent: 'default',
  failed: 'destructive',
  canceled: 'secondary'
}

export const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const { t } = useTranslation('admin-emails')
  return <Badge variant={VARIANT[status]}>{t(`campaigns.status.${status}`)}</Badge>
}
