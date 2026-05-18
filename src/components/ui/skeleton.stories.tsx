// Importado APENAS por src/components/ui/sidebar.tsx (animate-pulse, shadcn).
// Para skeletons no app (cards/tables/section loaders) use
// `@/components/common/skeleton` (animate-shimmer, custom). Divergência
// intencional: o sidebar usa o estilo padrão shadcn; o app mantém o estilo
// shimmer pré-existente.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Block: Story = {
  render: () => <Skeleton className="h-8 w-48" />
}

export const Circle: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />
}

export const Stack: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
