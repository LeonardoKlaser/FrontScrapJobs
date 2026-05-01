import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  bodyHtml: string // already-rendered HTML from previewMut.data
  subject: string
  bodyText?: string
  sampleJson: string
  onSampleChange: (next: string) => void
  onRefresh: () => void
  loading?: boolean
}

export function TemplatePreviewPane({
  bodyHtml,
  subject,
  bodyText,
  sampleJson,
  onSampleChange,
  onRefresh,
  loading
}: Props) {
  const [showSample, setShowSample] = useState(false)
  const [showText, setShowText] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Preview</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSample(!showSample)}
          >
            {showSample ? 'Ocultar sample' : 'Editar sample'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? 'Renderizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>
      {showSample && (
        <Textarea
          value={sampleJson}
          onChange={(e) => onSampleChange(e.target.value)}
          rows={6}
          className="font-mono text-xs"
          placeholder="{}"
        />
      )}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Subject:</p>
          <p className="text-sm font-medium mb-3">{subject}</p>
          <iframe
            srcDoc={bodyHtml}
            sandbox="allow-same-origin"
            className="w-full h-96 border-0 bg-white"
            title="Email preview"
          />
          {bodyText && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setShowText(!showText)}
              >
                {showText ? 'Ocultar plain text' : 'Ver plain text'}
              </Button>
              {showText && (
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-48">
                  {bodyText}
                </pre>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
