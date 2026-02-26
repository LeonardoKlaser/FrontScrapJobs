import { CheckCircle2, AlertCircle } from 'lucide-react'

interface StatusFeedbackProps {
  variant: 'success' | 'error'
  message: string
}

export function StatusFeedback({ variant, message }: StatusFeedbackProps) {
  const isSuccess = variant === 'success'
  const Icon = isSuccess ? CheckCircle2 : AlertCircle

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
        isSuccess ? 'bg-primary/5 text-primary' : 'bg-destructive/10 text-destructive'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}
