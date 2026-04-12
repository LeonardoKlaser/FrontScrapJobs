import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { userService } from '@/services/userService'
import { cancelSubscription } from '@/services/paymentService'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { User } from '@/models/user'

interface PlanSectionProps {
  user: User | undefined
}

export function PlanSection({ user }: PlanSectionProps) {
  const { t, i18n } = useTranslation('account')
  const { t: tCommon } = useTranslation('common')
  const queryClient = useQueryClient()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      await cancelSubscription()
      toast.success(t('plan.cancelSuccess'))
      setShowCancelDialog(false)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        toast.success(t('plan.cancelSuccess'))
        setShowCancelDialog(false)
        queryClient.invalidateQueries({ queryKey: ['user'] })
      } else {
        toast.error(t('plan.cancelError'))
      }
    } finally {
      setIsCanceling(false)
    }
  }

  const hasActiveSubscription =
    user?.expires_at && new Date(user.expires_at) > new Date() && !user?.subscription_canceled

  const currentUsage = user?.monitored_sites_count ?? 0
  const maxUsage = user?.plan?.max_sites ?? 0
  const usagePercentage = maxUsage > 0 ? (currentUsage / maxUsage) * 100 : 0
  const analysisUsed = user?.monthly_analysis_count ?? 0
  const analysisMax = user?.plan?.max_ai_analyses ?? 0
  const analysisPercentage = analysisMax > 0 ? (analysisUsed / analysisMax) * 100 : 0
  const extractionUsed = user?.monthly_extraction_count ?? 0
  const extractionMax = user?.plan?.max_pdf_extractions ?? 0
  const extractionPercentage = extractionMax > 0 ? (extractionUsed / extractionMax) * 100 : 0
  const suggestionUsed = user?.monthly_suggestion_apply_count ?? 0
  const suggestionMax = user?.plan?.max_suggestion_applies ?? 0
  const suggestionPercentage = suggestionMax > 0 ? (suggestionUsed / suggestionMax) * 100 : 0
  const pdfGenUsed = user?.monthly_pdf_generation_count ?? 0
  const pdfGenMax = user?.plan?.max_pdf_generations ?? 0
  const pdfGenPercentage = pdfGenMax > 0 ? (pdfGenUsed / pdfGenMax) * 100 : 0
  const benefits = user?.plan?.features ?? []

  const [weekdaysOnly, setWeekdaysOnly] = useState(user?.weekdays_only ?? false)

  useEffect(() => {
    if (user?.weekdays_only !== undefined) {
      setWeekdaysOnly(user.weekdays_only)
    }
  }, [user?.weekdays_only])

  const handleWeekdaysToggle = async (checked: boolean) => {
    setWeekdaysOnly(checked)
    try {
      await userService.updatePreferences({ weekdays_only: checked })
      toast.success(t('plan.preferencesUpdated'))
    } catch {
      setWeekdaysOnly(!checked)
      toast.error(t('plan.preferencesError'))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('plan.title')}</CardTitle>
              <CardDescription className="mt-1">{t('plan.description')}</CardDescription>
            </div>
            <Badge>{user?.plan?.name ?? t('plan.noPlan')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">{t('plan.monitoredUrls')}</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {currentUsage}
                <span className="text-sm font-normal text-muted-foreground"> / {maxUsage}</span>
              </p>
              <Progress value={usagePercentage} className="mt-3 h-1.5" />
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">{t('plan.aiAnalyses')}</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {analysisUsed}
                <span className="text-sm font-normal text-muted-foreground"> / {analysisMax}</span>
              </p>
              <Progress value={analysisPercentage} className="mt-3 h-1.5" />
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t('plan.pdfExtractions', 'Extrações de PDF')}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {extractionUsed}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {extractionMax}
                </span>
              </p>
              <Progress value={extractionPercentage} className="mt-3 h-1.5" />
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t('plan.suggestionApplies', 'Aplicações de Sugestões')}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {suggestionUsed}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {suggestionMax}
                </span>
              </p>
              <Progress value={suggestionPercentage} className="mt-3 h-1.5" />
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t('plan.pdfGenerations', 'Gerações de PDF')}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                {pdfGenUsed}
                <span className="text-sm font-normal text-muted-foreground"> / {pdfGenMax}</span>
              </p>
              <Progress value={pdfGenPercentage} className="mt-3 h-1.5" />
            </div>
          </div>

          {user?.expires_at && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('plan.expiresAt', 'Expira em')}:{' '}
              {new Date(user.expires_at).toLocaleDateString('pt-BR')}
            </p>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="weekdays-only" className="text-sm font-medium">
                {t('plan.weekdaysOnlyLabel')}
              </Label>
              <p className="text-xs text-muted-foreground">{t('plan.weekdaysOnlyDescription')}</p>
            </div>
            <Switch
              id="weekdays-only"
              checked={weekdaysOnly}
              onCheckedChange={handleWeekdaysToggle}
            />
          </div>

          {benefits.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">{t('plan.benefits')}</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {hasActiveSubscription && (
          <CardFooter>
            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setShowCancelDialog(true)}
            >
              {t('plan.cancel')}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('plan.cancelTitle')}</DialogTitle>
            <DialogDescription>
              {t('plan.cancelDescription', {
                date: user?.expires_at ? new Date(user.expires_at).toLocaleDateString(i18n.language) : ''
              })}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('plan.cancelContact')}{' '}
            <a href={`mailto:${tCommon('footer.contactEmail')}`} className="text-primary hover:underline font-medium">
              {tCommon('footer.contactEmail')}
            </a>
          </p>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {tCommon('actions.back')}
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling}>
              {isCanceling ? <Spinner className="h-4 w-4" /> : t('plan.confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
