import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationItem {
  id: string
  message: string
  type: NotificationType
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  showNotification: (message: string, type?: NotificationType) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

const AUTO_CLOSE_MS = 3600

function buildId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function NotificationViewport({
  notifications,
  onDismiss,
}: {
  notifications: NotificationItem[]
  onDismiss: (id: string) => void
}) {
  const styleByType: Record<NotificationType, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      {notifications.map((item) => (
        <article
          key={item.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${styleByType[item.type]}`}
        >
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm font-medium">{item.message}</p>
            <button
              type="button"
              aria-label="Cerrar notificacion"
              className="rounded-md px-2 py-0.5 text-xs font-semibold text-slate-600 transition hover:bg-white/60"
              onClick={() => onDismiss(item.id)}
            >
              X
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const id = buildId()

      setNotifications((prev) => [...prev, { id, message, type }])

      window.setTimeout(() => {
        removeNotification(id)
      }, AUTO_CLOSE_MS)
    },
    [removeNotification],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      showNotification,
      removeNotification,
    }),
    [notifications, showNotification, removeNotification],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} onDismiss={removeNotification} />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }

  return context
}
