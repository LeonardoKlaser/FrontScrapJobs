import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente de avatar com suporte a imagem e fallback de iniciais.'
      }
    }
  }
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="Foto do usuário" />
      <AvatarFallback>SC</AvatarFallback>
    </Avatar>
  )
}

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>ES</AvatarFallback>
    </Avatar>
  )
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-8">
        <AvatarFallback>P</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>G</AvatarFallback>
      </Avatar>
    </div>
  )
}
