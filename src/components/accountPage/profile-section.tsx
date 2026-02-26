import { useState, useEffect } from 'react'
import { UserCircle, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { useButtonState } from '@/hooks/useButtonState'
import { toast } from 'sonner'
import type { User } from '@/models/user'

export function ProfileSection({ user }: { user: User | undefined }) {
  const [name, setName] = useState('')
  const [cellphone, setCellphone] = useState('')
  const [tax, setTax] = useState('')

  const updateProfile = useUpdateProfile()
  const {
    buttonState,
    setLoading,
    setSuccess,
    setError: setBtnError,
    isDisabled
  } = useButtonState()

  useEffect(() => {
    if (user) {
      setName(user.user_name ?? '')
      setCellphone(user.cellphone ?? '')
      setTax(user.tax ?? '')
    }
  }, [user])

  const handleSave = () => {
    setLoading()
    updateProfile.mutate(
      {
        user_name: name,
        cellphone: cellphone || undefined,
        tax: tax || undefined
      },
      {
        onSuccess: () => {
          setSuccess()
          toast.success('Perfil atualizado com sucesso!')
        },
        onError: () => {
          setBtnError()
          toast.error('Erro ao atualizar perfil. Tente novamente.')
        }
      }
    )
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
      </CardContent>
      <CardFooter>
        <Button
          variant={buttonState === 'success' ? 'outline' : 'glow'}
          onClick={handleSave}
          disabled={isDisabled || !name.trim()}
          className={
            buttonState === 'success' ? 'animate-success-flash border-primary/50 text-primary' : ''
          }
        >
          {buttonState === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : buttonState === 'success' ? (
            <>
              <CheckCircle className="size-4" />
              Salvo!
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
