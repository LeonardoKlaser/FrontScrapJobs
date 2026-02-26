interface FilterOption {
  key: string
  label: string
}

interface FilterPillsProps {
  options: readonly FilterOption[]
  activeKey: string
  onChange: (key: string) => void
}

export function FilterPills({ options, activeKey, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2" role="tablist">
      {options.map((option) => {
        const isActive = activeKey === option.key
        return (
          <button
            key={option.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
