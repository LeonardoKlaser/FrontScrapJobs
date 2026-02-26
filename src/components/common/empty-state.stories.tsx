import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './empty-state'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' }
  }
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: SearchX,
    title: 'Nenhuma vaga encontrada'
  }
}

export const WithDescription: Story = {
  args: {
    icon: SearchX,
    title: 'Nenhuma vaga encontrada',
    description: 'Tente ajustar seus filtros de busca'
  }
}

export const WithAction: Story = {
  render: () => (
    <EmptyState
      icon={SearchX}
      title="Nenhuma vaga encontrada"
      description="Tente ajustar seus filtros de busca"
      action={<Button>Explorar empresas</Button>}
    />
  )
}
