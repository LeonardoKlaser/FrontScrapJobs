import { useTranslation } from 'react-i18next'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

export function HeroSection() {
  const { t } = useTranslation('landing')

  const handleCtaClick = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-[180px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center md:text-left"
        >
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-zinc-900 text-balance"
          >
            {t('hero.headline1')}{' '}
            <span className="text-gradient-primary">{t('hero.headline2')}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg text-zinc-600 max-w-xl mx-auto md:mx-0 leading-relaxed"
          >
            {t('hero.subheading')}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
          >
            <Button
              variant="glow"
              size="lg"
              className="px-8 py-4 text-base font-semibold rounded-lg animate-pulse-glow w-full sm:w-auto"
              onClick={handleCtaClick}
            >
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center gap-3 justify-center md:justify-start"
          >
            <div className="flex">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="inline-block w-7 h-7 rounded-full border-2 border-white"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    marginLeft: i === 0 ? 0 : -8
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-zinc-500">{t('hero.socialProof')}</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="relative w-full"
        >
          <div className="relative mx-auto max-w-[560px]">
            <img
              src="/dashboard_mockup.png"
              alt={t('hero.dashboardAlt')}
              loading="eager"
              className="w-full"
            />
            <motion.img
              src="/analysis_mockup_cel.png"
              alt={t('hero.mobileAlt')}
              loading="eager"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -left-8 sm:-left-12 lg:-left-16 top-1/3 w-[35%] animate-float"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
