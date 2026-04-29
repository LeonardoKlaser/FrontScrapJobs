import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from './StarRating'
import { useSubmitFeedback, useIncrementModalShown } from '@/hooks/useFeedback'
import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useTranslation('common')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const submitFeedback = useSubmitFeedback()
  const incrementShown = useIncrementModalShown()

  useEffect(() => {
    if (open) {
      incrementShown.mutate()
    }
  }, [open])

  const handleSubmit = useCallback(() => {
    if (rating === 0) return
    submitFeedback.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(t('feedback.thanks', 'Obrigado pelo feedback!'))
          onClose()
        },
        onError: () => {
          toast.error(t('feedback.error', 'Erro ao enviar feedback. Tente novamente.'))
        }
      }
    )
  }, [rating, comment, submitFeedback, onClose, t])

  const handleDismiss = () => {
    setRating(0)
    setComment('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[400px] text-center"
      >
        <DialogTitle className="text-xl font-bold">
          {t('feedback.title', 'Como está sendo sua experiência?')}
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          {t('feedback.subtitle', 'Sua opinião nos ajuda a melhorar o ScrapJobs')}
        </p>

        <div className="flex justify-center py-4">
          <StarRating
            value={rating}
            onChange={setRating}
            disabled={submitFeedback.isPending}
          />
        </div>

        <Textarea
          placeholder={t('feedback.placeholder', 'Conte mais sobre sua experiência (opcional)')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitFeedback.isPending}
          className="min-h-[80px] resize-none"
        />

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleDismiss}
            disabled={submitFeedback.isPending}
          >
            {t('feedback.dismiss', 'Agora não')}
          </Button>
          <Button
            variant="glow"
            className="flex-1"
            onClick={handleSubmit}
            disabled={rating === 0 || submitFeedback.isPending}
          >
            {submitFeedback.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('feedback.submit', 'Enviar feedback')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
