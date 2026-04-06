"use server";

import { db } from "@/db";
import { recurringTaskTemplate } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { addMonths, setDate } from "date-fns";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// ==========================================
// 1. Read: ดึง Recurring Templates ทั้งหมดของ user
// ==========================================
export async function getRecurringTemplates() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  return db.select()
    .from(recurringTaskTemplate)
    .where(eq(recurringTaskTemplate.userId, user.id))
    .orderBy(asc(recurringTaskTemplate.createdAt));
}

// ==========================================
// 2. Create: สร้าง Recurring Template ใหม่
// ==========================================
export async function createRecurringTemplate(data: {
  title: string;
  columnId: string;
  description?: string;
  categoryId?: string;
  recurrenceType: string;
  recurrenceInterval?: number;
  recurrenceDayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
  subtaskTemplates?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // === Validation ===
  if (!data.title.trim()) throw new Error("ชื่องานต้องไม่ว่างเปล่า");
  if (!data.columnId.trim()) throw new Error("ต้องเลือกคอลัมน์");
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(data.recurrenceType)) {
    throw new Error("ประเภทความถี่ไม่ถูกต้อง");
  }
  if (data.recurrenceDayOfMonth !== undefined &&
      (data.recurrenceDayOfMonth < 1 || data.recurrenceDayOfMonth > 31)) {
    throw new Error("วันที่ในเดือนต้องอยู่ระหว่าง 1-31");
  }
  if (data.recurrenceInterval !== undefined && data.recurrenceInterval < 1) {
    throw new Error("ช่วงความถี่ต้องมากกว่า 0");
  }

  const now = new Date();
  const interval = data.recurrenceInterval ?? 1;

  // คำนวณ nextRunAt
  let nextRunAt: Date;
  if (data.startDate > now) {
    // ยังไม่ถึงเวลาเริ่ม → ใช้ startDate เป็น nextRunAt
    nextRunAt = data.startDate;
  } else {
    // ถ้า startDate เป็นอดีตหรือปัจจุบัน → สร้างทันทีรอบถัดไปที่เปิดหน้า kanban
    nextRunAt = now;
  }

  // สำหรับ monthly: ปรับ nextRunAt ให้ตรงวันที่กำหนด
  if (data.recurrenceType === 'monthly' && data.recurrenceDayOfMonth) {
    const targetDate = setDate(nextRunAt, data.recurrenceDayOfMonth);
    if (targetDate <= now) {
      // วันที่กำหนดของเดือนนี้ผ่านไปแล้ว → ใช้เดือนถัดไป
      nextRunAt = setDate(addMonths(nextRunAt, interval), data.recurrenceDayOfMonth);
    } else {
      nextRunAt = targetDate;
    }
  }

  const newTemplate = await db.insert(recurringTaskTemplate).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    categoryId: data.categoryId || null,
    columnId: data.columnId,
    recurrenceType: data.recurrenceType,
    recurrenceInterval: interval,
    recurrenceDayOfMonth: data.recurrenceDayOfMonth ?? null,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    maxOccurrences: data.maxOccurrences ?? null,
    occurrenceCount: 0,
    nextRunAt: nextRunAt,
    lastRunAt: null,
    isActive: true,
    subtaskTemplates: data.subtaskTemplates?.length
      ? JSON.stringify(data.subtaskTemplates)
      : null,
    createdAt: now,
    updatedAt: now,
  }).returning();

  revalidatePath("/kanban/recurring");
  return newTemplate[0];
}

// ==========================================
// 3. Update: แก้ไข Recurring Template
// ==========================================
export async function updateRecurringTemplate(
  templateId: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    columnId?: string;
    recurrenceType?: string;
    recurrenceInterval?: number;
    recurrenceDayOfMonth?: number | null;
    startDate?: Date;
    endDate?: Date | null;
    maxOccurrences?: number | null;
    isActive?: boolean;
    subtaskTemplates?: string[];
  }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // === Validation ===
  if (data.title !== undefined && !data.title.trim()) {
    throw new Error("ชื่องานต้องไม่ว่างเปล่า");
  }
  if (data.recurrenceType &&
      !['daily', 'weekly', 'monthly', 'yearly'].includes(data.recurrenceType)) {
    throw new Error("ประเภทความถี่ไม่ถูกต้อง");
  }
  if (data.recurrenceDayOfMonth !== undefined && data.recurrenceDayOfMonth !== null &&
      (data.recurrenceDayOfMonth < 1 || data.recurrenceDayOfMonth > 31)) {
    throw new Error("วันที่ในเดือนต้องอยู่ระหว่าง 1-31");
  }
  if (data.recurrenceInterval !== undefined && data.recurrenceInterval < 1) {
    throw new Error("ช่วงความถี่ต้องมากกว่า 0");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.columnId !== undefined) updateData.columnId = data.columnId;
  if (data.recurrenceType !== undefined) updateData.recurrenceType = data.recurrenceType;
  if (data.recurrenceInterval !== undefined) updateData.recurrenceInterval = data.recurrenceInterval;
  if (data.recurrenceDayOfMonth !== undefined) updateData.recurrenceDayOfMonth = data.recurrenceDayOfMonth;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  if (data.maxOccurrences !== undefined) updateData.maxOccurrences = data.maxOccurrences;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.subtaskTemplates !== undefined) {
    updateData.subtaskTemplates = data.subtaskTemplates.length
      ? JSON.stringify(data.subtaskTemplates)
      : null;
  }

  const updated = await db.update(recurringTaskTemplate)
    .set(updateData)
    .where(
      and(
        eq(recurringTaskTemplate.id, templateId),
        eq(recurringTaskTemplate.userId, user.id)
      )
    )
    .returning();

  revalidatePath("/kanban/recurring");
  return updated[0];
}

// ==========================================
// 4. Delete: ลบ Recurring Template
// ==========================================
export async function deleteRecurringTemplate(templateId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(recurringTaskTemplate)
    .where(
      and(
        eq(recurringTaskTemplate.id, templateId),
        eq(recurringTaskTemplate.userId, user.id)
      )
    );

  revalidatePath("/kanban/recurring");
  return true;
}

// ==========================================
// 5. Toggle: เปิด/ปิด Template
// ==========================================
export async function toggleRecurringTemplate(templateId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // ดึงสถานะปัจจุบัน
  const current = await db.select({ isActive: recurringTaskTemplate.isActive })
    .from(recurringTaskTemplate)
    .where(
      and(
        eq(recurringTaskTemplate.id, templateId),
        eq(recurringTaskTemplate.userId, user.id)
      )
    );

  if (current.length === 0) throw new Error("ไม่พบ Template");

  const newIsActive = !current[0].isActive;

  // ถ้าเปิดใหม่ → คำนวณ nextRunAt ใหม่ด้วย
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    isActive: newIsActive,
    updatedAt: new Date(),
  };

  if (newIsActive) {
    // เมื่อเปิดใหม่ → ให้ nextRunAt เป็นตอนนี้ เพื่อสร้าง task ทันทีรอบถัดไปที่เปิด kanban
    updateData.nextRunAt = new Date();
  }

  const updated = await db.update(recurringTaskTemplate)
    .set(updateData)
    .where(
      and(
        eq(recurringTaskTemplate.id, templateId),
        eq(recurringTaskTemplate.userId, user.id)
      )
    )
    .returning();

  revalidatePath("/kanban/recurring");
  return updated[0];
}
