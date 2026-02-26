import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog'
import { Button } from './button'
import { Input } from './input'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir dialogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Titulo do dialogo</DialogTitle>
          <DialogDescription>
            Esta e uma descricao explicando o proposito deste dialogo. Voce pode incluir qualquer
            informacao relevante aqui.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Adicionar site</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar novo site</DialogTitle>
          <DialogDescription>
            Insira a URL da pagina de carreiras que deseja monitorar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="site-name" className="text-sm font-medium">
              Nome do site
            </label>
            <Input id="site-name" placeholder="Ex: Nubank Carreiras" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="site-url" className="text-sm font-medium">
              URL da pagina
            </label>
            <Input id="site-url" type="url" placeholder="https://carreiras.exemplo.com" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Excluir conta</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Esta acao nao pode ser desfeita. Todos os seus dados serao permanentemente removidos dos
            nossos servidores.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Sim, excluir conta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
