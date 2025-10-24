#!/bin/bash
echo "🚀 Maersk Schedule Dashboard setup başlıyor..."

# Backend klasörü
mkdir -p backend && cd backend
echo "📦 Backend kuruluyor..."

# package.json oluştur
cat <<'EOF' > package.json
{
  "name": "maersk-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "axios": "^1.7.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.19.2",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.8",
    "xlsx": "^0.18.5"
  }
}
EOF

# .env.example
cat <<'EOF' > .env.example
MAERSK_CLIENT_ID=YOUR_CLIENT_ID
MAERSK_CLIENT_SECRET=YOUR_CLIENT_SECRET
MAERSK_BASE_URL=https://api.maersk.com/edp/bookings/v1
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=your_google_app_password
MAIL_TO=alicankck89@gmail.com,meltemkocak.uk@gmail.com
MAIL_SUBJECT=Weekly Maersk Vessel Schedules
MAIL_BODY=Attached you can find the latest Maersk vessel schedule report.
CRON_SCHEDULE=0 9 * * 1
PORT=4000
EOF

# backend JS dosyaları
cat <<'EOF' > server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getSchedules } from "./maerskService.js";
import { createExcel } from "./excelService.js";
import { sendMail } from "./mailService.js";
import { initCron, reschedule } from "./cronService.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/schedules", async (req, res) => {
  try {
    const { origin, destination, from, to } = req.query;
    const data = await getSchedules({ origin, destination, from, to });
    const file = await createExcel(data);
    res.download(file);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/send-weekly", async (req, res) => {
  try {
    const data = await getSchedules();
    const file = await createExcel(data);
    await sendMail(file);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/reschedule", async (req, res) => {
  const { cron } = req.body;
  await reschedule(cron);
  res.json({ updated: true });
});

initCron();
app.listen(process.env.PORT, () =>
  console.log(\`✅ Backend running on port \${process.env.PORT}\`)
);
EOF

cat <<'EOF' > maerskService.js
import axios from "axios";

export async function getToken() {
  const res = await axios.post(
    "https://api.maersk.com/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MAERSK_CLIENT_ID,
      client_secret: process.env.MAERSK_CLIENT_SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data.access_token;
}

export async function getSchedules({ origin = "TRGEM", destination = "GBFXT", from } = {}) {
  const token = await getToken();
  const res = await axios.get(
    \`\${process.env.MAERSK_BASE_URL}/schedules?originPort=\${origin}&destinationPort=\${destination}&fromDate=\${from || "2025-01-01"}\`,
    { headers: { Authorization: \`Bearer \${token}\` } }
  );
  return res.data;
}
EOF

cat <<'EOF' > excelService.js
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

export async function createExcel(data) {
  const mapped = data.map(d => ({
    Voyage: d.voyageNumber,
    Vessel: d.vesselName,
    Origin: d.origin.portName,
    Destination: d.destination.portName,
    Departure: d.departureDate,
    Arrival: d.arrivalDate,
    Carrier: d.carrier || "MAERSK"
  }));
  const ws = XLSX.utils.json_to_sheet(mapped);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Schedules");
  const filename = path.join("exports", \`WeeklySchedules_\${Date.now()}.xlsx\`);
  fs.mkdirSync("exports", { recursive: true });
  XLSX.writeFile(wb, filename);
  return filename;
}
EOF

cat <<'EOF' > mailService.js
import nodemailer from "nodemailer";

export async function sendMail(filePath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.MAIL_TO,
    subject: process.env.MAIL_SUBJECT,
    text: process.env.MAIL_BODY,
    attachments: [{ filename: filePath.split("/").pop(), path: filePath }],
  });
}
EOF

cat <<'EOF' > cronService.js
import cron from "node-cron";
import { getSchedules } from "./maerskService.js";
import { createExcel } from "./excelService.js";
import { sendMail } from "./mailService.js";

let task;

export function initCron() {
  task = cron.schedule(process.env.CRON_SCHEDULE, async () => {
    const data = await getSchedules();
    const file = await createExcel(data);
    await sendMail(file);
  });
}

export async function reschedule(newCron) {
  if (task) task.stop();
  task = cron.schedule(newCron, async () => {
    const data = await getSchedules();
    const file = await createExcel(data);
    await sendMail(file);
  });
}
EOF

npm install
cd ..

echo "🎨 Frontend Next.js kurulumu..."
npx create-next-app@latest frontend -y
cd frontend
npm install tailwindcss @shadcn/ui lucide-react
npx tailwindcss init -p

echo "✅ Kurulum tamamlandı."


