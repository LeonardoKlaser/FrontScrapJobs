import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  MailIcon,
  LockIcon,
  FileTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCPF } from '@/lib/format'
import { signupService } from '@/services/signupService'
import type { SignupCompleteResponse } from '@/services/signupService'

const infoStepSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  tax: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'CPF inválido'))
})

type InfoStepInput = z.infer<typeof infoStepSchema>

interface InfoPaymentStepProps {
  sessionId: string
  isPaidPlan?: boolean
  onSuccess: (response: SignupCompleteResponse) => void
  onBack: () => void
}

export function InfoPaymentStep({
  sessionId,
  isPaidPlan,
  onSuccess,
  onBack
}: InfoPaymentStepProps) {
  const { t } = useTranslation('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<InfoStepInput>({
    resolver: zodResolver(infoStepSchema),
    mode: 'onBlur'
  })

  const tax = watch('tax') ?? ''

  const onSubmit = async (data: InfoStepInput) => {
    setLoading(true)
    setError(null)
    try {
      const result = await signupService.complete({
        signup_session_id: sessionId,
        email: data.email.trim(),
        password: data.password,
        tax: data.tax
      })
      sessionStorage.setItem('pending_checkout_email', data.email.trim().toLowerCase())
      onSuccess(result)
    } catch (err: unknown) {
      const resp = (
        err as {
          response?: { data?: { error?: string; message?: string } }
        }
      )?.response?.data
      if (resp?.error === 'email_ou_cpf_ja_cadastrado') {
        setError(t('signup.emailOrCpfExists', 'E-mail ou CPF já cadastrado.'))
      } else if (resp?.error === 'phone_not_verified') {
        setError(t('signup.phoneNotVerified', 'Telefone não verificado. Volte e verifique.'))
      } else {
        setError(
          resp?.message || t('signup.completeError', 'Erro ao finalizar cadastro. Tente novamente.')
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-muted-foreground">
          {t('email', 'E-mail')}
        </Label>
        <div className="relative">
          <MailIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder', 'seu@email.com')}
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-muted-foreground">
          {t('password', 'Senha')}
        </Label>
        <div className="relative">
          <LockIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('signup.passwordPlaceholder', 'Mínimo 8 caracteres')}
            className="pl-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-foreground transition-colors
              hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tax" className="text-muted-foreground">
          {t('signup.cpf', 'CPF')}
        </Label>
        <div className="relative">
          <FileTextIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="tax"
            type="text"
            inputMode="numeric"
            placeholder={t('signup.cpfPlaceholder', '000.000.000-00')}
            className="pl-10 font-mono"
            {...register('tax')}
            value={tax}
            onChange={(e) => {
              setValue('tax', formatCPF(e.target.value), {
                shouldValidate: false
              })
            }}
            onBlur={() => trigger('tax')}
          />
        </div>
        {errors.tax && <p className="text-xs text-destructive">{errors.tax.message}</p>}
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2
            text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={loading}>
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          {t('signup.back', 'Voltar')}
        </Button>

        <Button
          type="submit"
          variant="glow"
          disabled={loading}
          size="lg"
          className="flex-1 font-semibold"
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isPaidPlan
                ? t('signup.goToPayment', 'Ir para pagamento')
                : t('signup.startTrial', 'Comecar trial gratis')}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
