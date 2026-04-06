import { db } from "@/db";
import { task, subtask, recurringTaskTemplate } from "@/db/schema";
import { eq, and, lte, or, isNull, gte } from "drizzle-orm";
import { addDays, addWeeks, addMonths, addYears, setDate } from "date-fns";

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

    // 3. Optimistic lock: อัปเดต nextRunAt + occurrenceCount ก่อน
    //    ใช้ lte(nextRunAt, now) เป็น condition เพื่อป้องกัน race condition
    //    ถ้า tab อื่นอัปเดตไปแล้ว nextRunAt จะเปลี่ยน → condition ไม่ตรง → ไม่ทำซ้ำ
    const nextRun = calculateNextRun(template, now);
    const newOccurrenceCount = (template.occurrenceCount ?? 0) + 1;

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

    // 4. สร้าง task instance จาก template
    const newTaskId = crypto.randomUUID();
    await db.insert(task).values({
      id: newTaskId,
      userId: userId,
      columnId: template.columnId,
      title: template.title,
      description: template.description,
      categoryId: template.categoryId,
      recurringTemplateId: template.id,
      recurrenceIndex: newOccurrenceCount,
      order: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 5. สร้าง subtasks จาก template (ถ้ามี)
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

    // 6. ถ้าถึง maxOccurrences แล้ว → ปิด template
    if (template.maxOccurrences && newOccurrenceCount >= template.maxOccurrences) {
      await db.update(recurringTaskTemplate)
        .set({ isActive: false, updatedAt: now })
        .where(eq(recurringTaskTemplate.id, template.id));
    }
  }
}

// ==========================================
// คำนวณรอบถัดไป (เริ่มจาก monthly ก่อน)
// ==========================================
function calculateNextRun(
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
      // ถ้ากำหนด dayOfMonth → ใช้วันที่นั้นของเดือนถัดไป
      const next = addMonths(fromDate, interval);
      if (template.recurrenceDayOfMonth) {
        // setDate จะ clamp ให้อัตโนมัติ (เช่น วันที่ 31 ในเดือน 30 วัน → วันที่ 30)
        return setDate(next, Math.min(template.recurrenceDayOfMonth, getDaysInMonth(next)));
      }
      return next;
    }

    case 'yearly':
      return addYears(fromDate, interval);

    default:
      // fallback: 1 เดือน
      return addMonths(fromDate, 1);
  }
}

// Helper: จำนวนวันในเดือน
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
