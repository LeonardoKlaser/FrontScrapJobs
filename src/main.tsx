import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { App } from './App'
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err, _vars, _ctx, mutation) => {
      // Só dispara se a mutation NÃO definiu seu próprio onError.
      // Garante feedback ao usuário mesmo em fluxos que esqueceram do error path.
      if (mutation.options.onError) return
      let message = 'Erro ao processar a requisição.'
      if (err instanceof AxiosError) {
        const data = err.response?.data as { error?: string } | undefined
        if (data?.error) message = data.error
      }
      toast.error(message)
    }
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App queryClient={queryClient} />
    </QueryClientProvider>
  </StrictMode>
)
