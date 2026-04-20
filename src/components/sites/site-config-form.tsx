import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  XCircle,
  ImagePlus,
  Globe,
  Code2,
  Webhook,
  Monitor,
  Loader2,
  CheckCircle,
  Play
} from 'lucide-react'
import { Tooltip } from '@/components/tooltip'
import { useSandboxScrape } from '@/hooks/useAddSiteConfig'
import { useButtonState } from '@/hooks/useButtonState'
import { type SiteConfigFormData } from '@/services/siteCareerService'
import type { SiteConfig } from '@/models/siteCareer'
import { useTranslation } from 'react-i18next'
import { safeHref } from '@/utils/url'

// Extrai pagination_delay_ms do JSON mapping em edit mode — sem isso o
// campo sempre renderiza vazio e, ao re-salvar, buildFormDataWithDelay
// deleta o delay existente do mappings (silent data loss).
function extractPaginationDelay(jsonMappings: string | null | undefined): string {
  if (!jsonMappings) return ''
  try {
    const parsed = JSON.parse(jsonMappings)
    const delay = parsed?.pagination_delay_ms
    return typeof delay === 'number' && delay > 0 ? String(delay) : ''
  } catch (err) {
    // json_data_mappings corrompido no DB — admin vera toast quando
    // tentar salvar (parseBucketKey do backend tambem rejeita 400).
    // Log pra browser console pra facilitar debug de suporte.
    console.warn('json_data_mappings malformado — pagination_delay_ms nao extraido', err)
    return ''
  }
}

// Extrai mensagem de erro util de erros de axios, Error, ou fallback.
// Prefere response.data.error (API devolve {"error": "..."} em pt-BR).
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const axiosLike = err as { response?: { data?: { error?: string } }; message?: string }
    const apiError = axiosLike.response?.data?.error
    if (apiError) return apiError
    if (axiosLike.message) return axiosLike.message
  }
  return fallback
}

const DEFAULT_FORM_DATA: SiteConfigFormData = {
  site_name: '',
  base_url: '',
  is_active: true,
  scraping_type: 'CSS',
  job_list_item_selector: '',
  title_selector: '',
  link_selector: '',
  link_attribute: '',
  location_selector: '',
  next_page_selector: '',
  job_description_selector: '',
  job_requisition_id_selector: '',
  job_requisition_id_attribute: '',
  api_endpoint_template: '',
  api_method: 'GET',
  api_headers_json: '',
  api_payload_template: '',
  json_data_mappings: ''
}

// Converte os campos nullable do SiteConfig (edit) pra strings vazias
// — React controlled inputs nao aceitam null/undefined.
function siteConfigToFormData(site: SiteConfig): SiteConfigFormData {
  return {
    site_name: site.site_name,
    base_url: site.base_url,
    is_active: site.is_active,
    scraping_type: site.scraping_type,
    job_list_item_selector: site.job_list_item_selector ?? '',
    title_selector: site.title_selector ?? '',
    link_selector: site.link_selector ?? '',
    link_attribute: site.link_attribute ?? '',
    location_selector: site.location_selector ?? '',
    next_page_selector: site.next_page_selector ?? '',
    job_description_selector: site.job_description_selector ?? '',
    job_requisition_id_selector: site.job_requisition_id_selector ?? '',
    job_requisition_id_attribute: site.job_requisition_id_attribute ?? '',
    api_endpoint_template: site.api_endpoint_template ?? '',
    api_method: site.api_method ?? 'GET',
    api_headers_json: site.api_headers_json ?? '',
    api_payload_template: site.api_payload_template ?? '',
    json_data_mappings: site.json_data_mappings ?? ''
  }
}

interface SiteConfigFormProps {
  mode: 'create' | 'edit'
  initialData?: SiteConfig
  onSubmit: (formData: SiteConfigFormData, logoFile: File | null) => Promise<void>
  submitLabel: string
  onSubmitSuccess?: () => void
}

