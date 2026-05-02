import type { Meta, StoryObj } from '@storybook/react-vite'
import { CampaignProgressBar } from './CampaignProgressBar'

const meta = {
  title: 'AdminEmails/CampaignProgressBar',
  component: CampaignProgressBar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof CampaignProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { sent: 0, failed: 0, recipient: null }
}

export const Starting: Story = {
  args: { sent: 0, failed: 0, recipient: 100 }
}

export const Partial: Story = {
  args: { sent: 42, failed: 0, recipient: 100 }
}

export const WithFailures: Story = {
  args: { sent: 80, failed: 15, recipient: 100 }
}

export const Complete: Story = {
  args: { sent: 100, failed: 0, recipient: 100 }
}
