import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Loader2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  companyName: string | undefined
  companyLogo: string | null | undefined
  remainingSlots: number
  isAlreadyRegistered: boolean | undefined
  isLoading: boolean
  onRegister: (targetWords: string[]) => void
  onUnRegister: () => void
  currentTargetWords?: string[]
  onUpdateFilters?: (targetWords: string[]) => void
  isUpdatingFilters?: boolean
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
  currentTargetWords,
  onUpdateFilters,
  isUpdatingFilters
}: RegistrationModalProps) {
  const { t } = useTranslation('sites')
  const [keywords, setKeywords] = useState('')
  const [editKeywords, setEditKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const hasNoSlots = remainingSlots === 0 && !isAlreadyRegistered

  useEffect(() => {
    if (isOpen) {
      setKeywords('')
      setEditKeywords(currentTargetWords ?? [])
      setKeywordInput('')
    }
  }, [isOpen, currentTargetWords])

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
                alt={t('popup.logo', { name: companyName })}
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
                  {t('popup.receiving', { name: companyName })}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">
                  {t('popup.keywordsEdit', 'Palavras-chave para alertas')}
                </Label>
                {editKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editKeywords.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setEditKeywords((prev) => prev.filter((k) => k !== tag))}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('popup.keywordsPlaceholder')}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const newWord = keywordInput.trim()
                        if (newWord && !editKeywords.includes(newWord)) {
                          setEditKeywords((prev) => [...prev, newWord])
                          setKeywordInput('')
                        }
                      }
                    }}
                    disabled={isUpdatingFilters}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!keywordInput.trim() || isUpdatingFilters}
                    onClick={() => {
                      const newWord = keywordInput.trim()
                      if (newWord && !editKeywords.includes(newWord)) {
                        setEditKeywords((prev) => [...prev, newWord])
                        setKeywordInput('')
                      }
                    }}
                  >
                    {t('popup.addKeyword', 'Adicionar')}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="glow"
                  className="w-full"
                  disabled={isUpdatingFilters}
                  onClick={() => onUpdateFilters?.(editKeywords)}
                >
                  {isUpdatingFilters ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('popup.saving', 'Salvando...')}
                    </>
                  ) : (
                    t('popup.saveFilters', 'Salvar alterações')
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleUnregister}
                >
                  {t('popup.unsubscribe')}
                </Button>
              </div>
            </div>
          ) : hasNoSlots ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">{t('popup.limitReached')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">{t('popup.instruction')}</p>
              <div className="space-y-1.5">
                <Label htmlFor="keywords" className="text-muted-foreground text-sm">
                  {t('popup.keywordsLabel')}
                </Label>
                <Input
                  id="keywords"
                  placeholder={t('popup.keywordsPlaceholder')}
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
              <span className="text-sm text-muted-foreground">{t('popup.slotsAvailable')}</span>
              <Badge variant={remainingSlots > 0 ? 'default' : 'destructive'} className="font-bold">
                {remainingSlots}
              </Badge>
            </div>
          )}

          {/* Actions */}
          {!isAlreadyRegistered && (
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={handleRegisterClick}
                disabled={isRegisterButtonDisabled}
                variant="glow"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('popup.registering')}
                  </>
                ) : hasNoSlots ? (
                  t('popup.limitButton')
                ) : (
                  t('popup.confirmSubscription')
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
