import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { StarRating } from '@/components/feedback/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Logo } from '@/components/common/logo'
import { feedbackService } from '@/services/feedbackService'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

type PageState = 'loading' | 'form' | 'success' | 'error' | 'invalid'

export default function Feedback() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, setState] = useState<PageState>('loading')
  const [userName, setUserName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }
    feedbackService.validateToken(token)
      .then((res) => {
        setUserName(res.user_name)
        setState('form')
      })
      .catch(() => setState('invalid'))
  }, [token])

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await feedbackService.submit({ rating, comment: comment.trim() || undefined, token })
      setState('success')
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setState('success')
      } else {
        setState('error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <Logo size={64} showText className="mx-auto" />

        {state === 'loading' && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {state === 'invalid' && (
          <div className="space-y-3">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Link inválido ou expirado</h2>
            <p className="text-sm text-muted-foreground">
              Este link de feedback não é mais válido. Caso já tenha enviado seu feedback, obrigado!
            </p>
          </div>
        )}

        {state === 'form' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">
                Como foi sua experiência, {userName.split(' ')[0]}?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sua opinião nos ajuda a melhorar. Em troca, ganha +3 dias grátis!
              </p>
            </div>

            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} disabled={submitting} />
            </div>

            <Textarea
              placeholder="Conte mais sobre sua experiência (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              className="min-h-[80px] resize-none"
            />

            <Button
              variant="glow"
              className="w-full"
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Enviar feedback'
              )}
            </Button>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-semibold">Obrigado pelo feedback!</h2>
            <p className="text-sm text-muted-foreground">
              +3 dias foram adicionados à sua conta. Aproveite!
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-3">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground">
              Não foi possível enviar seu feedback. Tente novamente mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
