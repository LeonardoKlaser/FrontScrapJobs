import type { Meta, StoryObj } from '@storybook/react-vite'
import { createElement } from 'react'
import { useState } from 'react'
import { FilterPills } from './filter-pills'

const defaultOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Novas' },
  { key: 'analyzed', label: 'Analisadas' }
] as const

const manyOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Novas' },
  { key: 'analyzed', label: 'Analisadas' },
  { key: 'applied', label: 'Candidatadas' },
  { key: 'archived', label: 'Arquivadas' },
  { key: 'favorites', label: 'Favoritas' },
  { key: 'remote', label: 'Remotas' }
] as const

const meta = {
  title: 'Common/FilterPills',
  component: FilterPills,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    activeKey: { control: 'text' },
    onChange: { action: 'onChange' }
  }
} satisfies Meta<typeof FilterPills>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    options: defaultOptions,
    activeKey: 'all'
  }
}

export const ManyOptions: Story = {
  args: {
    options: manyOptions,
    activeKey: 'all'
  }
}

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState('all')
    return createElement(FilterPills, {
      options: defaultOptions,
      activeKey: active,
      onChange: setActive
    })
  }
}
