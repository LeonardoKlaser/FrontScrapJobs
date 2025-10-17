import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  benefits: string[]
}

interface PaymentFormProps {
  plan: Plan
}

export function PaymentForm({ plan }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    email: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
      setFormData((prev) => ({ ...prev, [name]: formatted }))
      return
    }

    // Format expiry date
    if (name === "expiryDate") {
      const formatted = value.replace(/\D/g, "").slice(0, 4)
      if (formatted.length >= 2) {
        setFormData((prev) => ({ ...prev, [name]: `${formatted.slice(0, 2)}/${formatted.slice(2)}` }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: formatted }))
      }
      return
    }

    // Limit CVC to 4 digits
    if (name === "cvc") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 4) }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate form data
      if (
        !formData.cardholderName ||
        !formData.cardNumber ||
        !formData.expiryDate ||
        !formData.cvc ||
        !formData.email
      ) {
        throw new Error("Por favor, preencha todos os campos")
      }

      // Validate card number (basic check)
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, "")
      if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
        throw new Error("Número do cartão inválido")
      }

      // Validate expiry date
      const [month, year] = formData.expiryDate.split("/")
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        throw new Error("Data de validade inválida")
      }

      // Validate CVC
      if (formData.cvc.length < 3 || formData.cvc.length > 4) {
        throw new Error("CVC inválido")
      }

      // TODO: Integrate with AbacatePay API
      // This is where you would call your backend to process the payment with AbacatePay
      console.log("Processing payment with AbacatePay:", {
        plan: plan.id,
        amount: plan.price,
        ...formData,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Success - redirect to confirmation page
      // window.location.href = '/checkout/success'
      alert("Pagamento processado com sucesso! (Simulado)")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-3xl">Finalize sua Assinatura</CardTitle>
        <CardDescription>Preencha os dados do seu cartão para completar a compra</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
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
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName" className="text-foreground">
              Nome no Cartão
            </Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="João Silva"
              value={formData.cardholderName}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground uppercase"
              required
            />
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-foreground">
              Número do Cartão
            </Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={19}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono"
              required
            />
          </div>

          {/* Expiry Date and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-foreground">
                Validade
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={5}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-foreground">
                CVC
              </Label>
              <Input
                id="cvc"
                name="cvc"
                type="text"
                placeholder="123"
                value={formData.cvc}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={4}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="w-5 h-5" />
                Processando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Confirmar Pagamento
              </>
            )}
          </Button>

          {/* Security Text */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-blue-500" />
            <span>Pagamento seguro processado pela AbacatePay</span>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Ao clicar em "Confirmar Pagamento", você concorda com nossos{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400 underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400 underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
