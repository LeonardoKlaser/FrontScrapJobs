import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Loader2, Search, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { FilterPreviewResult } from '@/services/filterPreviewService'
import { useFilterPreview } from '@/hooks/useFilterPreview'
import { useSiteKeywords } from '@/hooks/useSiteKeywords'

// Espelha a ordem do backend Tokenize: ToLower → NFD → strip Mn → NFC.
// Ordem importa pra edge cases (Turkish dotless-i, eszett). Divergência
// backend/frontend causaria miss silencioso: preview mostra token X mas
// backend grava Y. Mantém os dois alinhados.
const splitIntoTags = (input: string): string[] => {
  const folded = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .normalize('NFC')
  const seen = new Set<string>()
  const out: string[] = []
  for (const match of folded.matchAll(/[\p{L}\p{N}]+/gu)) {
    const tok = match[0]
    if (!seen.has(tok)) {
      seen.add(tok)
      out.push(tok)
    }
  }
  return out
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  siteId: number
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
  siteId,
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
  const { t: tDashboard } = useTranslation('dashboard')
  const [keywords, setKeywords] = useState('')
  const [editKeywords, setEditKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [previewResult, setPreviewResult] = useState<FilterPreviewResult | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const filterPreview = useFilterPreview()
  const previewLoading = filterPreview.isPending
  const hasNoSlots = remainingSlots === 0 && !isAlreadyRegistered
  const { data: siteKeywords } = useSiteKeywords(siteId, isOpen)
  const [showZeroMatchWarning, setShowZeroMatchWarning] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setKeywords('')
      const hydrated = (currentTargetWords ?? []).flatMap(splitIntoTags)
      setEditKeywords(Array.from(new Set(hydrated)))
      setKeywordInput('')
      setPreviewResult(null)
      setPreviewError(null)
      setShowSample(false)
      setShowZeroMatchWarning(false)
    }
  }, [isOpen, currentTargetWords])

  const addKeyword = useCallback(() => {
    const tokens = splitIntoTags(keywordInput)
    if (tokens.length === 0) return
    setEditKeywords((prev) => {
      const existing = new Set(prev)
      const additions = tokens.filter((t) => !existing.has(t))
      return additions.length === 0 ? prev : [...prev, ...additions]
    })
    setKeywordInput('')
    setPreviewResult(null)
    setPreviewError(null)
    setShowSample(false)
  }, [keywordInput])

  const previewTags = splitIntoTags(keywords)

  const currentFilters = isAlreadyRegistered ? editKeywords : previewTags

  const handleAddSuggestion = (keyword: string) => {
    if (isAlreadyRegistered) {
      setEditKeywords((prev) => (prev.includes(keyword) ? prev : [...prev, keyword]))
    } else {
      setKeywords((prev) => (prev ? `${prev} ${keyword}` : keyword))
    }
    setShowZeroMatchWarning(false)
    setPreviewResult(null)
  }

  const getRelevantSuggestions = () => {
    if (!siteKeywords) return []
    const userTokens = currentFilters.map((f) => f.toLowerCase())
    const relevant = siteKeywords.filter(
      (sk) =>
        !currentFilters.includes(sk.keyword) &&
        userTokens.some((ut) => sk.keyword.includes(ut) || ut.includes(sk.keyword))
    )
    const suggestions =
      relevant.length > 0
        ? relevant
        : siteKeywords.filter((sk) => !currentFilters.includes(sk.keyword))
    return suggestions.slice(0, 8)
  }

  const handleSaveWithValidation = () => {
    const filters = isAlreadyRegistered ? editKeywords : previewTags
    if (filters.length === 0) return

    filterPreview.mutate(
      { siteId, filters },
      {
        onSuccess: (result) => {
          if (result.matched_jobs > 0) {
            if (isAlreadyRegistered) {
              onUpdateFilters?.(editKeywords)
            } else {
              onRegister(previewTags)
            }
          } else {
            setShowZeroMatchWarning(true)
          }
        },
        onError: () => {
          if (isAlreadyRegistered) {
            onUpdateFilters?.(editKeywords)
          } else {
            onRegister(previewTags)
          }
        }
      }
    )
  }

  const handleSaveAnyway = () => {
    setShowZeroMatchWarning(false)
    if (isAlreadyRegistered) {
      onUpdateFilters?.(editKeywords)
    } else {
      onRegister(previewTags)
    }
  }

  const runPreview = (filters: string[]) => {
    if (filters.length === 0) return
    setPreviewResult(null)
    setPreviewError(null)
    setShowSample(false)
    filterPreview.mutate(
      { siteId, filters },
      {
        onSuccess: (result) => {
          setPreviewResult(result)
        },
        onError: (err) => {
          console.error('filter preview failed', err)
          let key = 'preview.error'
          if (axios.isAxiosError(err)) {
            const status = err.response?.status
            if (status === 429) key = 'preview.rateLimited'
            // Distinguir gateway/upstream down de erro genérico — sem isso o
            // user nao sabia se era a query dele ou um problema temporario do site.
            else if (status === 503 || status === 504) key = 'preview.serviceUnavailable'
          }
          setPreviewError(tDashboard(key))
        }
      }
    )
  }

  const handlePreviewFilters = () => runPreview(editKeywords)
  const handlePreviewRegistrationFilters = () => runPreview(previewTags)

  const isRegisterButtonDisabled =
    hasNoSlots || isLoading || (previewTags.length === 0 && !isAlreadyRegistered)

  const handleClose = () => {
    setKeywords('')
    onClose()
  }

  const handleUnregister = () => {
    onUnRegister()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[95vw] sm:max-w-[460px] p-0 gap-0 overflow-hidden"
      >
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
                <Label className="text-muted-foreground text-sm">{t('popup.keywordsEdit')}</Label>
                {editKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editKeywords.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            setEditKeywords((prev) => prev.filter((k) => k !== tag))
                            setPreviewResult(null)
                            setShowSample(false)
                          }}
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
                        addKeyword()
                      }
                    }}
                    disabled={isUpdatingFilters}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!keywordInput.trim() || isUpdatingFilters}
                    onClick={addKeyword}
                  >
                    {t('popup.addKeyword')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('popup.keywordsHelp')}</p>
              </div>
              {siteKeywords && siteKeywords.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold text-emerald-800">
                      {t('popup.suggestions.popular')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {siteKeywords
                      .filter((sk) => !editKeywords.includes(sk.keyword))
                      .slice(0, 12)
                      .map((sk) => (
                        <button
                          key={sk.keyword}
                          type="button"
                          onClick={() => handleAddSuggestion(sk.keyword)}
                          className="bg-emerald-100 text-emerald-800 border border-emerald-200
                            px-2.5 py-1 rounded-full text-xs cursor-pointer
                            hover:bg-emerald-200 transition-colors"
                        >
                          {sk.keyword} <span className="opacity-70">({sk.job_count})</span>
                        </button>
                      ))}
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-2 opacity-80">
                    {t('popup.suggestions.popularHint')}
                  </p>
                </div>
              )}
              {editKeywords.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewFilters}
                    disabled={previewLoading}
                    className="w-full gap-2"
                  >
                    {previewLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {previewLoading
                      ? tDashboard('preview.testing')
                      : tDashboard('preview.testFilters')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {tDashboard('preview.testFiltersDescription')}
                  </p>

                  {previewError && <p className="mt-2 text-sm text-destructive">{previewError}</p>}

                  {previewResult && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      {previewResult.matched_jobs > 0 ? (
                        <>
                          <p className="text-gray-700">
                            <span className="font-semibold text-emerald-600">
                              {tDashboard('preview.matchesFound', {
                                matched: previewResult.matched_jobs,
                                total: previewResult.total_jobs
                              })}
                            </span>
                            {tDashboard('preview.matchesText')}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowSample(!showSample)}
                            className="text-xs text-emerald-600 hover:underline mt-1"
                          >
                            {showSample
                              ? tDashboard('preview.hideJobs')
                              : tDashboard('preview.showJobs')}
                          </button>
                          {showSample && (
                            <div className="mt-2 space-y-1.5">
                              {previewResult.sample.map((job, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700 truncate">{job.title}</span>
                                  <span className="text-gray-400 ml-2 shrink-0">
                                    {job.location}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-amber-600">
                          {previewResult.site_has_no_recent_jobs
                            ? tDashboard('preview.noRecentJobs')
                            : tDashboard('preview.noMatches')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {showZeroMatchWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-semibold text-amber-900">
                      {t('popup.suggestions.warningTitle')}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 mb-2.5">
                    {t('popup.suggestions.warningText')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {getRelevantSuggestions().map((sk) => (
                      <button
                        key={sk.keyword}
                        type="button"
                        onClick={() => handleAddSuggestion(sk.keyword)}
                        className="bg-amber-100 text-amber-900 border border-amber-200
                          px-2.5 py-1 rounded-full text-xs cursor-pointer
                          hover:bg-amber-200 transition-colors font-medium"
                      >
                        + {sk.keyword} <span className="opacity-70">({sk.job_count})</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-800 mt-2 opacity-80">
                    {t('popup.suggestions.warningHint')}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={handleSaveAnyway}
                    >
                      {t('popup.suggestions.saveAnyway')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowZeroMatchWarning(false)}
                    >
                      {t('popup.suggestions.cancel')}
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2">
                {editKeywords.length === 0 && (
                  <p className="text-xs text-amber-500/70">
                    {t(
                      'popup.keywordsRequired',
                      'Adicione pelo menos uma palavra-chave para se inscrever'
                    )}
                  </p>
                )}
                <Button
                  variant="glow"
                  className="w-full"
                  disabled={isUpdatingFilters || editKeywords.length === 0}
                  onClick={handleSaveWithValidation}
                >
                  {isUpdatingFilters ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('popup.saving')}
                    </>
                  ) : (
                    t('popup.saveFilters')
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
                  onChange={(e) => {
                    setKeywords(e.target.value)
                    setPreviewResult(null)
                    setPreviewError(null)
                    setShowSample(false)
                  }}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">{t('popup.keywordsHelp')}</p>
              </div>
              {siteKeywords && siteKeywords.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold text-emerald-800">
                      {t('popup.suggestions.popular')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {siteKeywords
                      .filter((sk) => !previewTags.includes(sk.keyword))
                      .slice(0, 12)
                      .map((sk) => (
                        <button
                          key={sk.keyword}
                          type="button"
                          onClick={() => handleAddSuggestion(sk.keyword)}
                          className="bg-emerald-100 text-emerald-800 border border-emerald-200
                            px-2.5 py-1 rounded-full text-xs cursor-pointer
                            hover:bg-emerald-200 transition-colors"
                        >
                          {sk.keyword} <span className="opacity-70">({sk.job_count})</span>
                        </button>
                      ))}
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-2 opacity-80">
                    {t('popup.suggestions.popularHint')}
                  </p>
                </div>
              )}
              {previewTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewTags.map((tag) => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {previewTags.length === 0 && keywords.trim().length > 0 && (
                <p className="text-xs text-amber-500">
                  {t('popup.noValidKeywords', 'Nenhuma palavra-chave válida detectada')}
                </p>
              )}
              {keywords.trim().length === 0 && (
                <p className="text-xs text-amber-500/70">
                  {t(
                    'popup.keywordsRequired',
                    'Adicione pelo menos uma palavra-chave para se inscrever'
                  )}
                </p>
              )}
              {previewTags.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewRegistrationFilters}
                    disabled={previewLoading}
                    className="w-full gap-2"
                  >
                    {previewLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {previewLoading
                      ? tDashboard('preview.testing')
                      : tDashboard('preview.testFilters')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {tDashboard('preview.testFiltersDescription')}
                  </p>

                  {previewError && <p className="mt-2 text-sm text-destructive">{previewError}</p>}

                  {previewResult && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      {previewResult.matched_jobs > 0 ? (
                        <>
                          <p className="text-gray-700">
                            <span className="font-semibold text-emerald-600">
                              {tDashboard('preview.matchesFound', {
                                matched: previewResult.matched_jobs,
                                total: previewResult.total_jobs
                              })}
                            </span>
                            {tDashboard('preview.matchesText')}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowSample(!showSample)}
                            className="text-xs text-emerald-600 hover:underline mt-1"
                          >
                            {showSample
                              ? tDashboard('preview.hideJobs')
                              : tDashboard('preview.showJobs')}
                          </button>
                          {showSample && (
                            <div className="mt-2 space-y-1.5">
                              {previewResult.sample.map((job, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700 truncate">{job.title}</span>
                                  <span className="text-gray-400 ml-2 shrink-0">
                                    {job.location}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-amber-600">
                          {previewResult.site_has_no_recent_jobs
                            ? tDashboard('preview.noRecentJobs')
                            : tDashboard('preview.noMatches')}
                        </p>
                      )}
                    </div>
                  )}
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

          {showZeroMatchWarning && !isAlreadyRegistered && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-semibold text-amber-900">
                  {t('popup.suggestions.warningTitle')}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mb-2.5">
                {t('popup.suggestions.warningText')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {getRelevantSuggestions().map((sk) => (
                  <button
                    key={sk.keyword}
                    type="button"
                    onClick={() => handleAddSuggestion(sk.keyword)}
                    className="bg-amber-100 text-amber-900 border border-amber-200
                      px-2.5 py-1 rounded-full text-xs cursor-pointer
                      hover:bg-amber-200 transition-colors font-medium"
                  >
                    + {sk.keyword} <span className="opacity-70">({sk.job_count})</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-amber-800 mt-2 opacity-80">
                {t('popup.suggestions.warningHint')}
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="default" size="sm" className="flex-1" onClick={handleSaveAnyway}>
                  {t('popup.suggestions.saveAnyway')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowZeroMatchWarning(false)}
                >
                  {t('popup.suggestions.cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isAlreadyRegistered && (
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={handleSaveWithValidation}
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
