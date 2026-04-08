import { db } from "@/db";
import { task, subtask, recurringTaskTemplate } from "@/db/schema";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { addDays, addWeeks, addMonths, addYears, setDate, subDays, format } from "date-fns";

// ==========================================
// Lazy Generator: สร้าง recurring tasks ที่ค้างอยู่
// เรียกจาก kanban/layout.tsx หลัง auth check
// ==========================================

/**
 * ตรวจสอบและสร้าง tasks จาก recurring templates ที่ถึงเวลา
 * ใช้ optimistic locking แทน transaction (เพราะ neon-http ไม่รองรับ interactive tx)
 */
export async function generatePendingTasks(userId: string) {
  const now = new Date();

  // 1. ดึง templates ที่ถึงเวลาต้องสร้าง task
  const dueTemplates = await db.select()
    .from(recurringTaskTemplate)
    .where(
      and(
        eq(recurringTaskTemplate.userId, userId),
        eq(recurringTaskTemplate.isActive, true),
        lte(recurringTaskTemplate.nextRunAt, now),
        or(
          isNull(recurringTaskTemplate.endDate),
          gte(recurringTaskTemplate.endDate, now) // endDate >= now (ยังไม่หมดอายุ)
        )
      )
    );

  for (const template of dueTemplates) {
    // 2. เช็ค maxOccurrences
    if (template.maxOccurrences &&
        (template.occurrenceCount ?? 0) >= template.maxOccurrences) {
      // ถึงจำนวนครั้งสูงสุดแล้ว → ปิด template
      await db.update(recurringTaskTemplate)
        .set({ isActive: false, updatedAt: now })
        .where(eq(recurringTaskTemplate.id, template.id));
      continue;
    }

    // 3. คำนวณ due date จริงของรอบนี้ (targetDueDate)
    //    nextRunAt อาจถูกเลื่อนขึ้นมาตาม advanceDays แล้ว
    //    ดังนั้น targetDueDate = nextRunAt + advanceDays
    const advance = template.advanceDays ?? 0;
    const targetDueDate = advance > 0
      ? addDays(template.nextRunAt!, advance)
      : template.nextRunAt!;

    // 4. คำนวณ nextRunAt ของรอบถัดไป
    //    เอา targetDueDate เป็นฐาน → คำนวณ due date ถัดไป → แล้วลบ advanceDays
    const nextTargetDueDate = calculateNextTargetDate(template, targetDueDate);
    const nextRun = advance > 0
      ? subDays(nextTargetDueDate, advance)
      : nextTargetDueDate;

    const newOccurrenceCount = (template.occurrenceCount ?? 0) + 1;

    // 5. Optimistic lock: อัปเดต nextRunAt + occurrenceCount ก่อน
    const updated = await db.update(recurringTaskTemplate)
      .set({
        nextRunAt: nextRun,
        lastRunAt: now,
        occurrenceCount: newOccurrenceCount,
        updatedAt: now,
      })
      .where(
        and(
          eq(recurringTaskTemplate.id, template.id),
          lte(recurringTaskTemplate.nextRunAt, now) // optimistic lock condition
        )
      )
      .returning({ id: recurringTaskTemplate.id });

    // ถ้าไม่ได้อัปเดต (tab อื่นทำไปแล้ว) → ข้ามเลย
    if (updated.length === 0) continue;

    // 6. สร้าง task instance จาก template
    //    ใส่ dueDate = targetDueDate เพื่อให้ผู้ใช้เห็นว่างาน due เมื่อไร
    const newTaskId = crypto.randomUUID();
    const dueDateStr = format(targetDueDate, "yyyy-MM-dd");

    await db.insert(task).values({
      id: newTaskId,
      userId: userId,
      columnId: template.columnId,
      title: template.title,
      description: template.description,
      categoryId: template.categoryId,
      dueDate: dueDateStr,
      recurringTemplateId: template.id,
      recurrenceIndex: newOccurrenceCount,
      order: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 7. สร้าง subtasks จาก template (ถ้ามี)
    if (template.subtaskTemplates) {
      try {
        const subtaskTitles: string[] = JSON.parse(template.subtaskTemplates);
        for (const title of subtaskTitles) {
          await db.insert(subtask).values({
            id: crypto.randomUUID(),
            taskId: newTaskId,
            title: title,
            isCompleted: false,
            createdAt: now,
          });
        }
      } catch {
        // JSON parse error → ข้ามการสร้าง subtask
        console.error(`Invalid subtaskTemplates JSON for template ${template.id}`);
      }
    }

    // 8. ถ้าถึง maxOccurrences แล้ว → ปิด template
    if (template.maxOccurrences && newOccurrenceCount >= template.maxOccurrences) {
      await db.update(recurringTaskTemplate)
        .set({ isActive: false, updatedAt: now })
        .where(eq(recurringTaskTemplate.id, template.id));
    }
  }
}

// ==========================================
// คำนวณ target due date ถัดไป (ไม่รวม advanceDays)
// ==========================================
function calculateNextTargetDate(
  template: typeof recurringTaskTemplate.$inferSelect,
  fromDate: Date
): Date {
  const interval = template.recurrenceInterval;

  switch (template.recurrenceType) {
    case 'daily':
      return addDays(fromDate, interval);

    case 'weekly':
      return addWeeks(fromDate, interval);

    case 'monthly': {
      const next = addMonths(fromDate, interval);
      if (template.recurrenceDayOfMonth) {
        return setDate(next, Math.min(template.recurrenceDayOfMonth, getDaysInMonth(next)));
      }
      return next;
    }

    case 'yearly':
      return addYears(fromDate, interval);

    default:
      return addMonths(fromDate, 1);
  }
}

// Helper: จำนวนวันในเดือน
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

