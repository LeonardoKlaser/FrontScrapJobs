import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, SkeletonCard, SkeletonTable } from './skeleton'

const meta = {
  title: 'Common/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    className: 'h-4 w-48'
  }
}

export const Card: Story = {
  render: () => <SkeletonCard />
}

export const Table: Story = {
  render: () => <SkeletonTable />
}

export const TableCustomRows: Story = {
  render: () => <SkeletonTable rows={5} />
}
