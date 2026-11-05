import { useEffect } from 'react'
import { useRentalStore } from '../../store/rentalStore'
import { Icon } from './Icon'

export function Toast() {
  const toast = useRentalStore((s) => s.toast)
  const clearToast = useRentalStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(clearToast, 3500)
    return () => window.clearTimeout(id)
  }, [toast, clearToast])

  if (!toast) return null

  const tone =
    toast.type === 'success'
      ? 'bg-secondary text-on-secondary'
      : toast.type === 'warning'
        ? 'bg-tertiary-container text-on-tertiary-container'
        : 'bg-error text-on-error'

  const icon =
    toast.type === 'success'
      ? 'check_circle'
      : toast.type === 'warning'
        ? 'warning'
        : 'error_outline'

  return (
    <div
      className={`pointer-events-none fixed top-20 right-4 left-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl p-4 shadow-[var(--shadow-float)] animate-fade-up md:left-1/2 md:-translate-x-1/2 ${tone}`}
      role="status"
    >
      <Icon name={icon} className="text-[24px]" />
      <div className="flex min-w-0 flex-col">
        <span className="text-sm leading-tight font-semibold">{toast.title}</span>
        <span className="text-[11px] leading-tight opacity-90">{toast.message}</span>
      </div>
    </div>
  )
}
