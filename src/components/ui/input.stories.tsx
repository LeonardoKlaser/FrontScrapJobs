import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'file', 'search']
    },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' }
  }
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Digite algo...'
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    )
  ]
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <label htmlFor="email" className="text-sm font-medium">
        E-mail
      </label>
      <Input id="email" type="email" placeholder="seu@email.com" />
      <p className="text-xs text-muted-foreground">Insira seu endereco de e-mail.</p>
    </div>
  )
}

export const WithError: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium">
        Nome completo
      </label>
      <Input id="name" placeholder="Seu nome" aria-invalid={true} defaultValue="ab" />
      <p className="text-xs text-destructive">O nome deve ter pelo menos 3 caracteres.</p>
    </div>
  )
}

export const FileInput: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <label htmlFor="file" className="text-sm font-medium">
        Curriculo
      </label>
      <Input id="file" type="file" accept=".pdf,.doc,.docx" />
      <p className="text-xs text-muted-foreground">Aceita PDF, DOC ou DOCX (max 5MB).</p>
    </div>
  )
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <label htmlFor="disabled" className="text-sm font-medium">
        Campo desabilitado
      </label>
      <Input id="disabled" placeholder="Nao editavel" defaultValue="Valor fixo" disabled />
    </div>
  )
}
