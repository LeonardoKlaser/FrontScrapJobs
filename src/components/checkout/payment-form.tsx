import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cpfCnpj') {
      const digits = value.replace(/\D/g, '').slice(0, 14)
      if (digits.length <= 11) {
        // CPF: XXX.XXX.XXX-XX
        formattedValue = digits
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      } else {
        // CNPJ: XX.XXX.XXX/XXXX-XX
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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter maiúsculas, minúsculas e números'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem'
    }

    if (!formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    } else {
      const cpfCnpjDigits = formData.cpfCnpj.replace(/\D/g, '')
      if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
        newErrors.cpfCnpj = 'CPF/CNPJ inválido'
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        newErrors.phone = 'Telefone inválido'
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Selecione um método de pagamento'
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
    <Card className="border-border w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">Criar Conta</CardTitle>
        <CardDescription>Preencha os dados para criar sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                  errors.name ? 'border-destructive' : ''
                }`}
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                  errors.email ? 'border-destructive' : ''
                }`}
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground pr-10 ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com maiúsculas, minúsculas e números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`bg-input border-border text-foreground placeholder:text-muted-foreground pr-10 ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          </div>

          {/* Additional Data Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Dados Adicionais</h3>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj" className="text-foreground">
                CPF/CNPJ
              </Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpfCnpj}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground font-mono ${
                  errors.cpfCnpj ? 'border-destructive' : ''
                }`}
                required
              />
              {errors.cpfCnpj && <p className="text-sm text-destructive">{errors.cpfCnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground font-mono ${
                  errors.phone ? 'border-destructive' : ''
                }`}
                required
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Método de Pagamento</h3>

            <div className="space-y-3">
              <Label className="text-foreground">Escolha o método de pagamento</Label>

              <div
                className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  formData.paymentMethod === 'pix'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
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
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold">PIX</p>
                  <p className="text-sm text-muted-foreground">Transferência instantânea</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  formData.paymentMethod === 'card'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
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
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold">Cartão de Crédito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
                </div>
              </div>

              {errors.paymentMethod && (
                <p className="text-sm text-destructive">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </div>

          {/* Security Text */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <span>Seus dados são protegidos com criptografia SSL</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
