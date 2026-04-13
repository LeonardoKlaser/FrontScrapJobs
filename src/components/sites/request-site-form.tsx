import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRequestSite } from '@/hooks/useRequestSite'
import { toast } from 'sonner'

interface RequestSiteFormProps {
  className?: string
}

export function RequestSiteForm({ className }: RequestSiteFormProps) {
  const { t } = useTranslation('sites')
  const [url, setUrl] = useState('')
  const { mutate: requestSite, isPending } = useRequestSite()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      requestSite(url, {
        onSuccess: () => {
          toast.success(t('requestSite.success'))
          setUrl('')
        },
        onError: (err) => {
          toast.error(err?.message || t('requestSite.error'))
        }
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="url"
          required
          placeholder={t('requestSite.placeholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" variant="glow" size="sm" disabled={isPending}>
          {isPending ? t('requestSite.sending') : t('requestSite.send')}
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
