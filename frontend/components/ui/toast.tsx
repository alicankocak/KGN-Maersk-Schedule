"use client"

import * as React from "react"

export function Toast({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`fixed bottom-6 right-6 rounded-md px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md ${className}`}
    >
      {children}
    </div>
  )
}

export function ToastTitle({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="font-semibold mb-1">{children}</div>
}

export function ToastDescription({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="text-sm opacity-80">{children}</div>
}

export function ToastClose() {
  return null // basit sürüm, X butonu istersen ekleyebiliriz
}

export function ToastViewport() {
  return null
}
