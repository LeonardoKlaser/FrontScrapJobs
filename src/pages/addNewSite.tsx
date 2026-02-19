import type React from 'react'

import { useEffect, useState } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HelpCircle, CheckCircle, XCircle, ImagePlus } from 'lucide-react'
import { Tooltip } from '@/components/tooltip'
import { useAddSiteConfig } from '@/hooks/useAddSiteConfig'
import { type SiteConfigFormData, type ScrapingType } from '@/services/siteCareerService'

export default function AdicionarSitePage() {
  const [formData, setFormData] = useState<SiteConfigFormData>({
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
    api_endpoint_template: '',
    api_method: 'GET',
    api_headers_json: '',
    api_payload_template: '',
    json_data_mappings: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const { mutate: addSite, isPending, isSuccess, isError, error } = useAddSiteConfig()

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setFormData({
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
          api_endpoint_template: '',
          api_method: 'GET',
          api_headers_json: '',
          api_payload_template: '',
          json_data_mappings: ''
        })
        setLogoFile(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const handleInputChange = (field: keyof SiteConfigFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!formData.site_name || !formData.base_url) {
      setValidationError('Por favor, preencha os campos obrigatórios: Nome do Site e URL Base.')
      return
    }
    addSite({ formData, logoFile })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Adicionar Novo Site para Monitoramento
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {validationError && (
              <Alert className="border-destructive bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{validationError}</AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert className="border-success bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Site adicionado com sucesso!
                </AlertDescription>
              </Alert>
            )}
            {isError && (
              <Alert className="border-destructive bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error?.message || 'Ocorreu um erro ao adicionar o site.'}
                </AlertDescription>
              </Alert>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure as informações fundamentais do site de empregos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Nome do Site *</Label>
                    <Input
                      id="site_name"
                      type="text"
                      placeholder="Ex: Google Careers"
                      value={formData.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_url">URL Base da Página de Carreiras *</Label>
                    <Input
                      id="base_url"
                      type="url"
                      placeholder="https://careers.google.com/jobs/results/"
                      value={formData.base_url}
                      onChange={(e) => handleInputChange('base_url', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Monitoramento Ativo</Label>
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Estratégia de Coleta */}
            <Card>
              <CardHeader>
                <CardTitle>Estratégia de Coleta</CardTitle>
                <CardDescription>Selecione como os dados serão coletados do site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Selecione a Estratégia de Coleta de Dados *</Label>
                  <RadioGroup
                    value={formData.scraping_type}
                    onValueChange={(value: ScrapingType) =>
                      handleInputChange('scraping_type', value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CSS" id="CSS" />
                      <Label htmlFor="CSS">CSS Selectors (Coleta via seletores CSS)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="API" id="API" />
                      <Label htmlFor="API">API (Coleta via chamada de API)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Seção 3: Configuração de Seletores CSS */}
            {formData.scraping_type === 'CSS' && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de Seletores CSS</CardTitle>
                  <CardDescription>
                    Configure os seletores CSS para extrair dados das páginas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="job_list_item_selector">
                          Seletor do Item da Lista de Vagas
                        </Label>
                        <Tooltip content="Ex: .job-card, li.search-result">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </Tooltip>
                      </div>
                      <Input
                        id="job_list_item_selector"
                        placeholder=".job-card"
                        value={formData.job_list_item_selector}
                        onChange={(e) =>
                          handleInputChange('job_list_item_selector', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="title_selector">Seletor do Título da Vaga</Label>
                        <Tooltip content="Ex: h2.job-title">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="link_selector">Seletor do Link da Vaga</Label>
                        <Tooltip content="Ex: a.apply-button">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="link_attribute">Atributo do Link</Label>
                        <Tooltip content="Ex: href, data-href">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="location_selector">Seletor da Localização</Label>
                        <Tooltip content="Ex: .job-location span">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="next_page_selector">
                          Seletor do Botão 'Próxima Página'
                        </Label>
                        <Tooltip content="Ex: a.pagination-next">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="job_description_selector">
                          Seletor da Descrição da Vaga
                        </Label>
                        <Tooltip content="Seletor para a descrição na página de detalhes">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="job_requisition_id_selector">
                          Seletor do ID de Requisição
                        </Label>
                        <Tooltip content="Seletor para o ID único da vaga">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.scraping_type === 'API' && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de API</CardTitle>
                  <CardDescription>Configure os parâmetros para coleta via API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="api_endpoint_template">Template do Endpoint da API</Label>
                    <Input
                      id="api_endpoint_template"
                      placeholder="https://api.empresa.com/jobs?page={page_number}"
                      value={formData.api_endpoint_template}
                      onChange={(e) => handleInputChange('api_endpoint_template', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_method">Método HTTP</Label>
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
                    <Label htmlFor="api_headers_json">Cabeçalhos (Headers) em formato JSON</Label>
                    <Textarea
                      id="api_headers_json"
                      placeholder='{"Content-Type": "application/json", "X-API-Key": "sua-chave"}'
                      value={formData.api_headers_json}
                      onChange={(e) => handleInputChange('api_headers_json', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_payload_template">
                      Corpo da Requisição (Payload Template)
                    </Label>
                    <Textarea
                      id="api_payload_template"
                      placeholder='{"query": "engenheiro de software", "page": {page_number}}'
                      value={formData.api_payload_template}
                      onChange={(e) => handleInputChange('api_payload_template', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="json_data_mappings">Mapeamento dos Dados JSON</Label>
                      <Tooltip content="Define o caminho para extrair cada dado do objeto JSON retornado pela API">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </Tooltip>
                    </div>
                    <Textarea
                      id="json_data_mappings"
                      placeholder='{"jobs_list_path": "data.jobs", "title_path": "jobTitle", "link_path": "applyUrl", "location_path": "location.city"}'
                      value={formData.json_data_mappings}
                      onChange={(e) => handleInputChange('json_data_mappings', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="logo_upload">Logo da Empresa</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo_upload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo_upload')?.click()}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Escolher Imagem
                </Button>
                {logoFile && <span className="text-sm text-muted-foreground">{logoFile.name}</span>}
              </div>
            </div>

            {/* Seção 5: Ações */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? 'Salvando...' : 'Salvar Configuração do Site'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
