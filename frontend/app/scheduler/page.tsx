"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SchedulerPage() {
  const router = useRouter()
  const [day, setDay] = useState("Monday")
  const [time, setTime] = useState("09:00")
  const [emails, setEmails] = useState("alicankck89@gmail.com, meltemkocak.uk@gmail.com")
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const cron = `${time} ${day}`
      await fetch("http://localhost:4000/api/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cron, emails: emails.split(",").map(e => e.trim()) })
      })
      alert("✅ Schedule saved successfully!")
      router.push("/") // Dashboard’a dön
    } catch (err) {
      alert("❌ Failed to save schedule")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const sendNow = async () => {
    setSending(true)
    try {
      await fetch("http://localhost:4000/api/send-weekly", { method: "POST" })
      alert("📧 Email sent successfully!")
      router.push("/") // Dashboard’a dön
    } catch (err) {
      alert("❌ Failed to send email.")
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">📅 Email Scheduler</h1>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <div>
          <label className="block mb-2 font-medium">Select Day</label>
          <select
            value={day}
            onChange={e => setDay(e.target.value)}
            className="w-full p-2 border rounded-md bg-transparent"
          >
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Select Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full p-2 border rounded-md bg-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email Recipients</label>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            className="w-full p-2 border rounded-md bg-transparent"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple addresses with commas.</p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={saveSchedule}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3 rounded-md"
          >
            {saving ? "Saving..." : "Save Schedule"}
          </Button>

          <Button
            onClick={sendNow}
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3 rounded-md"
          >
            {sending ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </div>
    </main>
  )
}
