import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'AdminEmails/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled']
    }
  }
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: { status: 'draft' }
}

export const Scheduled: Story = {
  args: { status: 'scheduled' }
}

export const Sending: Story = {
  args: { status: 'sending' }
}

export const Sent: Story = {
  args: { status: 'sent' }
}

export const Failed: Story = {
  args: { status: 'failed' }
}

export const Canceled: Story = {
  args: { status: 'canceled' }
}

export const AllVariants: Story = {
  args: { status: 'draft' },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="draft" />
        <span className="text-xs text-muted-foreground">draft</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="scheduled" />
        <span className="text-xs text-muted-foreground">scheduled</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="sending" />
        <span className="text-xs text-muted-foreground">sending</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="sent" />
        <span className="text-xs text-muted-foreground">sent</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="failed" />
        <span className="text-xs text-muted-foreground">failed</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusBadge status="canceled" />
        <span className="text-xs text-muted-foreground">canceled</span>
      </div>
    </div>
  )
}
