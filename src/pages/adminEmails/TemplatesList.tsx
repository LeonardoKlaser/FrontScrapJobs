import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  useEmailTemplates,
  useDeleteEmailTemplate,
  useUpdateEmailTemplate
} from '@/hooks/useEmailTemplates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PATHS } from '@/router/paths'
import { extractApiError } from '@/lib/extractApiError'
import { DeleteConfirmDialog } from '@/components/admin-emails/DeleteConfirmDialog'

export default function TemplatesList() {
  const { t } = useTranslation('admin-emails')
  const { data, isLoading, isError, error, refetch } = useEmailTemplates()
  const deleteMut = useDeleteEmailTemplate()
  const updateMut = useUpdateEmailTemplate()
  const [search, setSearch] = useState('')
  // statusFilter cobre o gap do spec §6.2 (filtro de status). 'all' default.
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [pendingDelete, setPendingDelete] = useState<{ id: number; key: string } | null>(null)

  const filtered = (data ?? []).filter((t) => {
    const q = search.toLowerCase()
    const matchesText =
      t.key.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && t.is_active) ||
      (statusFilter === 'inactive' && !t.is_active)
    return matchesText && matchesStatus
  })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteMut.mutateAsync(pendingDelete.id)
      setPendingDelete(null)
    } catch {
      // Hook propaga toast; mantém dialog aberto pra admin tentar de novo.
    }
  }

  // toggleActive permite admin ativar/desativar inline sem abrir o editor —
  // requirement do spec §6.2 ("is_active toggle"). O backend aceita Update
  // com record inteiro (não merge), então enviamos o tpl completo da lista
  // com is_active flipado pra evitar zerar subject/body_html/etc.
  const toggleActive = (tpl: import('@/models/email').EmailTemplate) => {
    updateMut.mutate({ id: tpl.id, input: { ...tpl, is_active: !tpl.is_active } })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('templates.title')}</h1>
        <Button asChild>
          <Link to={PATHS.app.adminEmails.templateNew}>{t('templates.createButton')}</Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por key, nome ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-1">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Inativos'}
            </Button>
          ))}
        </div>
      </div>
      <Card>
        {isLoading ? (
          <div className="p-6 text-muted-foreground">Carregando...</div>
        ) : isError ? (
          <div className="p-6 space-y-3">
            <p className="text-sm text-destructive">
              {extractApiError(error, 'Erro ao carregar templates')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">Key</th>
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Descrição</th>
                <th className="p-3 font-medium">Locale</th>
                <th className="p-3 font-medium">Ativo</th>
                <th className="p-3 font-medium">Atualizado</th>
                <th className="p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tpl) => (
                <tr key={tpl.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-mono text-sm">{tpl.key}</td>
                  <td className="p-3">{tpl.name}</td>
                  <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                    {tpl.description ?? '—'}
                  </td>
                  <td className="p-3">{tpl.locale}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(tpl)}
                      disabled={updateMut.isPending}
                      title={tpl.is_active ? 'Desativar' : 'Ativar'}
                      className="cursor-pointer disabled:opacity-50"
                    >
                      <Badge variant={tpl.is_active ? 'default' : 'secondary'}>
                        {tpl.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(tpl.updated_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={PATHS.app.adminEmails.templateEdit(tpl.id)}>Editar</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete({ id: tpl.id, key: tpl.key })}
                      disabled={deleteMut.isPending}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Nenhum template encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
      <DeleteConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Deletar template "${pendingDelete?.key ?? ''}"?`}
        description="Esta ação não pode ser desfeita. Subscribers/lifecycles que usam este template precisam ser desativados primeiro."
        loading={deleteMut.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
