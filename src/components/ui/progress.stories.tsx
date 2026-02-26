import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useEffect } from 'react'
import { Progress } from './progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Barra de progresso com valor de 0 a 100.'
      }
    }
  }
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    value: 0
  }
}

export const Half: Story = {
  args: {
    value: 50
  }
}

export const Full: Story = {
  args: {
    value: 100
  }
}

export const Animated: Story = {
  render: () => {
    const [value, setValue] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setValue((prev) => {
          if (prev >= 75) {
            clearInterval(timer)
            return 75
          }
          return prev + 1
        })
      }, 30)
      return () => clearInterval(timer)
    }, [])

    return (
      <div className="space-y-2">
        <Progress value={value} />
        <p className="text-sm text-muted-foreground">{value}% concluído</p>
      </div>
    )
  }
}
