import type { Meta, StoryObj } from '@storybook/react-vite'
import { RegionChip } from './region-chip'

const meta = {
  title: 'UI/RegionChip',
  component: RegionChip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof RegionChip>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  args: {
    active: false,
    onClick: () => {},
    children: 'Brasil (12)'
  }
}

export const Active: Story = {
  args: {
    active: true,
    onClick: () => {},
    children: 'Brasil (12)'
  }
}

export const Group: Story = {
  args: {
    active: false,
    onClick: () => {},
    children: 'Brasil (12)'
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <RegionChip active onClick={() => {}}>
        Brasil (12)
      </RegionChip>
      <RegionChip active={false} onClick={() => {}}>
        EUA/Canada (8)
      </RegionChip>
      <RegionChip active={false} onClick={() => {}}>
        Europa (5)
      </RegionChip>
      <RegionChip active={false} onClick={() => {}}>
        Remoto (20)
      </RegionChip>
    </div>
  )
}
