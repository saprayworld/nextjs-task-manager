import { test, expect } from '@playwright/test';

test.describe('Kanban Core Flow', () => {
  const testEmail = `kanban_${Date.now()}@example.com`;
  const testPassword = 'password123';
  const taskTitle = `New Test Task ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // ลงทะเบียนผู้ใช้ใหม่ทุกครั้งก่อนเทส เพื่อที่จะได้กระดานเปล่าๆ หรือกระดานที่มีเฉพาะข้อมูลเริ่มต้น
    await page.goto('/register');
    await page.fill('input[id="name"]', 'Kanban Tester');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/kanban/, { timeout: 15000 });
  });

  test('Create task, Drag & Drop, Delete task', async ({ page }) => {
    // ============================================
    // 1. ทดสอบการสร้างงานใหม่
    // ============================================
    // คลิกปุ่มคลิก "สร้างงานใหม่"
    await page.click('button:has-text("สร้างงานใหม่")');

    // รอดู Modal / Dialog ที่มีหัวข้อ "สร้างงานใหม่"
    await expect(page.locator('.text-lg', { hasText: 'สร้างงานใหม่' })).toBeVisible();

    // กรอกข้อมูลหัวข้อ
    await page.fill('input[id="task-title"]', taskTitle);

    // เลือกสถานะ (To Do เป็นค่าเริ่มต้น) หมวดหมู่
    await page.selectOption('select[id="task-category"]', 'development');

    // กรอก Tiptap editor
    await page.click('.tiptap');
    await page.keyboard.type('This is a test description inserted by Playwright');

    // กดปุ่มเซฟ "สร้างงาน"
    await page.click('button[aria-label="create-task"]');

    // ตรวจสอบว่ามี การ์ด โผล่บนหน้าจอ
    const card = page.locator('div.cursor-grab').filter({ has: page.locator('h3', { hasText: taskTitle }) });
    await expect(card).toBeVisible({ timeout: 10000 });

    // ============================================
    // 2. Drag & Drop ย้ายคอลัมน์
    // ============================================
    // ค้นหา Column "In Progress"
    const targetColumn = page.locator('div.w-80').filter({ has: page.locator('h2', { hasText: /^In Progress$/ }) });

    // จำลองการใช้เมาส์ลาก Drag and drop อย่างละเอียดเพื่อรองรับ dnd-kit
    const box = await card.boundingBox();
    const targetBox = await targetColumn.boundingBox();

    if (box && targetBox) {
      await page.mouse.move(box.x + box.width / 2, box.y + 10);
      await page.mouse.down();
      // ขยับเล็กน้อยเพื่อให้ Trigger การลาก
      await page.mouse.move(box.x + box.width / 2 + 5, box.y + 20);
      await page.waitForTimeout(300); // จำลองการคลิกค้าง

      // ลากไปยังกึ่งกลางคอลัมน์ "In Progress"
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 3, { steps: 5 });
      await page.waitForTimeout(200);
      await page.mouse.up();
    } else {
      throw new Error('ไม่สามารถตรวจสอบตำแหน่งที่จะทำการ Drag & Drop ได้');
    }

    // รอดูให้การ์ดย้ายเข้าไปอยู่ในคอลัมน์ In Progress (ฝั่ง UI ปัจจุบัน)
    const cardInTargetColumn = targetColumn.locator('div.cursor-grab').filter({ has: page.locator('h3', { hasText: taskTitle }) });
    await expect(cardInTargetColumn).toBeVisible({ timeout: 10000 });

    // รีเฟรชหน้าเว็บ 1 รอบ
    await page.reload();
    await expect(page.locator('h2', { hasText: 'Kanban Board' })).toBeVisible(); // รอโหลดเสร็จ

    // ตรวจสอบว่าการ์ดยังอยู่ที่ตำแหน่ง "In Progress"
    const targetColumnAfterReload = page.locator('div.w-80').filter({ has: page.locator('h2', { hasText: /^In Progress$/ }) });
    await expect(targetColumnAfterReload.locator('div.cursor-grab').filter({ has: page.locator('h3', { hasText: taskTitle }) })).toBeVisible();

    // ============================================
    // 3. การลบงาน
    // ============================================
    const currentCard = targetColumnAfterReload.locator('div.cursor-grab').filter({ has: page.locator('h3', { hasText: taskTitle }) });

    // Hover ดูปุ่ม และคลิกปุ่ม Edit
    await currentCard.hover();
    await currentCard.locator('button[title="แก้ไขงาน"]').click();

    // รอ Dialog
    await expect(page.locator('.text-lg', { hasText: 'แก้ไขงาน' })).toBeVisible();

    // กด "ลบงาน"
    await page.click('button:has-text("ลบงาน")');

    // ตรวจสอบว่าหน้าต่าง UI นำการ์ดนั้นออกไปทันที
    await expect(page.locator('div.cursor-grab').filter({ has: page.locator('h3', { hasText: taskTitle }) })).toHaveCount(0);
  });
});
