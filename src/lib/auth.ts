import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db"; // อ้างอิงจากโฟลเดอร์ db ที่เราสร้างไว้
import { sendEmail } from "./resend/send";

const origins = [
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

const previewUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

if (process.env.NODE_ENV !== "production") {
  origins.push("http://localhost:3000");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  trustedOrigins: [
    ...origins,
    ...(previewUrl ? [previewUrl] : []),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #111827; margin-bottom: 16px; font-size: 24px; text-align: center;">ยืนยันอีเมลของคุณ</h2>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">สวัสดีคุณ <strong>${user.name}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
            ขอบคุณที่ใช้งานระบบของเรา กรุณากดปุ่มด้านล่างเพื่อยืนยันที่อยู่อีเมลของคุณให้เสร็จสมบูรณ์:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ยืนยันอีเมลของฉัน
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; line-height: 1.6;">
            หากปุ่มกดยืนยันไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้ด้วยต้วเอง: <br/>
            <span style="color: #2563eb; word-break: break-all; margin-top: 8px; display: inline-block;">${url}</span>
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "ยืนยันอีเมลเพื่อให้บัญชีของคุณมีความปลอดภัยสูงขึ้น",
        html: emailHtml,
      });
    },
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #111827; margin-bottom: 16px; font-size: 24px; text-align: center;">รหัส OTP ของคุณ</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">รหัสผ่านแบบใช้ครั้งเดียว (OTP) ของคุณคือ:</p>
            <div style="text-align: center; margin: 32px 0;">
              <span style="display: inline-block; padding: 14px 28px; background-color: #f3f4f6; color: #111827; letter-spacing: 4px; border-radius: 8px; font-weight: bold; font-size: 24px;">
                ${otp}
              </span>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; line-height: 1.6;">
              รหัสนี้ใช้สำหรับ ${type === 'sign-in' ? 'เข้าสู่ระบบ' : 'ยืนยันตัวตน'} และมีอายุการใช้งาน 5 นาที<br/>
              หากคุณไม่ได้ขอรหัสนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้
            </p>
          </div>
        `;

        await sendEmail({
          to: email,
          subject: "รหัส OTP สำหรับเข้าสู่ระบบ",
          html: emailHtml,
        });
      },
    }),
  ],
});