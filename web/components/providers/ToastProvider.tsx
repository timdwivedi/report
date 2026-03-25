"use client"

import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { useNotifications } from './NotificationProvider'
import { X } from 'lucide-react'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useNotifications()

  return (
    <Toast.Provider swipeDirection="right">
      {children}

      {notifications.map((notification) => (
        <Toast.Root
          key={notification.id}
          className={`
            fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg p-4 shadow-lg
            ${notification.type === 'success' ? 'bg-green-500/90 text-white' : ''}
            ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-500/90 text-white' : ''}
            ${notification.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
          `}
          open={true}
          onOpenChange={(open) => !open && removeNotification(notification.id)}
        >
          <div className="flex-1">
            <Toast.Title className="font-semibold">
              {notification.title}
            </Toast.Title>
            {notification.message && (
              <Toast.Description className="mt-1 text-sm opacity-90">
                {notification.message}
              </Toast.Description>
            )}
          </div>
          <Toast.Close asChild>
            <button className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </Toast.Close>
        </Toast.Root>
      ))}

      <Toast.Viewport className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 outline-none" />
    </Toast.Provider>
  )
}
