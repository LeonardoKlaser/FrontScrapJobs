import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' }
  }
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Digite sua mensagem...'
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    )
  ]
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label htmlFor="bio" className="text-sm font-medium">
        Sobre voce
      </label>
      <Textarea id="bio" placeholder="Conte um pouco sobre sua experiencia profissional..." />
      <p className="text-xs text-muted-foreground">Maximo de 500 caracteres.</p>
    </div>
  )
}

export const AutoResize: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <label htmlFor="auto" className="text-sm font-medium">
        Redimensionamento automatico
      </label>
      <Textarea
        id="auto"
        placeholder="Digite varias linhas para ver o campo crescer automaticamente..."
        defaultValue={
          'Este textarea usa field-sizing-content.\n\n' +
          'Conforme voce digita mais conteudo,\n' +
          'o campo cresce automaticamente para\n' +
          'acomodar o texto sem barra de rolagem.'
        }
      />
      <p className="text-xs text-muted-foreground">
        O campo se ajusta ao conteudo com field-sizing-content.
      </p>
    </div>
  )
}
