import type { ReactNode } from 'react'

type Props = {
  title: string
  children?: ReactNode
}

export function AppPageHeader({ title, children }: Props) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border/40
                 bg-background/80 backdrop-blur-md"
    >
      <div
        className="mx-auto flex h-14 max-w-7xl items-center gap-3
                   px-4 pl-14 sm:pl-6 lg:pl-8 sm:px-6 lg:px-8"
      >
        <h1 className="text-base font-semibold truncate">{title}</h1>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  )
}
