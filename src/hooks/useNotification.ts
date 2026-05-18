import { useCallback } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { addNotification } from '@/features/tasks/uiSlice'
import type { NotificationType } from '@/types'

export function useNotification() {
  const dispatch = useAppDispatch()

  const notify = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      dispatch(addNotification({ type, message, duration }))
    },
    [dispatch]
  )

  return {
    success: (msg: string, duration?: number) => notify('success', msg, duration),
    error: (msg: string, duration?: number) => notify('error', msg, duration),
    info: (msg: string, duration?: number) => notify('info', msg, duration),
    warning: (msg: string, duration?: number) => notify('warning', msg, duration),
  }
}
