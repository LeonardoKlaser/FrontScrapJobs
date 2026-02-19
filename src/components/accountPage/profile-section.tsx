import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado. Entre em contato com o suporte se necessário.
            </p>
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
          <p className="text-sm text-green-500">Perfil atualizado com sucesso!</p>
        )}
        {updateProfile.isError && (
          <p className="text-sm text-destructive">Erro ao atualizar perfil. Tente novamente.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={updateProfile.isPending || !name.trim()}>
          {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  )
}
