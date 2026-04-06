import { Resend } from "resend";

// สร้าง Instance ของ Resend โดยใช้ API Key จาก Environment Variable
// โปรดตั้งค่า RESEND_API_KEY ในไฟล์ .env ของคุณ
export const resend = new Resend(process.env.RESEND_API_KEY!);

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

/**
 * ฟังก์ชันกลางสำหรับส่งอีเมลผ่าน Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {

    if (process.env.NODE_ENV === "development") {
      console.log("Sending email to:", to);
      console.log("Subject:", subject);
      console.log("HTML:", html);
      console.log("Text:", text);
      return { success: true, data: null };
    }

    const { data, error } = await resend.emails.send({
      // โปรดเปลี่ยนอีเมลผู้ส่ง (from) ตามที่คุณยืนยันโดเมนไว้ในระบบ Resend
      from: process.env.RESEND_FROM_EMAIL || "Task Manager <noreply@yourdomain.com>",
      to,
      subject,
      html,
      text: text || "กรุณาเปิดอ่านด้วยแอปพลิเคชันที่รองรับ HTML",
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error sending email:", err);
    return { success: false, error: err?.message || "Internal server error" };
  }
}
