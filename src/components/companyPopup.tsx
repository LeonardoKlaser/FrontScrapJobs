import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  companyName: string | undefined
  companyLogo: string | undefined
  remainingSlots: number
  isAlreadyRegistered: boolean | undefined
  isLoading: boolean
  onRegister: (targetWords: string[]) => void
  onUnRegister: () => void
}

export function RegistrationModal({
  isOpen,
  onClose,
  companyName,
  companyLogo,
  remainingSlots,
  isAlreadyRegistered,
  isLoading,
  onRegister,
  onUnRegister,
}: RegistrationModalProps) {
  const [keywords, setKeywords] = useState("")
  const hasNoSlots = remainingSlots === 0 && !isAlreadyRegistered

  const isRegisterButtonDisabled = hasNoSlots || isLoading || (!keywords.trim() && !isAlreadyRegistered)

  const handleRegisterClick = () => {
    if (!keywords.trim()) return 
    const targetWords = keywords
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean)

    onRegister(targetWords)
  }

  const handleClose = () => {
    setKeywords("")
    onClose()
  }

  const handleUnregister = () => {
    onUnRegister()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="relative h-10 w-auto max-w-[200px]">
                <img
                  src={companyLogo || "/placeholder.svg"}
                  alt={`${companyName} logo`}
                  width={200}
                  height={40}
                  className="object-contain max-h-10 w-auto"
                />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">{companyName}</DialogTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {isAlreadyRegistered ? (
              <div>
                <p className="text-center text-muted-foreground">
                  Você já está inscrito para receber alertas de vagas do(a){" "}
                  <span className="font-semibold text-foreground">{companyName}</span>.
                </p>
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Deseja se desvincular para parar de receber notificações de vagas da {companyName}?
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleUnregister}>
                    Desvincular
                  </Button>
                </div>
              </div>
              
            ) : hasNoSlots ? (
              <p className="text-center text-muted-foreground">Você atingiu o limite de empresas do seu plano.</p>
            ) : (
              <>
                <p className="text-center text-muted-foreground">
                  Para receber alertas, insira as palavras-chave ou cargos de interesse.
                </p>
                {/* NOVO CAMPO DE INPUT */}
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-muted-foreground">
                    Palavras-chave (separe com vírgulas)
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="Ex: Desenvolvedor Front-end, React, Pleno"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="py-6"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {!isAlreadyRegistered && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Slots de Inscrição Disponíveis:</span>
                <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                  {remainingSlots}
                </Badge>
              </div>
              
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            {isAlreadyRegistered ? (
              <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
                Fechar
              </Button>
            ) : (
              <>
                <Button onClick={handleRegisterClick} disabled={isRegisterButtonDisabled} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : hasNoSlots ? (
                    "Limite de Slots Atingido"
                  ) : (
                    "Confirmar Inscrição e Usar 1 Slot"
                  )}
                </Button>
                <Button onClick={onClose} variant="ghost" className="w-full" disabled={isLoading}>
                  Cancelar
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