export default function SiteConfigForm({
  mode,
  initialData,
  onSubmit,
  submitLabel,
  onSubmitSuccess
}: SiteConfigFormProps) {
  const { t } = useTranslation('admin')
  const { t: tCommon } = useTranslation('common')

  const [formData, setFormData] = useState<SiteConfigFormData>(
    initialData ? siteConfigToFormData(initialData) : DEFAULT_FORM_DATA
  )
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [paginationDelayMs, setPaginationDelayMs] = useState(() =>
    extractPaginationDelay(initialData?.json_data_mappings)
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const {
    mutate: testScrape,
    data: sandboxResult,
    isPending: isTesting,
    reset: resetSandbox
  } = useSandboxScrape()
  const {
    buttonState,
    setLoading,
    setSuccess,
    setError: setBtnError,
    isDisabled
  } = useButtonState()

  const handleInputChange = (field: keyof SiteConfigFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      setValidationError(t('addSite.logoTooLargeError'))
      // Limpa o DOM input pra state React e visual ficarem sincronizados —
      // sem isso, filename rejeitado aparece no input embora logoFile seja null.
      e.target.value = ''
      setLogoFile(null)
      return
    }
    setValidationError(null)
    setLogoFile(file)
  }

  // Retorna { formData, error } — erro nao-nulo significa JSON mapping
  // invalido e o chamador deve abortar o submit em vez de prosseguir
  // com o delay silenciosamente dropado.
  const buildFormDataWithDelay = (): { formData: SiteConfigFormData; error: string | null } => {
    if (
      formData.scraping_type !== 'API' ||
      !paginationDelayMs ||
      !formData.json_data_mappings.trim()
    ) {
      return { formData, error: null }
    }
    try {
      const mappings = JSON.parse(formData.json_data_mappings)
      const delay = Number.parseInt(paginationDelayMs, 10)
      if (delay > 0) {
        mappings.pagination_delay_ms = delay
      } else {
        delete mappings.pagination_delay_ms
      }
      return {
        formData: { ...formData, json_data_mappings: JSON.stringify(mappings) },
        error: null
      }
    } catch {
      return { formData, error: t('addSite.apiConfig.invalidJsonMappingError') }
    }
  }

  const handleTestScrape = () => {
    if (!formData.base_url) {
      toast.error('URL base é obrigatória para testar')
      return
    }
    const { formData: payload, error } = buildFormDataWithDelay()
    if (error) {
      setValidationError(error)
      return
    }
    resetSandbox()
    testScrape(payload, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`${result.data?.length || 0} vaga(s) encontrada(s)`)
        } else {
          toast.error(result.message || 'Falha no scraping')
        }
      },
      onError: (err) => {
        toast.error(extractErrorMessage(err, 'Erro ao testar scraping'))
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!formData.site_name || !formData.base_url) {
      setValidationError(t('addSite.requiredFieldsError'))
      return
    }
    if (mode === 'create' && !logoFile) {
      setValidationError(t('addSite.logoRequiredError'))
      return
    }

    const { formData: payload, error: delayError } = buildFormDataWithDelay()
    if (delayError) {
      setValidationError(delayError)
      return
    }

    setLoading()
    try {
      await onSubmit(payload, logoFile)
      setSuccess()
      if (mode === 'create') {
        setFormData(DEFAULT_FORM_DATA)
        setLogoFile(null)
        setPaginationDelayMs('')
      }
      onSubmitSuccess?.()
    } catch (err) {
      setBtnError()
      toast.error(extractErrorMessage(err, t('addSite.addError')))
    }
  }

  const existingLogoURL = mode === 'edit' ? initialData?.logo_url : null
  const showLogoRequired = mode === 'create'

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
          <Alert className="border-destructive/50 bg-destructive/5 animate-fade-in">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <div className="animate-fade-in-up [animation-delay:100ms]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base tracking-tight">
                    {t('addSite.basicInfo.title')}
                  </CardTitle>
                  <CardDescription>{t('addSite.basicInfo.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name">
                    {t('addSite.basicInfo.nameLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="site_name"
                    type="text"
                    placeholder={t('addSite.basicInfo.namePlaceholder')}
                    value={formData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_url">
                    {t('addSite.basicInfo.urlLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="base_url"
                    type="url"
                    placeholder={t('addSite.basicInfo.urlPlaceholder')}
                    value={formData.base_url}
                    onChange={(e) => handleInputChange('base_url', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <div>
                  <Label htmlFor="is_active" className="cursor-pointer">
                    {t('addSite.basicInfo.activeLabel')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('addSite.basicInfo.activeDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Strategy */}
        <div className="animate-fade-in-up [animation-delay:150ms]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base tracking-tight">
                {t('addSite.strategy.title')}
              </CardTitle>
              <CardDescription>{t('addSite.strategy.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('scraping_type', 'CSS')}
                  className={`relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 ${
                    formData.scraping_type === 'CSS'
                      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/50 hover:border-primary/20 hover:bg-muted/30'
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-md p-2 ${
                      formData.scraping_type === 'CSS'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Code2 className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t('addSite.strategy.css')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('addSite.strategy.cssDescription')}
                    </p>
                  </div>
                  {formData.scraping_type === 'CSS' && (
                    <Badge variant="default" className="absolute top-3 right-3 text-xs">
                      {t('addSite.strategy.selected')}
                    </Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('scraping_type', 'API')}
                  className={`relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 ${
                    formData.scraping_type === 'API'
                      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/50 hover:border-primary/20 hover:bg-muted/30'
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-md p-2 ${
                      formData.scraping_type === 'API'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Webhook className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t('addSite.strategy.api')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('addSite.strategy.apiDescription')}
                    </p>
                  </div>
                  {formData.scraping_type === 'API' && (
                    <Badge variant="default" className="absolute top-3 right-3 text-xs">
                      {t('addSite.strategy.selected')}
                    </Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('scraping_type', 'HEADLESS')}
                  className={`relative flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 ${
                    formData.scraping_type === 'HEADLESS'
                      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border/50 hover:border-primary/20 hover:bg-muted/30'
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-md p-2 ${
                      formData.scraping_type === 'HEADLESS'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Monitor className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t('addSite.strategy.headless')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('addSite.strategy.headlessDescription')}
                    </p>
                  </div>
                  {formData.scraping_type === 'HEADLESS' && (
                    <Badge variant="default" className="absolute top-3 right-3 text-xs">
                      {t('addSite.strategy.selected')}
                    </Badge>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSS Selectors */}
        {(formData.scraping_type === 'CSS' || formData.scraping_type === 'HEADLESS') && (
          <div className="animate-fade-in-up">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base tracking-tight">
                      {t('addSite.cssConfig.title')}
                    </CardTitle>
                    <CardDescription>{t('addSite.cssConfig.description')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job_list_item_selector">
                        {t('addSite.cssConfig.jobListItem')}
                      </Label>
                      <Tooltip content="Ex: .job-card, li.search-result">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="job_list_item_selector"
                      placeholder=".job-card"
                      value={formData.job_list_item_selector}
                      onChange={(e) => handleInputChange('job_list_item_selector', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title_selector">{t('addSite.cssConfig.jobTitle')}</Label>
                      <Tooltip content="Ex: h2.job-title">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="title_selector"
                      placeholder="h2.job-title"
                      value={formData.title_selector}
                      onChange={(e) => handleInputChange('title_selector', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="link_selector">{t('addSite.cssConfig.jobLink')}</Label>
                      <Tooltip content="Ex: a.apply-button">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="link_selector"
                      placeholder="a.apply-button"
                      value={formData.link_selector}
                      onChange={(e) => handleInputChange('link_selector', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="link_attribute">{t('addSite.cssConfig.linkAttribute')}</Label>
                      <Tooltip content="Ex: href, data-href">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="link_attribute"
                      placeholder="href"
                      value={formData.link_attribute}
                      onChange={(e) => handleInputChange('link_attribute', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="location_selector">{t('addSite.cssConfig.location')}</Label>
                      <Tooltip content="Ex: .job-location span">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="location_selector"
                      placeholder=".job-location span"
                      value={formData.location_selector}
                      onChange={(e) => handleInputChange('location_selector', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="next_page_selector">{t('addSite.cssConfig.nextPage')}</Label>
                      <Tooltip content="Ex: a.pagination-next">
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="next_page_selector"
                      placeholder="a.pagination-next"
                      value={formData.next_page_selector}
                      onChange={(e) => handleInputChange('next_page_selector', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job_description_selector">
                        {t('addSite.cssConfig.jobDescription')}
                      </Label>
                      <Tooltip content={t('addSite.cssConfig.jobDescriptionTooltip')}>
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="job_description_selector"
                      placeholder=".job-description"
                      value={formData.job_description_selector}
                      onChange={(e) =>
                        handleInputChange('job_description_selector', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job_requisition_id_selector">
                        {t('addSite.cssConfig.requisitionId')}
                      </Label>
                      <Tooltip content={t('addSite.cssConfig.requisitionIdTooltip')}>
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="job_requisition_id_selector"
                      placeholder=".job-id"
                      value={formData.job_requisition_id_selector}
                      onChange={(e) =>
                        handleInputChange('job_requisition_id_selector', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job_requisition_id_attribute">
                        {t('addSite.cssConfig.requisitionIdAttribute')}
                      </Label>
                      <Tooltip content={t('addSite.cssConfig.requisitionIdAttributeTooltip')}>
                        <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="job_requisition_id_attribute"
                      placeholder="data-job-id"
                      value={formData.job_requisition_id_attribute}
                      onChange={(e) =>
                        handleInputChange('job_requisition_id_attribute', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Config */}
        {formData.scraping_type === 'API' && (
          <div className="animate-fade-in-up">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Webhook className="size-5 text-primary" />
                  <div>
                    <CardTitle className="text-base tracking-tight">
                      {t('addSite.apiConfig.title')}
                    </CardTitle>
                    <CardDescription>{t('addSite.apiConfig.description')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint_template">
                    {t('addSite.apiConfig.endpointTemplate')}
                  </Label>
                  <Input
                    id="api_endpoint_template"
                    placeholder={t('addSite.apiConfig.endpointPlaceholder')}
                    value={formData.api_endpoint_template}
                    onChange={(e) => handleInputChange('api_endpoint_template', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_method">{t('addSite.apiConfig.httpMethod')}</Label>
                  <Select
                    value={formData.api_method}
                    onValueChange={(value) => handleInputChange('api_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_headers_json">{t('addSite.apiConfig.headers')}</Label>
                  <Textarea
                    id="api_headers_json"
                    className="font-mono text-sm"
                    placeholder='{"Content-Type": "application/json", "X-API-Key": "sua-chave"}'
                    value={formData.api_headers_json}
                    onChange={(e) => handleInputChange('api_headers_json', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_payload_template">{t('addSite.apiConfig.payload')}</Label>
                  <Textarea
                    id="api_payload_template"
                    className="font-mono text-sm"
                    placeholder='{"query": "engenheiro de software", "page": {page_number}}'
                    value={formData.api_payload_template}
                    onChange={(e) => handleInputChange('api_payload_template', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="json_data_mappings">{t('addSite.apiConfig.jsonMapping')}</Label>
                    <Tooltip content={t('addSite.apiConfig.jsonMappingTooltip')}>
                      <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <Textarea
                    id="json_data_mappings"
                    className="font-mono text-sm"
                    placeholder='{"jobs_list_path": "data.jobs", "title_path": "jobTitle", "link_path": "applyUrl", "location_path": "location.city"}'
                    value={formData.json_data_mappings}
                    onChange={(e) => handleInputChange('json_data_mappings', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pagination_delay_ms">
                      {t('addSite.apiConfig.paginationDelay')}
                    </Label>
                    <Tooltip content={t('addSite.apiConfig.paginationDelayTooltip')}>
                      <HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    id="pagination_delay_ms"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={paginationDelayMs}
                    onChange={(e) => setPaginationDelayMs(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logo Upload */}
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base tracking-tight">
                {t('addSite.logo.title')}
                {showLogoRequired && <span className="text-destructive"> *</span>}
              </CardTitle>
              <CardDescription>{t('addSite.logo.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                {mode === 'edit' && existingLogoURL && !logoFile && (
                  <div className="flex items-center gap-3">
                    <img
                      src={existingLogoURL}
                      alt={t('addSite.logo.currentLogo')}
                      className="h-12 w-12 rounded border border-border/50 object-contain bg-muted/30 p-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {t('addSite.logo.currentLogo')}
                    </span>
                  </div>
                )}
                <Input
                  id="logo_upload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo_upload')?.click()}
                >
                  <ImagePlus className="size-4" />
                  {mode === 'edit' && existingLogoURL
                    ? t('addSite.logo.replace')
                    : t('addSite.logo.chooseImage')}
                </Button>
                {logoFile && (
                  <span className="text-sm text-muted-foreground min-w-0 truncate max-w-[200px] sm:max-w-xs">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 animate-fade-in-up [animation-delay:250ms]">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleTestScrape}
            disabled={isTesting || !formData.base_url}
          >
            {isTesting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('addSite.sandbox.testing')}
              </>
            ) : (
              <>
                <Play className="size-4" />
                {t('addSite.sandbox.testButton')}
              </>
            )}
          </Button>
          <Button
            type="submit"
            variant={buttonState === 'success' ? 'outline' : 'glow'}
            size="lg"
            className={`w-full sm:w-auto ${buttonState === 'success' ? 'animate-success-flash border-primary/50 text-primary' : ''}`}
            disabled={isDisabled}
          >
            {buttonState === 'loading' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {tCommon('actions.saving')}
              </>
            ) : buttonState === 'success' ? (
              <>
                <CheckCircle className="size-4" />
                {tCommon('actions.saved')}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>

      {/* Sandbox Results */}
      {sandboxResult && (
        <Card className="animate-fade-in-up mt-10">
          <CardHeader>
            <CardTitle className="text-base">
              {t('addSite.sandbox.resultTitle')}
              <Badge className="ml-2" variant={sandboxResult.success ? 'default' : 'destructive'}>
                {sandboxResult.success
                  ? `${sandboxResult.data?.length || 0} ${t('addSite.sandbox.jobs')}`
                  : t('addSite.sandbox.error')}
              </Badge>
            </CardTitle>
            {sandboxResult.message && <CardDescription>{sandboxResult.message}</CardDescription>}
          </CardHeader>
          {sandboxResult.success && sandboxResult.data?.length > 0 && (
            <CardContent>
              <div className="rounded-lg border border-border/50 overflow-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">
                        {t('addSite.sandbox.columns.title')}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {t('addSite.sandbox.columns.company')}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {t('addSite.sandbox.columns.location')}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {t('addSite.sandbox.columns.link')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {sandboxResult.data.map((job, i) => (
                      <tr key={i}>
                        <td className="p-2">{job.title}</td>
                        <td className="p-2 text-muted-foreground">{job.company}</td>
                        <td className="p-2 text-muted-foreground">{job.location}</td>
                        <td className="p-2">
                          <a
                            href={safeHref(job.job_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {t('addSite.sandbox.viewLink')}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  )
}
