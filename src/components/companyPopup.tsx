import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

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
  onUnRegister
}: RegistrationModalProps) {
  const [keywords, setKeywords] = useState('')
  const hasNoSlots = remainingSlots === 0 && !isAlreadyRegistered

  const isRegisterButtonDisabled =
    hasNoSlots || isLoading || (!keywords.trim() && !isAlreadyRegistered)

  const previewTags = keywords
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)

  const handleRegisterClick = () => {
    if (!keywords.trim()) return
    const targetWords = keywords
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean)

    onRegister(targetWords)
  }

  const handleClose = () => {
    setKeywords('')
    onClose()
  }

  const handleUnregister = () => {
    onUnRegister()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[460px] p-0 gap-0 overflow-hidden">
        {/* Company header */}
        <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/50 p-2">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={`${companyName} logo`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Building2 className="size-8 text-muted-foreground" />
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">{companyName}</DialogTitle>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {isAlreadyRegistered ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Você recebe alertas de vagas do(a){' '}
                  <span className="font-semibold text-foreground">{companyName}</span>.
                </p>
              </div>
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Deseja parar de receber notificações?
                </p>
                <Button variant="destructive" size="sm" onClick={handleUnregister}>
                  Desvincular
                </Button>
              </div>
            </div>
          ) : hasNoSlots ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Você atingiu o limite de empresas do seu plano.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Insira palavras-chave ou cargos de interesse para receber alertas.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="keywords" className="text-muted-foreground text-sm">
                  Palavras-chave (separe com vírgulas)
                </Label>
                <Input
                  id="keywords"
                  placeholder="Ex: Front-end, React, Pleno"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {previewTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewTags.map((tag) => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isAlreadyRegistered && (
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Slots disponíveis</span>
              <Badge variant={remainingSlots > 0 ? 'default' : 'destructive'} className="font-bold">
                {remainingSlots}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            {isAlreadyRegistered ? (
              <Button onClick={onClose} variant="outline" className="w-full">
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleRegisterClick}
                  disabled={isRegisterButtonDisabled}
                  variant="glow"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : hasNoSlots ? (
                    'Limite Atingido'
                  ) : (
                    'Confirmar Inscrição'
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
