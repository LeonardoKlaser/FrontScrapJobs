import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './spinner'
import { Button } from './button'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Indicador de carregamento animado.'
      }
    }
  }
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomSize: Story = {
  args: {
    className: 'size-8'
  }
}

export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner className="text-primary-foreground" />
      Carregando...
    </Button>
  )
}
