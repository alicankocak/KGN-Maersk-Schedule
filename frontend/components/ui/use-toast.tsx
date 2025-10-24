"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type ToastProps = {
  id?: number
  title: string
  description?: string
  variant?: "default" | "success" | "error"
}

type ToastContextType = {
  toast: (toast: Omit<ToastProps, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (newToast: Omit<ToastProps, "id">) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, ...newToast }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-lg text-sm border ${
              t.variant === "error"
                ? "bg-red-600 text-white border-red-700"
                : t.variant === "success"
                ? "bg-green-600 text-white border-green-700"
                : "bg-zinc-800 text-white border-zinc-700"
            }`}
          >
            <strong>{t.title}</strong>
            {t.description && (
              <div className="text-xs mt-1 opacity-90">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
