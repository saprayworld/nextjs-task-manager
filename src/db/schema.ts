import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ==========================================
// ส่วนที่ 1: ตารางสำหรับระบบ Authentication (Better Auth)
// ==========================================
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// ==========================================
// ส่วนที่ 2: ตารางสำหรับระบบ Kanban Board
// ==========================================
export const task = sqliteTable("task", {
  id: text("id").primaryKey(), // รหัสงาน (จะใช้ crypto.randomUUID() ตอนสร้าง)
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }), // ผูกกับผู้ใช้ (ถ้าลบ User ให้ลบ Task ทิ้งด้วย)
  columnId: text("columnId").notNull(), // สถานะ (เช่น 'todo', 'inprogress')
  title: text("title").notNull(), // ชื่องาน
  description: text("description"), // รายละเอียดงาน
  categoryId: text("categoryId"), // หมวดหมู่ (เช่น 'design', 'development')
  progress: integer("progress").default(0), // ความคืบหน้า 0-100
  dueDate: text("dueDate"), // วันครบกำหนด (เก็บเป็น YYYY-MM-DD string)
  order: integer("order").notNull().default(0), // ลำดับการ์ดในคอลัมน์ (สำหรับ Drag & Drop)
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
