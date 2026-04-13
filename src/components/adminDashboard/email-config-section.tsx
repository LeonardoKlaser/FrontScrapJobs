import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { useEmailConfig, useUpdateEmailConfig } from '@/hooks/useAdminDashboard'
import type { EmailProviderConfig } from '@/services/adminDashboardService'

export function EmailConfigSection() {
  const { data: configs, isLoading } = useEmailConfig()
  const updateMutation = useUpdateEmailConfig()
  const [localConfigs, setLocalConfigs] = useState<EmailProviderConfig[]>([])
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (configs) {
      setLocalConfigs([...configs].sort((a, b) => a.priority - b.priority))
      setIsDirty(false)
    }
  }, [configs])

  function toggleActive(providerName: string) {
    setLocalConfigs((prev) => {
      const updated = prev.map((c) =>
        c.provider_name === providerName ? { ...c, is_active: !c.is_active } : c
      )
      const activeCount = updated.filter((c) => c.is_active).length
      if (activeCount === 0) return prev
      return updated
    })
    setIsDirty(true)
  }

  function movePriority(index: number, direction: 'up' | 'down') {
    setLocalConfigs((prev) => {
      const arr = [...prev]
      const swapIdx = direction === 'up' ? index - 1 : index + 1
      if (swapIdx < 0 || swapIdx >= arr.length) return prev
      ;[arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]]
      return arr.map((c, i) => ({ ...c, priority: i + 1 }))
    })
    setIsDirty(true)
  }

  function handleSave() {
    updateMutation.mutate({
      providers: localConfigs.map((c) => ({
        provider_name: c.provider_name,
        is_active: c.is_active,
        priority: c.priority
      }))
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Carregando configuração de email...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <CardTitle className="text-lg">Provedores de Email</CardTitle>
          </div>
          {isDirty && (
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {localConfigs.map((config, index) => (
          <div
            key={config.provider_name}
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => movePriority(index, 'up')}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  onClick={() => movePriority(index, 'down')}
                  disabled={index === localConfigs.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{config.provider_name}</span>
                  {index === 0 && config.is_active && (
                    <Badge variant="default" className="text-xs">
                      Primário
                    </Badge>
                  )}
                  {index > 0 && config.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Fallback
                    </Badge>
                  )}
                  {!config.is_active && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Desativado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Switch
              checked={config.is_active}
              onCheckedChange={() => toggleActive(config.provider_name)}
            />
          </div>
        ))}

        {updateMutation.isSuccess && (
          <p className="text-sm text-primary mt-4">Configuração salva com sucesso.</p>
        )}
        {updateMutation.isError && (
          <p className="text-sm text-destructive mt-4">Erro ao salvar configuração.</p>
        )}
      </CardContent>
    </Card>
  )
}
