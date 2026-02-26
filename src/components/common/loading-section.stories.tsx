import type { Meta, StoryObj } from '@storybook/react-vite'
import { createElement } from 'react'
import { LoadingSection } from './loading-section'

const meta = {
  title: 'Common/LoadingSection',
  component: LoadingSection,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['full', 'section', 'inline']
    },
    label: { control: 'text' }
  }
} satisfies Meta<typeof LoadingSection>

export default meta
type Story = StoryObj<typeof meta>

export const Section: Story = {
  args: {
    variant: 'section'
  }
}

export const Inline: Story = {
  args: {
    variant: 'inline'
  }
}

export const WithLabel: Story = {
  args: {
    variant: 'section',
    label: 'Carregando vagas...'
  }
}

export const Full: Story = {
  args: {
    variant: 'full'
  }
}

Full.decorators = [
  (Story) =>
    createElement('div', { style: { height: '400px', overflow: 'hidden' } }, createElement(Story))
]
