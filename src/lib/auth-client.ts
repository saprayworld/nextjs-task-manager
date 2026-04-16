import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

let baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" && process.env.NEXT_PUBLIC_VERCEL_URL) {
  baseURL = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
} else if (process.env.NODE_ENV === "development") {
  baseURL = "http://localhost:3000";
}

export const authClient = createAuthClient({
  // ถ้าขึ้น Production ค่อยแก้เป็น URL ของเว็บจริง
  baseURL: baseURL,
  plugins: [
    emailOTPClient(),
  ],
});

// ส่งออก functions ที่ใช้บ่อยๆ เพื่อให้เรียกใช้ง่ายๆ
export const { signIn, signUp, signOut, useSession } = authClient;