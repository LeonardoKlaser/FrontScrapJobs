import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionHeader } from './section-header'
import { Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'Common/SectionHeader',
  component: SectionHeader,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Vagas Recentes'
  }
}

export const WithIcon: Story = {
  args: {
    title: 'Vagas Recentes',
    icon: Briefcase
  }
}

export const WithChildren: Story = {
  render: () => (
    <SectionHeader title="Vagas Recentes">
      <Badge>12 novas</Badge>
    </SectionHeader>
  )
}
