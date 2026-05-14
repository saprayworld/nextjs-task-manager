import { getTasks } from '@/lib/actions/task';
import { getCategories } from '@/lib/actions/category';
import ReportDashboard from '@/components/kanban/report/report-dashboard';

export default async function ReportPage() {
  // ดึงข้อมูลจริงจาก Database
  const dbTasks = await getTasks({ includeHidden: true });
  const categories = await getCategories();

  // กรองเฉพาะ tasks ที่อยู่ใน categories ที่ includeInReport === true
  const reportCategoryIds = new Set(
    categories
      .filter(c => c.includeInReport)
      .flatMap(c => {
        // รองรับทั้ง id (UUID) และ legacyKey สำหรับ task เก่า
        const ids = [c.id];
        if (c.legacyKey) ids.push(c.legacyKey);
        return ids;
      })
  );

  const filteredTasks = dbTasks.filter(t =>
    reportCategoryIds.has(t.categoryId ?? "")
  );

  // โยนข้อมูลที่กรองแล้วให้ Component ไปจัดการ UI ต่อ
  return <ReportDashboard dbTasks={filteredTasks} />;
}
