"use server";

import { db } from "@/db";
import { category, task, recurringTaskTemplate } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
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
// ข้อมูล Legacy Categories สำหรับ Migration
// (map จาก mock-data tags เดิม)
// ==========================================
const LEGACY_CATEGORIES = [
  { legacyKey: "default", name: "Default", color: "#6b7280", isDefault: true, includeInReport: true },
  { legacyKey: "design", name: "Design", color: "#3b82f6", isDefault: false, includeInReport: true },
  { legacyKey: "development", name: "Development", color: "#10b981", isDefault: false, includeInReport: true },
  { legacyKey: "research", name: "Research", color: "#f59e0b", isDefault: false, includeInReport: true },
  { legacyKey: "marketing", name: "Marketing", color: "#8b5cf6", isDefault: false, includeInReport: true },
  { legacyKey: "wr", name: "Work Request", color: "#ef4444", isDefault: false, includeInReport: true },
  { legacyKey: "pm", name: "PM", color: "#f97316", isDefault: false, includeInReport: true },
  { legacyKey: "cm", name: "CM", color: "#06b6d4", isDefault: false, includeInReport: true },
];

// ==========================================
// 1. Read: ดึง Categories ทั้งหมดของ User
//    (พร้อม Lazy Migration ถ้ายังไม่มีข้อมูล)
// ==========================================
export async function getCategories() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: กรุณาเข้าสู่ระบบ");

  let categories = await db.select()
    .from(category)
    .where(eq(category.userId, user.id))
    .orderBy(asc(category.order), asc(category.createdAt));

  // ถ้ายังไม่มี categories → trigger migration อัตโนมัติ (ต้องเปิด ENV ก่อน)
  if (categories.length === 0 && process.env.ENABLE_CATEGORY_MIGRATION === "true") {
    await migrateHardcodedCategories(user.id);
    categories = await db.select()
      .from(category)
      .where(eq(category.userId, user.id))
      .orderBy(asc(category.order), asc(category.createdAt));
  }

  return categories;
}

// ==========================================
// 2. Create: สร้าง Category ใหม่
// ==========================================
export async function createCategory(data: {
  name: string;
  color: string;
  includeInReport?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // คำนวณ order ถัดไป
  const existing = await db.select()
    .from(category)
    .where(eq(category.userId, user.id));
  const maxOrder = existing.reduce((max, c) => Math.max(max, c.order), -1);

  const newCategory = await db.insert(category).values({
    id: crypto.randomUUID(),
    userId: user.id,
    name: data.name.trim(),
    color: data.color,
    includeInReport: data.includeInReport ?? true,
    isDefault: false,
    order: maxOrder + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  revalidatePath("/kanban/setting");
  return newCategory[0];
}

// ==========================================
// 3. Update: แก้ไข Category
// ==========================================
export async function updateCategory(categoryId: string, data: {
  name?: string;
  color?: string;
  includeInReport?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // ดึง category เดิมเพื่อตรวจสอบ
  const existing = await db.select()
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.userId, user.id)));

  if (existing.length === 0) throw new Error("Category not found");

  // สร้าง update data (ไม่ให้แก้ isDefault)
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.color !== undefined) updateData.color = data.color;
  if (data.includeInReport !== undefined) updateData.includeInReport = data.includeInReport;

  const updated = await db.update(category)
    .set(updateData)
    .where(and(eq(category.id, categoryId), eq(category.userId, user.id)))
    .returning();

  revalidatePath("/kanban/setting");
  return updated[0];
}

// ==========================================
// 4. Delete: ลบ Category
//    → เปลี่ยน tasks/templates ที่ใช้ category นี้เป็น "Default"
// ==========================================
export async function deleteCategory(categoryId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // ดึง category ที่จะลบ
  const toDelete = await db.select()
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.userId, user.id)));

  if (toDelete.length === 0) throw new Error("Category not found");
  if (toDelete[0].isDefault) throw new Error("Cannot delete the default category");

  // หา Default category ของ user
  const defaultCat = await db.select()
    .from(category)
    .where(and(eq(category.userId, user.id), eq(category.isDefault, true)));

  if (defaultCat.length === 0) throw new Error("Default category not found");

  const defaultId = defaultCat[0].id;

  // เปลี่ยน tasks ที่ใช้ category นี้เป็น Default
  await db.update(task)
    .set({ categoryId: defaultId, updatedAt: new Date() })
    .where(and(eq(task.categoryId, categoryId), eq(task.userId, user.id)));

  // เปลี่ยน recurring templates ที่ใช้ category นี้เป็น Default
  await db.update(recurringTaskTemplate)
    .set({ categoryId: defaultId, updatedAt: new Date() })
    .where(and(eq(recurringTaskTemplate.categoryId, categoryId), eq(recurringTaskTemplate.userId, user.id)));

  // ลบ category
  await db.delete(category)
    .where(and(eq(category.id, categoryId), eq(category.userId, user.id)));

  revalidatePath("/kanban/setting");
  revalidatePath("/kanban");
  revalidatePath("/kanban/list");
  return true;
}

// ==========================================
// 5. Lazy Migration: สร้าง Categories จาก Mock-data เดิม
//    (เรียกจาก getCategories เมื่อ user ยังไม่มี categories)
//    ⚡ ไม่แตะ task.categoryId — Frontend ยังทำงานปกติ
// ==========================================
async function migrateHardcodedCategories(userId: string) {
  const now = new Date();

  for (let i = 0; i < LEGACY_CATEGORIES.length; i++) {
    const legacy = LEGACY_CATEGORIES[i];
    await db.insert(category).values({
      id: crypto.randomUUID(),
      userId: userId,
      name: legacy.name,
      color: legacy.color,
      includeInReport: legacy.includeInReport,
      isDefault: legacy.isDefault,
      legacyKey: legacy.legacyKey,
      order: i,
      createdAt: now,
      updatedAt: now,
    });
  }
}
