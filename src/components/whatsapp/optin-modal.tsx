import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  whatsappSchema,
  whatsappCodeSchema,
  type WhatsAppInput,
  type WhatsAppCodeInput
} from '@/validators/whatsapp'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import {
  WhatsAppCodeInvalidError,
  WhatsAppNoPendingOptinError,
  WhatsAppNumberAlreadyTakenError
} from '@/services/whatsappService'
import { PATHS } from '@/router/paths'
import { formatPhoneBR } from '@/lib/format'
import { toast } from 'sonner'

interface OptInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultNumber?: string
  onOptedIn?: () => void
}

// OptInModal implementa o opt-in em duas etapas (T9.x security fix):
//   Step 1 (number): pede o número → requestOptIn dispara código via WhatsApp.
//   Step 2 (code):   pede o código de 6 dígitos → confirmOptIn commita o DB.
// "Mudar número" volta pro step 1 (overwrites o pendente no Redis). "Reenviar"
// dispara requestOptIn de novo com o mesmo número.
export function OptInModal({ open, onOpenChange, defaultNumber, onOptedIn }: OptInModalProps) {
  const { t } = useTranslation('whatsapp')
  const { requestOptIn, confirmOptIn } = useWhatsApp()
  const [step, setStep] = useState<'number' | 'code'>('number')
  const [pendingNumber, setPendingNumber] = useState('')

  const numberForm = useForm<WhatsAppInput>({
    resolver: zodResolver(whatsappSchema),
    mode: 'onBlur',
    defaultValues: { whatsapp_number: defaultNumber ? formatPhoneBR(defaultNumber) : '' }
  })

  const codeForm = useForm<WhatsAppCodeInput>({
    resolver: zodResolver(whatsappCodeSchema),
    mode: 'onSubmit',
    defaultValues: { code: '' }
  })

  // Reset do form e do step quando o modal reabre. Mantém o defaultNumber como
  // valor inicial — reset() limpa erros antigos e preserva o resolver. As refs
  // numberForm.reset / codeForm.reset são estáveis (vêm de useForm), então não
  // entram em deps.
  useEffect(() => {
    if (open) {
      setStep('number')
      setPendingNumber('')
      numberForm.reset({ whatsapp_number: defaultNumber ? formatPhoneBR(defaultNumber) : '' })
      codeForm.reset({ code: '' })
    }
  }, [open, defaultNumber, numberForm, codeForm])

  const number = numberForm.watch('whatsapp_number') ?? ''
  const code = codeForm.watch('code') ?? ''

  const onSubmitNumber = (data: WhatsAppInput) => {
    requestOptIn.mutate(data.whatsapp_number, {
      onSuccess: () => {
        setPendingNumber(data.whatsapp_number)
        setStep('code')
        codeForm.reset({ code: '' })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t('modal.error'))
      }
    })
  }

  const onSubmitCode = (data: WhatsAppCodeInput) => {
    confirmOptIn.mutate(data.code, {
      onSuccess: () => {
        toast.success(t('modal.success'))
        onOpenChange(false)
        onOptedIn?.()
      },
      onError: (err) => {
        if (err instanceof WhatsAppCodeInvalidError) {
          codeForm.setError('code', { message: t('modal.codeStep.codeInvalid') })
          return
        }
        if (err instanceof WhatsAppNoPendingOptinError) {
          // Pendente expirou ou foi invalidado — volta pro step 1 pra reenviar.
          toast.error(t('modal.codeStep.noPending'))
          setStep('number')
          codeForm.reset({ code: '' })
          return
        }
        if (err instanceof WhatsAppNumberAlreadyTakenError) {
          // Race rara: outro user commitou o número entre Request e Confirm.
          // Volta pro step 1 e mostra o erro no campo do número.
          numberForm.setError('whatsapp_number', { message: t('modal.codeStep.numberTaken') })
          setStep('number')
          codeForm.reset({ code: '' })
          return
        }
        toast.error(err instanceof Error ? err.message : t('modal.error'))
      }
    })
  }

  const handleResend = () => {
    if (!pendingNumber) return
    requestOptIn.mutate(pendingNumber, {
      onSuccess: () => {
        toast.success(t('modal.codeStep.resentToast'))
        codeForm.reset({ code: '' })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t('modal.error'))
      }
    })
  }

  const handleChangeNumber = () => {
    setStep('number')
    codeForm.reset({ code: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {step === 'number' ? t('modal.title') : t('modal.codeStep.title')}
          </DialogTitle>
          <DialogDescription>
            {step === 'number'
              ? t('modal.description')
              : t('modal.codeStep.description', { number: formatPhoneBR(pendingNumber) })}
          </DialogDescription>
        </DialogHeader>

        {step === 'number' ? (
          <form onSubmit={numberForm.handleSubmit(onSubmitNumber)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">{t('modal.numberLabel')}</Label>
              <Input
                id="whatsapp-number"
                type="text"
                inputMode="tel"
                autoFocus
                placeholder={t('modal.numberPlaceholder')}
                className="font-mono"
                value={number}
                onChange={(e) =>
                  numberForm.setValue('whatsapp_number', formatPhoneBR(e.target.value), {
                    shouldValidate: false
                  })
                }
              />
              {numberForm.formState.errors.whatsapp_number && (
                <p className="text-xs text-destructive">
                  {numberForm.formState.errors.whatsapp_number.message}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey="modal.privacyNote"
                t={t}
                components={{
                  privacy: (
                    <Link
                      to={PATHS.privacy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    />
                  )
                }}
              />
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={requestOptIn.isPending}
              >
                {t('modal.cancel')}
              </Button>
              <Button type="submit" variant="glow" disabled={requestOptIn.isPending}>
                {requestOptIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('modal.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-code">{t('modal.codeStep.codeLabel')}</Label>
              <Input
                id="whatsapp-code"
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={6}
                autoComplete="one-time-code"
                placeholder={t('modal.codeStep.codePlaceholder')}
                className="font-mono tracking-widest text-center text-lg"
                value={code}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                  codeForm.setValue('code', digits, { shouldValidate: false })
                  codeForm.clearErrors('code')
                }}
              />
              {codeForm.formState.errors.code && (
                <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleChangeNumber}
                disabled={requestOptIn.isPending || confirmOptIn.isPending}
                className="flex items-center gap-1 text-muted-foreground underline-offset-2
                  hover:text-foreground hover:underline disabled:opacity-50"
              >
                <ArrowLeft className="h-3 w-3" />
                {t('modal.codeStep.changeNumber')}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={requestOptIn.isPending || confirmOptIn.isPending}
                className="text-primary underline-offset-2 hover:underline disabled:opacity-50"
              >
                {requestOptIn.isPending ? (
                  <Loader2 className="inline h-3 w-3 animate-spin" />
                ) : (
                  t('modal.codeStep.resend')
                )}
              </button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={confirmOptIn.isPending}
              >
                {t('modal.cancel')}
              </Button>
              <Button type="submit" variant="glow" disabled={confirmOptIn.isPending}>
                {confirmOptIn.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('modal.codeStep.codeSubmit')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
