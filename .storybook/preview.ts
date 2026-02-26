import type { Preview } from '@storybook/react-vite'
import { createElement } from 'react'
import { ThemeProvider } from '../src/components/theme-provider'
import '../src/index.css'

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Tema global',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' }
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark'
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)

      return createElement(
        ThemeProvider,
        { defaultTheme: theme, storageKey: 'storybook-theme' },
        createElement(
          'div',
          { className: 'bg-background text-foreground p-8 min-h-[200px]' },
          createElement(Story)
        )
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'padded',
    backgrounds: { disable: true },
  },
}

export default preview
