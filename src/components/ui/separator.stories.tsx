import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator
}
export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <div>Acima</div>
      <Separator />
      <div>Abaixo</div>
    </div>
  )
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-3">
      <span>Esquerda</span>
      <Separator orientation="vertical" />
      <span>Direita</span>
    </div>
  )
}
