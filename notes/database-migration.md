สำหรับแปลง Lagacy Category Key ไปยัง UUID ใน Database

---

สำหรับคำสั่ง SQL ในการทำ **Data Migration** เพื่อแปลงฟิลด์ `categoryId` ของเก่าที่เป็นแบบตัวหนังสือธรรมดา (เช่น `"design"`, `"wr"`) ไปอ้างอิงเป็น `id` (UUID) จริง ๆ ของตาราง `category` บนฐานข้อมูล Postgres (เช่น Neon) มีดังนี้ครับ:

### ข้อควรทราบก่อนรันคำสั่ง
เนื่องจากฟิลด์ในตารางฐานข้อมูลที่สร้างโดย Drizzle มักจะบันทึกเป็นชื่อแบบ **CamelCase** ทำให้ใน PostgreSQL จำเป็นต้อง **ครอบด้วยเครื่องหมายอัญประกาศคู่ (Double Quotes)** เช่น `"categoryId"`, `"userId"`, `"legacyKey"` เสมอเพื่อให้ไม่เกิดข้อผิดพลาดด้านตัวพิมพ์เล็ก/ใหญ่

---

### 1. คำสั่ง SQL สำหรับตาราง `task`

คำสั่งนี้จะไปค้นหารายการงานทั้งหมดที่คอลัมน์ `"categoryId"` มีค่าตรงกับ `"legacyKey"` ในตาราง `category` (ภายใต้ผู้ใช้คนเดียวกัน) แล้วอัปเดตค่าให้กลายเป็น UUID จากคอลัมน์ `id` ของ Category นั้น ๆ:

```sql
UPDATE task
SET "categoryId" = category.id
FROM category
WHERE task."categoryId" = category."legacyKey"
  AND task."userId" = category."userId";
```

### 2. คำสั่ง SQL สำหรับตาราง `recurring_task_template`

เนื่องจากระบบงานประจำยังมีตารางเทมเพลตที่เก็บฟิลด์ `categoryId` ไว้เหมือนกัน หากมีข้อมูลเทมเพลตเก่าอยู่ด้วย แนะนำให้รันคำสั่งนี้ควบคู่ไปด้วยครับ:

```sql
UPDATE recurring_task_template
SET "categoryId" = category.id
FROM category
WHERE recurring_task_template."categoryId" = category."legacyKey"
  AND recurring_task_template."userId" = category."userId";
```

---

### อธิบายการทำงานของคำสั่ง SQL:
1. **`UPDATE task`**: สั่งอัปเดตข้อมูลในตาราง `task` (หรือ `recurring_task_template`)
2. **`SET "categoryId" = category.id`**: เปลี่ยนค่า `categoryId` ในตารางงานให้เป็น `id` (UUID) ของตาราง `category`
3. **`FROM category`**: ดึงข้อมูลจากตาราง `category` มาเข้าร่วม (Join)
4. **`WHERE task."categoryId" = category."legacyKey"`**: ทำการแมปจับคู่ ข้อมูลเก่าที่เป็น Key ตัวหนังสือธรรมดา (เช่น `"design"`) ให้ตรงกับช่อง `"legacyKey"` ที่เตรียมไว้รองรับการทำ Migration ในตาราง Category
5. **`AND task."userId" = category."userId"`**: เพื่อความปลอดภัย ป้องกันข้อมูลข้ามผู้ใช้ (Cross-user data mutation) โดยจะตรวจสอบให้มั่นใจว่าเป็นการอัปเดตหมวดหมู่ที่เป็นของ **ผู้ใช้คนเดียวกัน** เท่านั้น