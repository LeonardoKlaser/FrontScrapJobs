import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHeader } from './page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const meta = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    gradient: { control: 'boolean' }
  }
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Meu Painel'
  }
}

export const WithDescription: Story = {
  args: {
    title: 'Meu Painel',
    description: 'Gerencie suas vagas e curriculos'
  }
}

export const WithGradient: Story = {
  args: {
    title: 'Meu Painel',
    gradient: true
  }
}

export const WithoutGradient: Story = {
  args: {
    title: 'Meu Painel',
    gradient: false
  }
}

export const WithAction: Story = {
  render: () => (
    <PageHeader title="Meu Painel">
      <Button>
        <Plus />
        Adicionar novo
      </Button>
    </PageHeader>
  )
}
