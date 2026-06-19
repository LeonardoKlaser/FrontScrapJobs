import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserIcon, PhoneIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatPhoneBR } from '@/lib/format'

const phoneStepSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  // Espelha utils.IsValidBRCellphone do backend: exatamente 11 dígitos (DDD + 9 +
  // 8 dígitos), com o 3º dígito = '9'. Sem isso, um número de 10 dígitos passava no
  // front e era rejeitado pelo backend com um 400 genérico "telefone inválido".
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .length(11, 'Informe DDD + celular (11 dígitos)')
        .refine((v) => v[2] === '9', 'Celular deve ter o 9 após o DDD')
    )
})

type PhoneStepInput = z.infer<typeof phoneStepSchema>

interface PhoneStepProps {
  onSubmit: (name: string, phone: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function PhoneStep({ onSubmit, loading, error }: PhoneStepProps) {
  const { t } = useTranslation('auth')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<PhoneStepInput>({
    resolver: zodResolver(phoneStepSchema),
    mode: 'onBlur'
  })

  const phone = watch('phone') ?? ''

  const submit = async (data: PhoneStepInput) => {
    await onSubmit(data.name, data.phone)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-muted-foreground">
          {t('signup.name', 'Nome completo')}
        </Label>
        <div className="relative">
          <UserIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="name"
            type="text"
            placeholder={t('signup.namePlaceholder', 'Como gostaria de ser chamado')}
            className="pl-10"
            {...register('name')}
          />
        </div>
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-muted-foreground">
          {t('signup.phone', 'WhatsApp')}
        </Label>
        <div className="relative">
          <PhoneIcon
            className="pointer-events-none absolute left-3 top-1/2
              h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="phone"
            type="text"
            inputMode="tel"
            placeholder={t('signup.phonePlaceholder', '(11) 99999-9999')}
            className="pl-10 font-mono"
            {...register('phone')}
            value={phone}
            onChange={(e) =>
              setValue('phone', formatPhoneBR(e.target.value), {
                shouldValidate: false
              })
            }
            onBlur={() => trigger('phone')}
          />
        </div>
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        <p className="text-xs text-muted-foreground">
          {t(
            'signup.whatsappHint',
            'Voce recebera alertas de vagas e podera conversar com o Norte, sua IA de carreira.'
          )}
        </p>
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2
            text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="glow"
        disabled={loading}
        size="lg"
        className="mt-1 font-semibold"
      >
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('signup.sendCode', 'Enviar código')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
