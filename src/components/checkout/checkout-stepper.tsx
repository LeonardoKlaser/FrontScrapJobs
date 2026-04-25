import { Fragment } from 'react'
import { Check } from 'lucide-react'

interface CheckoutStepperProps {
  currentStep: number
  labels: string[]
}

export function CheckoutStepper({ currentStep, labels }: CheckoutStepperProps) {
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const reached = isCompleted || isActive

        return (
          <Fragment key={label}>
            {index > 0 && (
              <div
                className={`h-px flex-1 mx-3 transition-colors ${
                  reached ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
