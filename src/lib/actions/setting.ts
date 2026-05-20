"use server";

import { db } from "@/db";
import { userSetting } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ==========================================
// Helper: ดึง User ปัจจุบัน
// ==========================================
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// ==========================================
// 1. Read: ดึง Settings ของ User
//    (Lazy init — สร้าง default record ถ้ายังไม่มี)
// ==========================================
export async function getUserSettings() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  // ดึง settings ที่มีอยู่
  const existing = await db.select()
    .from(userSetting)
    .where(eq(userSetting.userId, user.id));

  if (existing.length > 0) {
    return existing[0];
  }

  // ถ้ายังไม่มี → สร้าง default settings ให้อัตโนมัติ
  const now = new Date();
  const newSettings = await db.insert(userSetting).values({
    id: crypto.randomUUID(),
    userId: user.id,
    autoDeleteTrash: false,
    trashRetentionDays: 30,
    defaultColumn: "todo",
    showProgress: true,
    showDueDate: true,
    enableDragDrop: true,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return newSettings[0];
}

// ==========================================
// 2. Update: อัปเดต Settings ของ User
//    (รับ partial data — อัปเดตเฉพาะฟิลด์ที่ส่งมา)
// ==========================================
export async function updateUserSettings(data: {
  // Data Settings
  autoDeleteTrash?: boolean;
  trashRetentionDays?: number;
  // Board Settings
  defaultColumn?: string;
  showProgress?: boolean;
  showDueDate?: boolean;
  enableDragDrop?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // ตรวจสอบว่ามี settings record อยู่แล้ว (ถ้ายังไม่มี → สร้างก่อน)
  await getUserSettings();

  // สร้าง update data (เฉพาะฟิลด์ที่ส่งมา)
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.autoDeleteTrash !== undefined) updateData.autoDeleteTrash = data.autoDeleteTrash;
  if (data.trashRetentionDays !== undefined) updateData.trashRetentionDays = data.trashRetentionDays;
  if (data.defaultColumn !== undefined) updateData.defaultColumn = data.defaultColumn;
  if (data.showProgress !== undefined) updateData.showProgress = data.showProgress;
  if (data.showDueDate !== undefined) updateData.showDueDate = data.showDueDate;
  if (data.enableDragDrop !== undefined) updateData.enableDragDrop = data.enableDragDrop;

  const updated = await db.update(userSetting)
    .set(updateData)
    .where(eq(userSetting.userId, user.id))
    .returning();

  revalidatePath("/kanban/setting");
  return updated[0];
}
