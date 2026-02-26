import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
} from './card'
import { Button } from './button'
import { Badge } from './badge'
import { MoreHorizontal, Briefcase, MapPin, Clock } from 'lucide-react'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const BasicCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Titulo do Card</CardTitle>
        <CardDescription>Uma descricao breve sobre o conteudo deste card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Este e o conteudo principal do card. Pode conter qualquer elemento.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Confirmar</Button>
      </CardFooter>
    </Card>
  )
}

export const WithAction: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card com Acao</CardTitle>
        <CardDescription>
          Este card possui um botao de acao no canto superior direito.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          O componente CardAction posiciona automaticamente o botao no canto.
        </p>
      </CardContent>
    </Card>
  )
}

export const HoverLift: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="hover-lift w-64 cursor-pointer">
        <CardHeader>
          <CardTitle>Hover aqui</CardTitle>
          <CardDescription>Card com efeito hover-lift</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Passe o mouse para ver o efeito de elevacao.
          </p>
        </CardContent>
      </Card>
      <Card className="hover-lift w-64 cursor-pointer">
        <CardHeader>
          <CardTitle>Outro card</CardTitle>
          <CardDescription>Tambem com hover-lift</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">A animacao usa translateY e sombra.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export const Composition: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>Desenvolvedor Frontend</CardTitle>
            <CardDescription>Empresa XYZ</CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="default">85% compativel</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            Sao Paulo, SP - Remoto
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            Publicado ha 2 dias
          </div>
          <div className="flex gap-2 pt-2">
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1">Ver detalhes</Button>
        <Button variant="outline">Salvar</Button>
      </CardFooter>
    </Card>
  )
}
