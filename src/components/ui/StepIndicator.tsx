import { Icon } from './Icon'

type Step = {
  label: string
  detail: string
}

type StepIndicatorProps = {
  steps: Step[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-[var(--shadow-card)]">
      {steps.map((step, index) => {
        const n = index + 1
        const done = n < current
        const active = n === current
        return (
          <div key={step.label} className="contents">
            <div
              className={`flex items-center gap-2 ${
                active || done ? 'opacity-100' : 'opacity-45'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-success text-white'
                    : active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface'
                }`}
              >
                {done ? <Icon name="check" className="text-[16px]" /> : n}
              </div>
              <div className="hidden flex-col leading-tight min-[380px]:flex">
                <span
                  className={`text-[11px] font-bold ${
                    active || done ? 'text-primary' : 'text-on-surface'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-on-surface-variant">{step.detail}</span>
              </div>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full ${
                  done ? 'bg-success/40' : 'bg-surface-container-high'
                }`}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
