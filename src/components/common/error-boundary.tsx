import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/app'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 animate-fade-in">
          <Card className="max-w-md w-full border-destructive/30">
            <CardContent className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-7 text-destructive" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold tracking-tight">Algo deu errado</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ocorreu um erro inesperado. Tente recarregar a página.
                </p>
              </div>
              {this.state.error && (
                <code className="block w-full rounded-md bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                  {this.state.error.message}
                </code>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={this.handleRetry} variant="glow" size="sm">
                  <RefreshCw className="size-4" />
                  Tentar novamente
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost" size="sm">
                  <Home className="size-4" />
                  Página inicial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
