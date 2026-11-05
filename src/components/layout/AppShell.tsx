import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopHeader } from './TopHeader'
import { Toast } from '../ui/Toast'

type AppShellProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  showNotifications?: boolean
  hideNav?: boolean
  contentClassName?: string
}

export function AppShell({
  children,
  title,
  subtitle,
  showBack,
  backTo,
  showNotifications,
  hideNav = false,
  contentClassName = '',
}: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-surface text-on-surface">
      <TopHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        backTo={backTo}
        showNotifications={showNotifications}
      />
      <main
        className={`mx-auto w-full max-w-5xl flex-1 px-4 pt-20 pb-28 md:px-6 ${
          hideNav ? 'pb-10' : ''
        } ${contentClassName}`}
      >
        {children}
      </main>
      {!hideNav ? <BottomNav /> : null}
      <Toast />
    </div>
  )
}
