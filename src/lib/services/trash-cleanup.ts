import { db } from "@/db";
import { task, userSetting } from "@/db/schema";
import { eq, and, isNotNull, lte } from "drizzle-orm";

// ==========================================
// Lazy Cleanup: ลบ task ในถังขยะที่เกิน retention period
// เรียกจาก kanban/layout.tsx หลัง auth check (เหมือน generatePendingTasks)
// ==========================================

/**
 * ตรวจสอบและลบ task ในถังขยะที่เกิน retention period
 * - ถ้า user ไม่ได้เปิด autoDeleteTrash → ข้ามทันที
 * - ถ้าเปิด → คำนวณ cutoffDate แล้ว DELETE task ที่ deletedAt <= cutoffDate
 */
export async function cleanupExpiredTrash(userId: string) {
  // 1. ดึง settings ของ user
  const settings = await db.select()
    .from(userSetting)
    .where(eq(userSetting.userId, userId));

  // ถ้ายังไม่มี settings หรือไม่ได้เปิด autoDeleteTrash → ข้ามเลย
  if (settings.length === 0 || !settings[0].autoDeleteTrash) {
    return;
  }

  // 2. คำนวณ cutoff date (วันที่เก่าสุดที่ยังเก็บไว้)
  const retentionDays = settings[0].trashRetentionDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // 3. ลบ task ที่ deletedAt <= cutoffDate (เกิน retention แล้ว)
  await db.delete(task)
    .where(
      and(
        eq(task.userId, userId),
        isNotNull(task.deletedAt),
        lte(task.deletedAt, cutoffDate),
      )
    );
}
