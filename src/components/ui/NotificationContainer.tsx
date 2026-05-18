import { useEffect, memo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { removeNotification } from '@/features/tasks/uiSlice'
import type { Notification } from '@/types'

const NotificationItem = memo(function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id)
    }, notification.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onDismiss])

  const icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`notification notification-${notification.type} animate-slide-in`}>
      <span className="notification-icon">{icons[notification.type]}</span>
      <p className="notification-message">{notification.message}</p>
      <button
        className="notification-dismiss"
        onClick={() => onDismiss(notification.id)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
})

export function NotificationContainer() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((s) => s.ui.notifications)

  const handleDismiss = (id: string) => {
    dispatch(removeNotification(id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="notification-container" role="region" aria-label="Notifications">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}
