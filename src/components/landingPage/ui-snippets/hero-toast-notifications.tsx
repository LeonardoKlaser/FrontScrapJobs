import { LogoMark } from '@/components/common/logo'

const TOAST_DATA = [
  {
    company: 'Nubank',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/1630b6e3-7956-4677-85e2-f92b34a01364.png',
    title: 'Senior Frontend Developer',
    location: 'Nubank · São Paulo · Remoto',
    time: 'agora',
    hasActions: true,
    top: 'top-0',
    left: 'left-[30px] lg:left-[10px]',
    zIndex: 'z-[4]',
    opacity: 1,
    borderClass: 'border-emerald-300',
    delay: '[animation-delay:0ms]',
  },
  {
    company: 'iFood',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/373e4794-7189-489a-8844-7df3273d2322.jpeg',
    title: 'Product Designer Pleno',
    location: 'iFood · Campinas · Híbrido',
    time: '1 min atrás',
    hasActions: false,
    top: 'top-[160px]',
    left: 'left-[30px] lg:left-[40px]',
    zIndex: 'z-[3]',
    opacity: 0.8,
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:200ms]',
  },
  {
    company: 'Mercado Livre',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/86f7f791-9cbd-4996-90ea-163429386d12.png',
    title: 'Data Engineer Senior',
    location: 'Mercado Livre · São Paulo',
    time: '3 min atrás',
    hasActions: false,
    top: 'top-[290px]',
    left: 'left-[30px] lg:left-0',
    zIndex: 'z-[2]',
    opacity: 0.5,
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:400ms]',
  },
  {
    company: 'Itaú',
    logoUrl:
      'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/aec1db60-75d9-4d6b-923d-fd87d0eaa1a5.png',
    title: 'Backend Engineer',
    location: 'Itaú · São Paulo',
    time: '5 min atrás',
    hasActions: false,
    top: 'top-[390px]',
    left: 'left-[30px] lg:left-[30px]',
    zIndex: 'z-[1]',
    opacity: 0.25,
    borderClass: 'border-zinc-200',
    delay: '[animation-delay:600ms]',
  },
] as const

export function HeroToastNotifications() {
  return (
    <div
      className="relative w-[400px] h-[480px] mx-auto lg:ml-auto lg:mr-[200px] scale-75 md:scale-[0.85] lg:scale-100 origin-top"
      aria-hidden="true"
      role="presentation"
    >
      {TOAST_DATA.map((toast) => (
        <div
          key={toast.company}
          className={`absolute animate-slide-in-from-top ${toast.top} ${toast.left} ${toast.zIndex} ${toast.delay}`}
        >
          <div
            className={`w-[340px] bg-white border ${toast.borderClass} rounded-[14px] p-3.5 shadow-lg`}
            style={{ opacity: toast.opacity }}
          >
            {/* Toast header — ScrapJobs branding + timestamp */}
            <div className="flex items-center gap-2 mb-2">
              <LogoMark size={28} className="rounded-lg" />
              <span className="text-[11px] font-bold text-emerald-500">ScrapJobs</span>
              <span className="text-[10px] text-zinc-400 ml-auto">{toast.time}</span>
            </div>

            {/* Toast body — company logo + job info */}
            <div className="flex items-center gap-2.5">
              <img
                src={toast.logoUrl}
                alt={toast.company}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <div>
                <p className="text-[13px] font-semibold text-zinc-900">
                  Nova vaga: {toast.title}
                </p>
                <p className="text-[11px] text-zinc-500">{toast.location}</p>
              </div>
            </div>

            {/* Action buttons — only on first toast */}
            {toast.hasActions && (
              <div className="flex gap-1.5 mt-2.5">
                <span className="flex-1 py-1.5 rounded-md border border-emerald-500 bg-white text-emerald-600 text-[11px] font-semibold text-center">
                  🤖 Analisar com IA
                </span>
                <span className="flex-1 py-1.5 rounded-md bg-emerald-500 text-white text-[11px] font-semibold text-center">
                  ✓ Apliquei
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
