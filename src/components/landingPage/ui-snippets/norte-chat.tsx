import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type NorteMessage = {
  from: 'norte' | 'user'
  text: ReactNode
  pdf?: string
}

interface NorteChatProps {
  messages: NorteMessage[]
  showHeader?: boolean
  className?: string
}

export function NorteChat({ messages, showHeader = true, className }: NorteChatProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl shadow-lg', className)}>
      {showHeader && (
        <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2 text-white">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-sm"
            aria-hidden
          >
            🧭
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold">Norte</p>
            <p className="text-[10px] opacity-80">online</p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 bg-[#ECE5DD] p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm shadow-sm',
              m.from === 'norte'
                ? 'self-start rounded-tl-sm bg-white text-zinc-800'
                : 'self-end rounded-tr-sm bg-[#DCF8C6] text-zinc-800'
            )}
          >
            {m.text}
            {m.pdf && (
              <div
                className="mt-1 flex items-center gap-2 rounded-md bg-zinc-100 px-2 py-1
                  text-xs font-semibold text-zinc-700"
              >
                <span aria-hidden>📄</span>
                {m.pdf}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
