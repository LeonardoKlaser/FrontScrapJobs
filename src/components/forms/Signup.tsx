import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@/validators/auth'
import { useAuth } from '@/hooks/useAuth'
import { useValidateCheckout } from '@/hooks/useValidateCheckout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  ArrowRightIcon,
  Loader2Icon,
  MailIcon,
  LockIcon,
  UserIcon,
  PhoneIcon,
  FileTextIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PATHS } from '@/router/paths'
import { formatPhoneBR, formatCPF } from '@/lib/format'

export function SignupForm() {
  const { signup, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [emailExistsOnServer, setEmailExistsOnServer] = useState(false)
  const [taxExistsOnServer, setTaxExistsOnServer] = useState(false)
  const { t } = useTranslation('auth')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  })

  const phone = watch('phone') ?? ''
  const tax = watch('tax') ?? ''
  const email = watch('email') ?? ''

  const { mutateAsync: validateAsync } = useValidateCheckout()
  const inFlightEmailRef = useRef('')
  const inFlightTaxRef = useRef('')

  const validateEmail = useCallback(
    async (value: string) => {
      if (!value) return
      inFlightEmailRef.current = value
      try {
        const data = await validateAsync({ email: value })
        if (inFlightEmailRef.current !== value) return
        setEmailExistsOnServer(data.email_exists)
      } catch (err) {
        if (inFlightEmailRef.current === value) setEmailExistsOnServer(false)
        console.error('signup validate-checkout (email) failed', err)
      }
    },
    [validateAsync]
  )

  const validateTax = useCallback(
    async (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length !== 11) return
      const key = `${email}|${digits}`
      inFlightTaxRef.current = key
      try {
        const data = await validateAsync({ email, tax: digits })
        if (inFlightTaxRef.current !== key) return
        setTaxExistsOnServer(data.tax_exists)
      } catch (err) {
        if (inFlightTaxRef.current === key) setTaxExistsOnServer(false)
        console.error('signup validate-checkout (tax) failed', err)
      }
    },
    [email, validateAsync]
  )

  const onSubmit = async (data: SignupInput) => {
    if (emailExistsOnServer || taxExistsOnServer) return
    await signup(data)
  }

  const blocked = emailExistsOnServer || taxExistsOnServer

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-muted-foreground">
          {t('signup.name', 'Nome completo')}
        </Label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-muted-foreground">
          {t('email', 'E-mail')}
        </Label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder', 'seu@email.com')}
            className="pl-10"
            {...register('email', {
              onBlur: (e) => {
                setEmailExistsOnServer(false)
                setTaxExistsOnServer(false)
                validateEmail(e.target.value.trim())
              }
            })}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        {emailExistsOnServer && (
          <p className="text-xs text-destructive">
            <Trans
              i18nKey="signup.emailExists"
              t={t}
              defaults="Este e-mail já tem conta. <login>Fazer login</login>"
              components={{
                login: <Link to={PATHS.login} className="font-medium underline text-destructive" />
              }}
            />
          </p>
        )}
      </div>

      {/* Telefone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-muted-foreground">
          {t('signup.phone', 'Celular')}
        </Label>
        <div className="relative">
          <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="text"
            inputMode="tel"
            placeholder={t('signup.phonePlaceholder', '(11) 91234-5678')}
            className="pl-10 font-mono"
            {...register('phone')}
            value={phone}
            onChange={(e) =>
              setValue('phone', formatPhoneBR(e.target.value), { shouldValidate: false })
            }
            onBlur={() => trigger('phone')}
          />
        </div>
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      {/* CPF */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tax" className="text-muted-foreground">
          {t('signup.cpf', 'CPF')}
        </Label>
        <div className="relative">
          <FileTextIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="tax"
            type="text"
            inputMode="numeric"
            placeholder={t('signup.cpfPlaceholder', '000.000.000-00')}
            className="pl-10 font-mono"
            {...register('tax')}
            value={tax}
            onChange={(e) => {
              setTaxExistsOnServer(false)
              setValue('tax', formatCPF(e.target.value), { shouldValidate: false })
            }}
            onBlur={() => {
              trigger('tax')
              validateTax(tax)
            }}
          />
        </div>
        {errors.tax && <p className="text-xs text-destructive">{errors.tax.message}</p>}
        {taxExistsOnServer && (
          <p className="text-xs text-destructive">
            <Trans
              i18nKey="signup.cpfExists"
              t={t}
              defaults="Este CPF já tem conta. <login>Fazer login</login>"
              components={{
                login: <Link to={PATHS.login} className="font-medium underline text-destructive" />
              }}
            />
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-muted-foreground">
          {t('password', 'Senha')}
        </Label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        variant="glow"
        disabled={loading || blocked}
        size="lg"
        className="mt-1 font-semibold"
      >
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('signup.cta', 'Criar conta grátis')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
