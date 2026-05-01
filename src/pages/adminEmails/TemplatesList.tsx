import { useState } from 'react'
import { Link } from 'react-router'
import { useEmailTemplates, useDeleteEmailTemplate } from '@/hooks/useEmailTemplates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PATHS } from '@/router/paths'

export default function TemplatesList() {
  const { data, isLoading } = useEmailTemplates()
  const deleteMut = useDeleteEmailTemplate()
  const [search, setSearch] = useState('')

  const filtered = (data ?? []).filter((t) => {
    const q = search.toLowerCase()
    return t.key.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  })

  const handleDelete = (id: number, key: string) => {
    if (!confirm(`Deletar template "${key}"?`)) return
    deleteMut.mutate(id)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button asChild>
          <Link to={PATHS.app.adminEmails.templateNew}>Criar template</Link>
        </Button>
      </div>
      <Input
        placeholder="Buscar por key ou nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <Card>
        {isLoading ? (
          <div className="p-6 text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">Key</th>
                <th className="p-3 font-medium">Nome</th>
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
                  <td className="p-3">{tpl.locale}</td>
                  <td className="p-3">
                    <Badge variant={tpl.is_active ? 'default' : 'secondary'}>
                      {tpl.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
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
                      onClick={() => handleDelete(tpl.id, tpl.key)}
                      disabled={deleteMut.isPending}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Nenhum template encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
