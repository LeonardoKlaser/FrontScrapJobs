import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './switch'
import { Label } from './label'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Interruptor de alternância para configurações booleanas.'
      }
    }
  }
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notificacoes" />
      <Label htmlFor="notificacoes">Ativar notificações</Label>
    </div>
  )
}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}
