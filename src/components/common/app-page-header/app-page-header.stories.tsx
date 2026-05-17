import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppPageHeader } from './index'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const meta: Meta<typeof AppPageHeader> = {
  title: 'Common/AppPageHeader',
  component: AppPageHeader
}
export default meta
type Story = StoryObj<typeof AppPageHeader>

export const TitleOnly: Story = {
  args: { title: 'Início' }
}

export const WithAction: Story = {
  args: {
    title: 'Início',
    children: (
      <Button variant="outline" aria-label="Adicionar empresa">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar empresa</span>
      </Button>
    )
  }
}
