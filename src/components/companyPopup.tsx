"use client"

import * as React from "react"
import { Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Company {
  id: string
  name: string
  logo: string
}

interface CompanySubscriptionPopupProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
}

type ButtonState = "initial" | "loading" | "success"

export function CompanySubscriptionPopup({ company, isOpen, onClose }: CompanySubscriptionPopupProps) {
  const [buttonState, setButtonState] = React.useState<ButtonState>("initial")

  React.useEffect(() => {
    if (isOpen) {
      setButtonState("initial")
    }
  }, [isOpen])

  const handleSubscribe = async () => {
    if (buttonState !== "initial") return

    setButtonState("loading")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setButtonState("success")

    setTimeout(() => {
      onClose()
    }, 2500)
  }

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span className="sr-only">Carregando...</span>
          </>
        )
      case "success":
        return (
          <>
            <Check className="size-4" />
            Inscrito com Sucesso!
          </>
        )
      default:
        return "Confirmar Inscrição"
    }
  }

  const getButtonClassName = () => {
    switch (buttonState) {
      case "success":
        return "bg-[var(--color-company-success-green)] text-black hover:bg-[var(--color-company-success-green)]/90"
      default:
        return "bg-[var(--color-company-accent-blue)] text-white hover:bg-[var(--color-company-accent-blue)]/90"
    }
  }

  if (!company) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "bg-[var(--color-company-card-bg)] border-[var(--color-company-accent-blue)] text-[var(--color-company-text-light)]",
          "max-w-md mx-auto",
        )}
        showCloseButton={true}
      >
        <DialogHeader className="items-center text-center space-y-4">
          <div className="flex justify-center">
            <div className="size-20 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
              <img
                src={company.logo || "/placeholder.svg"}
                alt={`${company.name} logo`}
                className="size-16 object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(company.name + " company logo")}`
                }}
              />
            </div>
          </div>

          <DialogTitle className="text-xl font-semibold text-[var(--color-company-text-light)]">
            {company.name}
          </DialogTitle>

          <p className="text-sm text-[var(--color-company-text-light)]/80 text-balance">
            Deseja receber notificações de novas vagas para esta empresa?
          </p>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubscribe}
            disabled={buttonState !== "initial"}
            className={cn("w-full max-w-xs h-12 text-sm font-medium transition-all duration-200", getButtonClassName())}
          >
            {getButtonContent()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
