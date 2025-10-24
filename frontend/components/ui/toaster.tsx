"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  // Bu bileşen sadece useToast'u import etmek için placeholder
  // İstersen future’da burada global UI toastları handle edebilirsin.
  useToast()
  return null
}
