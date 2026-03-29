import { Check } from 'lucide-react'

interface CheckoutStepperProps {
  currentStep: 1 | 2
  labels: [string, string]
}

export function CheckoutStepper({ currentStep, labels }: CheckoutStepperProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {labels.map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep

        return (
          <div key={label} className="flex items-center gap-3 flex-1">
            {index > 0 && (
              <div
                className={`h-px flex-1 transition-colors ${
                  isCompleted || isActive ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
