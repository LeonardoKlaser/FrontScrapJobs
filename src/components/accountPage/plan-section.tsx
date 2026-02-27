import { useTranslation } from 'react-i18next'
import { Check, ArrowUpRight, Sparkles } from 'lucide-react'
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
import type { User } from '@/models/user'
import { useNavigate } from 'react-router'

interface PlanSectionProps {
  user: User | undefined
  currentUsage?: number
}

export function PlanSection({ user, currentUsage = 0 }: PlanSectionProps) {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const maxUsage = user?.plan?.max_sites ?? 0
  const usagePercentage = maxUsage > 0 ? (currentUsage / maxUsage) * 100 : 0
  const benefits = user?.plan?.features ?? []
  const isPremium = user?.plan?.name === 'Premium'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className={isPremium ? 'glow-border border-primary/30' : ''}>
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
                {user?.plan?.max_ai_analyses === -1
                  ? t('plan.unlimited')
                  : (user?.plan?.max_ai_analyses ?? 0)}
              </p>
            </div>
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
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate('/#pricing')}
          >
            {t('plan.manage')}
          </Button>
          {!isPremium && (
            <Button
              variant="glow"
              className="w-full sm:w-auto"
              onClick={() => navigate('/#pricing')}
            >
              <Sparkles className="h-4 w-4" />
              {t('plan.upgrade')}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
