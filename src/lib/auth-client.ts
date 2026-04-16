import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // ถ้าขึ้น Production ค่อยแก้เป็น URL ของเว็บจริง
  baseURL: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    emailOTPClient(),
  ],
});

// ส่งออก functions ที่ใช้บ่อยๆ เพื่อให้เรียกใช้ง่ายๆ
export const { signIn, signUp, signOut, useSession } = authClient;