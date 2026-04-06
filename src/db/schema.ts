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
  userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
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
// ส่วนที่ 2: ตารางสำหรับระบบ Recurring Tasks (งานประจำ)
// ==========================================
export const recurringTaskTemplate = pgTable("recurring_task_template", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // ข้อมูลงานที่จะ copy ไปยัง task ใหม่
  title: text("title").notNull(),
  description: text("description"),
  categoryId: text("categoryId"),
  columnId: text("columnId").notNull(),

  // Recurrence Rule
  recurrenceType: text("recurrenceType").notNull(),              // 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrenceInterval: integer("recurrenceInterval").notNull().default(1), // ทุกๆ N หน่วย
  recurrenceDayOfMonth: integer("recurrenceDayOfMonth"),         // 1-31 (สำหรับ monthly)

  // ช่วงเวลา
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),                                 // null = ไม่มีกำหนดสิ้นสุด
  maxOccurrences: integer("maxOccurrences"),                     // null = ไม่จำกัดจำนวนครั้ง
  occurrenceCount: integer("occurrenceCount").default(0),

  // Scheduling State
  nextRunAt: timestamp("nextRunAt"),                             // วันที่จะสร้าง task ถัดไป
  lastRunAt: timestamp("lastRunAt"),                             // วันที่สร้าง task ล่าสุด
  isActive: boolean("isActive").notNull().default(true),

  // Subtask Templates (JSON array of titles)
  subtaskTemplates: text("subtaskTemplates"),                    // '["งานย่อย 1","งานย่อย 2"]'

  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

// ==========================================
// ส่วนที่ 3: ตารางสำหรับระบบ Kanban Board
// ==========================================
export const task = pgTable("task", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  recurringTemplateId: text("recurringTemplateId")
    .references(() => recurringTaskTemplate.id, { onDelete: 'set null' }),
  recurrenceIndex: integer("recurrenceIndex"),       // ลำดับรอบที่เท่าไร
  columnId: text("columnId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: text("categoryId"),
  progress: integer("progress").default(0),
  dueDate: text("dueDate"),
  order: integer("order").notNull().default(0),
  startDateTime: timestamp("startDateTime"),
  endDateTime: timestamp("endDateTime"),
  totalWorkTime: integer("totalWorkTime").default(0),
  deletedAt: timestamp("deletedAt"),
  isVisible: boolean("isVisible").notNull().default(true),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

// ==========================================
// ตารางสำหรับ Subtasks (งานย่อย)
// ==========================================
export const subtask = pgTable("subtask", {
  id: text("id").primaryKey(),
  taskId: text("taskId")
    .notNull()
    .references(() => task.id, { onDelete: 'cascade' }), // ลบงานหลัก = งานย่อยโดนลบด้วย
  title: text("title").notNull(),
  isCompleted: boolean("isCompleted").notNull().default(false),
  createdAt: timestamp("createdAt").notNull(),
});
