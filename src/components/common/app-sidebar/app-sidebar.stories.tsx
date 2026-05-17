import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './index'

function makeClient(isAdmin: boolean) {
  const qc = new QueryClient()
  qc.setQueryData(['user'], {
    user_name: 'Test User',
    email: 'test@scrap.jobs',
    is_admin: isAdmin
  })
  return qc
}

const meta: Meta<typeof AppSidebar> = {
  title: 'Common/AppSidebar',
  component: AppSidebar
}
export default meta
type Story = StoryObj<typeof AppSidebar>

export const UserView: Story = {
  render: () => (
    <QueryClientProvider client={makeClient(false)}>
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export const AdminView: Story = {
  render: () => (
    <QueryClientProvider client={makeClient(true)}>
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}
