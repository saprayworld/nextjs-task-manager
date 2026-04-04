"use server";

import { db } from "@/db";
import { task, subtask } from "@/db/schema";
import { eq, and, asc, desc, isNull, isNotNull, max } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// ==========================================
// 1. Read: ดึงข้อมูลงาน + งานย่อย
// ==========================================
export async function getTasks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  // 1. ดึงงานหลักทั้งหมด (ไม่รวมงานที่อยู่ในถังขยะหรือ Archive)
  const tasks = await db.select()
    .from(task)
    .where(
      and(
        eq(task.userId, user.id),
        isNull(task.deletedAt),
        isNull(task.archivedAt),
      )
    )
    .orderBy(asc(task.order), asc(task.createdAt));

  // 2. ดึงงานย่อยทั้งหมด (ที่ผูกกับงานหลักข้างบน)
  const allSubtasks = await db.select().from(subtask);

  // 3. เอามายัดรวมกันเป็นก้อนเดียวเพื่อส่งให้ Frontend
  return tasks.map(t => ({
    ...t,
    subtasks: allSubtasks.filter(st => st.taskId === t.id)
  }));
}

// ==========================================
// 2. Create: สร้างงานใหม่
// ==========================================
export async function createTask(data: {
  title: string;
  columnId: string;
  description?: string;
  categoryId?: string;
  dueDate?: string;
  order?: number;
  startDateTime?: Date;
  endDateTime?: Date;
  totalWorkTime?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // คำนวณ order ถัดไปอัตโนมัติ (เอาค่าสูงสุดในคอลัมน์นั้น +1)
  let nextOrder = 0;
  if (data.order !== undefined) {
    nextOrder = data.order;
  } else {
    const maxOrderResult = await db.select({ maxOrder: max(task.order) })
      .from(task)
      .where(
        and(
          eq(task.userId, user.id),
          eq(task.columnId, data.columnId),
          isNull(task.deletedAt),
          isNull(task.archivedAt),
        )
      );
    nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
  }

  const newTask = await db.insert(task).values({
    id: crypto.randomUUID(),
    userId: user.id,
    columnId: data.columnId,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    dueDate: data.dueDate,
    order: nextOrder,
    startDateTime: data.startDateTime || null,
    endDateTime: data.endDateTime || null,
    totalWorkTime: data.totalWorkTime || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  revalidatePath("/kanban");
  return newTask[0];
}

// ==========================================
// 3. Update: แก้ไขข้อมูลงานทั่วไป
// ==========================================
export async function updateTask(taskId: string, data: Partial<typeof task.$inferInsert>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const updatedTask = await db.update(task)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)))
    .returning();

  revalidatePath("/kanban");
  return updatedTask[0];
}

// ==========================================
// 3.5 Reorder: อัปเดตลำดับการ์ดแบบ Batch (สำหรับ Drag & Drop)
// ==========================================
export async function reorderTasks(updates: { id: string; columnId: string; order: number }[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // อัปเดตทุกการ์ดที่มีการเปลี่ยนลำดับ
  await Promise.all(
    updates.map((item) =>
      db.update(task)
        .set({
          columnId: item.columnId,
          order: item.order,
          updatedAt: new Date(),
        })
        .where(and(eq(task.id, item.id), eq(task.userId, user.id)))
    )
  );

  revalidatePath("/kanban");
  return true;
}

// ==========================================
// 4. Soft Delete: ย้ายงานไปถังขยะ (ไม่ลบจริง)
// ==========================================
export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(task)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban");
  revalidatePath("/kanban/list");
  return true;
}

// ==========================================
// 5. Restore: กู้คืนงานจากถังขยะ
// ==========================================
export async function restoreTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(task)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban");
  revalidatePath("/kanban/list");
  revalidatePath("/kanban/trash");
  return true;
}

// ==========================================
// 6. Archive: เก็บงานเข้าคลัง (ไม่แสดงใน Board แต่ไม่ลบ)
// ==========================================
export async function archiveTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(task)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban");
  revalidatePath("/kanban/list");
  return true;
}

// ==========================================
// 7. Unarchive: นำงานกลับจากคลัง
// ==========================================
export async function unarchiveTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.update(task)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban");
  revalidatePath("/kanban/list");
  revalidatePath("/kanban/archive");
  return true;
}

// ==========================================
// 8. Permanent Delete: ลบงานถาวร (ใช้จากหน้าถังขยะ)
// ==========================================
export async function permanentDeleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(task)
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban/trash");
  return true;
}

