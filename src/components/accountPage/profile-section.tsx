import { useState, useEffect } from 'react'
import { UserCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { StatusFeedback } from '@/components/common/status-feedback'
import type { User } from '@/models/user'

export function ProfileSection({ user }: { user: User | undefined }) {
  const [name, setName] = useState('')
  const [cellphone, setCellphone] = useState('')
  const [tax, setTax] = useState('')

  const updateProfile = useUpdateProfile()

  useEffect(() => {
    if (user) {
      setName(user.user_name ?? '')
      setCellphone(user.cellphone ?? '')
      setTax(user.tax ?? '')
    }
  }, [user])

  const handleSave = () => {
    updateProfile.mutate({
      user_name: name,
      cellphone: cellphone || undefined,
      tax: tax || undefined
    })
  }

  const initials = user?.user_name
    ? user.user_name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user?.user_name ? (
              <span className="text-lg font-semibold">{initials}</span>
            ) : (
              <UserCircle className="h-8 w-8" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.user_name || 'Usuário'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cellphone">Celular</Label>
            <Input
              id="cellphone"
              value={cellphone}
              onChange={(e) => setCellphone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">CPF</Label>
            <Input
              id="tax"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        {updateProfile.isSuccess && (
          <StatusFeedback variant="success" message="Perfil atualizado com sucesso!" />
        )}
        {updateProfile.isError && (
          <StatusFeedback variant="error" message="Erro ao atualizar perfil. Tente novamente." />
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="glow"
          onClick={handleSave}
          disabled={updateProfile.isPending || !name.trim()}
        >
          {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  )
}
