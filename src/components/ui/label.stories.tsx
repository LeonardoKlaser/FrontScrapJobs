import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from './input'

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Rótulo acessível para campos de formulário.'
      }
    }
  }
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Nome completo'
  }
}

export const WithRequired: Story = {
  render: () => (
    <Label>
      E-mail <span className="text-destructive">*</span>
    </Label>
  )
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">E-mail</Label>
      <Input type="email" id="email" placeholder="seu@email.com" />
    </div>
  )
}
