import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface VerifyCodeStepProps {
  phoneMasked: string
  onSubmit: (code: string) => Promise<void>
  onBack: () => void
  onResend: () => Promise<void>
  loading: boolean
  error: string | null
}

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60

export function VerifyCodeStep({
  phoneMasked,
  onSubmit,
  onBack,
  onResend,
  loading,
  error
}: VerifyCodeStepProps) {
  const { t } = useTranslation('auth')
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1)
      const next = [...digits]
      next[index] = digit
      setDigits(next)

      if (digit && index < CODE_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus()
      }

      if (next.every((d) => d !== '') && next.join('').length === CODE_LENGTH) {
        onSubmit(next.join(''))
      }
    },
    [digits, onSubmit]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    },
    [digits]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
      if (!pasted) return
      const next = Array(CODE_LENGTH).fill('')
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i]
      }
      setDigits(next)
      const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
      inputsRef.current[focusIdx]?.focus()
      if (pasted.length === CODE_LENGTH) {
        onSubmit(pasted)
      }
    },
    [onSubmit]
  )

  const handleResend = async () => {
    setResending(true)
    try {
      await onResend()
      setCooldown(RESEND_COOLDOWN)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {t('signup.codeSent', 'Enviamos um código de 6 dígitos para')}{' '}
        <strong>{phoneMasked}</strong>
      </p>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-12 text-center text-lg font-mono"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2
            text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={loading}>
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          {t('signup.back', 'Voltar')}
        </Button>

        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
        >
          {cooldown > 0
            ? t('signup.resendIn', 'Reenviar em {{seconds}}s', {
                seconds: cooldown
              })
            : t('signup.resendCode', 'Reenviar código')}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
