import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, type ChangePasswordInput } from '@/validators/changePassword'
import { useChangePassword } from '@/hooks/useChangePassword'
import { useButtonState } from '@/hooks/useButtonState'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function SecuritySection() {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()
  const changePassword = useChangePassword()
  const {
    buttonState,
    setLoading,
    setSuccess,
    setError: setBtnError,
    isDisabled
  } = useButtonState()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = (data: ChangePasswordInput) => {
    setLoading()
    changePassword.mutate(
      { old_password: data.old_password, new_password: data.new_password },
      {
        onSuccess: () => {
          setSuccess()
          toast.success(t('security.changeSuccess'))
          reset()
        },
        onError: () => {
          setBtnError()
          toast.error(t('security.wrongPassword'))
        }
      }
    )
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await authService.deleteAccount(deletePassword)
      try {
        await authService.logout()
      } catch {
        /* best-effort: account already deleted */
      }
      queryClient.clear()
      window.location.href = '/'
    } catch (err) {
      setDeleteError(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : t('security.deleteError', 'Erro ao excluir conta')
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('security.title')}</CardTitle>
              <CardDescription>{t('security.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old_password">{t('security.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="old_password"
                    type={showOldPassword ? 'text' : 'password'}
                    className="pr-10"
                    {...register('old_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.old_password && (
                  <p className="text-xs text-destructive">{errors.old_password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">{t('security.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    className="pr-10"
                    {...register('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-xs text-destructive">{errors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">{t('security.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pr-10"
                    {...register('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              variant={buttonState === 'success' ? 'outline' : 'glow'}
              type="submit"
              disabled={isDisabled}
              className={
                buttonState === 'success'
                  ? 'animate-success-flash border-primary/50 text-primary'
                  : ''
              }
            >
              {buttonState === 'loading' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('security.changingButton')}
                </>
              ) : buttonState === 'success' ? (
                <>
                  <CheckCircle className="size-4" />
                  {t('security.changedButton')}
                </>
              ) : (
                t('security.changeButton')
              )}
            </Button>
          </CardFooter>
        </form>

        <div className="border-t border-destructive/20 pt-6 mt-8 px-6 pb-6">
          <h3 className="text-sm font-semibold text-destructive mb-2">
            {t('security.dangerZone', 'Zona de perigo')}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {t(
              'security.deleteWarning',
              'Ao excluir sua conta, seus dados serão desativados. Esta ação pode ser revertida em até 30 dias.'
            )}
          </p>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            {t('security.deleteAccount', 'Excluir minha conta')}
          </Button>
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security.confirmDelete', 'Confirmar exclusão de conta')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              'security.confirmDeleteMessage',
              'Digite sua senha para confirmar a exclusão da conta.'
            )}
          </p>
          <div className="relative">
            <Input
              type={showDeletePassword ? 'text' : 'password'}
              placeholder={t('security.passwordPlaceholder', 'Sua senha')}
              className="pr-10"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowDeletePassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteDialog(false)}>
              {t('security.cancel', 'Cancelar')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!deletePassword || deleteLoading}
              onClick={handleDeleteAccount}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('security.confirmDeleteBtn', 'Excluir conta')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
