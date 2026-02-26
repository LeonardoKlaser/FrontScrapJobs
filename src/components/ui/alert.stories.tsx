import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircle, Terminal } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Exibe uma mensagem de alerta com variantes de estilo.'
      }
    }
  }
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <Terminal className="size-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>
        Esta é uma mensagem de alerta padrão para informar o usuário.
      </AlertDescription>
    </Alert>
  )
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Ocorreu um erro ao processar sua solicitação. Tente novamente.
      </AlertDescription>
    </Alert>
  )
}

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="size-4" />
      <AlertTitle>Informação</AlertTitle>
      <AlertDescription>Seu currículo foi atualizado com sucesso.</AlertDescription>
    </Alert>
  )
}
