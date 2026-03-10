import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// ==========================================
// ส่วนที่ 1: ตารางสำหรับระบบ Authentication (Better Auth)
// ==========================================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

// ==========================================
// ส่วนที่ 2: ตารางสำหรับระบบ Kanban Board
// ==========================================
export const task = pgTable("task", {
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
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
