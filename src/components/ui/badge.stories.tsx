import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { CheckCircle, AlertTriangle, Info, Star } from 'lucide-react'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline']
    }
  }
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col items-center gap-2">
        <Badge variant="default">Padrao</Badge>
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Badge variant="secondary">Secundario</Badge>
        <span className="text-xs text-muted-foreground">secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Badge variant="destructive">Destrutivo</Badge>
        <span className="text-xs text-muted-foreground">destructive</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Badge variant="outline">Contorno</Badge>
        <span className="text-xs text-muted-foreground">outline</span>
      </div>
    </div>
  )
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">
        <CheckCircle />
        Ativo
      </Badge>
      <Badge variant="destructive">
        <AlertTriangle />
        Erro
      </Badge>
      <Badge variant="secondary">
        <Info />
        Informacao
      </Badge>
      <Badge variant="outline">
        <Star />
        Destaque
      </Badge>
    </div>
  )
}

export const InContext: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Vaga de Emprego
          <Badge variant="default">Nova</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="default">
              <CheckCircle />
              Compativel
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prioridade</span>
            <Badge variant="destructive">Alta</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <Badge variant="outline">Remoto</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
