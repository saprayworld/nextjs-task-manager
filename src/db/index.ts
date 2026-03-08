import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// สร้างไฟล์ sqlite ชื่อ sqlite.db ไว้ในโปรเจกต์
const sqlite = new Database('sqlite.db');

// สร้าง instance ของ db เพื่อเอาไปเรียกใช้งานในแอป
export const db = drizzle(sqlite, { schema });