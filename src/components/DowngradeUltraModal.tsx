import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DowngradeUltraModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
}

// DowngradeUltraModal exige confirmação explícita antes de trocar um user
// Ultra para um plano não-Ultra (ex.: Profissional). Sair do Ultra desliga a
// cobertura automática de vagas (ver ListSites.tsx/isUltraMode) — o user
// precisa entender isso antes de confirmar. Ver plan-section.tsx pro gate
// currentPlan.is_ultra && !targetPlan.is_ultra que abre esse modal.
export function DowngradeUltraModal({
  open,
  onConfirm,
  onCancel,
  isConfirming = false
}: DowngradeUltraModalProps) {
  const { t } = useTranslation('account')

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ultra.downgrade.title')}</DialogTitle>
          <DialogDescription>{t('ultra.downgrade.body')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isConfirming}>
            {t('ultra.downgrade.cancel')}
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isConfirming}>
            {t('ultra.downgrade.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
