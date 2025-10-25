import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendMail(recipientEmails) {
  const exportDir = path.join(process.cwd(), "exports");

  // 📂 export klasöründeki en son oluşturulmuş dosyayı bul
  const files = fs.readdirSync(exportDir)
    .filter(f => f.endsWith(".xlsx"))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(exportDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  const latestFile = files.length > 0 ? files[0].name : null;
  if (!latestFile) throw new Error("No Excel file found in exports folder");

  const filePath = path.join(exportDir, latestFile);

  // 🧾 Alıcı e-postalarını kontrol et
  const recipients = recipientEmails || process.env.MAIL_TO;
  if (!recipients || recipients.trim() === "") {
    throw new Error("No recipient emails specified (MAIL_TO or request parameter missing).");
  }

  // 📧 Mail transporter (Gmail App Password kullanıyoruz)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 📩 Mail ayarları
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipients, // artık parametreden veya env'den geliyor
    subject: process.env.MAIL_SUBJECT || "Weekly Schedule Report",
    text: process.env.MAIL_BODY || "Attached is the latest schedule report.",
    attachments: [
      {
        filename: latestFile,
        path: filePath,
      },
    ],
  };

  console.log(`📨 Preparing to send email to: ${recipients}`);
  console.log(`📎 Attachment: ${latestFile}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    throw err;
  }
}
