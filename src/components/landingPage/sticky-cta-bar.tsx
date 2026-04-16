import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StickyCtaBarProps {
  visible: boolean
}

export function StickyCtaBar({ visible }: StickyCtaBarProps) {
  const { t } = useTranslation('landing')

  const handleClick = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 bg-emerald-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-medium flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('stickyBar.message')}</span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="flex-shrink-0 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 font-semibold min-h-[40px]"
              onClick={handleClick}
            >
              {t('stickyBar.cta')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
