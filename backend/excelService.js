import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function createExcel(data) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No valid schedule data found");
    }

    // Export klasörü yoksa oluştur
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Dosya adı
    const filename = path.join(exportDir, `Schedules_${Date.now()}.xlsx`);

    // Workbook oluştur
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Schedules");

    // Başlıklar
    sheet.columns = [
      { header: "Vessel Name", key: "vessel", width: 25 },
      { header: "Service Name", key: "service", width: 25 },
      { header: "Arrival", key: "arrival", width: 25 },
      { header: "Departure", key: "departure", width: 25 },
      { header: "UNLocationCode", key: "unloc", width: 15 },
    ];

    // Satırları doldur
    data.forEach((loc) => {
      (loc.vesselSchedules || []).forEach((schedule) => {
        const vessel = schedule.vessel?.name || "N/A";
        const service = schedule.servicePartners?.[0]?.carrierServiceName || "N/A";
        const arrival = schedule.timestamps?.find((t) => t.eventTypeCode === "ARRI")?.eventDateTime || "";
        const departure = schedule.timestamps?.find((t) => t.eventTypeCode === "DEPA")?.eventDateTime || "";
        const unloc = loc.location?.UNLocationCode || "N/A";

        sheet.addRow({ vessel, service, arrival, departure, unloc });
      });
    });

    await workbook.xlsx.writeFile(filename);
    console.log(`✅ Excel created successfully: ${filename}`);
    return filename;
  } catch (err) {
    console.error("❌ Excel creation failed:", err.message);
    throw err;
  }
}
