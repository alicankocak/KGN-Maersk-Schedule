import cron from "node-cron";
import { getSchedules } from "./maerskService.js";
import { createExcel } from "./excelService.js";
import { sendMail } from "./mailService.js";

let currentJob = null;

// Varsayılan plan: her Pazartesi 09:00
const DEFAULT_CRON = "0 9 * * 1"; 

export function initCron() {
  console.log("📆 Cron service initialized");
  scheduleJob(DEFAULT_CRON);
}

function scheduleJob(cronExp) {
  if (currentJob) currentJob.stop();

  currentJob = cron.schedule(cronExp, async () => {
    console.log("🚀 Running scheduled job at:", new Date().toLocaleString());
    try {
      const data = await getSchedules();
      const file = await createExcel(data);
      await sendMail(file);
      console.log("📤 Weekly email sent successfully");
    } catch (err) {
      console.error("❌ Error in scheduled job:", err.message);
    }
  });
}

export async function reschedule(cronText) {
  console.log("🔁 Updating schedule to:", cronText);
  const cronParts = cronText.split(" ");
  const hourMinute = cronParts[0].split(":");

  // Eğer UI'dan sadece “09:00 Monday” gibi bir değer gelirse bunu dönüştür
  const time = hourMinute[0];
  const minute = hourMinute[1];
  const day = cronParts[1]?.toLowerCase() || "monday";

  const dayMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  const newCron = `${minute} ${time} * * ${dayMap[day]}`;
  scheduleJob(newCron);
  console.log("✅ Schedule updated to:", newCron);
}
