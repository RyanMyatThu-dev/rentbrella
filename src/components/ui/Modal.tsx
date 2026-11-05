import type { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
}

export function Modal({ open, onClose, children, labelledBy }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="pb-safe fixed inset-0 z-[70] flex items-end justify-center bg-inverse-surface/60 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="animate-fade-up w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface p-4 shadow-[var(--shadow-float)] sm:p-5">
        {children}
      </div>
    </div>
  )
}
