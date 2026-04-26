import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Bell, BrainCircuit, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionWrapper } from './section-wrapper'

const steps = [
  {
    number: '01',
    icon: FileText,
    titleKey: 'howItWorksNew.step1Title',
    descKey: 'howItWorksNew.step1Description',
    gradient: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-300',
    iconColor: 'text-emerald-500',
    numberColor: 'text-emerald-500'
  },
  {
    number: '02',
    icon: Bell,
    titleKey: 'howItWorksNew.step2Title',
    descKey: 'howItWorksNew.step2Description',
    gradient: 'from-emerald-100 to-emerald-200',
    border: 'border-emerald-400',
    iconColor: 'text-emerald-600',
    numberColor: 'text-emerald-500'
  },
  {
    number: '03',
    icon: BrainCircuit,
    titleKey: 'howItWorksNew.step3Title',
    descKey: 'howItWorksNew.step3Description',
    gradient: 'from-emerald-200 to-emerald-300',
    border: 'border-emerald-400',
    iconColor: 'text-emerald-700',
    numberColor: 'text-emerald-500'
  },
  {
    number: '04',
    icon: Download,
    titleKey: 'howItWorksNew.step4Title',
    descKey: 'howItWorksNew.step4Description',
    gradient: '',
    border: '',
    iconColor: 'text-white',
    numberColor: 'text-cyan-500',
    solid: true
  }
]

function Connector({ variant }: { variant: number }) {
  const colors = [
    { from: '#a7f3d0', to: '#10b981' },
    { from: '#10b981', to: '#10b981' },
    { from: '#10b981', to: '#06b6d4' }
  ]
  const { from, to } = colors[variant - 1] ?? colors[0]

  return (
    <div className="hidden lg:flex items-center shrink-0" style={{ paddingTop: '1.5rem' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.4 + variant * 0.2 }}
        className="w-10 h-px origin-left"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
      />
      <svg width="8" height="8" viewBox="0 0 8 8" fill={to}>
        <polygon points="0,0 8,4 0,8" />
      </svg>
    </div>
  )
}

export function HowItWorksSection() {
  const { t } = useTranslation('landing')

  return (
    <SectionWrapper id="howItWorks">
      <div className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 font-semibold">
              {t('howItWorksNew.overline')}
            </span>
            <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-zinc-900 mt-3 leading-[1.1]">
              {t('howItWorksNew.headline')}
              <br />
              <span className="text-gradient-primary">{t('howItWorksNew.headlineGradient')}</span>
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 lg:gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="flex flex-col items-center text-center flex-1 max-w-[200px] mx-auto lg:mx-0"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      step.solid
                        ? 'shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                        : `bg-gradient-to-br ${step.gradient} ${step.border} border shadow-[0_4px_12px_rgba(16,185,129,0.1)]`
                    }`}
                    style={
                      step.solid
                        ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)' }
                        : undefined
                    }
                  >
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <span className={`text-[0.7rem] font-bold font-mono ${step.numberColor}`}>
                    {step.number}
                  </span>
                  <h3 className="font-display text-sm font-bold text-zinc-900 mt-1.5">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">{t(step.descKey)}</p>
                </motion.div>
                {i < steps.length - 1 && <Connector variant={i + 1} />}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              variant="glow"
              size="lg"
              onClick={() =>
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t('howItWorksNew.cta')}
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
