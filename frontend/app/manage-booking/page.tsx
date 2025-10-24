"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function ManageBooking() {
  const { toast } = useToast()

  const [day, setDay] = useState("Monday")
  const [time, setTime] = useState("09:00")
  const [emails, setEmails] = useState("alicankck89@gmail.com, meltemkocak.uk@gmail.com")
  const [lastSent, setLastSent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load last sent info
  useEffect(() => {
    const saved = localStorage.getItem("lastSent")
    if (saved) setLastSent(saved)
  }, [])

  // Save weekly automation to backend
  const saveAutomation = async () => {
    setLoading(true)
    try {
      const cron = `0 ${time.split(":")[1]} ${time.split(":")[0]} * * ${["SUN","MON","TUE","WED","THU","FRI","SAT"].indexOf(day.toUpperCase())}`
      const res = await fetch("http://localhost:4000/api/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cron }),
      })

      if (res.ok) {
        toast({
          title: "Automation saved",
          description: `Emails will be sent every ${day} at ${time}`,
        })
      } else {
        throw new Error("Failed to save automation settings.")
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Send email immediately
  const sendNow = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/send-weekly", { method: "POST" })
      if (res.ok) {
        const now = new Date().toLocaleString()
        setLastSent(now)
        localStorage.setItem("lastSent", now)
        toast({ title: "Email sent", description: `Report sent successfully at ${now}` })
      } else {
        throw new Error("Email send failed.")
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-2xl rounded-2xl shadow-md bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Manage Booking Automation
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Configure automatic weekly report emails for Maersk schedule updates.
        </p>

        <div className="space-y-4">
          {/* Select Day */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border rounded-md p-2 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            >
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Select Time */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border rounded-md p-2 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>

          {/* Email Recipients */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Recipients</label>
            <input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter emails separated by comma"
              className="border rounded-md p-2 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-zinc-500">
            {lastSent ? `📤 Last sent: ${lastSent}` : "No emails sent yet."}
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendNow}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-sm font-medium"
            >
              Send Now
            </button>
            <button
              onClick={saveAutomation}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Save Automation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
