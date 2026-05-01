import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Editor from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  useEmailTemplate,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  usePreviewTemplate,
  useTestSendTemplate
} from '@/hooks/useEmailTemplates'
import { emailTemplateFormSchema, type EmailTemplateFormInput } from '@/validators/email'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { VariableInsertButton } from '@/components/admin-emails/VariableInsertButton'
import { TemplatePreviewPane } from '@/components/admin-emails/TemplatePreviewPane'
import { PATHS } from '@/router/paths'
import type { EmailTemplate } from '@/models/email'

export default function TemplateEditor() {
  const { id } = useParams()
  const idNum = id ? Number(id) : null
  const isEdit = idNum !== null && !Number.isNaN(idNum)
  const navigate = useNavigate()

  const tplQuery = useEmailTemplate(isEdit ? idNum : null)
  const createMut = useCreateEmailTemplate()
  const updateMut = useUpdateEmailTemplate()
  const previewMut = usePreviewTemplate()
  const testSendMut = useTestSendTemplate()

  const subjectEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const bodyEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [activeEditor, setActiveEditor] = useState<'subject' | 'body'>('body')

  const form = useForm<EmailTemplateFormInput>({
    resolver: zodResolver(emailTemplateFormSchema) as unknown as Resolver<EmailTemplateFormInput>,
    defaultValues: {
      key: '',
      locale: 'pt-BR',
      name: '',
      description: '',
      subject: '',
      body_html: '',
      variables_schema: [],
      is_active: true
    }
  })

  const watchAll = form.watch()

  useEffect(() => {
    if (tplQuery.data) {
      form.reset({
        key: tplQuery.data.key,
        locale: tplQuery.data.locale,
        name: tplQuery.data.name,
        description: tplQuery.data.description ?? '',
        subject: tplQuery.data.subject,
        body_html: tplQuery.data.body_html,
        variables_schema: tplQuery.data.variables_schema,
        is_active: tplQuery.data.is_active
      })
    }
  }, [tplQuery.data])

  const [sampleJson, setSampleJson] = useState('{}')

  const handlePreview = () => {
    if (!isEdit || !idNum) {
      toast.error('Salve o template antes de pré-visualizar')
      return
    }
    let sample: Record<string, unknown> | undefined
    if (sampleJson.trim() && sampleJson.trim() !== '{}') {
      try {
        sample = JSON.parse(sampleJson)
      } catch {
        toast.error('Sample JSON inválido')
        return
      }
    }
    previewMut.mutate({ id: idNum, sample })
  }

  const handleInsertVariable = (varName: string) => {
    const editor = activeEditor === 'subject' ? subjectEditorRef.current : bodyEditorRef.current
    if (!editor) return
    const insertText = `{{.${varName}}}`
    const selection = editor.getSelection()
    if (selection) {
      editor.executeEdits('insert-variable', [
        {
          range: selection,
          text: insertText,
          forceMoveMarkers: true
        }
      ])
      editor.focus()
    }
  }

  const onSubmit = async (data: EmailTemplateFormInput, opts?: { thenTestSend?: boolean }) => {
    try {
      let saved: EmailTemplate
      if (isEdit && idNum) {
        saved = await updateMut.mutateAsync({ id: idNum, input: data })
      } else {
        saved = await createMut.mutateAsync(data)
      }
      toast.success('Template salvo')
      if (opts?.thenTestSend) {
        await testSendMut.mutateAsync(saved.id)
        toast.success('Test enviado pra seu email')
      }
      navigate(PATHS.app.adminEmails.templateEdit(saved.id))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      toast.error(msg)
    }
  }

  const variables = watchAll.variables_schema ?? []

  if (isEdit && tplQuery.isLoading) {
    return <div className="p-6 text-muted-foreground">Carregando...</div>
  }
  if (isEdit && tplQuery.isError) {
    return <div className="p-6 text-destructive">Erro ao carregar template</div>
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEdit ? `Editar: ${tplQuery.data?.key ?? ''}` : 'Novo template'}
        </h1>
        <Button variant="ghost" onClick={() => navigate(PATHS.app.adminEmails.templates)}>
          Voltar
        </Button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Key</Label>
              <Input {...form.register('key')} disabled={isEdit} />
            </div>
            <div>
              <Label>Locale</Label>
              <Input {...form.register('locale')} />
            </div>
          </div>
          <div>
            <Label>Nome</Label>
            <Input {...form.register('name')} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input {...form.register('description')} />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={watchAll.is_active}
              onCheckedChange={(v) => form.setValue('is_active', v)}
            />
            <Label>Ativo</Label>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Subject</Label>
              {activeEditor === 'subject' && (
                <VariableInsertButton variables={variables} onInsert={handleInsertVariable} />
              )}
            </div>
            <div onFocus={() => setActiveEditor('subject')}>
              <Card>
                <CardContent className="p-0">
                  <Editor
                    height="40px"
                    defaultLanguage="plaintext"
                    value={watchAll.subject}
                    onChange={(v) => form.setValue('subject', v ?? '')}
                    onMount={(editor) => {
                      subjectEditorRef.current = editor
                    }}
                    options={{
                      lineNumbers: 'off',
                      glyphMargin: false,
                      folding: false,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Body HTML</Label>
              {activeEditor === 'body' && (
                <VariableInsertButton variables={variables} onInsert={handleInsertVariable} />
              )}
            </div>
            <div onFocus={() => setActiveEditor('body')}>
              <Card>
                <CardContent className="p-0">
                  <Editor
                    height="400px"
                    defaultLanguage="html"
                    value={watchAll.body_html}
                    onChange={(v) => form.setValue('body_html', v ?? '')}
                    onMount={(editor) => {
                      bodyEditorRef.current = editor
                    }}
                    options={{
                      minimap: { enabled: false },
                      wordWrap: 'on'
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <TemplatePreviewPane
            bodyHtml={previewMut.data?.body_html ?? ''}
            subject={previewMut.data?.subject ?? ''}
            bodyText={previewMut.data?.body_text}
            sampleJson={sampleJson}
            onSampleChange={setSampleJson}
            onRefresh={handlePreview}
            loading={previewMut.isPending}
          />
        </div>
      </form>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate(PATHS.app.adminEmails.templates)}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={form.handleSubmit((d) => onSubmit(d, { thenTestSend: true }))}
          disabled={createMut.isPending || updateMut.isPending || testSendMut.isPending}
        >
          Salvar e enviar teste
        </Button>
        <Button
          type="button"
          onClick={form.handleSubmit((d) => onSubmit(d))}
          disabled={createMut.isPending || updateMut.isPending}
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