// ==========================================
// 9. ดึงงานที่อยู่ในถังขยะ
// ==========================================
export async function getTrashedTasks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  const tasks = await db.select()
    .from(task)
    .where(
      and(
        eq(task.userId, user.id),
        isNotNull(task.deletedAt),
      )
    )
    .orderBy(asc(task.updatedAt));

  const allSubtasks = await db.select().from(subtask);

  return tasks.map(t => ({
    ...t,
    subtasks: allSubtasks.filter(st => st.taskId === t.id)
  }));
}

// ==========================================
// 10. ดึงงานที่อยู่ใน Archive
// ==========================================
export async function getArchivedTasks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  const tasks = await db.select()
    .from(task)
    .where(
      and(
        eq(task.userId, user.id),
        isNotNull(task.archivedAt),
      )
    )
    .orderBy(asc(task.updatedAt));

  const allSubtasks = await db.select().from(subtask);

  return tasks.map(t => ({
    ...t,
    subtasks: allSubtasks.filter(st => st.taskId === t.id)
  }));
}

// ==========================================
// การจัดการ Subtask
// ==========================================

export async function addSubtask(taskId: string, title: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const newSubtask = await db.insert(subtask).values({
    id: crypto.randomUUID(),
    taskId: taskId,
    title: title,
    isCompleted: false,
    createdAt: new Date(),
  }).returning();

  // คำนวณ Progress อัตโนมัติเมื่อเพิ่มงานย่อย
  await recalculateTaskProgress(taskId);

  revalidatePath("/kanban");
  return newSubtask[0];
}

export async function toggleSubtask(subtaskId: string, isCompleted: boolean, taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const updated = await db.update(subtask)
    .set({ isCompleted })
    .where(eq(subtask.id, subtaskId))
    .returning();

  // คำนวณ Progress อัตโนมัติเมื่อติ๊กถูก
  await recalculateTaskProgress(taskId);

  revalidatePath("/kanban");
  return updated[0];
}

export async function deleteSubtask(subtaskId: string, taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(subtask).where(eq(subtask.id, subtaskId));

  // คำนวณ Progress อัตโนมัติเมื่อลบงานย่อย
  await recalculateTaskProgress(taskId);

  revalidatePath("/kanban");
  return true;
}

// จัดการงานย่อยทั้งหมดในคลิกเดียว (ลบอันเก่า, อัปเดตอันเดิม, เพิ่มอันใหม่)
export async function syncSubtasks(taskId: string, subtasksData: { id?: string, title: string, isCompleted: boolean }[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // 1. ดึงข้อมูลงานย่อยเดิมที่มีอยู่
  const existing = await db.select().from(subtask).where(eq(subtask.taskId, taskId));
  const existingIds = existing.map(e => e.id);
  const incomingIds = subtasksData.map(s => s.id).filter(Boolean);

  // 2. ลบตัวที่ถูกกดลบทิ้งจากหน้าจอ
  const toDelete = existingIds.filter(id => !incomingIds.includes(id as string));
  for (const id of toDelete) {
    await db.delete(subtask).where(eq(subtask.id, id));
  }

  // 3. อัปเดตตัวเดิม หรือ เพิ่มตัวใหม่
  for (const st of subtasksData) {
    if (st.id && existingIds.includes(st.id)) {
      await db.update(subtask).set({ title: st.title, isCompleted: st.isCompleted }).where(eq(subtask.id, st.id));
    } else {
      await db.insert(subtask).values({
        id: st.id || crypto.randomUUID(),
        taskId: taskId,
        title: st.title,
        isCompleted: st.isCompleted,
        createdAt: new Date()
      });
    }
  }

  // คำนวณ % ความคืบหน้าใหม่
  await recalculateTaskProgress(taskId);
  revalidatePath("/kanban");
  return true;
}

// ฟังก์ชันช่วยเหลือสำหรับคำนวณ % ความคืบหน้า (Progress) และเซฟลง DB
async function recalculateTaskProgress(taskId: string) {
  const allSubtasks = await db.select().from(subtask).where(eq(subtask.taskId, taskId));

  if (allSubtasks.length === 0) {
    await db.update(task).set({ progress: 0 }).where(eq(task.id, taskId));
    return;
  }

  const completedCount = allSubtasks.filter(st => st.isCompleted).length;
  const progressPercent = Math.round((completedCount / allSubtasks.length) * 100);

  await db.update(task).set({ progress: progressPercent }).where(eq(task.id, taskId));
}