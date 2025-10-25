import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getSchedules } from "./maerskService.js";
import { createExcel } from "./excelService.js";
import { initCron } from "./cronService.js";
import { sendMail } from "./mailService.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ JSON endpoint (UI tablosu için)
app.get("/api/schedules", async (req, res) => {
  try {
    const { UNLocationCode, date, limit } = req.query;
    const data = await getSchedules({ UNLocationCode, date, limit });
    res.json(data); // JSON döndür
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ Excel endpoint (indirme için)
app.get("/api/schedules/excel", async (req, res) => {
  try {
    const { UNLocationCode, date, limit } = req.query;
    const data = await getSchedules({ UNLocationCode, date, limit });
    const file = await createExcel(data);
    res.download(file);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/send-weekly", async (req, res) => {
  try {
    const { emails } = req.body;
    await sendMail(emails);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


initCron();
app.listen(process.env.PORT, () => {
  console.log(`✅ Backend running on port ${process.env.PORT}`);
});
