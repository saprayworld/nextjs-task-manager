import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// กำหนด URL ของ Neon (ปกติอ่านจาก .env เช่น DATABASE_URL="postgresql://...")
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:pass@localhost/db');

// สร้าง instance ของ db เพื่อเอาไปเรียกใช้งานในแอป
export const db = drizzle(sql, { schema });