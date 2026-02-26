import type React from 'react'
import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  UserIcon,
  MailIcon,
  LockIcon,
  PhoneIcon,
  FileTextIcon,
  CreditCardIcon,
  QrCodeIcon
} from 'lucide-react'
import type { Plan } from '@/models/plan'
import { api } from '@/services/api'
import axios from 'axios'

interface PaymentFormProps {
  plan: Plan
  billingPeriod: 'monthly' | 'annual'
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  cpfCnpj: string
  phone: string
  paymentMethod: 'pix' | 'card' | ''
}

interface FormErrors {
  [key: string]: string
}

export function PaymentForm({ plan, billingPeriod }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpfCnpj: '',
    phone: '',
    paymentMethod: ''
  })

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const validateFieldOnServer = useCallback(
    async (field: 'email' | 'cpfCnpj', value: string) => {
      const email = field === 'email' ? value : formData.email
      const tax =
        field === 'cpfCnpj' ? value.replace(/\D/g, '') : formData.cpfCnpj.replace(/\D/g, '')

      if (!email || !tax) return

      try {
        const res = await api.post('/api/users/validate-checkout', { email, tax })
        const data = res.data as { email_exists: boolean; tax_exists: boolean }

        setErrors((prev) => {
          const next = { ...prev }
          if (field === 'email') {
            next.email = data.email_exists ? 'Este e-mail ja possui cadastro. Faca login.' : ''
          }
          if (field === 'cpfCnpj') {
            next.cpfCnpj = data.tax_exists ? 'Este CPF/CNPJ ja esta cadastrado.' : ''
          }
          return next
        })
      } catch {
        // Silently ignore validation errors — form submit will catch issues
      }
    },
    [formData.email, formData.cpfCnpj]
  )

  const handleFieldBlur = useCallback(
    (field: 'email' | 'cpfCnpj', value: string) => {
      if (debounceTimers.current[field]) {
        clearTimeout(debounceTimers.current[field])
      }
      debounceTimers.current[field] = setTimeout(() => {
        validateFieldOnServer(field, value)
      }, 300)
    },
    [validateFieldOnServer]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cpfCnpj') {
      const digits = value.replace(/\D/g, '').slice(0, 14)
      if (digits.length <= 11) {
        formattedValue = digits
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      } else {
        formattedValue = digits
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      }
    }

    if (name === 'phone') {
      formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    if (errors[name] || errors.submit) {
      setErrors((prev) => ({ ...prev, [name]: '', submit: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome e obrigatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email e obrigatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha e obrigatoria'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no minimo 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter maiusculas, minusculas e numeros'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmacao de senha e obrigatoria'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas nao conferem'
    }

    if (!formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ e obrigatorio'
    } else {
      const cpfCnpjDigits = formData.cpfCnpj.replace(/\D/g, '')
      if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
        newErrors.cpfCnpj = 'CPF/CNPJ invalido'
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone e obrigatorio'
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.phone = 'Telefone invalido'
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Selecione um metodo de pagamento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const responsePayment = await api.post(`/api/payments/create/${plan.id}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tax: formData.cpfCnpj.replace(/\D/g, ''),
        cellphone: formData.phone.replace(/\D/g, ''),
        methods: [formData.paymentMethod === 'card' ? 'CREDIT_CARD' : 'PIX'],
        billing_period: billingPeriod
      })

      const { url } = responsePayment.data
      if (url) {
        window.location.href = url
        return
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : 'Erro ao processar registro'
      setErrors({ submit: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">Criar Conta</CardTitle>
        <CardDescription>Preencha os dados para criar sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {Object.values(errors).some(Boolean) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.submit || 'Por favor, corrija os erros abaixo'}
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Data Section */}
          <fieldset className="space-y-4 animate-fade-in-up">
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Dados Pessoais
            </legend>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome Completo
              </Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Joao Silva"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('email', formData.email)}
                  disabled={isLoading}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email}
                  {errors.email.includes('login') && (
                    <>
                      {' '}
                      <a href="/login" className="font-medium underline">
                        Ir para login
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Minimo 8 caracteres, com maiusculas, minusculas e numeros
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </fieldset>

          {/* Additional Data Section */}
          <fieldset
            className="space-y-4 border-t border-border/50 pt-8 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Dados Adicionais
            </legend>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj" className="text-muted-foreground">
                CPF/CNPJ
              </Label>
              <div className="relative">
                <FileTextIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpfCnpj}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('cpfCnpj', formData.cpfCnpj)}
                  disabled={isLoading}
                  className={`pl-10 font-mono ${errors.cpfCnpj ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.cpfCnpj && <p className="text-sm text-destructive">{errors.cpfCnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground">
                Telefone
              </Label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`pl-10 font-mono ${errors.phone ? 'border-destructive' : ''}`}
                  required
                />
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </fieldset>

          {/* Payment Method Section */}
          <fieldset
            className="space-y-4 border-t border-border/50 pt-8 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Metodo de Pagamento
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={`group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all duration-150 ${
                  formData.paymentMethod === 'pix'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-primary/30'
                }`}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, paymentMethod: 'pix' }))
                  setErrors((prev) => ({ ...prev, paymentMethod: '' }))
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pix"
                  checked={formData.paymentMethod === 'pix'}
                  onChange={() => {
                    setFormData((prev) => ({ ...prev, paymentMethod: 'pix' }))
                    setErrors((prev) => ({ ...prev, paymentMethod: '' }))
                  }}
                  className="sr-only"
                />
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    formData.paymentMethod === 'pix'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <QrCodeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">PIX</p>
                  <p className="text-xs text-muted-foreground">Transferencia instantanea</p>
                </div>
              </div>

              <div
                className={`group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all duration-150 ${
                  formData.paymentMethod === 'card'
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-primary/30'
                }`}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))
                  setErrors((prev) => ({ ...prev, paymentMethod: '' }))
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => {
                    setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))
                    setErrors((prev) => ({ ...prev, paymentMethod: '' }))
                  }}
                  className="sr-only"
                />
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    formData.paymentMethod === 'card'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Cartao de Credito</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Elo</p>
                </div>
              </div>
            </div>

            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod}</p>
            )}
          </fieldset>

          {/* Submit Button */}
          <div className="space-y-4 border-t border-border/50 pt-8">
            <Button
              type="submit"
              variant="glow"
              disabled={
                isLoading ||
                errors.email?.includes('cadastro') ||
                errors.cpfCnpj?.includes('cadastrado')
              }
              className="h-11 w-full text-base"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Criar Conta e Pagar
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Seus dados sao protegidos com criptografia SSL</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
