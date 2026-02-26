import { ShieldCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordInput } from '@/validators/changePassword'
import { useChangePassword } from '@/hooks/useChangePassword'
import { StatusFeedback } from '@/components/common/status-feedback'

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
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Alterar Senha</CardTitle>
            <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Senha Atual</Label>
              <Input id="old_password" type="password" {...register('old_password')} />
              {errors.old_password && (
                <p className="text-xs text-destructive">{errors.old_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Nova Senha</Label>
              <Input id="new_password" type="password" {...register('new_password')} />
              {errors.new_password && (
                <p className="text-xs text-destructive">{errors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
              <Input id="confirm_password" type="password" {...register('confirm_password')} />
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          {changePassword.isSuccess && (
            <StatusFeedback variant="success" message="Senha alterada com sucesso!" />
          )}
          {changePassword.isError && (
            <StatusFeedback variant="error" message="Senha atual incorreta. Tente novamente." />
          )}
        </CardContent>
        <CardFooter>
          <Button variant="glow" type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
