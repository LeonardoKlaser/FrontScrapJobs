import { detectBrand } from '@/lib/cardBrand'

interface CardPreviewProps {
  cardNumber: string
  holderName: string
  expDate: string
  cvv: string
  cvvFocused: boolean
}

function formatNumberDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16).padEnd(16, '•')
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits
}

const BRAND_LABEL: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  elo: 'ELO',
  hipercard: 'HIPERCARD'
}

function brandLabel(b: string | null): string {
  if (!b) return ''
  return BRAND_LABEL[b] ?? ''
}

export function CardPreview({
  cardNumber,
  holderName,
  expDate,
  cvv,
  cvvFocused
}: CardPreviewProps) {
  const brand = detectBrand(cardNumber)
  const displayName = (holderName || 'NOME NO CARTÃO').toUpperCase().slice(0, 24)
  const displayExp = expDate || 'MM/AA'
  const displayNumber = formatNumberDisplay(cardNumber)
  // Amex usa CVV de 4 dígitos; resto usa 3.
  const cvvLen = brand === 'amex' ? 4 : 3
  const displayCvv = cvv.padEnd(cvvLen, '•').slice(0, cvvLen)

  return (
    <div
      className="relative w-full max-w-sm mx-auto"
      style={{ aspectRatio: '1.586 / 1', perspective: '1200px' }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: cvvFocused ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between text-white shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)'
          }}
        >
          <div>
            <div
              className="w-10 h-7 rounded"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}
            />
          </div>
          <div className="font-mono text-xl tracking-widest">{displayNumber}</div>
          <div className="flex items-end justify-between text-[10px] uppercase tracking-widest opacity-80">
            <div>
              <div>Titular</div>
              <div className="font-mono text-sm mt-0.5 normal-case tracking-normal">
                {displayName}
              </div>
            </div>
            <div className="text-right">
              <div>Validade</div>
              <div className="font-mono text-sm mt-0.5 normal-case tracking-normal">
                {displayExp}
              </div>
            </div>
          </div>
          <div className="absolute right-4 top-4 text-xs font-extrabold italic opacity-90">
            {brandLabel(brand)}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl flex flex-col text-white shadow-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)'
          }}
        >
          <div className="h-10 mt-6 bg-black" />
          <div className="px-5 py-4 flex items-center justify-end">
            <div className="bg-white text-black font-mono px-3 py-1 rounded">{displayCvv}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
