import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `login_${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('Redirect to /login if unauthenticated and visit /kanban', async ({ page }) => {
    // ผู้ใช้ที่ยังไม่ล็อกอิน พยายามเข้าหน้า /kanban จะต้องถูก Redirect ไปที่หน้า /login
    await page.goto('/kanban');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Registration and Login flow', async ({ page }) => {
    // ผู้ใช้จำลองทำการ Register ก่อนเพื่อให้มีข้อมูลใน Database
    await page.goto('/register');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    
    // ตั้งเวลาให้เผื่อการสร้างข้อมูลเริ่มต้น
    await page.click('button[type="submit"]');

    // ทะเบียนเสร็จจะ redirect ไปหน้าบอร์ด
    await expect(page).toHaveURL(/.*\/kanban/, { timeout: 10000 });

    // จากนั้น ทำการ Logout โดยเคลียร์ Cookie ทิ้ง เพื่อจำลองการล็อคเอาต์
    await page.context().clearCookies();

    // ทดสอบการกรอกฟอร์มเข้าสู่ระบบ (Login) สำเร็จ และถูกพาเข้าสู่หน้า Board
    await page.goto('/login');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    
    await page.click('button[type="submit"]');

    // ต้องพาเข้าสู่หน้า board ทันที
    await expect(page).toHaveURL(/.*\/kanban/, { timeout: 10000 });
  });
});
