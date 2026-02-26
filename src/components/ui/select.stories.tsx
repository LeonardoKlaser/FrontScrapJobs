import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './select'

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Selecione uma opcao" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="frontend">Desenvolvedor Frontend</SelectItem>
        <SelectItem value="backend">Desenvolvedor Backend</SelectItem>
        <SelectItem value="fullstack">Desenvolvedor Full Stack</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-48">
        <SelectValue placeholder="Filtrar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">Mais recentes</SelectItem>
        <SelectItem value="relevant">Mais relevantes</SelectItem>
        <SelectItem value="salary">Maior salario</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Escolha a area" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tecnologia</SelectLabel>
          <SelectItem value="dev">Desenvolvimento</SelectItem>
          <SelectItem value="data">Dados e Analytics</SelectItem>
          <SelectItem value="infra">Infraestrutura</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Negocios</SelectLabel>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Vendas</SelectItem>
          <SelectItem value="finance">Financeiro</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Design</SelectLabel>
          <SelectItem value="ux">UX Design</SelectItem>
          <SelectItem value="ui">UI Design</SelectItem>
          <SelectItem value="product">Product Design</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Indisponivel" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Opcao A</SelectItem>
        <SelectItem value="b">Opcao B</SelectItem>
      </SelectContent>
    </Select>
  )
}
