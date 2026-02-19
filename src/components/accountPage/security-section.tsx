import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordInput } from '@/validators/changePassword'
import { useChangePassword } from '@/hooks/useChangePassword'

export function SecuritySection() {
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = (data: ChangePasswordInput) => {
    changePassword.mutate(
      { old_password: data.old_password, new_password: data.new_password },
      { onSuccess: () => reset() }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old_password">Senha Atual</Label>
            <Input id="old_password" type="password" {...register('old_password')} />
            {errors.old_password && (
              <p className="text-sm text-destructive">{errors.old_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">Nova Senha</Label>
            <Input id="new_password" type="password" {...register('new_password')} />
            {errors.new_password && (
              <p className="text-sm text-destructive">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
            <Input id="confirm_password" type="password" {...register('confirm_password')} />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>

          {changePassword.isSuccess && (
            <p className="text-sm text-green-500">Senha alterada com sucesso!</p>
          )}
          {changePassword.isError && (
            <p className="text-sm text-destructive">Senha atual incorreta. Tente novamente.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
