import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { Plus, Loader2, Send, Trash2, ArrowRight } from 'lucide-react'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'glow']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    },
    disabled: { control: 'boolean' },
    asChild: { control: 'boolean' }
  }
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Botao'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="flex flex-col items-center gap-2">
        <Button variant="default">Padrao</Button>
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="destructive">Destrutivo</Button>
        <span className="text-xs text-muted-foreground">destructive</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="outline">Contorno</Button>
        <span className="text-xs text-muted-foreground">outline</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="secondary">Secundario</Button>
        <span className="text-xs text-muted-foreground">secondary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="ghost">Fantasma</Button>
        <span className="text-xs text-muted-foreground">ghost</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="link">Link</Button>
        <span className="text-xs text-muted-foreground">link</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button variant="glow">Brilho</Button>
        <span className="text-xs text-muted-foreground">glow</span>
      </div>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Button size="sm">Pequeno</Button>
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="default">Padrao</Button>
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="lg">Grande</Button>
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="icon">
          <Plus />
        </Button>
        <span className="text-xs text-muted-foreground">icon</span>
      </div>
    </div>
  )
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>
        <Plus />
        Adicionar
      </Button>
      <Button variant="destructive">
        <Trash2 />
        Excluir
      </Button>
      <Button variant="outline">
        Enviar
        <Send />
      </Button>
      <Button variant="secondary">
        Proximo
        <ArrowRight />
      </Button>
    </div>
  )
}

export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <Loader2 className="animate-spin" />
        Carregando...
      </Button>
      <Button variant="outline" disabled>
        <Loader2 className="animate-spin" />
        Salvando...
      </Button>
    </div>
  )
}

export const GlowEffect: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-8">
      <Button variant="glow" size="lg">
        Comecar agora
        <ArrowRight />
      </Button>
      <p className="text-sm text-muted-foreground">Passe o mouse para ver o efeito de brilho</p>
    </div>
  )
}
