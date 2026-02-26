import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusFeedback } from './status-feedback'

const meta = {
  title: 'Common/StatusFeedback',
  component: StatusFeedback,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error']
    },
    message: { control: 'text' }
  }
} satisfies Meta<typeof StatusFeedback>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Perfil atualizado com sucesso!'
  }
}

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'Erro ao salvar alteracoes. Tente novamente.'
  }
}
