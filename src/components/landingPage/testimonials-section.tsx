import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { SectionWrapper } from './section-wrapper'

// Whitespace convention pra renderização correta: body1 deve terminar com
// espaço quando body2Bold começa com letra/dígito; body3 (opcional) deve
// começar com espaço ou pontuação (sem quebrar contexto de quem for traduzir).
interface TestimonialItem {
  name: string
  role: string
  body1: string
  body2Bold: string
  body3?: string
  date: string
  badge: string
  badgeVariant: 'hired' | 'interviewing'
}

function TestimonialCard({
  item,
  index,
  ratingLabel
}: {
  item: TestimonialItem
  index: number
  ratingLabel: string
}) {
  const initial = item.name.charAt(0).toUpperCase()
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white border-t-[3px] border-emerald-500 rounded-xl shadow-md p-6 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br from-emerald-500 to-teal-500',
            'text-white font-bold text-lg'
          )}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 m-0 truncate">{item.name}</p>
          <p className="text-xs text-zinc-500 m-0 truncate">{item.role}</p>
        </div>
      </div>

      <div className="flex gap-0.5 mb-3">
        <span className="sr-only">{ratingLabel}</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
        ))}
      </div>

      <p className="text-sm text-zinc-700 leading-relaxed mb-4 flex-1">
        {item.body1}
        <strong className="text-zinc-900">{item.body2Bold}</strong>
        {item.body3}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
        <span className="text-xs text-zinc-400">{item.date}</span>
        <span
          className={cn(
            'px-2 py-1 rounded-md text-xs font-semibold text-white',
            item.badgeVariant === 'hired' ? 'bg-emerald-500' : 'bg-amber-500'
          )}
        >
          {item.badge}
        </span>
      </div>
    </motion.article>
  )
}

export function TestimonialsSection() {
  const { t, i18n } = useTranslation('landing')
  const raw = t('testimonials.items', { returnObjects: true })
  const items: TestimonialItem[] = Array.isArray(raw) ? (raw as TestimonialItem[]) : []
  const isMalformed = !Array.isArray(raw)
  useEffect(() => {
    if (isMalformed) {
      console.warn(
        `[TestimonialsSection] testimonials.items missing or invalid in locale "${i18n.language}"`
      )
    }
  }, [isMalformed, i18n.language])

  return (
    <SectionWrapper className="py-20 lg:py-28 px-4 sm:px-6 bg-zinc-50" id="testimonials">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-xs tracking-[0.15em] uppercase text-emerald-500 font-semibold">
            {t('testimonials.eyebrow')}
          </span>
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-zinc-900 mt-3 text-balance">
            {t('testimonials.headline')}{' '}
            <span className="text-gradient-primary">{t('testimonials.headlineGradient')}</span>
          </h2>
          <p className="mt-4 text-base text-zinc-500 max-w-xl mx-auto">{t('testimonials.sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <TestimonialCard
              key={item.name}
              item={item}
              index={i}
              ratingLabel={t('testimonials.rating')}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
