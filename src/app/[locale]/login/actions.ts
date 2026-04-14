"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkEmailExists(email: string) {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email.toLowerCase()),
    });

    return { exists: !!existingUser };
  } catch (error) {
    console.error("Error checking email:", error);
    return { error: "เกิดข้อผิดพลาดในการตรวจสอบอีเมล กรุณาลองใหม่อีกครั้ง" };
  }
}
