import type { Meta, StoryObj } from '@storybook/react-vite'
import { createElement } from 'react'

const meta = {
  title: 'Design System/Tokens',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ColorSwatch({ name, variable, hex }: { name: string; variable: string; hex: string }) {
  return createElement(
    'div',
    { className: 'flex items-center gap-3' },
    createElement('div', {
      className: 'size-12 rounded-lg border border-border/50 shrink-0',
      style: { backgroundColor: `var(${variable})` }
    }),
    createElement(
      'div',
      { className: 'space-y-0.5' },
      createElement('p', { className: 'text-sm font-medium' }, name),
      createElement('p', { className: 'text-xs text-muted-foreground font-mono' }, variable),
      createElement('p', { className: 'text-xs text-muted-foreground' }, hex)
    )
  )
}

export const Cores: Story = {
  render: () => {
    const sections = [
      {
        title: 'Base',
        colors: [
          { name: 'Background', variable: '--background', hex: '#0a0a0b / #ffffff' },
          { name: 'Foreground', variable: '--foreground', hex: '#fafafa / #18181b' },
          { name: 'Card', variable: '--card', hex: '#111113 / #f9fafb' },
          { name: 'Card Foreground', variable: '--card-foreground', hex: '#fafafa / #18181b' },
          { name: 'Popover', variable: '--popover', hex: '#111113 / #ffffff' },
          { name: 'Muted', variable: '--muted', hex: '#1f1f23 / #f4f4f5' },
          { name: 'Muted Foreground', variable: '--muted-foreground', hex: '#a1a1aa / #71717a' }
        ]
      },
      {
        title: 'Marca',
        colors: [
          { name: 'Primary (Emerald)', variable: '--primary', hex: '#10b981' },
          { name: 'Primary Foreground', variable: '--primary-foreground', hex: '#ffffff' },
          { name: 'Accent', variable: '--accent', hex: '#052e1e / #ecfdf5' },
          { name: 'Accent Foreground', variable: '--accent-foreground', hex: '#a7f3d0 / #065f46' },
          { name: 'Secondary', variable: '--secondary', hex: '#1f1f23 / #f4f4f5' }
        ]
      },
      {
        title: 'Semânticas',
        colors: [
          { name: 'Destructive', variable: '--destructive', hex: '#ef4444' },
          { name: 'Warning', variable: '--warning', hex: '#f59e0b' },
          { name: 'Info', variable: '--info', hex: '#3b82f6' },
          { name: 'Success', variable: '--success', hex: '#10b981' }
        ]
      },
      {
        title: 'Bordas & Input',
        colors: [
          { name: 'Border', variable: '--border', hex: '#1f1f23 / #e4e4e7' },
          { name: 'Input', variable: '--input', hex: '#1f1f23 / #e4e4e7' },
          { name: 'Ring', variable: '--ring', hex: '#10b981' }
        ]
      },
      {
        title: 'Gráficos',
        colors: [
          { name: 'Chart 1 (Emerald)', variable: '--chart-1', hex: '#10b981' },
          { name: 'Chart 2 (Cyan)', variable: '--chart-2', hex: '#06b6d4' },
          { name: 'Chart 3 (Amber)', variable: '--chart-3', hex: '#f59e0b' },
          { name: 'Chart 4 (Purple)', variable: '--chart-4', hex: '#8b5cf6' },
          { name: 'Chart 5 (Pink)', variable: '--chart-5', hex: '#ec4899' }
        ]
      }
    ]

    return createElement(
      'div',
      { className: 'space-y-10' },
      sections.map((section) =>
        createElement(
          'div',
          { key: section.title, className: 'space-y-4' },
          createElement(
            'h2',
            { className: 'text-lg font-semibold font-display tracking-tight' },
            section.title
          ),
          createElement(
            'div',
            {
              className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            },
            section.colors.map((color) =>
              createElement(ColorSwatch, { key: color.variable, ...color })
            )
          )
        )
      )
    )
  }
}

export const Tipografia: Story = {
  render: () => {
    const fonts = [
      {
        name: 'Sora',
        variable: 'font-display',
        usage: 'Títulos e headings',
        weights: ['500 (Medium)', '600 (SemiBold)', '700 (Bold)']
      },
      {
        name: 'Inter',
        variable: 'font-sans',
        usage: 'Corpo de texto',
        weights: ['400 (Regular)', '500 (Medium)', '600 (SemiBold)', '700 (Bold)']
      },
      {
        name: 'JetBrains Mono',
        variable: 'font-mono',
        usage: 'Código e dados técnicos',
        weights: ['400 (Regular)', '500 (Medium)']
      }
    ]

    return createElement(
      'div',
      { className: 'space-y-10' },
      fonts.map((font) =>
        createElement(
          'div',
          { key: font.name, className: 'space-y-4' },
          createElement(
            'div',
            { className: 'space-y-1' },
            createElement(
              'h2',
              {
                className: `text-2xl font-bold tracking-tight ${font.variable}`,
                style: { fontFamily: `var(--${font.variable})` }
              },
              font.name
            ),
            createElement(
              'p',
              { className: 'text-sm text-muted-foreground' },
              `${font.usage} — var(--${font.variable})`
            )
          ),
          createElement(
            'div',
            {
              className: 'rounded-lg border border-border/50 p-6 space-y-3',
              style: { fontFamily: `var(--${font.variable})` }
            },
            createElement(
              'p',
              { className: 'text-3xl font-bold' },
              'O rápido cão marrom saltou sobre a cerca'
            ),
            createElement(
              'p',
              { className: 'text-xl font-semibold' },
              'Encontre vagas compatíveis com seu currículo'
            ),
            createElement(
              'p',
              { className: 'text-base' },
              'A plataforma analisa suas habilidades e experiências para encontrar ' +
                'as melhores oportunidades no mercado de trabalho.'
            ),
            createElement(
              'p',
              { className: 'text-sm text-muted-foreground' },
              'Pesos disponíveis: ' + font.weights.join(', ')
            )
          )
        )
      )
    )
  }
}

export const Espacamento: Story = {
  render: () => {
    const sizes = [
      { name: '0.5', px: '2px' },
      { name: '1', px: '4px' },
      { name: '1.5', px: '6px' },
      { name: '2', px: '8px' },
      { name: '3', px: '12px' },
      { name: '4', px: '16px' },
      { name: '5', px: '20px' },
      { name: '6', px: '24px' },
      { name: '8', px: '32px' },
      { name: '10', px: '40px' },
      { name: '12', px: '48px' },
      { name: '16', px: '64px' }
    ]

    return createElement(
      'div',
      { className: 'space-y-6' },
      createElement(
        'h2',
        { className: 'text-lg font-semibold font-display tracking-tight' },
        'Escala de Espaçamento'
      ),
      createElement(
        'div',
        { className: 'space-y-2' },
        sizes.map((size) =>
          createElement(
            'div',
            { key: size.name, className: 'flex items-center gap-4' },
            createElement(
              'span',
              {
                className: 'text-xs text-muted-foreground font-mono w-12 text-right shrink-0'
              },
              size.name
            ),
            createElement('div', {
              className: 'h-3 bg-primary rounded-sm',
              style: { width: size.px }
            }),
            createElement(
              'span',
              {
                className: 'text-xs text-muted-foreground font-mono'
              },
              size.px
            )
          )
        )
      )
    )
  }
}

export const BorderRadius: Story = {
  render: () => {
    const radii = [
      { name: 'rounded-sm', value: 'calc(0.5rem - 4px)', label: 'sm' },
      { name: 'rounded-md', value: 'calc(0.5rem - 2px)', label: 'md' },
      { name: 'rounded-lg', value: '0.5rem (8px)', label: 'lg (padrão)' },
      { name: 'rounded-xl', value: 'calc(0.5rem + 4px)', label: 'xl' },
      { name: 'rounded-full', value: '9999px', label: 'full' }
    ]

    return createElement(
      'div',
      { className: 'space-y-6' },
      createElement(
        'h2',
        { className: 'text-lg font-semibold font-display tracking-tight' },
        'Border Radius'
      ),
      createElement(
        'div',
        { className: 'flex flex-wrap gap-6' },
        radii.map((r) =>
          createElement(
            'div',
            { key: r.name, className: 'flex flex-col items-center gap-2' },
            createElement('div', {
              className: `size-20 bg-primary/20 border border-primary/40 ${r.name}`
            }),
            createElement('span', { className: 'text-xs font-medium' }, r.label),
            createElement('span', { className: 'text-xs text-muted-foreground font-mono' }, r.value)
          )
        )
      )
    )
  }
}

export const Animacoes: Story = {
  render: () => {
    const animations = [
      { name: 'animate-fade-in-up', label: 'Fade In Up', desc: 'Entrada padrão de elementos' },
      { name: 'animate-fade-in', label: 'Fade In', desc: 'Fade simples' },
      { name: 'animate-shimmer', label: 'Shimmer', desc: 'Loading skeleton' },
      { name: 'animate-spin', label: 'Spin', desc: 'Spinner / loading' }
    ]

    const classes = [
      { name: 'hover-lift', label: 'Hover Lift', desc: 'Elevação sutil no hover' },
      { name: 'text-gradient-primary', label: 'Text Gradient', desc: 'Gradiente emerald no texto' },
      { name: 'glow-border', label: 'Glow Border', desc: 'Borda com brilho emerald' }
    ]

    return createElement(
      'div',
      { className: 'space-y-10' },
      createElement(
        'div',
        { className: 'space-y-4' },
        createElement(
          'h2',
          { className: 'text-lg font-semibold font-display tracking-tight' },
          'Animações'
        ),
        createElement(
          'div',
          { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
          animations.map((anim) =>
            createElement(
              'div',
              {
                key: anim.name,
                className: 'rounded-lg border border-border/50 p-6 flex flex-col items-center gap-3'
              },
              createElement('div', {
                className: `size-12 rounded-lg bg-primary/20 ${anim.name}`
              }),
              createElement(
                'div',
                { className: 'text-center space-y-0.5' },
                createElement('p', { className: 'text-sm font-medium' }, anim.label),
                createElement(
                  'p',
                  { className: 'text-xs text-muted-foreground font-mono' },
                  anim.name
                ),
                createElement('p', { className: 'text-xs text-muted-foreground' }, anim.desc)
              )
            )
          )
        )
      ),
      createElement(
        'div',
        { className: 'space-y-4' },
        createElement(
          'h2',
          { className: 'text-lg font-semibold font-display tracking-tight' },
          'Classes Utilitárias'
        ),
        createElement(
          'div',
          { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
          classes.map((cls) =>
            createElement(
              'div',
              {
                key: cls.name,
                className: `rounded-lg border border-border/50 p-6 flex flex-col items-center gap-3 ${cls.name}`
              },
              createElement(
                'p',
                {
                  className: `text-lg font-bold ${cls.name === 'text-gradient-primary' ? cls.name : ''}`
                },
                cls.label
              ),
              createElement(
                'p',
                { className: 'text-xs text-muted-foreground font-mono' },
                `.${cls.name}`
              ),
              createElement(
                'p',
                { className: 'text-xs text-muted-foreground text-center' },
                cls.desc
              )
            )
          )
        )
      )
    )
  }
}
