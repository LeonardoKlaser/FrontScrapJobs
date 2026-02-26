import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './dropdown-menu'

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Menu suspenso com suporte a itens, checkboxes e radio buttons.'
      }
    }
  }
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Abrir menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuItem>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithCheckbox: Story = {
  render: () => {
    const [showNotificacoes, setShowNotificacoes] = useState(true)
    const [showEmails, setShowEmails] = useState(false)
    const [showAlertas, setShowAlertas] = useState(true)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Preferências</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showNotificacoes}
            onCheckedChange={setShowNotificacoes}
          >
            Notificações push
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showEmails} onCheckedChange={setShowEmails}>
            E-mails
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showAlertas} onCheckedChange={setShowAlertas}>
            Alertas de vagas
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

export const WithRadio: Story = {
  render: () => {
    const [plano, setPlano] = useState('profissional')

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Selecionar plano</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Plano</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={plano} onValueChange={setPlano}>
            <DropdownMenuRadioItem value="iniciante">Iniciante</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="profissional">Profissional</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="premium">Premium</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}

export const DestructiveItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Opções</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Editar perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Excluir conta</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
