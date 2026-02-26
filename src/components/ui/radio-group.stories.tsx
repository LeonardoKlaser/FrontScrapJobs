import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Grupo de botões de rádio para seleção única.'
      }
    }
  }
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="profissional">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="iniciante" id="iniciante" />
        <Label htmlFor="iniciante">Iniciante</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="profissional" id="profissional" />
        <Label htmlFor="profissional">Profissional</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="premium" id="premium" />
        <Label htmlFor="premium">Premium</Label>
      </div>
    </RadioGroup>
  )
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="iniciante" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="iniciante" id="d-iniciante" />
        <Label htmlFor="d-iniciante">Iniciante</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="profissional" id="d-profissional" />
        <Label htmlFor="d-profissional">Profissional</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="premium" id="d-premium" />
        <Label htmlFor="d-premium">Premium</Label>
      </div>
    </RadioGroup>
  )
}
