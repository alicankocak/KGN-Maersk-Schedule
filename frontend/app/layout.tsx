import "./globals.css"
import Link from "next/link"
import { ToastProvider } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "Maersk Schedule Automation",
  description: "Search, manage, and automate Maersk booking schedules.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100">
        <ToastProvider>
          {/* HEADER */}
          <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                KGN Schedule
              </h1>
              <nav className="flex gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-blue-500 transition">
                  Dashboard
                </Link>
                <Link href="/search-booking" className="hover:text-blue-500 transition">
                  Search Booking
                </Link>
                <Link href="/manage-booking" className="hover:text-blue-500 transition">
                  Manage Booking Automation
                </Link>
              </nav>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="max-w-6xl mx-auto p-6">{children}</main>

          {/* ✅ Toaster artık provider’ın içinde */}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  )
}
