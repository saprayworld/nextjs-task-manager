"use server";

import { db } from "@/db";
import { task } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ==========================================
// ฟังก์ชันช่วยเหลือ: ดึงข้อมูลผู้ใช้ปัจจุบันจาก Session
// ==========================================
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user;
}

// ==========================================
// 1. Read: ดึงข้อมูลงานทั้งหมดของผู้ใช้คนนี้
// ==========================================
export async function getTasks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  const tasks = await db.select()
    .from(task)
    .where(eq(task.userId, user.id))
    .orderBy(asc(task.order)); // เรียงตามลำดับ (order) เสมอ

  return tasks;
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
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const newTask = await db.insert(task).values({
    id: crypto.randomUUID(),
    userId: user.id,
    columnId: data.columnId,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    dueDate: data.dueDate,
    order: data.order || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // สั่งให้ Next.js รีเฟรชข้อมูลในหน้า /kanban อัตโนมัติ
  revalidatePath("/kanban");
  return newTask[0];
}

// ==========================================
// 3. Update: แก้ไขข้อมูลงานทั่วไป หรือ เปลี่ยนสถานะ (Drag & Drop)
// ==========================================
export async function updateTask(taskId: string, data: Partial<typeof task.$inferInsert>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const updatedTask = await db.update(task)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    // ต้องเช็คว่าเป็นงานของ User คนนี้จริงๆ ป้องกันคนอื่นมาแอบแก้
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)))
    .returning();

  revalidatePath("/kanban");
  return updatedTask[0];
}

// ==========================================
// 4. Delete: ลบงาน
// ==========================================
export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(task)
    .where(and(eq(task.id, taskId), eq(task.userId, user.id)));

  revalidatePath("/kanban");
  return true;
}