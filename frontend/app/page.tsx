import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8 text-center">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow p-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to KGN Schedule Automation</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This platform lets you search live Maersk port schedules and set up automatic weekly email updates.
        </p>
      </div>

      <div className="flex justify-center gap-6">
        <Link href="/search-booking">
          <Button size="lg" className="w-48">Search Bookings</Button>
        </Link>
        <Link href="/manage-booking">
          <Button size="lg" variant="outline" className="w-48">Booking Automation</Button>
        </Link>
      </div>
    </div>
  );
}
